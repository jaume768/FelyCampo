"""Puerta de entrada del panel: permisos y flags de funcionalidad."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.core.models import FeatureFlag

User = get_user_model()


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def staff(db):
    return User.objects.create_user(email="staff@felycampo.test", password="x", is_staff=True)


@pytest.fixture
def customer(db):
    return User.objects.create_user(email="cliente@felycampo.test", password="x")


@pytest.fixture
def flag(db):
    return FeatureFlag.objects.create(key="prueba", name="Prueba", is_enabled=False)


# --- Permisos ---------------------------------------------------------------------------
# Se comprueban en los tres endpoints y no solo en uno: el permiso vive en una clase base
# compartida, y un descuido al declarar una vista nueva se manifiesta como un endpoint del
# panel abierto al público.


@pytest.mark.parametrize(
    "url",
    ["/api/v1/admin/me/", "/api/v1/admin/feature-flags/", "/api/v1/admin/media/"],
)
def test_el_panel_esta_cerrado_a_los_anonimos(api, db, url):
    assert api.get(url).status_code == 403


@pytest.mark.parametrize(
    "url",
    ["/api/v1/admin/me/", "/api/v1/admin/feature-flags/", "/api/v1/admin/media/"],
)
def test_un_cliente_registrado_no_entra_en_el_panel(api, customer, url):
    api.force_authenticate(customer)

    # 403 y no 404: quien tiene cuenta pero no es staff debe saber que no tiene permiso.
    assert api.get(url).status_code == 403


@pytest.mark.parametrize(
    "url",
    ["/api/v1/admin/me/", "/api/v1/admin/feature-flags/", "/api/v1/admin/media/"],
)
def test_el_personal_entra_en_el_panel(api, staff, url):
    api.force_authenticate(staff)

    assert api.get(url).status_code == 200


def test_me_devuelve_quien_ha_iniciado_sesion(api, staff):
    api.force_authenticate(staff)

    body = api.get("/api/v1/admin/me/").json()

    assert body["email"] == "staff@felycampo.test"
    assert body["is_staff"] is True


# --- Flags ------------------------------------------------------------------------------


def test_se_puede_activar_un_flag(api, staff, flag):
    api.force_authenticate(staff)

    response = api.patch(f"/api/v1/admin/feature-flags/{flag.key}/", {"is_enabled": True})

    assert response.status_code == 200
    flag.refresh_from_db()
    assert flag.is_enabled is True


def test_la_clave_del_flag_no_se_puede_cambiar(api, staff, flag):
    """La busca el código por nombre: si el panel la reescribe, el flag deja de existir."""
    api.force_authenticate(staff)

    response = api.patch(f"/api/v1/admin/feature-flags/{flag.key}/", {"key": "otra-cosa"})

    assert response.status_code == 200
    flag.refresh_from_db()
    assert flag.key == "prueba"


def test_los_flags_no_se_crean_desde_el_panel(api, staff):
    """Un flag sin código que lo consulte es un interruptor desconectado."""
    api.force_authenticate(staff)

    response = api.post("/api/v1/admin/feature-flags/", {"key": "inventado", "name": "X"})

    assert response.status_code == 405


def test_la_migracion_deja_los_flags_iniciales_apagados(db):
    """Encender uno tiene que ser un acto deliberado, no el estado por defecto."""
    assert FeatureFlag.objects.filter(key="automatic-emails", is_enabled=False).exists()
    assert FeatureFlag.objects.filter(key="stock-by-location", is_enabled=False).exists()
