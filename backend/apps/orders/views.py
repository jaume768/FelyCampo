"""
API de carrito, checkout y pedidos.

El carrito funciona con o sin cuenta: si hay sesión se usa el carrito del usuario, y si no
el frontend guarda el UUID del carrito y lo manda en la cabecera `X-Cart-Id`.
"""

import logging

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import BusinessRuleError
from apps.integrations.emails import send_invoice_request, send_order_confirmation
from apps.integrations.stripe import get_gateway, to_minor_units

from .models import Cart, CartItem, Order, OrderStatus, Return, ReturnLine
from .serializers import (
    CartItemWriteSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
    ReturnCreateSerializer,
    ReturnSerializer,
    empty_cart_payload,
)
from .services import (
    cancel_unpaid_order,
    create_order_from_cart,
    mark_order_paid,
    release_expired_reservations,
)

logger = logging.getLogger(__name__)

CART_HEADER = "X-Cart-Id"


def _find_cart(request) -> Cart | None:
    """
    Localiza el carrito de la petición **sin crearlo**. Con sesión iniciada, el del
    usuario; si no, el UUID que el frontend guarda y envía en `X-Cart-Id`.
    """
    if request.user.is_authenticated:
        return Cart.objects.filter(user=request.user, checked_out_at=None).first()

    cart_id = request.headers.get(CART_HEADER)
    if not cart_id:
        return None
    try:
        return Cart.objects.filter(id=cart_id, user__isnull=True, checked_out_at=None).first()
    except (ValueError, ValidationError):
        # Cabecera con un UUID mal formado: se trata como «no hay carrito», no como error.
        return None


def _get_or_create_cart(request) -> Cart:
    """
    Igual que `_find_cart`, pero creando el carrito si no existe. **Solo para escrituras**:
    crearlo en los GET llenaría la tabla con una fila por cada visita de bot.
    """
    cart = _find_cart(request)
    if cart is not None:
        return cart
    if request.user.is_authenticated:
        # `get_or_create` y no `create`: dos peticiones simultáneas del mismo usuario
        # chocarían contra la constraint de «un carrito abierto por usuario», y aquí el
        # IntegrityError se reintenta como lectura en vez de reventar la petición.
        cart, _created = Cart.objects.get_or_create(user=request.user, checked_out_at=None)
        return cart
    return Cart.objects.create()


def _serialized_cart(cart: Cart, request) -> dict:
    """Recarga el carrito con los prefetch de la ficha para no dispararle N+1 al frontend."""
    cart = Cart.objects.prefetch_related(
        "items__variant__colorway__product__family",
        "items__variant__colorway__color",
        "items__variant__colorway__images",
        "items__variant__size",
    ).get(pk=cart.pk)
    return CartSerializer(cart, context={"request": request}).data


class CartView(APIView):
    """
    Carrito actual, con el desglose de IVA y envío ya calculado.

    El `GET` **no crea nada**: si aún no hay carrito devuelve uno vacío con `id: null`. El
    carrito nace en el primer `POST`, y es entonces cuando el frontend recibe el `id` que
    debe guardar y mandar en `X-Cart-Id`.
    """

    permission_classes = [AllowAny]

    @extend_schema(responses={200: CartSerializer})
    def get(self, request):
        cart = _find_cart(request)
        if cart is None:
            # No se crea nada en un GET: cualquier crawler llenaría la tabla de carritos
            # vacíos. El frontend recibe un carrito vacío y obtiene su id al añadir algo.
            return Response(empty_cart_payload())
        return Response(_serialized_cart(cart, request))

    @extend_schema(request=CartItemWriteSerializer, responses={200: CartSerializer})
    def post(self, request):
        """Añade una variante o **suma** a la cantidad que ya hubiera."""
        cart = _get_or_create_cart(request)
        serializer = CartItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        variant = serializer.validated_data["variant"]
        quantity = serializer.validated_data["quantity"]

        item = cart.items.filter(variant=variant).first()
        new_quantity = quantity if item is None else item.quantity + quantity
        if new_quantity > variant.available:
            raise BusinessRuleError(
                f"Solo quedan {variant.available} unidades de este artículo.",
                code="out_of_stock",
                details={"available": variant.available},
            )
        CartItem.objects.update_or_create(
            cart=cart, variant=variant, defaults={"quantity": new_quantity}
        )
        return Response(_serialized_cart(cart, request))


