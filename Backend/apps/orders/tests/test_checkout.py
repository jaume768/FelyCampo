"""
Ciclo de vida del stock en el checkout: reservar → confirmar → o liberar al caducar.
Es la parte donde un fallo cuesta dinero real, así que se cubre entera.
"""

from decimal import Decimal

import pytest
from django.utils import timezone

from apps.catalog.models import SaleMode
from apps.core.exceptions import BusinessRuleError
from apps.orders.models import Cart, CartItem, Order, OrderStatus
from apps.orders.services import (
    cancel_unpaid_order,
    create_order_from_cart,
    mark_order_paid,
    quote_totals,
    release_expired_reservations,
)


@pytest.fixture
def cart_with_item(db, variant):
    cart = Cart.objects.create()
    CartItem.objects.create(cart=cart, variant=variant, quantity=2)
    return cart


def test_checkout_reserva_stock_sin_descontarlo_todavia(cart_with_item, variant, checkout_data):
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)
    variant.refresh_from_db()

    assert order.status == OrderStatus.PENDING_PAYMENT
    assert variant.stock == 5  # aún no ha salido del almacén
    assert variant.reserved == 2
    assert variant.available == 3
    assert order.reserved_until is not None


def test_checkout_congela_precios_y_datos_del_articulo(cart_with_item, checkout_data):
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)
    line = order.lines.get()

    assert line.sku == "VE-120-ROJ"
    assert line.product_name == "Vestido Aria"
    assert line.color_name == "Rojo"
    assert line.size_code == "38"
    assert line.unit_price_net == Decimal("200.00")
    assert line.line_net == Decimal("400.00")


def test_totales_incluyen_envio_e_iva(cart_with_item, checkout_data, settings):
    settings.SHIPPING_FLAT_RATE = "5.00"
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)

    assert order.subtotal_net == Decimal("400.00")
    assert order.shipping_net == Decimal("5.00")
    assert order.vat_total == Decimal("85.05")  # 21% de 405
    assert order.total_gross == Decimal("490.05")


def test_pagar_descuenta_el_stock_y_suelta_la_reserva(cart_with_item, variant, checkout_data):
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)

    mark_order_paid(order_id=order.id, payment_intent_id="pi_123")

    order.refresh_from_db()
    variant.refresh_from_db()
    assert order.status == OrderStatus.PAID
    assert order.is_paid
    assert order.stripe_payment_intent_id == "pi_123"
    assert variant.stock == 3
    assert variant.reserved == 0


def test_pagar_dos_veces_no_descuenta_el_stock_dos_veces(cart_with_item, variant, checkout_data):
    """Stripe reintenta los webhooks; aplicar el mismo evento dos veces no puede duplicar."""
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)

    mark_order_paid(order_id=order.id, payment_intent_id="pi_123")
    mark_order_paid(order_id=order.id, payment_intent_id="pi_123")

    variant.refresh_from_db()
    assert variant.stock == 3


def test_la_reserva_caducada_devuelve_el_stock(cart_with_item, variant, checkout_data):
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)
    Order.objects.filter(id=order.id).update(
        reserved_until=timezone.now() - timezone.timedelta(minutes=1)
    )

    assert release_expired_reservations() == 1

    order.refresh_from_db()
    variant.refresh_from_db()
    assert order.status == OrderStatus.CANCELLED
    assert variant.reserved == 0
    assert variant.available == 5


def test_liberar_reservas_no_toca_un_pedido_ya_pagado(cart_with_item, variant, checkout_data):
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)
    mark_order_paid(order_id=order.id)
    Order.objects.filter(id=order.id).update(
        reserved_until=timezone.now() - timezone.timedelta(minutes=1)
    )

    assert release_expired_reservations() == 0

    variant.refresh_from_db()
    assert variant.stock == 3


def test_no_se_puede_comprar_mas_de_lo_disponible(db, variant, checkout_data):
    cart = Cart.objects.create()
    CartItem.objects.create(cart=cart, variant=variant, quantity=9)

    with pytest.raises(BusinessRuleError) as exc:
        create_order_from_cart(cart=cart, checkout_data=checkout_data)

    assert exc.value.detail.code == "out_of_stock"
    assert exc.value.details["items"][0]["available"] == 5


def test_dos_checkouts_no_pueden_vender_la_misma_unidad(db, variant, checkout_data):
    """La reserva del primero deja al segundo sin stock suficiente."""
    first = Cart.objects.create()
    CartItem.objects.create(cart=first, variant=variant, quantity=4)
    second = Cart.objects.create()
    CartItem.objects.create(cart=second, variant=variant, quantity=4)

    create_order_from_cart(cart=first, checkout_data=checkout_data)

    with pytest.raises(BusinessRuleError):
        create_order_from_cart(cart=second, checkout_data=checkout_data)


def test_carrito_vacio_no_genera_pedido(db, checkout_data):
    with pytest.raises(BusinessRuleError) as exc:
        create_order_from_cart(cart=Cart.objects.create(), checkout_data=checkout_data)

    assert exc.value.detail.code == "cart_empty"


def test_un_carrito_no_puede_pasar_por_caja_dos_veces(cart_with_item, checkout_data):
    create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)
    cart_with_item.refresh_from_db()

    with pytest.raises(BusinessRuleError) as exc:
        create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)

    assert exc.value.detail.code == "cart_closed"


def test_producto_de_solo_consulta_no_puede_comprarse(cart_with_item, variant, checkout_data):
    product = variant.colorway.product
    product.sale_mode = SaleMode.ON_REQUEST
    product.price = None
    product.save()

    with pytest.raises(BusinessRuleError) as exc:
        create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)

    assert exc.value.detail.code == "product_not_purchasable"


def test_por_debajo_del_minimo_se_rechaza(cart_with_item, checkout_data, settings):
    settings.ORDER_MINIMUM_TOTAL = "1000.00"

    with pytest.raises(BusinessRuleError) as exc:
        create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)

    assert exc.value.detail.code == "below_minimum"


def test_cancelar_un_pedido_sin_pagar_libera_la_reserva(cart_with_item, variant, checkout_data):
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)

    cancel_unpaid_order(order=order)

    variant.refresh_from_db()
    order.refresh_from_db()
    assert order.status == OrderStatus.CANCELLED
    assert variant.available == 5


def test_no_se_cancela_un_pedido_ya_pagado(cart_with_item, checkout_data):
    order = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)
    mark_order_paid(order_id=order.id)
    order.refresh_from_db()

    with pytest.raises(BusinessRuleError) as exc:
        cancel_unpaid_order(order=order)

    assert exc.value.detail.code == "not_cancellable"


def test_los_numeros_de_pedido_no_se_repiten(cart_with_item, variant, checkout_data):
    first = create_order_from_cart(cart=cart_with_item, checkout_data=checkout_data)

    other_cart = Cart.objects.create()
    CartItem.objects.create(cart=other_cart, variant=variant, quantity=1)
    second = create_order_from_cart(cart=other_cart, checkout_data=checkout_data)

    assert second.number > first.number
    assert first.reference.startswith("FC-")


def test_el_envio_es_tarifa_plana_sin_depender_del_importe(settings):
    settings.SHIPPING_FLAT_RATE = "5.00"

    small = quote_totals(Decimal("50.00"))
    large = quote_totals(Decimal("5000.00"))

    assert small["shipping_net"] == large["shipping_net"] == Decimal("5.00")
