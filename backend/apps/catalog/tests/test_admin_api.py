"""CRUD del panel admin: acceso (403/403/200) y alta válida/inválida por endpoint."""

from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from apps.catalog.models import (
    Collection,
    Color,
    Colorway,
    Family,
    Product,
    ProductStatus,
    Size,
    Variant,
)

LIST_ENDPOINTS = [
    "/api/v1/admin/products/",
    "/api/v1/admin/colorways/",
    "/api/v1/admin/variants/",
    "/api/v1/admin/product-images/",
    "/api/v1/admin/families/",
    "/api/v1/admin/categories/",
    "/api/v1/admin/sizes/",
    "/api/v1/admin/colors/",
    "/api/v1/admin/fabrics/",
    "/api/v1/admin/collections/",
]


@pytest.fixture
def staff_client(django_user_model):
    staff = django_user_model.objects.create_user(
        email="staff@felycampo.test", password="x", is_staff=True
    )
    client = APIClient()
    client.force_authenticate(staff)
    return client


@pytest.fixture
def non_staff_client(django_user_model):
    user = django_user_model.objects.create_user(email="clienta@felycampo.test", password="x")
    client = APIClient()
    client.force_authenticate(user)
    return client


@pytest.fixture
def family(db):
    return Family.objects.create(code="VE", name="Vestidos", slug="vestidos")


@pytest.fixture
def color(db):
    return Color.objects.create(code="ROJ", name="Rojo")


@pytest.fixture
def size(db):
    return Size.objects.create(code="38", position=1)


@pytest.fixture
def product(db, family):
    return Product.objects.create(
        family=family,
        design_code="120",
        name="Vestido Aria",
        price=Decimal("200.00"),
        status=ProductStatus.ACTIVE,
    )


@pytest.fixture
def colorway(db, product, color):
    return Colorway.objects.create(product=product, color=color)


# ---------- Acceso: mismo patrón para todos los listados ----------


@pytest.mark.django_db
@pytest.mark.parametrize("url", LIST_ENDPOINTS)
def test_anonimo_403(url):
    assert APIClient().get(url).status_code == 403


@pytest.mark.django_db
@pytest.mark.parametrize("url", LIST_ENDPOINTS)
def test_no_staff_403(url, non_staff_client):
    assert non_staff_client.get(url).status_code == 403


@pytest.mark.django_db
@pytest.mark.parametrize("url", LIST_ENDPOINTS)
def test_staff_200(url, staff_client):
    assert staff_client.get(url).status_code == 200


# ---------- Family ----------


@pytest.mark.django_db
def test_family_alta_valida(staff_client):
    response = staff_client.post(
        "/api/v1/admin/families/", {"code": "ZA", "name": "Zapatos", "slug": "zapatos"}
    )
    assert response.status_code == 201
    assert Family.objects.filter(code="ZA").exists()