class CartItemView(APIView):
    """Cambia la cantidad de una línea o la elimina."""

    permission_classes = [AllowAny]

    def _get_item(self, request, item_id) -> CartItem:
        # `_find_cart` y no `_get_or_create_cart`: modificar o borrar una línea nunca debe
        # crear un carrito. Sin esto, un DELETE sobre un id inexistente creaba una fila y
        # después devolvía 404 — el mismo vector de basura que ya se cerró en el GET.
        cart = _find_cart(request)
        item = cart.items.filter(id=item_id).first() if cart is not None else None
        if item is None:
            raise NotFound("Esa línea no está en tu carrito.")
        return item

    @extend_schema(request=CartItemWriteSerializer, responses={200: CartSerializer})
    def patch(self, request, item_id):
        item = self._get_item(request, item_id)
        quantity = request.data.get("quantity")
        serializer = CartItemWriteSerializer(
            data={"variant": item.variant_id, "quantity": quantity}
        )
        serializer.is_valid(raise_exception=True)
        item.quantity = serializer.validated_data["quantity"]
        item.save(update_fields=["quantity", "updated_at"])
        return Response(_serialized_cart(item.cart, request))

    @extend_schema(responses={200: CartSerializer})
    def delete(self, request, item_id):
        item = self._get_item(request, item_id)
        cart = item.cart
        item.delete()
        return Response(_serialized_cart(cart, request))


class CheckoutView(APIView):
    """
    Cierra el carrito: crea el pedido, **reserva el stock 1 hora** y devuelve el
    `client_secret` de Stripe para que el frontend cobre el 100%.

    El pedido no se da por pagado aquí: eso lo confirma el webhook de Stripe.
    """

    permission_classes = [AllowAny]

    @extend_schema(request=CheckoutSerializer, responses={201: OrderSerializer})
    def post(self, request):
        # Único punto donde la liberación va en línea: aquí se compromete stock de verdad
        # y hay que contar con las reservas caducadas. En el resto lo hace el comando
        # `release_reservations` por cron: en la ruta caliente costaba un SELECT y una
        # transacción por pedido caducado en cada visita al carrito.
        release_expired_reservations()
        # Tampoco aquí se crea nada: sin carrito, la compra no puede prosperar y crear uno
        # vacío solo dejaría basura antes de responder «carrito vacío».
        cart = _find_cart(request)
        if cart is None:
            raise BusinessRuleError("El carrito está vacío.", code="cart_empty")

        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = create_order_from_cart(
            cart=cart,
            checkout_data=serializer.validated_data,
            user=request.user,
        )
        if order.invoice_requested:
            order.invoice_requested_at = timezone.now()
            order.save(update_fields=["invoice_requested_at", "updated_at"])

        payload = {"order": OrderSerializer(order).data}
        payload["payment"] = self._start_payment(order)
        return Response(payload, status=status.HTTP_201_CREATED)

    def _start_payment(self, order: Order) -> dict | None:
        """
        Crea el PaymentIntent. Si Stripe no está configurado todavía, el pedido queda
        creado y con el stock reservado, y se devuelve `null`: el fallo de la pasarela no
        debe hacer perder el pedido.
        """
        try:
            intent = get_gateway().create_payment_intent(
                amount=to_minor_units(order.total_gross),
                currency=order.currency,
                metadata={"order_id": str(order.id), "order_reference": order.reference},
            )
        except Exception:
            logger.exception("stripe_payment_intent_failed", extra={"order": order.reference})
            return None

        order.stripe_payment_intent_id = intent["id"]
        order.save(update_fields=["stripe_payment_intent_id", "updated_at"])
        return {"client_secret": intent["client_secret"]}


