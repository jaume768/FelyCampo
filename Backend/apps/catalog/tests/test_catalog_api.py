"""API pública del catálogo: lo que consume el frontend."""

from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from apps.catalog.models import (
    Category,
    Color,
    Colorway,
    Family,
    Product,
    SaleMode,
    Size,
    StockNotification,
    Variant,
)


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def catalog(db):
    family = Family.objects.create(code="VE", name="Vestidos", slug="vestidos")
    fiesta = Category.objects.create(name="Fiesta", slug="fiesta")
    Category.objects.create(name="Cóctel", slug="coctel", parent=fiesta)

    product = Product.objects.create(
        family=family,
        design_code="120",
        name="Vestido Aria",
        price=Decimal("200.00"),
        is_published=True,
    )
    product.categories.add(fiesta)
    colorway = Colorway.objects.create(
        product=product, color=Color.objects.create(code="ROJ", name="Rojo")
    )
    variant = Variant.objects.create(
        colorway=colorway, size=Size.objects.create(code="38"), stock=3
    )
    return {"product": product, "variant": variant, "family": family}


def test_el_listado_es_publico_y_lleva_precio_con_iva(api, catalog):
    response = api.get("/api/v1/catalog/products/")

    assert response.status_code == 200
    item = response.json()["results"][0]
    assert item["price"] == "200.00"
    assert item["effective_price_gross"] == "242.00"
    assert item["in_stock"] is True


def test_los_borradores_no_se_publican(api, catalog):
    catalog["product"].is_published = False
    catalog["product"].save()

    assert api.get("/api/v1/catalog/products/").json()["count"] == 0


def test_la_ficha_trae_colores_tallas_y_disponibilidad(api, catalog):
    response = api.get(f"/api/v1/catalog/products/{catalog['product'].slug}/")

    body = response.json()
    assert body["colorways"][0]["sku"] == "VE-120-ROJ"
    variant = body["colorways"][0]["variants"][0]
    assert variant["size"]["code"] == "38"
    assert variant["available"] == 3
    # El stock real y las reservas no se exponen.
    assert "stock" not in variant
    assert "reserved" not in variant


def test_el_precio_rebajado_manda_y_se_marca_como_oferta(api, catalog):
    catalog["product"].sale_price = Decimal("150.00")
    catalog["product"].save()

    item = api.get("/api/v1/catalog/products/").json()["results"][0]

    assert item["is_on_sale"] is True
    assert item["effective_price_gross"] == "181.50"


def test_se_puede_filtrar_el_outlet(api, catalog):
    assert api.get("/api/v1/catalog/products/?is_outlet=true").json()["count"] == 0

    catalog["product"].is_outlet = True
    catalog["product"].save()

    assert api.get("/api/v1/catalog/products/?is_outlet=true").json()["count"] == 1


def test_filtrar_por_categoria_incluye_las_subcategorias(api, catalog):
    catalog["product"].categories.set([Category.objects.get(slug="coctel")])

    assert api.get("/api/v1/catalog/products/?category=fiesta").json()["count"] == 1


def test_filtrar_por_disponibilidad(api, catalog):
    assert api.get("/api/v1/catalog/products/?in_stock=true").json()["count"] == 1

    catalog["variant"].stock = 0
    catalog["variant"].save()

    assert api.get("/api/v1/catalog/products/?in_stock=true").json()["count"] == 0


def test_un_producto_sin_precio_se_marca_como_solo_consulta(api, catalog):
    catalog["product"].sale_mode = SaleMode.ON_REQUEST
    catalog["product"].price = None
    catalog["product"].save()

    body = api.get(f"/api/v1/catalog/products/{catalog['product'].slug}/").json()

    assert body["enquiry_only"] is True
    assert body["effective_price_gross"] is None


def test_avisame_cuando_haya_stock_no_exige_cuenta(api, catalog):
    catalog["variant"].stock = 0
    catalog["variant"].save()

    response = api.post(
        "/api/v1/catalog/stock-notifications/",
        {"variant": str(catalog["variant"].id), "email": "ana@example.com"},
        format="json",
    )

    assert response.status_code == 201
    assert StockNotification.objects.count() == 1


def test_pedir_aviso_dos_veces_no_duplica(api, catalog):
    catalog["variant"].stock = 0
    catalog["variant"].save()
    payload = {"variant": str(catalog["variant"].id), "email": "ana@example.com"}

    api.post("/api/v1/catalog/stock-notifications/", payload, format="json")
    api.post("/api/v1/catalog/stock-notifications/", payload, format="json")

    assert StockNotification.objects.count() == 1


def test_no_tiene_sentido_pedir_aviso_de_algo_disponible(api, catalog):
    response = api.post(
        "/api/v1/catalog/stock-notifications/",
        {"variant": str(catalog["variant"].id), "email": "ana@example.com"},
        format="json",
    )

    assert response.status_code == 400


def test_la_consulta_de_un_producto_sin_precio_llega_por_correo(api, catalog, mailoutbox):
    catalog["product"].sale_mode = SaleMode.ON_REQUEST
    catalog["product"].price = None
    catalog["product"].save()

    response = api.post(
        "/api/v1/catalog/enquiries/",
        {
            "product": catalog["product"].slug,
            "name": "Ana",
            "email": "ana@example.com",
            "message": "¿Precio y plazo?",
        },
        format="json",
    )

    assert response.status_code == 202
    assert len(mailoutbox) == 1
    assert "Vestido Aria" in mailoutbox[0].subject


def test_no_se_consulta_por_un_producto_que_ya_tiene_precio(api, catalog):
    response = api.post(
        "/api/v1/catalog/enquiries/",
        {
            "product": catalog["product"].slug,
            "name": "Ana",
            "email": "ana@example.com",
            "message": "hola",
        },
        format="json",
    )

    assert response.status_code == 400


def test_las_categorias_se_devuelven_como_arbol(api, catalog):
    body = api.get("/api/v1/catalog/categories/").json()

    assert body[0]["slug"] == "fiesta"
    assert body[0]["children"][0]["slug"] == "coctel"


def test_los_avisos_de_reposicion_se_envian_al_reponer(catalog, mailoutbox):
    from apps.catalog.services import send_pending_stock_notifications

    catalog["variant"].stock = 0
    catalog["variant"].save()
    StockNotification.objects.create(variant=catalog["variant"], email="ana@example.com")

    assert send_pending_stock_notifications() == 0  # sigue sin stock

    catalog["variant"].stock = 2
    catalog["variant"].save()

    assert send_pending_stock_notifications() == 1
    assert len(mailoutbox) == 1
    assert "Vestido Aria" in mailoutbox[0].subject

    # Reejecutar no reenvía: notified_at ya está marcado.
    assert send_pending_stock_notifications() == 0
