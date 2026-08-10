"""
Reglas de negocio de pedidos. Todo lo que toca stock o dinero vive aquí, no en las vistas.

El ciclo de stock tiene tres momentos:

1. `create_order_from_cart` — reserva (`Variant.reserved += n`) durante
   `STOCK_RESERVATION_MINUTES`. El artículo deja de estar disponible para otros.
2. `mark_order_paid` — confirma: baja el stock real y suelta la reserva.
3. `release_expired_reservations` — si el pago no llegó a tiempo, devuelve lo reservado.

No hace falta Celery: la liberación es perezosa y se ejecuta antes de cualquier lectura de
disponibilidad que importe, siempre dentro de una transacción con `select_for_update`.
"""

from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.catalog.models import Variant
from apps.catalog.pricing import round_money, vat_rate
from apps.core.exceptions import BusinessRuleError

from .models import Cart, Order, OrderLine, OrderStatus, Return, ReturnStatus

ZERO = Decimal("0.00")


def shipping_flat_rate_net() -> Decimal:
    """Tarifa plana de envío, sin IVA. Única, no depende del número de artículos."""
    return round_money(Decimal(str(settings.SHIPPING_FLAT_RATE)))


def order_minimum_total() -> Decimal:
    """Importe mínimo de pedido (sin IVA). Cero desactiva la comprobación."""
    return round_money(Decimal(str(settings.ORDER_MINIMUM_TOTAL)))


def quote_totals(subtotal_net: Decimal) -> dict:
    """
    Calcula el desglose a partir del subtotal sin IVA. Un solo sitio de verdad para que el
    carrito, el checkout y el email de factura no puedan discrepar.
    """
    shipping_net = shipping_flat_rate_net()
    rate = vat_rate()
    taxable = round_money(subtotal_net + shipping_net)
    vat_total = round_money(taxable * rate)
    return {
        "subtotal_net": round_money(subtotal_net),
        "shipping_net": shipping_net,
        "vat_rate": rate,
        "vat_total": vat_total,
        "total_gross": round_money(taxable + vat_total),
        "currency": settings.CURRENCY,
    }


def release_expired_reservations() -> int:
    """
    Devuelve al stock lo reservado por pedidos que nunca se pagaron. Idempotente.
    Retorna cuántos pedidos liberó.
    """
    now = timezone.now()
    released = 0
    expired = Order.objects.filter(
        status=OrderStatus.PENDING_PAYMENT,
        stock_committed=False,
        reserved_until__lt=now,
    ).values_list("id", flat=True)

    for order_id in list(expired):
        with transaction.atomic():
            order = Order.objects.select_for_update().get(id=order_id)
            if order.status != OrderStatus.PENDING_PAYMENT or order.stock_committed:
                continue
            _unreserve(order)
            order.status = OrderStatus.CANCELLED
            order.cancelled_at = now
            order.reserved_until = None
            order.save(update_fields=["status", "cancelled_at", "reserved_until", "updated_at"])
            released += 1
    return released


def _unreserve(order: Order) -> None:
    """Suelta las unidades que este pedido tenía retenidas. Requiere transacción abierta."""
    for line in order.lines.select_related("variant"):
        if line.variant_id is None:
            continue
        variant = Variant.objects.select_for_update().get(id=line.variant_id)
        variant.reserved = max(variant.reserved - line.quantity, 0)
        variant.save(update_fields=["reserved", "updated_at"])


@transaction.atomic
def create_order_from_cart(*, cart: Cart, checkout_data: dict, user=None) -> Order:
    """
    Convierte un carrito en pedido y **reserva el stock**. No cobra: eso lo hace Stripe y
    lo confirma `mark_order_paid`.

    Falla en bloque si algún artículo se quedó sin stock mientras el cliente decidía: se
    bloquea siempre a cero, nunca se acepta un pedido que no se pueda servir.
    """
    if not cart.is_open:
        raise BusinessRuleError("Este carrito ya se convirtió en pedido.", code="cart_closed")

    items = list(cart.items.select_related("variant__colorway__product__family", "variant__size"))
    if not items:
        raise BusinessRuleError("El carrito está vacío.", code="cart_empty")

    subtotal_net = ZERO
    unavailable = []
    locked = {}

    for item in items:
        product = item.variant.colorway.product
        if not product.is_purchasable:
            raise BusinessRuleError(
                f"«{product.name}» es un artículo de solo consulta y no puede comprarse.",
                code="product_not_purchasable",
            )
        # Bloqueo por fila: dos checkouts sobre la misma variante se serializan aquí.
        variant = Variant.objects.select_for_update().get(id=item.variant_id)
        locked[item.id] = variant
        if not variant.is_active or variant.available < item.quantity:
            unavailable.append(
                {
                    "sku": variant.colorway.sku,
                    "size": variant.size.code,
                    "requested": item.quantity,
                    "available": variant.available,
                }
            )
            continue
        subtotal_net += item.line_net

    if unavailable:
        raise BusinessRuleError(
            "Algunos artículos ya no están disponibles en la cantidad solicitada.",
            code="out_of_stock",
            details={"items": unavailable},
        )

    minimum = order_minimum_total()
    if minimum > ZERO and subtotal_net < minimum:
        raise BusinessRuleError(
            f"El importe mínimo de pedido es {minimum} € (sin IVA).",
            code="below_minimum",
            details={"minimum_net": str(minimum), "subtotal_net": str(round_money(subtotal_net))},
        )

    totals = quote_totals(subtotal_net)
    order = Order.objects.create(
        user=user if (user is not None and user.is_authenticated) else None,
        reserved_until=timezone.now()
        + timezone.timedelta(minutes=settings.STOCK_RESERVATION_MINUTES),
        **checkout_data,
        **totals,
    )

    for item in items:
        variant = locked[item.id]
        product = variant.colorway.product
        OrderLine.objects.create(
            order=order,
            variant=variant,
            sku=variant.colorway.sku,
            product_name=product.name,
            color_name=variant.colorway.color.name,
            size_code=variant.size.code,
            unit_price_net=item.unit_price_net,
            quantity=item.quantity,
            line_net=item.line_net,
        )
        variant.reserved += item.quantity
        variant.save(update_fields=["reserved", "updated_at"])

    cart.checked_out_at = timezone.now()
    cart.save(update_fields=["checked_out_at", "updated_at"])
    return order


