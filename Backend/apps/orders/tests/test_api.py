"""
Recorrido HTTP que hará el frontend: carrito de invitado → checkout → pedido, más el
área privada del cliente.
"""

import pytest
from rest_framework.test import APIClient

from apps.orders.models import Cart, CartItem, Order
from apps.orders.services import create_order_from_cart, mark_order_paid


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def user(db, django_user_model):
    return django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-larga!")


def test_invitado_puede_llenar_el_carrito_sin_cuenta(api, variant):
    response = api.post("/api/v1/cart/", {"variant": str(variant.id), "quantity": 2}, format="json")

    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 1
    assert body["items"][0]["unit_price_gross"] == "242.00"
    assert body["totals"]["subtotal_net"] == "400.00"


def test_el_carrito_de_invitado_se_recupera_con_la_cabecera(api, variant):
    created = api.post(
        "/api/v1/cart/", {"variant": str(variant.id), "quantity": 1}, format="json"
    ).json()

    response = api.get("/api/v1/cart/", headers={"X-Cart-Id": created["id"]})

    assert response.json()["id"] == created["id"]
    assert len(response.json()["items"]) == 1


def test_anadir_dos_veces_suma_en_vez_de_duplicar_la_linea(api, variant):
    first = api.post(
        "/api/v1/cart/", {"variant": str(variant.id), "quantity": 1}, format="json"
    ).json()
    response = api.post(
        "/api/v1/cart/",
        {"variant": str(variant.id), "quantity": 2},
        format="json",
        headers={"X-Cart-Id": first["id"]},
    )

    items = response.json()["items"]
    assert len(items) == 1
    assert items[0]["quantity"] == 3


def test_no_se_puede_meter_al_carrito_mas_de_lo_que_hay(api, variant):
    response = api.post(
        "/api/v1/cart/", {"variant": str(variant.id), "quantity": 99}, format="json"
    )

    assert response.status_code == 400
    assert "quantity" in response.json()["error"]["details"]


def test_checkout_de_invitado_crea_el_pedido(api, variant, checkout_data):
    cart = api.post(
        "/api/v1/cart/", {"variant": str(variant.id), "quantity": 2}, format="json"
    ).json()

    response = api.post(
        "/api/v1/checkout/", checkout_data, format="json", headers={"X-Cart-Id": cart["id"]}
    )

    assert response.status_code == 201
    order = response.json()["order"]
    assert order["reference"].startswith("FC-")
    assert order["total_gross"] == "484.00"
    assert order["is_paid"] is False
    # Stripe no está configurado en tests: el pedido se crea igual y el pago queda a null.
    assert response.json()["payment"] is None


def test_el_pedido_no_expone_el_estado_de_envio_al_cliente(api, user, variant, checkout_data):
    """Del envío se encarga una empresa externa; al cliente se le remite al correo."""
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, variant=variant, quantity=1)
    order = create_order_from_cart(cart=cart, checkout_data=checkout_data, user=user)
    mark_order_paid(order_id=order.id)

    api.force_authenticate(user)
    body = api.get("/api/v1/orders/").json()

    assert body["count"] == 1
    assert "status" not in body["results"][0]
    assert "staff_note" not in body["results"][0]


def test_los_pedidos_pendientes_de_pago_no_aparecen_en_el_historial(
    api, user, variant, checkout_data
):
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, variant=variant, quantity=1)
    create_order_from_cart(cart=cart, checkout_data=checkout_data, user=user)

    api.force_authenticate(user)

    assert api.get("/api/v1/orders/").json()["count"] == 0


def test_un_cliente_no_ve_los_pedidos_de_otro(api, user, django_user_model, variant, checkout_data):
    otra = django_user_model.objects.create_user(email="otra@example.com", password="Cl4ve-larga!")
    cart = Cart.objects.create(user=otra)
    CartItem.objects.create(cart=cart, variant=variant, quantity=1)
    order = create_order_from_cart(cart=cart, checkout_data=checkout_data, user=otra)
    mark_order_paid(order_id=order.id)

    api.force_authenticate(user)

    assert api.get("/api/v1/orders/").json()["count"] == 0


