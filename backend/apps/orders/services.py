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

import logging
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.catalog.models import Variant
from apps.catalog.pricing import round_money, vat_rate
from apps.core.exceptions import BusinessRuleError
from apps.integrations.emails import send_manual_refund_alert
from apps.integrations.stripe import get_gateway, to_minor_units

from .models import Cart, Order, OrderLine, OrderStatus, OrderStatusChange, Return, ReturnStatus

logger = logging.getLogger(__name__)

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
            # El stock ya volvió al almacén: hay que impedir que el cliente pueda pagar
            # este pedido más tarde. La llamada a Stripe se difiere al commit.
            cancel_payment_intent(order)
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


MANUAL_ORDER_STATUSES = {OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.PROCESSING}


@transaction.atomic
def create_manual_order(*, lines_data: list[dict], checkout_data: dict, status: str) -> Order:
    """
    Alta manual de un pedido desde el panel (Fase 4) — venta tomada por teléfono o en
    persona, sin pasar por el carrito ni por Stripe.

    Sin `user`: quien lo da de alta es la empleada, no la clienta — el pedido nace
    siempre anónimo (invitado), igual que cualquier compra sin cuenta. Vincularlo a la
    cuenta de quien está en el panel sería incorrecto (aparecería como un pedido propio
    de esa persona).

    A diferencia de `create_order_from_cart` (reserva 1h a la espera del pago), aquí no
    hay ambigüedad temporal: quien lo da de alta ya sabe si se ha cobrado o no, así que el
    stock se descuenta **de verdad** desde el primer momento (`stock_committed=True`) si
    `status` es `paid`/`processing`; si es `pending_payment`, se deja constancia del pedido
    pero sin tocar stock todavía — hay que pasarlo a `paid` a mano (no hay webhook de
    Stripe para un pedido que no se creó ahí) cuando llegue el cobro.
    """
    if status not in MANUAL_ORDER_STATUSES:
        raise BusinessRuleError(
            f'No se puede crear un pedido manual en estado "{status}".',
            code="invalid_status_target",
        )
    if not lines_data:
        raise BusinessRuleError("El pedido necesita al menos un artículo.", code="cart_empty")

    subtotal_net = ZERO
    resolved = []
    unavailable = []
    for entry in lines_data:
        variant = Variant.objects.select_for_update().get(id=entry["variant"].id)
        quantity = entry["quantity"]
        if status != OrderStatus.PENDING_PAYMENT and (
            not variant.is_active or variant.available < quantity
        ):
            unavailable.append(
                {
                    "sku": variant.colorway.sku,
                    "size": variant.size.code,
                    "requested": quantity,
                    "available": variant.available,
                }
            )
            continue
        unit_price_net = variant.colorway.product.effective_price or ZERO
        line_net = round_money(unit_price_net * quantity)
        subtotal_net += line_net
        resolved.append((variant, quantity, unit_price_net, line_net))

    if unavailable:
        raise BusinessRuleError(
            "Algunos artículos no tienen stock suficiente.",
            code="out_of_stock",
            details={"items": unavailable},
        )

    totals = quote_totals(subtotal_net)
    is_paid = status in {OrderStatus.PAID, OrderStatus.PROCESSING}
    order = Order.objects.create(
        status=status,
        paid_at=timezone.now() if is_paid else None,
        stock_committed=is_paid,
        **checkout_data,
        **totals,
    )

    for variant, quantity, unit_price_net, line_net in resolved:
        product = variant.colorway.product
        OrderLine.objects.create(
            order=order,
            variant=variant,
            sku=variant.colorway.sku,
            product_name=product.name,
            color_name=variant.colorway.color.name,
            size_code=variant.size.code,
            unit_price_net=unit_price_net,
            quantity=quantity,
            line_net=line_net,
        )
        if is_paid:
            variant.stock = max(variant.stock - quantity, 0)
            variant.save(update_fields=["stock", "updated_at"])

    return order


