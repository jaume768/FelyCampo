"""Recuperación de contraseña y verificación de correo."""

import re

import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def user(db, django_user_model):
    return django_user_model.objects.create_user(email="ana@example.com", password="Cl4ve-larga!")


def _link_parts(message) -> dict:
    """Extrae uid y token del enlace que va en el correo."""
    return dict(re.findall(r"[?&](uid|token)=([^&\s]+)", message.body))


def test_pedir_restablecer_envia_el_enlace(api, user, mailoutbox):
    response = api.post("/api/v1/auth/password/reset/", {"email": user.email}, format="json")

    assert response.status_code == 204
    assert len(mailoutbox) == 1
    assert mailoutbox[0].to == [user.email]
    assert set(_link_parts(mailoutbox[0])) == {"uid", "token"}


def test_un_correo_desconocido_responde_igual_y_no_envia_nada(api, db, mailoutbox):
    """Si distinguiera, el endpoint diría quién es cliente de la tienda."""
    response = api.post(
        "/api/v1/auth/password/reset/", {"email": "nadie@example.com"}, format="json"
    )

    assert response.status_code == 204
    assert mailoutbox == []


def test_el_enlace_permite_fijar_una_contrasena_nueva(api, user, mailoutbox):
    api.post("/api/v1/auth/password/reset/", {"email": user.email}, format="json")
    parts = _link_parts(mailoutbox[0])

    response = api.post(
        "/api/v1/auth/password/reset/confirm/",
        {**parts, "new_password": "Nueva-cl4ve-larga!"},
        format="json",
    )

    assert response.status_code == 204
    user.refresh_from_db()
    assert user.check_password("Nueva-cl4ve-larga!")


def test_el_enlace_no_sirve_dos_veces(api, user, mailoutbox):
    api.post("/api/v1/auth/password/reset/", {"email": user.email}, format="json")
    parts = _link_parts(mailoutbox[0])
    payload = {**parts, "new_password": "Nueva-cl4ve-larga!"}
    api.post("/api/v1/auth/password/reset/confirm/", payload, format="json")

    # El token de Django deja de validar en cuanto cambia el hash de la contraseña.
    response = api.post("/api/v1/auth/password/reset/confirm/", payload, format="json")

    assert response.status_code == 400


def test_un_token_inventado_no_cambia_nada(api, user):
    response = api.post(
        "/api/v1/auth/password/reset/confirm/",
        {"uid": "xxxx", "token": "yyyy", "new_password": "Nueva-cl4ve-larga!"},
        format="json",
    )

    assert response.status_code == 400
    user.refresh_from_db()
    assert user.check_password("Cl4ve-larga!")


def test_no_se_acepta_una_contrasena_debil_al_restablecer(api, user, mailoutbox):
    api.post("/api/v1/auth/password/reset/", {"email": user.email}, format="json")
    parts = _link_parts(mailoutbox[0])

    response = api.post(
        "/api/v1/auth/password/reset/confirm/",
        {**parts, "new_password": "1234"},
        format="json",
    )

    assert response.status_code == 400


def test_el_registro_envia_el_correo_de_verificacion(api, db, mailoutbox):
    api.post(
        "/api/v1/auth/register/",
        {"email": "nueva@example.com", "password": "Cl4ve-muy-larga!"},
        format="json",
    )

    assert len(mailoutbox) == 1
    assert mailoutbox[0].to == ["nueva@example.com"]


def test_el_enlace_de_verificacion_marca_el_correo_como_verificado(api, db, mailoutbox):
    body = api.post(
        "/api/v1/auth/register/",
        {"email": "nueva@example.com", "password": "Cl4ve-muy-larga!"},
        format="json",
    ).json()
    assert body["email_verified"] is False

    parts = _link_parts(mailoutbox[0])
    response = api.post("/api/v1/auth/email/verify/", parts, format="json")

    assert response.status_code == 204
    assert api.get("/api/v1/account/me/").json()["email_verified"] is True


def test_restablecer_la_contrasena_verifica_el_correo_de_paso(api, user, mailoutbox):
    """Quien abre el enlace demuestra que controla el buzón."""
    assert user.email_verified is False
    api.post("/api/v1/auth/password/reset/", {"email": user.email}, format="json")
    parts = _link_parts(mailoutbox[0])

    api.post(
        "/api/v1/auth/password/reset/confirm/",
        {**parts, "new_password": "Nueva-cl4ve-larga!"},
        format="json",
    )

    user.refresh_from_db()
    assert user.email_verified is True
