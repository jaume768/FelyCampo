"""
Endurecimiento: carritos fantasma, límites de ritmo, fusión de carritos y entradas
malformadas.
"""

import pytest
from rest_framework.test import APIClient

from apps.orders.models import Cart, CartItem
from apps.orders.services import merge_carts


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def user(db, django_user_model):
    return django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-larga!")


def test_consultar_el_carrito_no_crea_filas(api, db):
    """Un crawler que pase por /cart/ no debe dejar rastro en la base de datos."""
    for _ in range(5):
        response = api.get("/api/v1/cart/")
        assert response.status_code == 200
        assert response.json()["id"] is None

    assert Cart.objects.count() == 0


def test_el_carrito_vacio_ya_trae_los_totales(api, db):
    body = api.get("/api/v1/cart/").json()

    assert body["items"] == []
    assert body["has_stock_issues"] is False
    assert body["totals"]["subtotal_net"] == "0.00"


def test_el_carrito_nace_al_anadir_el_primer_articulo(api, variant):
    api.post("/api/v1/cart/", {"variant": str(variant.id), "quantity": 1}, format="json")

    assert Cart.objects.count() == 1


def test_una_cabecera_de_carrito_corrupta_no_rompe(api, db):
    response = api.get("/api/v1/cart/", headers={"X-Cart-Id": "esto-no-es-un-uuid"})

    assert response.status_code == 200
    assert Cart.objects.count() == 0


def test_cancelar_con_un_id_que_no_es_uuid_devuelve_404(api, user):
    api.force_authenticate(user)

    assert api.post("/api/v1/orders/abc/cancel/").status_code == 404


def test_al_fusionar_no_se_arrastran_articulos_agotados(db, user, variant):
    """Si se agotó mientras el invitado decidía, la línea no debe colarse: el checkout la
    rechazaría igualmente y el cliente vería un carrito que no puede pagar."""
    guest = Cart.objects.create()
    CartItem.objects.create(cart=guest, variant=variant, quantity=1)
    variant.stock = 0
    variant.save()

    merged = merge_carts(guest_cart=guest, user=user)

    assert merged.items.count() == 0


def test_al_fusionar_no_se_supera_el_stock_disponible(db, user, variant):
    variant.stock = 3
    variant.save()
    user_cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=user_cart, variant=variant, quantity=2)
    guest = Cart.objects.create()
    CartItem.objects.create(cart=guest, variant=variant, quantity=2)

    merged = merge_carts(guest_cart=guest, user=user)

    assert merged.items.get().quantity == 3  # no 4


def test_la_consulta_de_pedido_esta_limitada_por_ritmo(api, db, monkeypatch):
    """
    Contiene datos personales y la referencia del pedido es correlativa: sin límite se
    podría barrer el histórico. Se parchea la tasa en la clase porque DRF congela
    `THROTTLE_RATES` al importar y no la relee al cambiar los settings.
    """
    from rest_framework.throttling import ScopedRateThrottle

    monkeypatch.setitem(ScopedRateThrottle.THROTTLE_RATES, "order_lookup", "2/hour")

    codes = [api.get("/api/v1/orders/lookup/", {"token": "x"}).status_code for _ in range(4)]

    assert codes[:2] == [404, 404]
    assert codes[2:] == [429, 429]
