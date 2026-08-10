"""Registro, login y área privada."""

import pytest
from rest_framework.test import APIClient

from apps.orders.models import Cart, CartItem


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def variant(db):
    from decimal import Decimal

    from apps.catalog.models import Color, Colorway, Family, Product, Size, Variant

    family = Family.objects.create(code="VE", name="Vestidos", slug="vestidos")
    product = Product.objects.create(
        family=family,
        design_code="120",
        name="Vestido Aria",
        price=Decimal("200.00"),
        is_published=True,
    )
    colorway = Colorway.objects.create(
        product=product, color=Color.objects.create(code="ROJ", name="Rojo")
    )
    return Variant.objects.create(colorway=colorway, size=Size.objects.create(code="38"), stock=5)


def test_registro_crea_la_cuenta_y_deja_la_sesion_iniciada(api, db):
    response = api.post(
        "/api/v1/auth/register/",
        {"email": "ana@example.com", "password": "Cl4ve-muy-larga!", "first_name": "Ana"},
        format="json",
    )

    assert response.status_code == 201
    assert response.json()["email"] == "ana@example.com"
    # Sin volver a autenticarse, el área privada ya responde.
    assert api.get("/api/v1/account/me/").status_code == 200


def test_no_se_puede_registrar_el_mismo_correo_dos_veces_aunque_cambie_la_caja(api, db):
    api.post(
        "/api/v1/auth/register/",
        {"email": "ana@example.com", "password": "Cl4ve-muy-larga!"},
        format="json",
    )

    response = api.post(
        "/api/v1/auth/register/",
        {"email": "ANA@example.com", "password": "Otra-cl4ve-larga!"},
        format="json",
    )

    assert response.status_code == 400
    assert "email" in response.json()["error"]["details"]


def test_el_registro_rechaza_contrasenas_debiles(api, db):
    response = api.post(
        "/api/v1/auth/register/",
        {"email": "ana@example.com", "password": "1234"},
        format="json",
    )

    assert response.status_code == 400
    assert "password" in response.json()["error"]["details"]


def test_login_funciona_ignorando_mayusculas_del_correo(api, django_user_model):
    django_user_model.objects.create_user(email="Ana@example.com", password="Cl4ve-muy-larga!")

    response = api.post(
        "/api/v1/auth/login/",
        {"email": "ana@example.com", "password": "Cl4ve-muy-larga!"},
        format="json",
    )

    assert response.status_code == 200


def test_login_con_credenciales_malas_no_revela_si_el_correo_existe(api, django_user_model):
    django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-muy-larga!")

    existing = api.post(
        "/api/v1/auth/login/", {"email": "ana@example.com", "password": "mal"}, format="json"
    )
    missing = api.post(
        "/api/v1/auth/login/", {"email": "nadie@example.com", "password": "mal"}, format="json"
    )

    assert existing.status_code == missing.status_code == 400
    assert existing.json()["error"]["details"] == missing.json()["error"]["details"]


def test_el_area_privada_exige_sesion(api, db):
    assert api.get("/api/v1/account/me/").status_code == 403


def test_al_iniciar_sesion_el_carrito_de_invitado_se_conserva(api, django_user_model, variant):
    django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-muy-larga!")
    guest_cart = api.post(
        "/api/v1/cart/", {"variant": str(variant.id), "quantity": 2}, format="json"
    ).json()

    api.post(
        "/api/v1/auth/login/",
        {"email": "ana@example.com", "password": "Cl4ve-muy-larga!", "cart_id": guest_cart["id"]},
        format="json",
    )

    cart = api.get("/api/v1/cart/").json()
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 2


def test_favoritos_solo_los_del_propio_cliente(api, django_user_model, variant):
    ana = django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-larga!")
    otra = django_user_model.objects.create_user(email="otra@example.com", password="Cl4ve-larga!")
    from apps.accounts.models import Favorite

    Favorite.objects.create(user=otra, product=variant.colorway.product)

    api.force_authenticate(ana)
    assert api.get("/api/v1/account/favorites/").json() == []

    api.post(
        "/api/v1/account/favorites/",
        {"product": str(variant.colorway.product_id)},
        format="json",
    )
    assert len(api.get("/api/v1/account/favorites/").json()) == 1


def test_las_direcciones_son_privadas(api, django_user_model):
    ana = django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-larga!")
    otra = django_user_model.objects.create_user(email="otra@example.com", password="Cl4ve-larga!")
    from apps.accounts.models import Address

    Address.objects.create(
        user=otra,
        recipient="Otra",
        line1="Calle X",
        postal_code="28001",
        city="Madrid",
        province="Madrid",
    )

    api.force_authenticate(ana)
    assert api.get("/api/v1/account/addresses/").json() == []


def test_cambiar_la_contrasena_no_cierra_la_sesion(api, django_user_model):
    django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-muy-larga!")
    api.post(
        "/api/v1/auth/login/",
        {"email": "ana@example.com", "password": "Cl4ve-muy-larga!"},
        format="json",
    )

    response = api.post(
        "/api/v1/auth/password/",
        {"current_password": "Cl4ve-muy-larga!", "new_password": "Nueva-cl4ve-larga!"},
        format="json",
    )

    assert response.status_code == 204
    assert api.get("/api/v1/account/me/").status_code == 200


def test_no_se_cambia_la_contrasena_sin_saber_la_actual(api, django_user_model):
    user = django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-larga!")
    api.force_authenticate(user)

    response = api.post(
        "/api/v1/auth/password/",
        {"current_password": "no-es-esta", "new_password": "Nueva-cl4ve-larga!"},
        format="json",
    )

    assert response.status_code == 400


def test_el_carrito_del_usuario_sobrevive_entre_peticiones(api, django_user_model, variant):
    user = django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-larga!")
    api.force_authenticate(user)

    api.post("/api/v1/cart/", {"variant": str(variant.id), "quantity": 1}, format="json")

    assert Cart.objects.filter(user=user).count() == 1
    assert CartItem.objects.filter(cart__user=user).count() == 1
