"""CRUD/acciones del panel admin sobre pedidos y devoluciones (Fase 4)."""

from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from apps.orders.models import (
    Order,
    OrderNote,
    OrderStatus,
    OrderStatusChange,
    Return,
    ReturnLine,
)
from apps.orders.services import quote_totals

LIST_ENDPOINTS = ["/api/v1/admin/orders/", "/api/v1/admin/returns/"]


@pytest.fixture
def staff_client(django_user_model):
    staff = django_user_model.objects.create_user(
        email="staff@felycampo.test", password="x", is_staff=True
    )
    client = APIClient()
    client.force_authenticate(staff)
    return client


@pytest.fixture
def non_staff_client(django_user_model):
    user = django_user_model.objects.create_user(email="clienta@felycampo.test", password="x")
    client = APIClient()
    client.force_authenticate(user)
    return client


SHIPPING = {
    "email": "clienta@example.com",
    "phone": "600000000",
    "shipping_recipient": "Ana García",
    "shipping_line1": "Calle Mayor 1",
    "shipping_line2": "",
    "shipping_postal_code": "28013",
    "shipping_city": "Madrid",
    "shipping_province": "Madrid",
}


@pytest.fixture
def order(db, variant):
    from apps.orders.models import OrderLine

    totals = quote_totals(Decimal("200.00"))
    order = Order.objects.create(
        status=OrderStatus.PAID,
        paid_at="2026-01-01T10:00:00Z",
        stock_committed=True,
        **SHIPPING,
        **totals,
    )
    OrderLine.objects.create(
        order=order,
        variant=variant,
        sku=variant.colorway.sku,
        product_name=variant.colorway.product.name,
        color_name=variant.colorway.color.name,
        size_code=variant.size.code,
        unit_price_net=Decimal("200.00"),
        quantity=1,
        line_net=Decimal("200.00"),
    )
    return order


# ---------- Acceso ----------


@pytest.mark.django_db
@pytest.mark.parametrize("url", LIST_ENDPOINTS)
def test_anonimo_403(url):
    assert APIClient().get(url).status_code == 403


@pytest.mark.django_db
@pytest.mark.parametrize("url", LIST_ENDPOINTS)
def test_no_staff_403(url, non_staff_client):
    assert non_staff_client.get(url).status_code == 403


@pytest.mark.django_db
@pytest.mark.parametrize("url", LIST_ENDPOINTS)
def test_staff_200(url, staff_client):
    assert staff_client.get(url).status_code == 200


# ---------- Listado / filtros ----------


@pytest.mark.django_db
def test_el_listado_trae_el_pedido_con_lineas_y_flags(staff_client, order):
    response = staff_client.get("/api/v1/admin/orders/")
    body = response.json()["results"][0]
    assert body["reference"] == order.reference
    assert body["is_paid"] is True
    assert body["is_delayed"] is False
    assert len(body["lines"]) == 1


@pytest.mark.django_db
def test_filtro_por_referencia(staff_client, order):
    numero = order.reference.replace("FC-", "").lstrip("0")
    response = staff_client.get(f"/api/v1/admin/orders/?reference={numero}")
    assert response.json()["count"] == 1


@pytest.mark.django_db
def test_filtro_paid(staff_client, order):
    assert staff_client.get("/api/v1/admin/orders/?paid=true").json()["count"] == 1
    assert staff_client.get("/api/v1/admin/orders/?paid=false").json()["count"] == 0


@pytest.mark.django_db
def test_filtro_is_delayed(staff_client, order):
    assert staff_client.get("/api/v1/admin/orders/?is_delayed=true").json()["count"] == 0

    order.status = OrderStatus.PROCESSING
    order.created_at = "2020-01-01T00:00:00Z"
    order.save(update_fields=["status", "created_at"])

    assert staff_client.get("/api/v1/admin/orders/?is_delayed=true").json()["count"] == 1
    assert staff_client.get("/api/v1/admin/orders/?status=processing").json()["count"] == 1


# ---------- PATCH (tracking / nota interna) ----------


