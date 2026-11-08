import io

import pytest
from django.core.management import call_command
from PIL import Image
from rest_framework.test import APIClient

from apps.content.services import publish_document
from apps.media.models import MediaAsset, MediaKind


@pytest.fixture
def media_root(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path / "media"
    return settings.MEDIA_ROOT


@pytest.fixture
def origen(tmp_path):
    carpeta = tmp_path / "public"
    (carpeta / "img" / "fiesta").mkdir(parents=True)
    buffer = io.BytesIO()
    Image.new("RGB", (1200, 800), color=(10, 20, 30)).save(buffer, "WEBP")
    (carpeta / "img" / "fiesta" / "fely campo look 1.webp").write_bytes(buffer.getvalue())
    (carpeta / "img" / "fiesta" / "intro.mp4").write_bytes(b"\x00\x00\x00\x18ftypmp42")
    return carpeta


@pytest.mark.django_db
def test_copia_y_registra_lo_que_usa_el_contenido(media_root, origen):
    publish_document(
        "vosotras",
        {
            "fotos": ["/media/web/img/fiesta/fely campo look 1.webp"],
            "video": "/media/web/img/fiesta/intro.mp4#video",
            "otra": "/media/web/img/no-existe.webp",
        },
        expected_version=None,
    )

    call_command("importar_medios_web", origen=str(origen))
    call_command("importar_medios_web", origen=str(origen))  # idempotente

    assert MediaAsset.objects.count() == 2
    foto = MediaAsset.objects.get(kind=MediaKind.IMAGE)
    assert foto.file.name == "web/img/fiesta/fely campo look 1.webp"
    assert (foto.width, foto.height) == (1200, 800)
    assert foto.thumbnail
    assert (media_root / "web/img/fiesta/intro.mp4").exists()
    assert MediaAsset.objects.get(kind=MediaKind.VIDEO).content_type == "video/mp4"
    # Versiones para srcset, con el nombre que espera Frontend/src/lib/imagenes.js.
    for ancho in (480, 960, 1600):
        assert (media_root / f"web/img/fiesta/fely campo look 1.w{ancho}.webp").exists()
    assert not (media_root / "web/img/fiesta/intro.w480.webp").exists()


@pytest.mark.django_db
def test_no_se_borra_una_foto_que_sale_en_la_web(media_root, origen, django_user_model):
    publish_document(
        "landing", {"hero": "/media/web/img/fiesta/fely campo look 1.webp"}, expected_version=None
    )
    call_command("importar_medios_web", origen=str(origen))
    asset = MediaAsset.objects.get()
    staff = django_user_model.objects.create_user(
        email="s@felycampo.test", password="x", is_staff=True
    )
    client = APIClient()
    client.force_authenticate(staff)

    response = client.delete(f"/api/v1/admin/media/{asset.id}/")

    assert response.status_code == 409
    assert response.json()["error"]["details"]["usages"] == [
        {"type": "content", "label": "landing"}
    ]