def test_el_invitado_consulta_su_pedido_con_el_token(api, variant, checkout_data):
    cart = Cart.objects.create()
    CartItem.objects.create(cart=cart, variant=variant, quantity=1)
    order = create_order_from_cart(cart=cart, checkout_data=checkout_data)

    response = api.get("/api/v1/orders/lookup/", {"token": order.access_token})

    assert response.status_code == 200
    assert response.json()["reference"] == order.reference


def test_la_referencia_y_el_correo_no_bastan_para_ver_un_pedido(api, variant, checkout_data):
    """La referencia es correlativa: si sirviera para consultar, se podría enumerar el
    histórico entero y extraer direcciones y teléfonos."""
    cart = Cart.objects.create()
    CartItem.objects.create(cart=cart, variant=variant, quantity=1)
    order = create_order_from_cart(cart=cart, checkout_data=checkout_data)

    response = api.get(
        "/api/v1/orders/lookup/",
        {"reference": order.reference, "email": checkout_data["email"]},
    )

    assert response.status_code == 409  # falta el token


def test_un_token_ajeno_no_abre_ningun_pedido(api, variant, checkout_data):
    cart = Cart.objects.create()
    CartItem.objects.create(cart=cart, variant=variant, quantity=1)
    create_order_from_cart(cart=cart, checkout_data=checkout_data)

    assert api.get("/api/v1/orders/lookup/", {"token": "inventado"}).status_code == 404


def test_los_tokens_de_pedido_son_distintos_entre_si(api, variant, checkout_data):
    tokens = set()
    for _ in range(3):
        cart = Cart.objects.create()
        CartItem.objects.create(cart=cart, variant=variant, quantity=1)
        tokens.add(create_order_from_cart(cart=cart, checkout_data=checkout_data).access_token)

    assert len(tokens) == 3
    assert all(len(t) > 30 for t in tokens)


def test_pedir_factura_envia_el_correo_a_administracion(
    api, user, variant, checkout_data, mailoutbox
):
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, variant=variant, quantity=1)
    order = create_order_from_cart(cart=cart, checkout_data=checkout_data, user=user)
    mark_order_paid(order_id=order.id)

    api.force_authenticate(user)
    response = api.post(f"/api/v1/orders/{order.id}/request-invoice/")

    assert response.status_code == 202
    assert len(mailoutbox) == 1
    assert order.reference in mailoutbox[0].subject
    assert "VE-120-ROJ" in mailoutbox[0].body
    assert Order.objects.get(id=order.id).invoice_requested is True


def test_solicitar_devolucion_desde_el_area_privada(api, user, variant, checkout_data):
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, variant=variant, quantity=2)
    order = create_order_from_cart(cart=cart, checkout_data=checkout_data, user=user)
    mark_order_paid(order_id=order.id)
    line = order.lines.get()

    api.force_authenticate(user)
    response = api.post(
        f"/api/v1/orders/{order.id}/returns/",
        {
            "reason": "Llegó con una costura rota",
            "lines": [{"order_line": str(line.id), "quantity": 1}],
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.json()["status"] == "requested"


def test_no_se_puede_devolver_mas_de_lo_comprado(api, user, variant, checkout_data):
    cart = Cart.objects.create(user=user)
    CartItem.objects.create(cart=cart, variant=variant, quantity=1)
    order = create_order_from_cart(cart=cart, checkout_data=checkout_data, user=user)
    mark_order_paid(order_id=order.id)
    line = order.lines.get()

    api.force_authenticate(user)
    response = api.post(
        f"/api/v1/orders/{order.id}/returns/",
        {"reason": "x", "lines": [{"order_line": str(line.id), "quantity": 5}]},
        format="json",
    )

    assert response.status_code == 400