@pytest.mark.django_db
def test_patch_tracking_y_nota(staff_client, order):
    response = staff_client.patch(
        f"/api/v1/admin/orders/{order.id}/",
        {"tracking_carrier": "SEUR", "tracking_code": "ES123", "staff_note": "Frágil"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["tracking_carrier"] == "SEUR"
    order.refresh_from_db()
    assert order.tracking_code == "ES123"
    assert order.staff_note == "Frágil"


@pytest.mark.django_db
def test_patch_no_permite_tocar_importes(staff_client, order):
    response = staff_client.patch(
        f"/api/v1/admin/orders/{order.id}/", {"total_gross": "0.01"}, format="json"
    )
    assert response.status_code == 200
    order.refresh_from_db()
    assert order.total_gross != Decimal("0.01")


# ---------- Cambio de estado ----------


@pytest.mark.django_db
def test_avanzar_estado_valido_crea_historial(staff_client, order):
    order.status = OrderStatus.PROCESSING
    order.save(update_fields=["status"])

    response = staff_client.post(
        f"/api/v1/admin/orders/{order.id}/status/",
        {"status": "shipped", "note": "Salió hoy"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["status"] == "shipped"

    cambio = OrderStatusChange.objects.get(order=order)
    assert cambio.from_status == "processing"
    assert cambio.to_status == "shipped"
    assert cambio.note == "Salió hoy"


@pytest.mark.django_db
def test_no_se_puede_poner_estado_fuera_del_conjunto_permitido(staff_client, order):
    order.status = OrderStatus.PROCESSING
    order.save(update_fields=["status"])

    response = staff_client.post(
        f"/api/v1/admin/orders/{order.id}/status/", {"status": "cancelled"}, format="json"
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "invalid_status_target"


@pytest.mark.django_db
def test_no_se_puede_cambiar_estado_de_un_pedido_no_pagado(staff_client, order):
    order.status = OrderStatus.PENDING_PAYMENT
    order.save(update_fields=["status"])

    response = staff_client.post(
        f"/api/v1/admin/orders/{order.id}/status/", {"status": "processing"}, format="json"
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "order_not_paid"


@pytest.mark.django_db
def test_historial_endpoint(staff_client, order):
    order.status = OrderStatus.PROCESSING
    order.save(update_fields=["status"])
    staff_client.post(
        f"/api/v1/admin/orders/{order.id}/status/", {"status": "shipped"}, format="json"
    )

    response = staff_client.get(f"/api/v1/admin/orders/{order.id}/history/")
    assert len(response.json()) == 1


# ---------- Notas ----------


@pytest.mark.django_db
def test_anadir_y_listar_notas(staff_client, order):
    response = staff_client.post(
        f"/api/v1/admin/orders/{order.id}/notes/", {"body": "Llamó preguntando"}, format="json"
    )
    assert response.status_code == 201
    assert response.json()["author_email"] == "staff@felycampo.test"

    response = staff_client.get(f"/api/v1/admin/orders/{order.id}/notes/")
    assert len(response.json()) == 1
    assert OrderNote.objects.filter(order=order).count() == 1


@pytest.mark.django_db
def test_nota_vacia_400(staff_client, order):
    response = staff_client.post(
        f"/api/v1/admin/orders/{order.id}/notes/", {"body": "   "}, format="json"
    )
    assert response.status_code == 400


# ---------- Alta manual ----------


@pytest.mark.django_db
def test_alta_manual_pagada_descuenta_stock(staff_client, variant):
    stock_antes = variant.stock
    response = staff_client.post(
        "/api/v1/admin/orders/",
        {**SHIPPING, "status": "paid", "lines": [{"variant": str(variant.id), "quantity": 2}]},
        format="json",
    )
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "paid"
    assert body["is_paid"] is True
    assert len(body["lines"]) == 1

    variant.refresh_from_db()
    assert variant.stock == stock_antes - 2


@pytest.mark.django_db
def test_alta_manual_no_se_atribuye_a_quien_lo_da_de_alta(staff_client, variant):
    # Regresión: el pedido lo crea la empleada en nombre de quien compró por teléfono —
    # antes quedaba vinculado a la cuenta de la propia empleada (`user=request.user`),
    # apareciendo como un pedido suyo en vez de uno anónimo.
    response = staff_client.post(
        "/api/v1/admin/orders/",
        {**SHIPPING, "status": "paid", "lines": [{"variant": str(variant.id), "quantity": 1}]},
        format="json",
    )
    assert response.status_code == 201
    assert response.json()["user"] is None
    assert response.json()["user_email"] is None


@pytest.mark.django_db
def test_alta_manual_pendiente_no_toca_stock(staff_client, variant):
    stock_antes = variant.stock
    response = staff_client.post(
        "/api/v1/admin/orders/",
        {
            **SHIPPING,
            "status": "pending_payment",
            "lines": [{"variant": str(variant.id), "quantity": 1}],
        },
        format="json",
    )
    assert response.status_code == 201
    variant.refresh_from_db()
    assert variant.stock == stock_antes


@pytest.mark.django_db
def test_alta_manual_sin_stock_suficiente_409(staff_client, variant):
    response = staff_client.post(
        "/api/v1/admin/orders/",
        {**SHIPPING, "status": "paid", "lines": [{"variant": str(variant.id), "quantity": 999}]},
        format="json",
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "out_of_stock"


@pytest.mark.django_db
def test_alta_manual_sin_lineas_400(staff_client):
    response = staff_client.post(
        "/api/v1/admin/orders/", {**SHIPPING, "status": "paid", "lines": []}, format="json"
    )
    assert response.status_code == 400


# ---------- Devoluciones ----------


@pytest.fixture
def return_request(db, order):
    line = order.lines.first()
    devolucion = Return.objects.create(order=order, reason="No es de la talla")
    ReturnLine.objects.create(return_request=devolucion, order_line=line, quantity=1)
    return devolucion


@pytest.mark.django_db
def test_aceptar_devolucion_repone_stock_y_marca_reembolsado(staff_client, return_request, variant):
    stock_antes = variant.stock
    response = staff_client.post(f"/api/v1/admin/returns/{return_request.id}/accept/")
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    assert Decimal(response.json()["refund_amount_gross"]) > 0

    variant.refresh_from_db()
    assert variant.stock == stock_antes + 1
    return_request.order.refresh_from_db()
    assert return_request.order.status in {"refunded", "partially_refunded"}


@pytest.mark.django_db
def test_rechazar_devolucion(staff_client, return_request):
    response = staff_client.post(
        f"/api/v1/admin/returns/{return_request.id}/reject/",
        {"staff_note": "Fuera de plazo"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["status"] == "rejected"
    assert response.json()["staff_note"] == "Fuera de plazo"


@pytest.mark.django_db
def test_marcar_reembolsado_exige_devolucion_aceptada(staff_client, return_request):
    response = staff_client.post(f"/api/v1/admin/returns/{return_request.id}/mark-refunded/")
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "return_not_accepted"


@pytest.mark.django_db
def test_marcar_reembolsado_tras_aceptar(staff_client, return_request):
    staff_client.post(f"/api/v1/admin/returns/{return_request.id}/accept/")
    response = staff_client.post(f"/api/v1/admin/returns/{return_request.id}/mark-refunded/")
    assert response.status_code == 200
    assert response.json()["refunded_at"] is not None
