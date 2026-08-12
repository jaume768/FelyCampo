"""Biblioteca de medios: subida, normalización de imágenes y borrado seguro."""

import io

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from apps.content.models import MediaAsset
from apps.content.services import EXTRA_USAGE_CHECKS

User = get_user_model()

URL = "/api/v1/admin/media/"


@pytest.fixture(autouse=True)
def media_root(settings, tmp_path):
    """
    Los tests escriben archivos de verdad. Sin aislar MEDIA_ROOT acabarían en el árbol del
    proyecto y se acumularían entre ejecuciones.
    """
    settings.MEDIA_ROOT = tmp_path
    return tmp_path


@pytest.fixture
def api(db):
    client = APIClient()
    client.force_authenticate(
        User.objects.create_user(email="staff@felycampo.test", password="x", is_staff=True)
    )
    return client


def build_image(
    *, size=(120, 80), mode="RGB", fmt="JPEG", name="foto.jpg", content_type=None, color="red"
):
    buffer = io.BytesIO()
    Image.new(mode, size, color).save(buffer, format=fmt)
    return SimpleUploadedFile(
        name,
        buffer.getvalue(),
        content_type=content_type or f"image/{fmt.lower()}",
    )


# --- Subida y normalización --------------------------------------------------------------


def test_una_imagen_se_convierte_a_webp_y_conserva_el_original(api):
    response = api.post(URL, {"file": build_image(), "title": "Portada"}, format="multipart")

    assert response.status_code == 201
    body = response.json()
    assert body["mime_type"] == "image/webp"
    assert body["url"].endswith(".webp")
    assert body["thumbnail_url"].endswith(".webp")
    # El original permite regenerar los derivados si mañana cambian los tamaños.
    assert body["original_url"].endswith(".jpg")
    assert (body["width"], body["height"]) == (120, 80)


def test_una_imagen_enorme_se_reescala(api, settings):
    settings.MEDIA_IMAGE_MAX_DIMENSION = 100

    response = api.post(URL, {"file": build_image(size=(400, 200))}, format="multipart")

    assert response.status_code == 201
    body = response.json()
    # Se reescala por el lado mayor y se conserva la proporción.
    assert (body["width"], body["height"]) == (100, 50)


def test_una_imagen_pequena_no_se_amplia(api, settings):
    settings.MEDIA_IMAGE_MAX_DIMENSION = 5000

    body = api.post(URL, {"file": build_image(size=(120, 80))}, format="multipart").json()

    assert (body["width"], body["height"]) == (120, 80)


def test_un_png_con_transparencia_no_se_pinta_de_negro(api):
    """
    Convertir a RGB una imagen con alfa rellena de negro lo que era transparente. Se
    comprueba el píxel, no el modo: una imagen RGBA totalmente opaca se guarda como RGB con
    toda la razón, y eso no es el fallo que interesa detectar aquí.
    """
    upload = build_image(
        size=(40, 40), mode="RGBA", fmt="PNG", name="logo.png", color=(255, 0, 0, 0)
    )

    response = api.post(URL, {"file": upload}, format="multipart")

    assert response.status_code == 201
    asset = MediaAsset.objects.get()
    with Image.open(asset.file.path) as saved:
        assert saved.convert("RGBA").getpixel((0, 0))[3] == 0


def test_un_video_se_guarda_sin_convertir(api):
    upload = SimpleUploadedFile("clip.mp4", b"\x00\x00\x00\x20ftypmp42", content_type="video/mp4")

    response = api.post(URL, {"file": upload}, format="multipart")

    assert response.status_code == 201
    body = response.json()
    assert body["kind"] == "video"
    assert body["thumbnail_url"] is None


# --- Validación --------------------------------------------------------------------------


def test_se_rechaza_un_formato_no_admitido(api):
    upload = SimpleUploadedFile("virus.exe", b"MZ", content_type="application/x-msdownload")

    response = api.post(URL, {"file": upload}, format="multipart")

    assert response.status_code == 400
    assert MediaAsset.objects.count() == 0


def test_se_rechaza_un_archivo_por_encima_del_limite(api, settings):
    settings.MEDIA_IMAGE_MAX_UPLOAD_BYTES = 10

    response = api.post(URL, {"file": build_image()}, format="multipart")

    assert response.status_code == 400
    assert MediaAsset.objects.count() == 0


def test_un_archivo_que_dice_ser_imagen_pero_no_lo_es_no_revienta(api):
    """El tipo MIME lo declara el cliente: no se puede confiar en él para decodificar."""
    upload = SimpleUploadedFile("falsa.jpg", b"esto no es una imagen", content_type="image/jpeg")

    response = api.post(URL, {"file": upload}, format="multipart")

    assert response.status_code == 400
    assert MediaAsset.objects.count() == 0


# --- Borrado -----------------------------------------------------------------------------


def test_se_puede_borrar_un_archivo_que_no_usa_nadie(api):
    api.post(URL, {"file": build_image()}, format="multipart")
    asset = MediaAsset.objects.get()

    assert api.delete(f"{URL}{asset.id}/").status_code == 204
    assert MediaAsset.objects.count() == 0


def test_no_se_puede_borrar_un_archivo_en_uso(api):
    """
    Borrarlo dejaría un hueco en la home que nadie ve hasta que lo ve un cliente. Las
    secciones que referencian medios desde un JSON registran su comprobación aquí, porque
    no hay clave ajena que las proteja.
    """
    api.post(URL, {"file": build_image()}, format="multipart")
    asset = MediaAsset.objects.get()
    EXTRA_USAGE_CHECKS.append(lambda _asset: ["Bloque «hero» de la home"])
    try:
        response = api.delete(f"{URL}{asset.id}/")
    finally:
        EXTRA_USAGE_CHECKS.clear()

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "media_asset_in_use"
    assert response.json()["error"]["details"]["usages"] == ["Bloque «hero» de la home"]
    assert MediaAsset.objects.count() == 1
