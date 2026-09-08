import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from apps.media.models import MediaAsset

LIST_URL = "/api/v1/admin/media/"


def _jpeg_bytes(size=(4000, 3000)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, color=(200, 50, 100)).save(buffer, "JPEG")
    return buffer.getvalue()


@pytest.fixture
def staff_client(django_user_model):
    staff = django_user_model.objects.create_user(
        email="staff@felycampo.test", password="x", is_staff=True
    )
    client = APIClient()
    client.force_authenticate(staff)
    return client


@pytest.mark.django_db
def test_anonimo_403():
    response = APIClient().get(LIST_URL)
    assert response.status_code == 403


@pytest.mark.django_db
def test_no_staff_403(django_user_model):
    user = django_user_model.objects.create_user(email="clienta@felycampo.test", password="x")
    client = APIClient()
    client.force_authenticate(user)

    assert client.get(LIST_URL).status_code == 403


@pytest.mark.django_db
def test_staff_200_lista_vacia(staff_client):
    response = staff_client.get(LIST_URL)

    assert response.status_code == 200
    assert response.json() == {"count": 0, "next": None, "previous": None, "results": []}


@pytest.mark.django_db
def test_alta_valida_redimensiona_convierte_y_limpia_metadatos(staff_client):
    upload = SimpleUploadedFile("foto.jpg", _jpeg_bytes(), content_type="image/jpeg")

    response = staff_client.post(
        LIST_URL, {"file": upload, "alt_text": "Vestido Aria"}, format="multipart"
    )

    assert response.status_code == 201
    data = response.json()
    assert data["kind"] == "image"
    assert data["width"] == 2560  # tope de reescalado, el original era 4000x3000
    assert data["height"] == 1920
    assert data["file"].endswith(".webp")
    assert data["thumbnail"].endswith(".webp")
    assert data["alt_text"] == "Vestido Aria"

    asset = MediaAsset.objects.get(pk=data["id"])
    with Image.open(asset.file) as stored:
        assert stored.format == "WEBP"
        assert not stored.getexif()  # EXIF limpio


@pytest.mark.django_db
def test_alta_formato_no_admitido_400(staff_client):
    upload = SimpleUploadedFile("archivo.txt", b"hola", content_type="text/plain")

    response = staff_client.post(LIST_URL, {"file": upload}, format="multipart")

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "invalid"
    assert "file" in response.json()["error"]["details"]


@pytest.mark.django_db
def test_alta_imagen_demasiado_pesada_400(staff_client, monkeypatch):
    monkeypatch.setattr("apps.media.serializers.MAX_IMAGE_BYTES", 10)
    upload = SimpleUploadedFile("foto.jpg", _jpeg_bytes(), content_type="image/jpeg")

    response = staff_client.post(LIST_URL, {"file": upload}, format="multipart")

    assert response.status_code == 400
    assert "MB" in response.json()["error"]["details"]["file"][0]


@pytest.mark.django_db
def test_patch_solo_toca_alt_text(staff_client):
    upload = SimpleUploadedFile("foto.jpg", _jpeg_bytes(), content_type="image/jpeg")
    asset_id = staff_client.post(LIST_URL, {"file": upload}, format="multipart").json()["id"]

    response = staff_client.patch(
        f"{LIST_URL}{asset_id}/", {"alt_text": "Nuevo texto"}, format="json"
    )

    assert response.status_code == 200
    assert response.json()["alt_text"] == "Nuevo texto"


@pytest.mark.django_db
def test_borrado_sin_uso_204(staff_client):
    upload = SimpleUploadedFile("foto.jpg", _jpeg_bytes(), content_type="image/jpeg")
    asset_id = staff_client.post(LIST_URL, {"file": upload}, format="multipart").json()["id"]

    response = staff_client.delete(f"{LIST_URL}{asset_id}/")

    assert response.status_code == 204
    assert not MediaAsset.objects.filter(pk=asset_id).exists()


@pytest.mark.django_db
def test_borrado_en_uso_409(staff_client, monkeypatch):
    upload = SimpleUploadedFile("foto.jpg", _jpeg_bytes(), content_type="image/jpeg")
    asset_id = staff_client.post(LIST_URL, {"file": upload}, format="multipart").json()["id"]

    monkeypatch.setattr(
        MediaAsset, "usages", lambda self: [{"type": "product_image", "label": "Vestido Aria"}]
    )

    response = staff_client.delete(f"{LIST_URL}{asset_id}/")

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "media_in_use"
    assert "Vestido Aria" in response.json()["error"]["message"]
    assert MediaAsset.objects.filter(pk=asset_id).exists()  # no se borró
