"""
Los límites de ritmo degradan en abierto.

Los contadores viven en Redis y DRF los consulta en **cada** petición. Con `RedisCache`
(que no tiene `IGNORE_EXCEPTIONS`), un Redis caído haría que toda la API devolviera 500:
la tienda entera dependería de Redis solo para contar peticiones.
"""

import pytest
from rest_framework.test import APIClient

from apps.core.throttling import (
    FailOpenAnonRateThrottle,
    FailOpenScopedRateThrottle,
    FailOpenUserRateThrottle,
)


class BrokenCache:
    """Caché que falla como lo haría Redis caído: en la propia llamada."""

    def get(self, *args, **kwargs):
        raise RuntimeError("Redis no responde")

    def set(self, *args, **kwargs):
        raise RuntimeError("Redis no responde")


def _break_cache(monkeypatch):
    """
    Se sustituye `SimpleRateThrottle.cache`, que es por donde pasan de verdad los
    contadores. Parchear `get_cache_key` no vale: `AnonRateThrottle` lo sobrescribe y el
    test quedaría verde sin ejercitar nada.
    """
    monkeypatch.setattr("rest_framework.throttling.SimpleRateThrottle.cache", BrokenCache())


@pytest.fixture
def api():
    return APIClient()


@pytest.mark.django_db
def test_la_api_sigue_respondiendo_si_la_cache_se_cae(api, monkeypatch):
    _break_cache(monkeypatch)

    response = api.get("/api/v1/catalog/products/")

    assert response.status_code == 200


@pytest.mark.django_db
def test_los_endpoints_con_cupo_propio_tambien_degradan_en_abierto(api, monkeypatch):
    _break_cache(monkeypatch)

    # Sin fail-open esto sería un 500; con él llega a la vista y responde su 404 normal.
    assert api.get("/api/v1/orders/lookup/", {"token": "x"}).status_code == 404


@pytest.mark.django_db
def test_el_fallo_de_la_cache_se_registra(api, monkeypatch):
    """Degradar en silencio sería peor: nadie se enteraría de que no hay límites."""
    _break_cache(monkeypatch)
    registrados = []
    # Se comprueba la llamada al logger y no `caplog`: la configuración de LOGGING de
    # Django sustituye los handlers de root y el registro no llega al capturador.
    monkeypatch.setattr(
        "apps.core.throttling.logger.error",
        lambda message, *a, **kw: registrados.append(message),
    )

    api.get("/api/v1/catalog/products/")

    assert "throttle_cache_unavailable" in registrados


def test_los_throttles_configurados_son_los_que_degradan(settings):
    configured = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"]

    assert configured == [
        "apps.core.throttling.FailOpenAnonRateThrottle",
        "apps.core.throttling.FailOpenUserRateThrottle",
        "apps.core.throttling.FailOpenScopedRateThrottle",
    ]


@pytest.mark.django_db
def test_con_la_cache_sana_el_limite_sigue_aplicandose(api, monkeypatch):
    """Degradar en abierto no puede convertirse en no tener límites nunca."""
    monkeypatch.setitem(FailOpenScopedRateThrottle.THROTTLE_RATES, "order_lookup", "1/hour")

    first = api.get("/api/v1/orders/lookup/", {"token": "x"}).status_code
    second = api.get("/api/v1/orders/lookup/", {"token": "x"}).status_code

    assert first == 404
    assert second == 429


def test_todas_las_clases_heredan_el_comportamiento():
    for throttle_class in (
        FailOpenAnonRateThrottle,
        FailOpenUserRateThrottle,
        FailOpenScopedRateThrottle,
    ):
        assert throttle_class.allow_request.__qualname__.startswith("FailOpenMixin")