@transaction.atomic
def mark_order_paid(*, order_id, payment_intent_id: str = "") -> Order:
    """
    Confirma el pago: descuenta el stock de verdad y suelta la reserva.

    Idempotente a propósito — Stripe reintenta los webhooks, y cobrar dos veces el stock
    dejaría el almacén en negativo.
    """
    order = Order.objects.select_for_update().get(id=order_id)
    if order.stock_committed:
        return order

    for line in order.lines.all():
        if line.variant_id is None:
            continue
        variant = Variant.objects.select_for_update().get(id=line.variant_id)
        variant.reserved = max(variant.reserved - line.quantity, 0)
        variant.stock = max(variant.stock - line.quantity, 0)
        variant.save(update_fields=["reserved", "stock", "updated_at"])

    order.status = OrderStatus.PAID
    order.paid_at = timezone.now()
    order.reserved_until = None
    order.stock_committed = True
    if payment_intent_id:
        order.stripe_payment_intent_id = payment_intent_id
    order.save(
        update_fields=[
            "status",
            "paid_at",
            "reserved_until",
            "stock_committed",
            "stripe_payment_intent_id",
            "updated_at",
        ]
    )
    return order


@transaction.atomic
def cancel_unpaid_order(*, order: Order) -> Order:
    """Cancela un pedido no pagado y libera su reserva."""
    order = Order.objects.select_for_update().get(id=order.id)
    if order.stock_committed or order.status != OrderStatus.PENDING_PAYMENT:
        raise BusinessRuleError(
            "Solo puede cancelarse un pedido pendiente de pago.", code="not_cancellable"
        )
    _unreserve(order)
    order.status = OrderStatus.CANCELLED
    order.cancelled_at = timezone.now()
    order.reserved_until = None
    order.save(update_fields=["status", "cancelled_at", "reserved_until", "updated_at"])
    return order


@transaction.atomic
def accept_return(*, return_request: Return, refund_amount_gross: Decimal | None = None) -> Return:
    """
    Acepta una devolución: repone stock si procede y deja el pedido marcado como
    reembolsado (total o parcialmente).

    **No mueve dinero**: el reembolso se ejecuta a mano en Stripe y se anota después con
    `refunded_at`.
    """
    if return_request.status == ReturnStatus.ACCEPTED:
        return return_request

    order = return_request.order
    for line in return_request.lines.select_related("order_line__variant"):
        variant_id = line.order_line.variant_id
        if return_request.restock and variant_id is not None:
            variant = Variant.objects.select_for_update().get(id=variant_id)
            variant.stock += line.quantity
            variant.save(update_fields=["stock", "updated_at"])

    if refund_amount_gross is None:
        refund_amount_gross = calculate_refund_gross(return_request)

    return_request.status = ReturnStatus.ACCEPTED
    return_request.refund_amount_gross = refund_amount_gross
    return_request.save(update_fields=["status", "refund_amount_gross", "updated_at"])

    returned_units = sum(line.quantity for line in return_request.lines.all())
    ordered_units = sum(line.quantity for line in order.lines.all())
    order.status = (
        OrderStatus.REFUNDED if returned_units >= ordered_units else OrderStatus.PARTIALLY_REFUNDED
    )
    order.save(update_fields=["status", "updated_at"])
    return return_request


def calculate_refund_gross(return_request: Return) -> Decimal:
    """
    Importe a devolver, con IVA: el 100% de los artículos devueltos. El envío no se
    reembolsa salvo que se devuelva el pedido entero.
    """
    order = return_request.order
    net = ZERO
    for line in return_request.lines.select_related("order_line"):
        net += round_money(line.order_line.unit_price_net * line.quantity)

    returned_units = sum(line.quantity for line in return_request.lines.all())
    ordered_units = sum(line.quantity for line in order.lines.all())
    if returned_units >= ordered_units:
        net += order.shipping_net

    return round_money(net * (Decimal("1") + order.vat_rate))


@transaction.atomic
def merge_carts(*, guest_cart: Cart, user) -> Cart:
    """
    Fusiona el carrito anónimo con el del usuario al iniciar sesión. Suma cantidades sin
    pasarse del stock disponible, y cierra el carrito de invitado.
    """
    user_cart, _created = Cart.objects.get_or_create(user=user, checked_out_at=None)
    if guest_cart.pk == user_cart.pk:
        return user_cart

    for item in guest_cart.items.select_related("variant"):
        existing = user_cart.items.filter(variant=item.variant).first()
        if existing is None:
            item.cart = user_cart
            item.save(update_fields=["cart", "updated_at"])
        else:
            existing.quantity = min(existing.quantity + item.quantity, item.variant.available or 1)
            existing.save(update_fields=["quantity", "updated_at"])
            item.delete()

    guest_cart.delete()
    return user_cart
