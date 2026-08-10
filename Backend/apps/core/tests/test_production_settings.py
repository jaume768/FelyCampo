"""
Guardas de arranque de `production.py`.

Cada una cubre un fallo que solo se manifestaría **en producción y en caliente**: una lista
vacía que nadie mira hasta que la tienda deja de aceptar pedidos. Se prueban importando el
módulo con el entorno manipulado, no leyendo su código, para que no se queden verdes si
alguien mueve la comprobación de sitio.
"""

import importlib
import sys

import pytest

BASE_ENV = {
    "DJANGO_SECRET_KEY": "clave-de-prueba-suficientemente-larga-000000000000",
    "DJANGO_ALLOWED_HOSTS": "api.felycampo.com",
    "CORS_ALLOWED_ORIGINS": "https://felycampo.com",
    "CSRF_TRUSTED_ORIGINS": "https://felycampo.com",
    "REDIS_URL": "redis://redis:6379/0",
    "EMAIL_HOST": "smtp.example.com",
    "DEFAULT_FROM_EMAIL": "no-reply@felycampo.com",
    "DATABASE_URL": "postgres://u:p@localhost:5432/db",
}


def _load(monkeypatch, **overrides):
    """
    Importa production.py con el entorno indicado. `None` borra la variable.

    Hay que recargar también `base`: `production` hace `from .base import *`, y sin
    recargarlo se leerían los valores que `base` cacheó al importarse con los settings de
    test, no los del entorno de esta prueba.
    """
    # Se anula la lectura del fichero .env: si no, al recargar `base` volvería a rellenar
    # las variables que este test acaba de borrar y la guarda nunca saltaría. Aquí interesa
    # probar contra el entorno, no contra el .env de quien ejecute los tests.
    monkeypatch.setattr("environ.Env.read_env", lambda *args, **kwargs: None)

    for key, value in {**BASE_ENV, **overrides}.items():
        if value is None:
            monkeypatch.delenv(key, raising=False)
        else:
            monkeypatch.setenv(key, value)

    import config.settings.base as base

    # `base` primero: si `production` se importa antes, se ejecuta contra los valores
    # viejos de `base` y la guarda salta con el mensaje equivocado.
    importlib.reload(base)

    if "config.settings.production" in sys.modules:
        return importlib.reload(sys.modules["config.settings.production"])

    import config.settings.production as production

    return production


@pytest.fixture(autouse=True)
def _restore_base_settings():
    """Deja `base` como estaba: los tests siguientes no deben ver un módulo recargado."""
    yield
    import config.settings.base as base

    importlib.reload(base)


def test_la_configuracion_completa_arranca(monkeypatch):
    settings_module = _load(monkeypatch)

    assert settings_module.DEBUG is False
    assert settings_module.CORS_ALLOW_ALL_ORIGINS is False


def test_sin_csrf_trusted_origins_no_arranca(monkeypatch):
    """
    Con el frontend en felycampo.com y la API en api.felycampo.com, sin esta lista Django
    responde 403 a todos los POST: login, carrito y checkout.
    """
    with pytest.raises(RuntimeError, match="CSRF_TRUSTED_ORIGINS"):
        _load(monkeypatch, CSRF_TRUSTED_ORIGINS=None)


def test_sin_cors_allowed_origins_no_arranca(monkeypatch):
    with pytest.raises(RuntimeError, match="CORS_ALLOWED_ORIGINS"):
        _load(monkeypatch, CORS_ALLOWED_ORIGINS=None)


def test_sin_allowed_hosts_no_arranca(monkeypatch):
    with pytest.raises(RuntimeError, match="DJANGO_ALLOWED_HOSTS"):
        _load(monkeypatch, DJANGO_ALLOWED_HOSTS=None)


def test_allowed_hosts_con_comodin_no_arranca(monkeypatch):
    with pytest.raises(RuntimeError, match="no puede contener"):
        _load(monkeypatch, DJANGO_ALLOWED_HOSTS="*")


def test_sin_redis_no_arranca(monkeypatch):
    with pytest.raises(RuntimeError, match="REDIS_URL"):
        _load(monkeypatch, REDIS_URL=None)


def test_sin_smtp_no_arranca(monkeypatch):
    with pytest.raises(RuntimeError, match="EMAIL_HOST"):
        _load(monkeypatch, EMAIL_HOST=None)


def test_sin_remitente_no_arranca(monkeypatch):
    with pytest.raises(RuntimeError, match="DEFAULT_FROM_EMAIL"):
        _load(monkeypatch, DEFAULT_FROM_EMAIL=None)
