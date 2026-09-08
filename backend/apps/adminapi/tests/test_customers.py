"""Clientes del panel: acceso, anotaciones de compra y la mitad que compra sin cuenta."""

from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from apps.orders.models import Order, OrderStatus


@pytest.fixture
def staff_client(django_user_model):
    user = django_user_model.objects.create_user(
        email="staff@felycampo.test", password="x", is_staff=True
    )
    api = APIClient()
    api.force_authenticate(user=user)
    return api


@pytest.fixture
def cliente(django_user_model):
    return django_user_model.objects.create_user(
        email="ana@ejemplo.com", password="x", first_name="Ana", last_name="García"
    )


def _pedido(*, user=None, email="quien@ejemplo.com", status=OrderStatus.PAID, total="100.00"):
    return Order.objects.create(
        user=user,
        email=email,
        status=status,
        shipping_recipient="Quien Sea",
        shipping_line1="Calle 1",
        shipping_postal_code="28001",
        shipping_city="Madrid",
        shipping_province="Madrid",
        subtotal_net=Decimal(total),
        shipping_net=Decimal("0.00"),
        vat_rate=Decimal("0.21"),
        vat_total=Decimal("0.00"),
        total_gross=Decimal(total),
    )


def test_clientes_exige_staff(client, cliente):
    assert client.get("/api/v1/admin/customers/").status_code in (401, 403)


def test_el_staff_no_aparece_como_cliente(staff_client, cliente):
    emails = [c["email"] for c in staff_client.get("/api/v1/admin/customers/").json()["results"]]

    assert "ana@ejemplo.com" in emails
    assert "staff@felycampo.test" not in emails


@pytest.mark.django_db
def test_cuenta_los_pedidos_y_suma_el_gasto(staff_client, cliente):
    _pedido(user=cliente, email=cliente.email, total="100.00")
    _pedido(user=cliente, email=cliente.email, total="50.00", status=OrderStatus.DELIVERED)
    # Cancelado: cuenta como pedido, pero NO como gasto.
    _pedido(user=cliente, email=cliente.email, total="999.00", status=OrderStatus.CANCELLED)

    fila = next(
        c for c in staff_client.get("/api/v1/admin/customers/").json()["results"]
        if c["email"] == "ana@ejemplo.com"
    )

    assert fila["orders_count"] == 3
    assert fila["paid_orders_count"] == 2
    assert Decimal(fila["total_spent"]) == Decimal("150.00")


@pytest.mark.django_db
def test_una_compra_de_invitado_no_crea_cliente(staff_client):
    """
    El checkout acepta pedidos sin cuenta: guardan `email` con `user = NULL`. Ese comprador
    NO es un usuario y no puede salir en el listado de clientes.
    """
    _pedido(user=None, email="invitado@ejemplo.com")

    listado = staff_client.get("/api/v1/admin/customers/").json()

    assert listado["count"] == 0
    assert "invitado@ejemplo.com" not in [c["email"] for c in listado["results"]]


@pytest.mark.django_db
def test_los_invitados_se_ven_en_su_propio_endpoint(staff_client):
    """La otra mitad se expone aparte para que el hueco sea visible, no silencioso."""
    _pedido(user=None, email="invitado@ejemplo.com", total="80.00")
    _pedido(user=None, email="invitado@ejemplo.com", total="20.00")

    filas = staff_client.get("/api/v1/admin/customers/guests/").json()

    assert len(filas) == 1
    assert filas[0]["email"] == "invitado@ejemplo.com"
    assert filas[0]["orders_count"] == 2
    assert Decimal(filas[0]["total_spent"]) == Decimal("100.00")


@pytest.mark.django_db
def test_se_puede_bloquear_una_cuenta_pero_no_borrarla(staff_client, cliente):
    respuesta = staff_client.patch(
        f"/api/v1/admin/customers/{cliente.id}/", {"is_active": False}, format="json"
    )
    assert respuesta.status_code == 200
    assert respuesta.json()["is_active"] is False

    # Borrar rompería el histórico de pedidos: el ViewSet no expone destroy.
    assert staff_client.delete(f"/api/v1/admin/customers/{cliente.id}/").status_code == 405


@pytest.mark.django_db
def test_el_correo_no_se_edita_desde_el_panel(staff_client, cliente):
    """Cambiarlo aquí dejaría al cliente sin poder entrar con el suyo."""
    staff_client.patch(
        f"/api/v1/admin/customers/{cliente.id}/", {"email": "otro@ejemplo.com"}, format="json"
    )
    cliente.refresh_from_db()

    assert cliente.email == "ana@ejemplo.com"