@transaction.atomic
def mark_order_paid(
    *,
    order_id,
    payment_intent_id: str = "",
    amount_received: int | None = None,
    currency: str | None = None,
) -> Order:
    """
    Confirma el pago: descuenta el stock de verdad y suelta la reserva.

    Idempotente a propósito — Stripe reintenta los webhooks, y cobrar dos veces el stock
    dejaría el almacén en negativo.

    Dos comprobaciones antes de dar nada por bueno, porque a partir de aquí se mueve
    mercancía real:

    - **El pedido sigue vivo.** Si la reserva caducó y se canceló, el stock ya volvió al
      almacén; confirmarlo ahora vendería unidades que no existen. Se marca para reembolso
      manual y se avisa en CRITICAL.
    - **El importe cuadra.** Se compara con lo que Stripe dice haber cobrado. Un importe o
      moneda distintos significan manipulación o un descuadre contable.

    En ambos casos **no se confirma nada**: el dinero está en Stripe y hay que devolverlo a
    mano, que es preferible a un almacén en negativo y a un pedido que no se puede servir.
    """
    order = Order.objects.select_for_update().get(id=order_id)
    if order.stock_committed:
        return order

    problem = _payment_rejection_reason(order, amount_received, currency)
    if problem is not None:
        logger.critical(
            "order_payment_rejected",
            extra={
                "order": order.reference,
                "reason": problem,
                "payment_intent": payment_intent_id,
            },
        )
        order.needs_manual_refund = True
        order.staff_note = f"{order.staff_note}\n[AUTOMÁTICO] Cobro rechazado: {problem}".strip()
        if payment_intent_id:
            order.stripe_payment_intent_id = payment_intent_id
        order.save(
            update_fields=[
                "needs_manual_refund",
                "staff_note",
                "stripe_payment_intent_id",
                "updated_at",
            ]
        )
        # El log en CRITICAL no lo lee nadie de la tienda. Se avisa por correo, tras el
        # commit para no retener el bloqueo del pedido mientras se envía, y sin propagar:
        # que falle el correo no puede revertir el registro del problema.
        transaction.on_commit(lambda: _alert_manual_refund(order, problem))
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


def _alert_manual_refund(order: Order, reason: str) -> None:
    try:
        send_manual_refund_alert(order=order, reason=reason)
    except Exception:
        logger.exception("manual_refund_alert_failed", extra={"order": order.reference})


def _payment_rejection_reason(
    order: Order, amount_received: int | None, currency: str | None
) -> str | None:
    """Devuelve por qué no debe aceptarse este cobro, o `None` si todo cuadra."""
    if order.status == OrderStatus.CANCELLED:
        return "el pedido ya estaba cancelado y su stock se devolvió al almacén"

    if amount_received is not None:
        expected = to_minor_units(order.total_gross)
        if amount_received != expected:
            return f"importe cobrado {amount_received} ≠ esperado {expected} (céntimos)"

    if currency is not None and currency.upper() != order.currency.upper():
        return f"moneda cobrada {currency.upper()} ≠ esperada {order.currency}"

    return None


def cancel_payment_intent(order: Order) -> None:
    """
    Anula el intento de cobro del pedido.

    Se programa con `on_commit`: es una llamada HTTP a Stripe y ejecutarla dentro de la
    transacción mantendría abierto el `select_for_update` del pedido durante todo lo que
    tarde la red. Nunca propaga: si Stripe falla, la cancelación del pedido debe
    completarse igual y `mark_order_paid` sigue protegiendo el stock.
    """
    payment_intent_id = order.stripe_payment_intent_id
    if not payment_intent_id:
        return

    def _cancel():
        try:
            get_gateway().cancel_payment_intent(payment_intent_id=payment_intent_id)
        except Exception:
            logger.exception("stripe_cancel_failed", extra={"order": order.reference})

    transaction.on_commit(_cancel)


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
    cancel_payment_intent(order)
    return order


# Estados a los que el panel puede mover un pedido a mano (Fase 4) — solo dentro del
# tramo de preparación/envío de un pedido YA pagado, en cualquier dirección dentro de
# ese tramo (mismo criterio del mock: "no hay flujo forzado, se puede saltar a
# cualquiera"). `paid` lo pone `mark_order_paid` (webhook de Stripe);
# `cancelled`/`refunded`/`partially_refunded` los ponen sus propios flujos (cancelación
# antes de pagar, devoluciones aceptadas) — mezclarlos con un cambio manual dejaría
# stock/reembolsos a medias, por eso no están en este conjunto.
MANUALLY_SETTABLE_STATUSES = {OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED}


