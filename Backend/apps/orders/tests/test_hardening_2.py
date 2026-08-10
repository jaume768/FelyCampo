"""
Segunda ronda de endurecimiento: el límite de ritmo no debe poder esquivarse con una
cabecera, los webhooks y las sondas no deben limitarse, y un usuario no puede acabar con
dos carritos abiertos.
"""

import pytest
from django.db import IntegrityError, transaction
from rest_framework.test import APIClient
from rest_framework.throttling import ScopedRateThrottle

from apps.orders.models import Cart


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def user(db, django_user_model):
    return django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-larga!")


def test_el_limite_no_se_esquiva_falseando_x_forwarded_for(api, db, monkeypatch):
    """
    Con NUM_PROXIES sin configurar, DRF identifica al cliente por el contenido íntegro de
    X-Forwarded-For, que el atacante controla: un valor distinto por petición daría cupo
    nuevo cada vez y anularía todos los límites.
    """
    monkeypatch.setitem(ScopedRateThrottle.THROTTLE_RATES, "order_lookup", "2/hour")

    codes = [
        api.get(
            "/api/v1/orders/lookup/",
            {"token": "x"},
            headers={"X-Forwarded-For": f"10.0.0.{i}, 127.0.0.1"},
        ).status_code
        for i in range(5)
    ]

    assert 429 in codes


def test_el_webhook_de_stripe_no_esta_limitado(api, db, monkeypatch):
    """
    Todos los webhooks llegan del mismo rango de IPs. Un 429 durante un pico retrasaría la
    confirmación de pedidos **ya pagados**.
    """
    from apps.orders.views import StripeWebhookView

    assert StripeWebhookView.throttle_classes == []

    monkeypatch.setattr(
        "rest_framework.throttling.AnonRateThrottle.get_rate", lambda self: "1/hour"
    )
    codes = [api.post("/api/v1/webhooks/stripe/", {}, format="json").status_code for _ in range(3)]

    assert 429 not in codes


def test_las_sondas_de_salud_no_estan_limitadas(api, db, monkeypatch):
    """Un 429 lo leería el orquestador como que el servicio está caído."""
    monkeypatch.setattr(
        "rest_framework.throttling.AnonRateThrottle.get_rate", lambda self: "1/hour"
    )

    codes = [api.get("/api/v1/health/live/").status_code for _ in range(4)]
    codes += [api.get("/api/v1/health/ready/").status_code for _ in range(4)]

    assert set(codes) == {200}


def test_un_usuario_no_puede_tener_dos_carritos_abiertos(db, user):
    Cart.objects.create(user=user)

    with pytest.raises(IntegrityError), transaction.atomic():
        Cart.objects.create(user=user)


def test_tras_pasar_por_caja_si_puede_abrirse_otro(db, user):
    from django.utils import timezone

    first = Cart.objects.create(user=user)
    first.checked_out_at = timezone.now()
    first.save()

    Cart.objects.create(user=user)  # no debe fallar

    assert Cart.objects.filter(user=user).count() == 2


def test_varios_carritos_anonimos_conviven(db):
    """La constraint es solo para usuarios: los invitados se distinguen por su UUID."""
    Cart.objects.create()
    Cart.objects.create()

    assert Cart.objects.filter(user__isnull=True).count() == 2


def test_dos_peticiones_seguidas_del_mismo_usuario_reutilizan_su_carrito(api, user, variant):
    api.force_authenticate(user)

    api.post("/api/v1/cart/", {"variant": str(variant.id), "quantity": 1}, format="json")
    api.post("/api/v1/cart/", {"variant": str(variant.id), "quantity": 1}, format="json")

    assert Cart.objects.filter(user=user, checked_out_at=None).count() == 1
