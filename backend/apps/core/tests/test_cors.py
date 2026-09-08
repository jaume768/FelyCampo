"""
CORS con autenticación por sesión + cookie.

Estos tests cubren lo que rompería el primer día que se conecte el frontend y que no se ve
en ninguna petición hecha desde el propio servidor: la sesión entre orígenes y el preflight
de la cabecera propia del carrito.
"""

import pytest
from rest_framework.test import APIClient

ORIGIN = "http://localhost:3000"


@pytest.fixture
def api():
    return APIClient()


@pytest.mark.django_db
def test_se_permiten_credenciales_entre_origenes(api):
    """Sin esto el navegador no manda la cookie de sesión y no hay área privada."""
    response = api.get("/api/v1/catalog/products/", headers={"Origin": ORIGIN})

    assert response["Access-Control-Allow-Credentials"] == "true"


@pytest.mark.django_db
def test_el_origen_se_devuelve_explicito_y_nunca_con_comodin(api):
    """
    La especificación de fetch prohíbe mandar credenciales a una respuesta con
    `Access-Control-Allow-Origin: *`; el navegador descartaría la respuesta.
    """
    response = api.get("/api/v1/catalog/products/", headers={"Origin": ORIGIN})

    assert response["Access-Control-Allow-Origin"] == ORIGIN
    assert response["Access-Control-Allow-Origin"] != "*"


@pytest.mark.django_db
def test_el_preflight_acepta_la_cabecera_del_carrito(api):
    """`x-cart-id` es cabecera propia: sin declararla, todo el carrito de invitado falla."""
    response = api.options(
        "/api/v1/cart/",
        headers={
            "Origin": ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "x-cart-id,content-type",
        },
    )

    assert response.status_code == 200
    assert "x-cart-id" in response["Access-Control-Allow-Headers"].lower()


@pytest.mark.django_db
def test_el_preflight_del_checkout_tambien_pasa(api):
    response = api.options(
        "/api/v1/checkout/",
        headers={
            "Origin": ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "x-cart-id,content-type,x-csrftoken",
        },
    )

    assert response.status_code == 200
    allowed = response["Access-Control-Allow-Headers"].lower()
    assert "x-cart-id" in allowed
    assert "x-csrftoken" in allowed


@pytest.mark.django_db
def test_un_origen_desconocido_no_recibe_cabeceras_cors(api):
    response = api.get(
        "/api/v1/catalog/products/", headers={"Origin": "https://sitio-ajeno.example"}
    )

    assert "Access-Control-Allow-Origin" not in response


def test_ningun_entorno_usa_el_comodin_de_origenes():
    """
    Con credenciales, `CORS_ALLOW_ALL_ORIGINS` rompe la sesión en vez de facilitarla.
    Se comprueba también desarrollo, que es donde la tentación es mayor.
    """
    from pathlib import Path

    from config.settings import development

    assert development.CORS_ALLOW_ALL_ORIGINS is False
    assert development.CORS_ALLOWED_ORIGINS

    # `production` no se importa: sus guardas de arranque exigen variables de entorno que
    # aquí no existen. Se comprueba el código, que es lo que se quiere fijar.
    produccion = (Path(development.__file__).parent / "production.py").read_text()
    assert "CORS_ALLOW_ALL_ORIGINS = False" in produccion
