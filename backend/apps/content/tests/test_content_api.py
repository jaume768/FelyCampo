from unittest import mock

import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from apps.content.models import Document, DocumentRevision
from apps.content.registry import MAX_REVISIONS
from apps.content.services import publish_document

ADMIN_URL = "/api/v1/admin/content/"


@pytest.fixture
def staff(django_user_model):
    return django_user_model.objects.create_user(
        email="editora@felycampo.test", password="x", is_staff=True
    )


@pytest.fixture
def staff_client(staff):
    client = APIClient()
    client.force_authenticate(staff)
    return client


@pytest.fixture
def landing(db):
    return publish_document("landing", {"hero": {"texto": {"es": "Hola"}}}, expected_version=None)


# --- Lectura pública ---------------------------------------------------------------------


@pytest.mark.django_db
def test_publico_lee_un_documento_sin_sesion(landing):
    response = APIClient().get("/api/v1/content/landing/")

    assert response.status_code == 200
    assert response.json()["data"] == {"hero": {"texto": {"es": "Hola"}}}
    assert response.json()["version"] == 1


@pytest.mark.django_db
def test_publico_404_con_shape_uniforme():
    response = APIClient().get("/api/v1/content/no-existe/")

    assert response.status_code == 404
    assert set(response.json()["error"]) == {"code", "message", "details"}


# --- Panel ---------------------------------------------------------------------------------


@pytest.mark.django_db
def test_panel_exige_staff(django_user_model, landing):
    assert APIClient().get(ADMIN_URL).status_code == 403
    clienta = django_user_model.objects.create_user(email="c@felycampo.test", password="x")
    client = APIClient()
    client.force_authenticate(clienta)
    assert (
        client.put(f"{ADMIN_URL}landing/", {"data": {}, "version": 1}, format="json").status_code
        == 403
    )


@pytest.mark.django_db
def test_listado_sin_data(staff_client, landing):
    response = staff_client.get(ADMIN_URL)

    assert response.status_code == 200
    assert response.json() == [
        {"key": "landing", "version": 1, "updated_at": mock.ANY, "updated_by": None}
    ]


@pytest.mark.django_db
def test_publicar_sube_version_guarda_revision_y_autora(staff_client, staff, landing):
    nuevo = {"hero": {"texto": {"es": "Adiós"}}}

    response = staff_client.put(
        f"{ADMIN_URL}landing/", {"data": nuevo, "version": 1}, format="json"
    )

    assert response.status_code == 200
    assert response.json()["version"] == 2
    assert response.json()["updated_by"] == staff.email
    landing.refresh_from_db()
    assert landing.data == nuevo
    assert list(landing.revisions.values_list("version", flat=True)) == [2, 1]


@pytest.mark.django_db
def test_publicar_con_version_vieja_da_409_y_no_pisa(staff_client, landing):
    staff_client.put(f"{ADMIN_URL}landing/", {"data": {"a": 1}, "version": 1}, format="json")

    response = staff_client.put(
        f"{ADMIN_URL}landing/", {"data": {"b": 2}, "version": 1}, format="json"
    )

    assert response.status_code == 409
    error = response.json()["error"]
    assert error["code"] == "version_conflict"
    assert error["details"]["current_version"] == 2
    landing.refresh_from_db()
    assert landing.data == {"a": 1}


@pytest.mark.django_db
def test_publicar_tipo_equivocado_da_400(staff_client, landing):
    response = staff_client.put(
        f"{ADMIN_URL}landing/", {"data": [1, 2], "version": 1}, format="json"
    )

    assert response.status_code == 400
    assert "objeto" in str(response.json()["error"]["details"])


@pytest.mark.django_db
def test_clave_fuera_del_registro_da_400(staff_client):
    response = staff_client.put(f"{ADMIN_URL}inventada/", {"data": {}, "version": 1}, format="json")

    assert response.status_code == 400


@pytest.mark.django_db
def test_publicar_sin_version_da_400(staff_client, landing):
    response = staff_client.put(f"{ADMIN_URL}landing/", {"data": {}}, format="json")

    assert response.status_code == 400


@pytest.mark.django_db
def test_revisiones_lista_y_detalle(staff_client, landing):
    staff_client.put(f"{ADMIN_URL}landing/", {"data": {"v": 2}, "version": 1}, format="json")

    listado = staff_client.get(f"{ADMIN_URL}landing/revisions/").json()
    detalle = staff_client.get(f"{ADMIN_URL}landing/revisions/1/").json()

    assert [r["version"] for r in listado] == [2, 1]
    assert "data" not in listado[0]
    assert detalle["data"] == {"hero": {"texto": {"es": "Hola"}}}


@pytest.mark.django_db
def test_solo_se_guardan_las_ultimas_revisiones(landing):
    for i in range(MAX_REVISIONS + 5):
        publish_document("landing", {"i": i}, expected_version=landing.version + i)

    assert DocumentRevision.objects.filter(document=landing).count() == MAX_REVISIONS


# --- Revalidación ----------------------------------------------------------------------------


@pytest.mark.django_db(transaction=True)
def test_publicar_avisa_al_frontend_tras_el_commit(staff_client, settings):
    settings.FRONTEND_INTERNAL_URL = "http://frontend:3000"
    settings.REVALIDATE_SECRET = "s3cr3t"
    # Preparación sin aviso: solo se mide el de la publicación de abajo.
    publish_document("contacto", {"email": "a@b.c"}, expected_version=None, revalidate=False)

    with mock.patch("apps.content.revalidation.urllib.request.urlopen") as urlopen:
        urlopen.return_value.__enter__.return_value.status = 200
        staff_client.put(
            f"{ADMIN_URL}contacto/", {"data": {"email": "x@y.z"}, "version": 1}, format="json"
        )

    request = urlopen.call_args.args[0]
    assert request.full_url == "http://frontend:3000/api/revalidar"
    assert request.get_header("X-revalidate-secret") == "s3cr3t"
    assert request.data == b'{"tags": ["contenido:contacto"]}'


@pytest.mark.django_db(transaction=True)
def test_si_el_frontend_no_responde_la_publicacion_se_mantiene(staff_client, settings):
    settings.FRONTEND_INTERNAL_URL = "http://frontend:3000"
    settings.REVALIDATE_SECRET = "s3cr3t"
    # Preparación sin aviso: solo se mide el de la publicación de abajo.
    publish_document("contacto", {"email": "a@b.c"}, expected_version=None, revalidate=False)

    with mock.patch("apps.content.revalidation.urllib.request.urlopen", side_effect=TimeoutError):
        response = staff_client.put(
            f"{ADMIN_URL}contacto/", {"data": {"email": "x@y.z"}, "version": 1}, format="json"
        )

    assert response.status_code == 200
    assert Document.objects.get(key="contacto").data == {"email": "x@y.z"}


# --- Carga inicial ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_cargar_contenido_semilla_crea_los_19_y_no_pisa_al_repetir():
    call_command("cargar_contenido")
    assert Document.objects.count() == 19

    doc = Document.objects.get(key="landing")
    publish_document("landing", {"editado": True}, expected_version=doc.version)
    call_command("cargar_contenido")

    assert Document.objects.get(key="landing").data == {"editado": True}


@pytest.mark.django_db
def test_semilla_apunta_las_fotos_al_almacen_de_medios():
    call_command("cargar_contenido")

    hero = Document.objects.get(key="landing").data["hero"]["imagen"]["escritorio"]
    assert hero.startswith("/media/web/img/")
