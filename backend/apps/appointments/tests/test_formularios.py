import pytest
from rest_framework.test import APIClient

from apps.appointments.internal import ThrottlePorVisitante
from apps.appointments.models import Cita, ConsultaVestido, Suscriptor

SECRETO = "secreto-de-prueba"

CITA = {
    "nombre": "Lucía Hernández",
    "email": "lucia@example.com",
    "telefono": "+34 600 112 233",
    "mensaje": "Me caso en junio.",
    "idioma": "es",
    "acepta_legal": True,
    "tipo": "novia",
    "atelier": "salamanca",
    "fecha_evento": "2027-06",
}


@pytest.fixture(autouse=True)
def secreto(settings):
    settings.REVALIDATE_SECRET = SECRETO


def frontend(ip="83.1.1.1"):
    """El servidor de Next: trae el secreto y la IP de la visitante."""
    client = APIClient()
    client.credentials(HTTP_X_INTERNO_SECRETO=SECRETO, HTTP_X_CLIENTE_IP=ip)
    return client


@pytest.fixture
def staff_client(django_user_model):
    staff = django_user_model.objects.create_user(
        email="equipo@felycampo.test", password="x", is_staff=True
    )
    client = APIClient()
    client.force_authenticate(staff)
    return client


# --- Altas internas ------------------------------------------------------------------


@pytest.mark.django_db
def test_alta_de_cita_sin_secreto_403():
    respuesta = APIClient().post("/api/v1/formularios/citas/", CITA, format="json")
    assert respuesta.status_code == 403
    assert not Cita.objects.exists()


@pytest.mark.django_db
def test_alta_de_cita_con_secreto_queda_pendiente_y_asignada_a_su_atelier():
    respuesta = frontend().post("/api/v1/formularios/citas/", CITA, format="json")

    assert respuesta.status_code == 201
    cita = Cita.objects.get()
    assert (cita.estado, cita.asignado) == ("pendiente", "salamanca")
    assert [h["estado"] for h in cita.historial] == ["pendiente"]


@pytest.mark.django_db
def test_sin_aceptar_la_privacidad_400():
    respuesta = frontend().post(
        "/api/v1/formularios/citas/", {**CITA, "acepta_legal": False}, format="json"
    )
    assert respuesta.status_code == 400


@pytest.mark.django_db
def test_el_cupo_es_por_visitante_no_por_el_contenedor_del_frontend(monkeypatch):
    # DRF lee las tasas al definir la clase: se parchean ahí, no en settings.
    monkeypatch.setattr(ThrottlePorVisitante, "THROTTLE_RATES", {"formulario": "2/hour"})
    url = "/api/v1/formularios/citas/"

    assert frontend("1.1.1.1").post(url, CITA, format="json").status_code == 201
    assert frontend("1.1.1.1").post(url, CITA, format="json").status_code == 201
    assert frontend("1.1.1.1").post(url, CITA, format="json").status_code == 429
    # Otra visitante, mismo contenedor del frontend: tiene su propio cupo.
    assert frontend("2.2.2.2").post(url, CITA, format="json").status_code == 201


@pytest.mark.django_db
def test_consulta_solo_guarda_rutas_propias():
    respuesta = frontend().post(
        "/api/v1/formularios/consultas/",
        {
            "nombre": "Carmen",
            "email": "carmen@example.com",
            "acepta_legal": True,
            "producto": "Look 6 26_Opaline",
            "ruta": "https://otra-web.com/x",
            "imagen": "/media/web/img/look.webp",
        },
        format="json",
    )

    assert respuesta.status_code == 201
    consulta = ConsultaVestido.objects.get()
    assert (consulta.ruta, consulta.imagen) == ("", "/media/web/img/look.webp")


@pytest.mark.django_db
def test_newsletter_idempotente_y_reactiva():
    url = "/api/v1/formularios/newsletter/"
    assert frontend().post(url, {"email": "Ana@Example.com"}, format="json").status_code == 201
    Suscriptor.objects.update(activo=False)

    respuesta = frontend().post(url, {"email": "ana@example.com"}, format="json")

    assert respuesta.status_code == 200
    assert Suscriptor.objects.get().activo is True
    assert Suscriptor.objects.count() == 1


# --- Bandejas del panel --------------------------------------------------------------


@pytest.mark.django_db
def test_bandeja_exige_staff():
    assert APIClient().get("/api/v1/admin/citas/").status_code == 403


@pytest.mark.django_db
def test_cambiar_estado_queda_en_el_historial_con_quien(staff_client):
    frontend().post("/api/v1/formularios/citas/", CITA, format="json")
    cita = Cita.objects.get()

    respuesta = staff_client.patch(
        f"/api/v1/admin/citas/{cita.id}/",
        {"estado": "contactada", "asignado": "madrid", "notas": "Llamada el lunes"},
        format="json",
    )

    assert respuesta.status_code == 200
    cita.refresh_from_db()
    assert (cita.estado, cita.asignado, cita.notas) == ("contactada", "madrid", "Llamada el lunes")
    assert cita.historial[-1]["estado"] == "contactada"
    assert cita.historial[-1]["por"] == "equipo@felycampo.test"


@pytest.mark.django_db
def test_los_datos_de_la_clienta_no_se_pueden_cambiar(staff_client):
    frontend().post("/api/v1/formularios/citas/", CITA, format="json")
    cita = Cita.objects.get()

    staff_client.patch(f"/api/v1/admin/citas/{cita.id}/", {"email": "x@x.com"}, format="json")

    cita.refresh_from_db()
    assert cita.email == "lucia@example.com"


@pytest.mark.django_db
def test_filtros_de_la_bandeja(staff_client):
    frontend().post("/api/v1/formularios/citas/", CITA, format="json")
    frontend().post(
        "/api/v1/formularios/citas/",
        {**CITA, "nombre": "Emma Wilson", "atelier": "madrid"},
        format="json",
    )

    def nombres(query):
        return [
            c["nombre"] for c in staff_client.get(f"/api/v1/admin/citas/?{query}").json()["results"]
        ]

    assert nombres("q=emma") == ["Emma Wilson"]
    assert nombres("atelier=salamanca") == ["Lucía Hernández"]
    assert len(nombres("estado=pendiente")) == 2


@pytest.mark.django_db
def test_resumen_y_csv(staff_client):
    frontend().post("/api/v1/formularios/citas/", CITA, format="json")
    frontend().post("/api/v1/formularios/newsletter/", {"email": "a@b.es"}, format="json")

    resumen = staff_client.get("/api/v1/admin/resumen/").json()
    csv = staff_client.get("/api/v1/admin/suscriptores/csv/")

    assert resumen["citas_pendientes"] == 1
    assert resumen["suscriptores"] == 1
    assert csv["Content-Type"].startswith("text/csv")
    assert "a@b.es" in csv.content.decode("utf-8-sig")