@pytest.mark.django_db
def test_family_codigo_duplicado_400(staff_client, family):
    response = staff_client.post(
        "/api/v1/admin/families/", {"code": "VE", "name": "Otra", "slug": "otra"}
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "invalid"


@pytest.mark.django_db
def test_family_en_uso_no_se_borra_409(staff_client, family, product):
    response = staff_client.delete(f"/api/v1/admin/families/{family.id}/")
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "protected"
    assert Family.objects.filter(pk=family.id).exists()


# ---------- Category ----------


@pytest.mark.django_db
def test_category_alta_valida(staff_client):
    response = staff_client.post(
        "/api/v1/admin/categories/", {"name": "Fiesta", "slug": "fiesta", "position": 1}
    )
    assert response.status_code == 201


@pytest.mark.django_db
def test_category_sin_nombre_400(staff_client):
    response = staff_client.post("/api/v1/admin/categories/", {"slug": "sin-nombre"})
    assert response.status_code == 400
    assert "name" in response.json()["error"]["details"]


# ---------- Size ----------


@pytest.mark.django_db
def test_size_alta_valida(staff_client):
    response = staff_client.post("/api/v1/admin/sizes/", {"code": "42", "position": 7})
    assert response.status_code == 201


@pytest.mark.django_db
def test_size_codigo_duplicado_400(staff_client, size):
    response = staff_client.post("/api/v1/admin/sizes/", {"code": "38", "position": 9})
    assert response.status_code == 400


# ---------- Color ----------


@pytest.mark.django_db
def test_color_alta_valida(staff_client):
    response = staff_client.post(
        "/api/v1/admin/colors/", {"code": "AZU", "name": "Azul", "hex_value": "#0000FF"}
    )
    assert response.status_code == 201


@pytest.mark.django_db
def test_color_sin_code_400(staff_client):
    response = staff_client.post("/api/v1/admin/colors/", {"name": "Sin código"})
    assert response.status_code == 400


# ---------- Fabric ----------


@pytest.mark.django_db
def test_fabric_alta_valida(staff_client):
    response = staff_client.post(
        "/api/v1/admin/fabrics/", {"name": "Seda", "composition": "100% seda"}
    )
    assert response.status_code == 201


@pytest.mark.django_db
def test_fabric_sin_nombre_400(staff_client):
    response = staff_client.post("/api/v1/admin/fabrics/", {"composition": "100% seda"})
    assert response.status_code == 400


# ---------- Collection ----------


@pytest.mark.django_db
def test_collection_alta_valida(staff_client):
    response = staff_client.post(
        "/api/v1/admin/collections/",
        {"code": "fw27", "name": "Otoño-Invierno 2027", "position": 1},
    )
    assert response.status_code == 201


@pytest.mark.django_db
def test_collection_codigo_duplicado_400(staff_client, db):
    Collection.objects.create(code="fw27", name="Otoño-Invierno 2027")
    response = staff_client.post(
        "/api/v1/admin/collections/", {"code": "fw27", "name": "Duplicada"}
    )
    assert response.status_code == 400


# ---------- Product ----------


@pytest.mark.django_db
def test_product_alta_valida(staff_client, family):
    response = staff_client.post(
        "/api/v1/admin/products/",
        {
            "family": str(family.id),
            "design_code": "500",
            "name": "Vestido Nuevo",
            "price": "300.00",
            "status": "draft",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "draft"
    assert data["is_published"] is False  # derivado, no lo manda el cliente


@pytest.mark.django_db
def test_product_sin_family_400(staff_client):
    response = staff_client.post(
        "/api/v1/admin/products/", {"design_code": "500", "name": "Sin familia", "price": "300.00"}
    )
    assert response.status_code == 400
    assert "family" in response.json()["error"]["details"]


@pytest.mark.django_db
def test_product_status_active_publica_de_verdad(staff_client, product):
    api = APIClient()
    response = staff_client.patch(
        f"/api/v1/admin/products/{product.id}/", {"status": "active"}, format="json"
    )
    assert response.status_code == 200
    assert response.json()["is_published"] is True

    public = api.get(f"/api/v1/catalog/products/{product.slug}/")
    assert public.status_code == 200


@pytest.mark.django_db
def test_product_delete_archiva_no_borra(staff_client, product):
    response = staff_client.delete(f"/api/v1/admin/products/{product.id}/")

    assert response.status_code == 204
    product.refresh_from_db()
    assert product.status == ProductStatus.ARCHIVED
    assert Product.objects.filter(pk=product.id).exists()  # sigue en la BD


# ---------- Colorway ----------


@pytest.mark.django_db
def test_colorway_alta_valida(staff_client, product, color):
    response = staff_client.post(
        "/api/v1/admin/colorways/", {"product": str(product.id), "color": str(color.id)}
    )
    assert response.status_code == 201
    assert response.json()["sku"]  # autogenerado


@pytest.mark.django_db
def test_colorway_duplicado_400(staff_client, product, color, colorway):
    response = staff_client.post(
        "/api/v1/admin/colorways/", {"product": str(product.id), "color": str(color.id)}
    )
    assert response.status_code == 400


# ---------- Variant ----------


@pytest.mark.django_db
def test_variant_alta_valida(staff_client, colorway, size):
    response = staff_client.post(
        "/api/v1/admin/variants/", {"colorway": str(colorway.id), "size": str(size.id), "stock": 10}
    )
    assert response.status_code == 201
    assert response.json()["available"] == 10


@pytest.mark.django_db
def test_variant_duplicada_400(staff_client, colorway, size):
    Variant.objects.create(colorway=colorway, size=size, stock=1)
    response = staff_client.post(
        "/api/v1/admin/variants/", {"colorway": str(colorway.id), "size": str(size.id), "stock": 5}
    )
    assert response.status_code == 400


# ---------- ProductImage ----------


@pytest.mark.django_db
def test_product_image_sin_asset_400(staff_client, product):
    response = staff_client.post("/api/v1/admin/product-images/", {"product": str(product.id)})
    assert response.status_code == 400
    assert "asset" in response.json()["error"]["details"]


# --- Publicación programada desde el panel ----------------------------------


def test_admin_programar_publicacion_exige_fecha(staff_client, family):
    """SCHEDULED sin fecha dejaría el producto invisible para siempre."""
    respuesta = staff_client.post(
        "/api/v1/admin/products/",
        {
            "family": str(family.id),
            "design_code": "970",
            "name": "Sin fecha",
            "price": "100.00",
            "status": "scheduled",
        },
        format="json",
    )

    assert respuesta.status_code == 400
    assert "published_at" in respuesta.json()["error"]["details"]


def test_admin_programar_publicacion_rechaza_fecha_pasada(staff_client, family):
    """Programar para el pasado es publicar ya: para eso está «Activo»."""
    from datetime import timedelta

    from django.utils import timezone

    respuesta = staff_client.post(
        "/api/v1/admin/products/",
        {
            "family": str(family.id),
            "design_code": "971",
            "name": "Fecha pasada",
            "price": "100.00",
            "status": "scheduled",
            "published_at": (timezone.now() - timedelta(days=1)).isoformat(),
        },
        format="json",
    )

    assert respuesta.status_code == 400
    assert "published_at" in respuesta.json()["error"]["details"]


def test_admin_programar_publicacion_con_fecha_futura(staff_client, family):
    from datetime import timedelta

    from django.utils import timezone

    respuesta = staff_client.post(
        "/api/v1/admin/products/",
        {
            "family": str(family.id),
            "design_code": "972",
            "name": "Programado ok",
            "price": "100.00",
            "status": "scheduled",
            "published_at": (timezone.now() + timedelta(days=5)).isoformat(),
        },
        format="json",
    )

    assert respuesta.status_code == 201
    # No es público todavía, aunque el estado ya esté puesto.
    assert respuesta.json()["is_published"] is False


def test_admin_editar_otro_campo_de_un_programado_vencido_no_falla(staff_client, family):
    """
    La validación de «fecha futura» solo aplica cuando la fecha viene en la petición: si
    no, editar el nombre de un programado ya vencido daría un error inútil.
    """
    from datetime import timedelta

    from django.utils import timezone

    producto = Product.objects.create(
        family=family,
        design_code="973",
        name="Vencido",
        price=Decimal("100.00"),
        status=ProductStatus.SCHEDULED,
        published_at=timezone.now() - timedelta(days=1),
    )

    respuesta = staff_client.patch(
        f"/api/v1/admin/products/{producto.id}/", {"name": "Nuevo nombre"}, format="json"
    )

    assert respuesta.status_code == 200


def test_admin_crear_sin_precio_da_400_no_500(staff_client, family):
    """
    La BD tiene un CheckConstraint que exige precio salvo en «solo consulta». Sin
    reflejarlo en el serializer, guardar un borrador sin precio —lo más normal del mundo
    en el panel— reventaba con IntegrityError y un 500 opaco.
    """
    respuesta = staff_client.post(
        "/api/v1/admin/products/",
        {
            "family": str(family.id),
            "design_code": "980",
            "name": "Sin precio",
            "status": "draft",
        },
        format="json",
    )

    assert respuesta.status_code == 400
    assert "price" in respuesta.json()["error"]["details"]


def test_admin_crear_solo_consulta_sin_precio_es_valido(staff_client, family):
    """Los productos de «solo consulta» sí pueden quedarse sin precio."""
    respuesta = staff_client.post(
        "/api/v1/admin/products/",
        {
            "family": str(family.id),
            "design_code": "981",
            "name": "A consultar",
            "sale_mode": "on_request",
            "status": "draft",
        },
        format="json",
    )

    assert respuesta.status_code == 201


def test_admin_editar_un_campo_suelto_no_exige_reenviar_el_precio(staff_client, product):
    """Un PATCH parcial no puede fallar por un campo que ya está guardado."""
    respuesta = staff_client.patch(
        f"/api/v1/admin/products/{product.id}/", {"name": "Otro nombre"}, format="json"
    )

    assert respuesta.status_code == 200
