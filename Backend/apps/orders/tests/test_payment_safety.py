"""
Confirmación de pago. Todo lo de aquí protege dinero real o stock real: son los casos en
los que aceptar un cobro a ciegas deja el almacén en negativo o cobra algo que no se puede
servir.
"""

import pytest
from django.utils import timezone

from apps.integrations.stripe import to_minor_units
from apps.orders.models import Cart, CartItem, Order, OrderStatus
from apps.orders.services import (
    create_order_from_cart,
    mark_order_paid,
    release_expired_reservations,
)


@pytest.fixture
def pending_order(db, variant, checkout_data):
    cart = Cart.objects.create()
    CartItem.objects.create(cart=cart, variant=variant, quantity=2)
    return create_order_from_cart(cart=cart, checkout_data=checkout_data)


def _expire(order):
    Order.objects.filter(id=order.id).update(
        reserved_until=timezone.now() - timezone.timedelta(minutes=1)
    )


def test_un_pedido_caducado_no_se_confirma_aunque_llegue_el_pago(pending_order, variant):
    """
    El caso caro: la reserva caduca a los 60 min, el cliente paga a los 65 y el stock ya
    volvió al almacén. Confirmarlo vendería unidades que quizá ya se vendieron a otro.
    """
    _expire(pending_order)
    release_expired_reservations()

    order = mark_order_paid(order_id=pending_order.id, payment_intent_id="pi_tarde")

    assert order.status == OrderStatus.CANCELLED
    assert order.is_paid is False
    assert order.stock_committed is False
    assert order.needs_manual_refund is True

    variant.refresh_from_db()
    assert variant.stock == 5  # intacto: no se descontó nada
    assert variant.reserved == 0


def test_el_rechazo_deja_rastro_para_reembolsar_a_mano(pending_order):
    _expire(pending_order)
    release_expired_reservations()

    order = mark_order_paid(order_id=pending_order.id, payment_intent_id="pi_tarde")

    assert "Cobro rechazado" in order.staff_note
    assert order.stripe_payment_intent_id == "pi_tarde"


def test_un_importe_distinto_del_esperado_no_se_acepta(pending_order, variant):
    order = mark_order_paid(
        order_id=pending_order.id,
        payment_intent_id="pi_1",
        amount_received=100,  # céntimos: nada que ver con el total
        currency="eur",
    )

    assert order.is_paid is False
    assert order.needs_manual_refund is True
    variant.refresh_from_db()
    assert variant.stock == 5


def test_una_moneda_distinta_no_se_acepta(pending_order):
    order = mark_order_paid(
        order_id=pending_order.id,
        payment_intent_id="pi_1",
        amount_received=to_minor_units(pending_order.total_gross),
        currency="usd",
    )

    assert order.is_paid is False
    assert order.needs_manual_refund is True


def test_el_importe_correcto_si_se_acepta(pending_order, variant):
    order = mark_order_paid(
        order_id=pending_order.id,
        payment_intent_id="pi_1",
        amount_received=to_minor_units(pending_order.total_gross),
        currency="eur",
    )

    assert order.is_paid is True
    assert order.needs_manual_refund is False
    variant.refresh_from_db()
    assert variant.stock == 3


def test_sin_datos_de_importe_se_acepta_igual(pending_order):
    """Compatibilidad: no todos los caminos disponen del importe (p. ej. confirmación
    manual desde el panel)."""
    assert mark_order_paid(order_id=pending_order.id).is_paid is True


def test_el_pago_confirmado_manda_el_correo_con_el_enlace_de_seguimiento(
    pending_order, mailoutbox, settings
):
    """Es el único sitio por donde viaja el access_token: sin este correo, quien compró
    sin cuenta no tiene forma de volver a ver su pedido."""
    from apps.integrations.emails import send_order_confirmation

    order = mark_order_paid(order_id=pending_order.id)
    send_order_confirmation(order=order)

    assert len(mailoutbox) == 1
    body = mailoutbox[0].body
    assert mailoutbox[0].to == [order.email]
    assert order.reference in mailoutbox[0].subject
    assert order.access_token in body
    assert settings.FRONTEND_BASE_URL in body
    assert "Vestido Aria" in body


def test_el_correo_de_confirmacion_no_promete_estados_de_envio(pending_order, mailoutbox):
    """La logística la lleva una empresa externa: no se anuncian estados ni fechas."""
    from apps.integrations.emails import send_order_confirmation

    send_order_confirmation(order=mark_order_paid(order_id=pending_order.id))

    body = mailoutbox[0].body.lower()
    assert "en preparación" not in body
    assert "enviado" not in body