@transaction.atomic
def change_order_status(*, order: Order, new_status: str, user, note: str = "") -> Order:
    """
    Cambia el estado de un pedido a mano desde el panel — solo dentro del tramo de
    preparación/envío (`paid`→`processing`→`shipped`→`delivered`), y solo hacia delante o
    hacia atrás DENTRO de ese tramo (el mock permitía saltar libremente entre sus 3
    estados; aquí se mantiene esa libertad, pero acotada al tramo que tiene sentido tocar
    a mano — no se puede "cambiar el estado" a `paid`/`cancelled`/`refunded`, esos los
    deciden sus propios flujos). Dispara siempre un `OrderStatusChange`.
    """
    order = Order.objects.select_for_update().get(id=order.id)

    if new_status not in MANUALLY_SETTABLE_STATUSES:
        raise BusinessRuleError(
            f'No se puede cambiar el estado a "{new_status}" desde aquí.',
            code="invalid_status_target",
        )
    if order.status not in MANUALLY_SETTABLE_STATUSES and order.status != OrderStatus.PAID:
        raise BusinessRuleError(
            "Este pedido no está en un estado que se pueda cambiar a mano "
            "(hace falta que esté pagado).",
            code="order_not_paid",
        )

    previous_status = order.status
    if previous_status == new_status:
        return order

    order.status = new_status
    update_fields = ["status", "updated_at"]
    if new_status == OrderStatus.SHIPPED and order.shipped_at is None:
        order.shipped_at = timezone.now()
        update_fields.append("shipped_at")
    if new_status == OrderStatus.DELIVERED and order.delivered_at is None:
        order.delivered_at = timezone.now()
        update_fields.append("delivered_at")
    order.save(update_fields=update_fields)

    OrderStatusChange.objects.create(
        order=order,
        from_status=previous_status,
        to_status=new_status,
        changed_by=user if (user is not None and user.is_authenticated) else None,
        note=note,
    )
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

    # Se cuenta sobre **todas** las devoluciones aceptadas del pedido, no solo esta: dos
    # parciales que sumen el pedido entero dejaban el estado en «parcial» para siempre.
    order.status = (
        OrderStatus.REFUNDED if _is_fully_returned(order) else OrderStatus.PARTIALLY_REFUNDED
    )
    order.save(update_fields=["status", "updated_at"])
    return return_request


def reject_return(*, return_request: Return, staff_note: str = "") -> Return:
    """Rechaza una solicitud de devolución — no toca stock ni el estado del pedido."""
    if return_request.status != ReturnStatus.REQUESTED:
        raise BusinessRuleError(
            "Solo se puede rechazar una devolución solicitada.", code="return_not_pending"
        )
    return_request.status = ReturnStatus.REJECTED
    if staff_note:
        return_request.staff_note = staff_note
    return_request.save(update_fields=["status", "staff_note", "updated_at"])
    return return_request


def _ordered_units(order: Order) -> int:
    return sum(line.quantity for line in order.lines.all())


def _accepted_returned_units(order: Order, including: Return | None = None) -> int:
    """
    Unidades devueltas y aceptadas del pedido. `including` permite contar una devolución
    que todavía no está marcada como aceptada (la que se está procesando ahora mismo).
    """
    accepted = order.returns.filter(status=ReturnStatus.ACCEPTED)
    if including is not None:
        accepted = accepted.exclude(pk=including.pk)

    units = sum(line.quantity for r in accepted for line in r.lines.all())
    if including is not None:
        units += sum(line.quantity for line in including.lines.all())
    return units


def _is_fully_returned(order: Order, including: Return | None = None) -> bool:
    return _accepted_returned_units(order, including) >= _ordered_units(order)


def calculate_refund_gross(return_request: Return) -> Decimal:
    """
    Importe a devolver, con IVA: el 100% de los artículos de **esta** devolución.

    El envío se reembolsa una sola vez, y solo cuando el pedido queda devuelto por
    completo. Se mira el acumulado de todas las devoluciones aceptadas: si el cliente
    devuelve en dos veces, el envío entra en la segunda —antes no entraba nunca—, y si
    ya se pagó en una anterior no se vuelve a pagar.
    """
    order = return_request.order
    net = ZERO
    for line in return_request.lines.select_related("order_line"):
        net += round_money(line.order_line.unit_price_net * line.quantity)

    already_complete = _is_fully_returned(order)
    if not already_complete and _is_fully_returned(order, including=return_request):
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
        available = item.variant.available
        existing = user_cart.items.filter(variant=item.variant).first()

        if available <= 0:
            # Se agotó mientras el carrito de invitado esperaba. No se arrastra: meterlo
            # dejaría en el carrito una línea que el checkout va a rechazar igualmente.
            if existing is not None:
                existing.delete()
            item.delete()
            continue

        if existing is None:
            item.quantity = min(item.quantity, available)
            item.cart = user_cart
            item.save(update_fields=["cart", "quantity", "updated_at"])
        else:
            existing.quantity = min(existing.quantity + item.quantity, available)
            existing.save(update_fields=["quantity", "updated_at"])
            item.delete()

    guest_cart.delete()
    return user_cart