class StripeWebhookView(APIView):
    """
    Webhook de Stripe. Confirma el pago y descuenta el stock.

    Es idempotente: Stripe reintenta, y aplicar dos veces el mismo evento dejaría el
    almacén descuadrado.
    """

    permission_classes = [AllowAny]
    authentication_classes: list = []
    # Sin límite de ritmo: todos los webhooks llegan del mismo rango de IPs de Stripe.
    # Un 429 durante un pico de ventas o una reposición de eventos retrasaría la
    # confirmación de pedidos **ya pagados**. La firma es lo que autentica aquí.
    throttle_classes: list = []

    @extend_schema(request=None, responses={200: None})
    def post(self, request):
        signature = request.headers.get("Stripe-Signature", "")
        try:
            event = get_gateway().verify_webhook(payload=request.body, signature=signature)
        except Exception:
            logger.warning("stripe_webhook_invalid_signature")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get("type")
        obj = event.get("data", {}).get("object", {})
        order_id = (obj.get("metadata") or {}).get("order_id")
        if not order_id:
            return Response(status=status.HTTP_200_OK)

        if event_type == "payment_intent.succeeded":
            # Se pasa lo que Stripe dice haber cobrado para contrastarlo con el total del
            # pedido: confirmar sin comparar importe y moneda deja pasar manipulaciones.
            order = mark_order_paid(
                order_id=order_id,
                payment_intent_id=obj.get("id", ""),
                amount_received=obj.get("amount_received"),
                currency=obj.get("currency"),
            )
            # Solo si el cobro se dio por bueno. El correo va fuera de la transacción y sin
            # propagar: Stripe reintentaría el webhook y volveríamos a confirmar el pedido
            # solo porque falló el servidor de correo.
            if order.is_paid:
                try:
                    send_order_confirmation(order=order)
                except Exception:
                    logger.exception(
                        "order_confirmation_email_failed", extra={"order": order.reference}
                    )
        elif event_type == "payment_intent.payment_failed":
            # No se cancela: el cliente aún puede reintentar dentro de la hora de reserva.
            logger.info("stripe_payment_failed", extra={"order_id": order_id})

        return Response(status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Pedidos del cliente. Solo lectura.

    No expone el estado del envío: de la logística se encarga una empresa externa y al
    cliente se le remite a su correo o al teléfono de la tienda.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    queryset = Order.objects.none()

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .exclude(status=OrderStatus.PENDING_PAYMENT)
            .prefetch_related("lines__return_lines__return_request")
        )

    @extend_schema(request=None, responses={202: None})
    @action(detail=True, methods=["post"], url_path="request-invoice")
    def request_invoice(self, request, pk=None):
        """
        Pide la factura. No se genera PDF: se manda un correo a administración con los
        datos del cliente, las líneas y el total, para emitirla a mano.
        """
        order = self.get_object()
        if not order.is_paid:
            raise BusinessRuleError("Solo se factura un pedido pagado.", code="order_not_paid")
        send_invoice_request(order=order)
        if not order.invoice_requested:
            order.invoice_requested = True
            order.invoice_requested_at = timezone.now()
            order.save(update_fields=["invoice_requested", "invoice_requested_at", "updated_at"])
        return Response(status=status.HTTP_202_ACCEPTED)

    @extend_schema(request=ReturnCreateSerializer, responses={201: ReturnSerializer})
    @action(detail=True, methods=["post"], url_path="returns")
    def create_return(self, request, pk=None):
        """
        Solicita una devolución, total o parcial. Plazo de 14 días y retorno a cargo del
        cliente. Queda en «solicitada» hasta que el panel la acepte.
        """
        order = self.get_object()
        if not order.can_be_returned:
            raise BusinessRuleError(
                "El plazo de devolución de este pedido ha terminado.",
                code="return_window_closed",
            )

        serializer = ReturnCreateSerializer(data=request.data, context={"order": order})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            return_request = Return.objects.create(
                order=order, reason=serializer.validated_data["reason"]
            )
            for line in serializer.validated_data["lines"]:
                ReturnLine.objects.create(
                    return_request=return_request,
                    order_line=line["order_line"],
                    quantity=line["quantity"],
                )

        return Response(ReturnSerializer(return_request).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=None, responses={200: OrderSerializer})
    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        """Cancela un pedido que aún no se ha pagado y libera su reserva de stock."""
        # No usa get_object(): el queryset del listado excluye los pendientes de pago,
        # que son justo los únicos cancelables.
        try:
            order = Order.objects.filter(id=pk, user=request.user).first()
        except (ValueError, ValidationError):
            # pk que no es un UUID: Django lanza ValidationError y saldría un 500.
            order = None
        if order is None:
            raise NotFound("Pedido no encontrado.")
        cancel_unpaid_order(order=order)
        order.refresh_from_db()
        return Response(OrderSerializer(order).data)


class GuestOrderLookupView(APIView):
    """
    Consulta de un pedido hecho **sin cuenta**, mediante el token que se envía al comprador.

    No se busca por referencia + email a propósito: la referencia es correlativa
    (`FC-001000`, `FC-001001`…), así que con el correo de una persona se podría recorrer el
    rango entero y extraer direcciones postales, teléfonos e importes. El token es un
    secreto de 256 bits, no enumerable, y además el endpoint va limitado por ritmo.
    """

    permission_classes = [AllowAny]
    throttle_scope = "order_lookup"

    @extend_schema(responses={200: OrderSerializer})
    def get(self, request):
        token = (request.query_params.get("token") or "").strip()
        if not token:
            raise BusinessRuleError(
                "Falta el enlace de seguimiento que te enviamos por correo.",
                code="lookup_incomplete",
            )

        order = Order.objects.filter(access_token=token).first()
        if order is None:
            raise NotFound("No encontramos ningún pedido con ese enlace.")
        return Response(OrderSerializer(order).data)
