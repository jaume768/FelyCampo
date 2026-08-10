import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_liveness_ok_without_touching_db(django_assert_num_queries):
    # Liveness no debe consultar la base de datos.
    with django_assert_num_queries(0):
        response = APIClient().get("/api/v1/health/live/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.django_db
def test_readiness_ok():
    response = APIClient().get("/api/v1/health/ready/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok", "cache": "ok"}


@pytest.mark.django_db
def test_health_alias_matches_readiness():
    response = APIClient().get("/api/v1/health/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok", "cache": "ok"}


@pytest.mark.django_db
def test_schema_no_se_regala_a_los_anonimos():
    """Fuera de DEBUG el esquema es el mapa completo de la API: solo para el personal."""
    assert APIClient().get("/api/v1/schema/").status_code == 403


@pytest.mark.django_db
def test_schema_lo_ve_el_personal(django_user_model):
    staff = django_user_model.objects.create_user(
        email="staff@felycampo.test", password="Cl4ve-larga!", is_staff=True
    )
    client = APIClient()
    client.force_authenticate(staff)

    assert client.get("/api/v1/schema/").status_code == 200


@pytest.mark.django_db
def test_readiness_no_da_503_por_la_cache(monkeypatch):
    """
    Los límites de ritmo degradan en abierto: sin Redis la tienda sigue vendiendo. Sacar
    el proceso de rotación por eso sería peor que el problema. El fallo se informa, pero
    no cambia el código de respuesta.
    """
    monkeypatch.setattr(
        "apps.core.views.cache.set", lambda *a, **kw: (_ for _ in ()).throw(RuntimeError("caída"))
    )

    response = APIClient().get("/api/v1/health/ready/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["cache"] == "error"
