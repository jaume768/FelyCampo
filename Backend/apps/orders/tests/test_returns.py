"""
Devoluciones: 14 días, retorno a cargo del cliente, reembolso del 100% ejecutado a mano.
"""

from decimal import Decimal

import pytest
from django.utils import timezone

from apps.orders.models import (
    Cart,
    CartItem,
    OrderStatus,
    Return,
    ReturnLine,
    ReturnStatus,
)
from apps.orders.services import (
    accept_return,
    calculate_refund_gross,
    create_order_from_cart,
    mark_order_paid,
)


@pytest.fixture
def paid_order(db, variant, checkout_data):
    cart = Cart.objects.create()
    CartItem.objects.create(cart=cart, variant=variant, quantity=2)
    order = create_order_from_cart(cart=cart, checkout_data=checkout_data)
    return mark_order_paid(order_id=order.id)


def test_devolucion_total_repone_stock_y_marca_el_pedido(paid_order, variant):
    devolucion = Return.objects.create(order=paid_order)
    ReturnLine.objects.create(
        return_request=devolucion, order_line=paid_order.lines.get(), quantity=2
    )

    accept_return(return_request=devolucion)

    paid_order.refresh_from_db()
    variant.refresh_from_db()
    assert paid_order.status == OrderStatus.REFUNDED
    assert variant.stock == 5  # 3 tras la venta + 2 devueltas


def test_devolucion_parcial_deja_el_pedido_como_parcialmente_reembolsado(paid_order, variant):
    devolucion = Return.objects.create(order=paid_order)
    ReturnLine.objects.create(
        return_request=devolucion, order_line=paid_order.lines.get(), quantity=1
    )

    accept_return(return_request=devolucion)

    paid_order.refresh_from_db()
    variant.refresh_from_db()
    assert paid_order.status == OrderStatus.PARTIALLY_REFUNDED
    assert variant.stock == 4


def test_prenda_en_mal_estado_no_vuelve_al_stock(paid_order, variant):
    devolucion = Return.objects.create(order=paid_order, restock=False)
    ReturnLine.objects.create(
        return_request=devolucion, order_line=paid_order.lines.get(), quantity=2
    )

    accept_return(return_request=devolucion)

    variant.refresh_from_db()
    assert variant.stock == 3


def test_se_reembolsa_el_100_por_cien_del_articulo(paid_order):
    devolucion = Return.objects.create(order=paid_order)
    ReturnLine.objects.create(
        return_request=devolucion, order_line=paid_order.lines.get(), quantity=1
    )

    # 200 € sin IVA + 21% = 242 €
    assert calculate_refund_gross(devolucion) == Decimal("242.00")


def test_la_devolucion_total_incluye_el_envio(paid_order, settings):
    paid_order.shipping_net = Decimal("5.00")
    paid_order.save()
    devolucion = Return.objects.create(order=paid_order)
    ReturnLine.objects.create(
        return_request=devolucion, order_line=paid_order.lines.get(), quantity=2
    )

    # (400 + 5) × 1.21
    assert calculate_refund_gross(devolucion) == Decimal("490.05")


def test_aceptar_dos_veces_no_repone_el_stock_dos_veces(paid_order, variant):
    devolucion = Return.objects.create(order=paid_order)
    ReturnLine.objects.create(
        return_request=devolucion, order_line=paid_order.lines.get(), quantity=2
    )

    accept_return(return_request=devolucion)
    accept_return(return_request=devolucion)

    variant.refresh_from_db()
    assert variant.stock == 5


def test_aceptar_no_marca_el_dinero_como_devuelto(paid_order):
    """El reembolso se ejecuta a mano en Stripe; aquí solo se registra el importe."""
    devolucion = Return.objects.create(order=paid_order)
    ReturnLine.objects.create(
        return_request=devolucion, order_line=paid_order.lines.get(), quantity=1
    )

    accepted = accept_return(return_request=devolucion)

    assert accepted.status == ReturnStatus.ACCEPTED
    assert accepted.refund_amount_gross == Decimal("242.00")
    assert accepted.refunded_at is None


def test_lo_ya_devuelto_no_puede_volver_a_devolverse(paid_order):
    devolucion = Return.objects.create(order=paid_order)
    line = paid_order.lines.get()
    ReturnLine.objects.create(return_request=devolucion, order_line=line, quantity=1)
    accept_return(return_request=devolucion)

    line.refresh_from_db()
    assert line.returned_quantity == 1
    assert line.returnable_quantity == 1


def test_el_plazo_de_14_dias_se_cierra(paid_order, settings):
    assert paid_order.can_be_returned is True

    paid_order.paid_at = timezone.now() - timezone.timedelta(days=settings.RETURN_WINDOW_DAYS + 1)
    paid_order.save()

    assert paid_order.can_be_returned is False
