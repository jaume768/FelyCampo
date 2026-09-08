import pytest
from rest_framework.test import APIClient

from apps.catalog.models import Color, Colorway, Family, Product, ProductStatus, Size, Variant
from apps.stock.models import Location, StockLevel, StockMovement

LIST_ENDPOINTS = [
    "/api/v1/admin/stock/variants/",
    "/api/v1/admin/stock/movements/",
    "/api/v1/admin/stock/locations/",
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
def almacen(db):
    # "ALM01" ya existe en cualquier base de test: la migración de datos de la Fase 3
    # (`0002_backfill_stock_levels`) la crea al montar la base — se reutiliza en vez de
    # volver a crearla (chocaría con la unique de `code`).
    almacen, _creado = Location.objects.get_or_create(
        code="ALM01",
        defaults={"name": "Almacén principal", "kind": "warehouse", "is_sellable": True},
    )
    return almacen


@pytest.fixture
def tienda(db):
    return Location.objects.create(
        code="TDA01", name="Tienda Madrid", kind="store", is_sellable=False
    )


@pytest.fixture
def variant(db):
    family = Family.objects.create(code="VE", name="Vestidos", slug="vestidos")
    color = Color.objects.create(code="ROJ", name="Rojo")
    size = Size.objects.create(code="38", position=1)
    product = Product.objects.create(
        family=family,
        design_code="120",
        name="Vestido Aria",
        status=ProductStatus.ACTIVE,
        price="200.00",
    )
    colorway = Colorway.objects.create(product=product, color=color)
    return Variant.objects.create(colorway=colorway, size=size, stock=0)


# ---------- Acceso ----------


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


# ---------- Location: guarda de una sola ubicación vendible ----------


@pytest.mark.django_db
def test_alta_ubicacion_vendible_sin_otra_previa(staff_client):
    # Sin esto, "ALM01" (creada por la migración de datos al montar la base de test) ya
    # cuenta como "otra ubicación vendible" y el POST de abajo chocaría con la guarda —
    # este test es justo el caso "no hay ninguna previa todavía".
    Location.objects.filter(is_sellable=True).delete()
    response = staff_client.post(
        "/api/v1/admin/stock/locations/",
        {"code": "ALM01", "name": "Almacén principal", "kind": "warehouse", "is_sellable": True},
    )
    assert response.status_code == 201


@pytest.mark.django_db
def test_marcar_segunda_ubicacion_vendible_409(staff_client, almacen):
    response = staff_client.post(
        "/api/v1/admin/stock/locations/",
        {"code": "ALM02", "name": "Almacén secundario", "kind": "warehouse", "is_sellable": True},
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "multiple_sellable_locations"


@pytest.mark.django_db
def test_editar_otra_ubicacion_sin_tocar_is_sellable_no_choca_con_la_guarda(
    staff_client, almacen, tienda
):
    # PATCH de un campo cualquiera de `tienda` (no vendible) no debe disparar la guarda —
    # solo se activa cuando el PATCH intenta poner is_sellable=True.
    response = staff_client.patch(
        f"/api/v1/admin/stock/locations/{tienda.id}/", {"name": "Tienda Barcelona"}
    )
    assert response.status_code == 200


@pytest.mark.django_db
def test_desmarcar_y_marcar_otra_vendible_funciona(staff_client, almacen, tienda):
    staff_client.patch(f"/api/v1/admin/stock/locations/{almacen.id}/", {"is_sellable": False})
    response = staff_client.patch(
        f"/api/v1/admin/stock/locations/{tienda.id}/", {"is_sellable": True}
    )
    assert response.status_code == 200


# ---------- adjust / set ----------


@pytest.mark.django_db
def test_adjust_sin_motivo_400(staff_client, variant, almacen):
    response = staff_client.post(
        f"/api/v1/admin/stock/variants/{variant.id}/adjust/",
        {"location": str(almacen.id), "delta": 5, "reason": ""},
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_adjust_positivo_crea_movimiento_y_actualiza_variant_stock(staff_client, variant, almacen):
    response = staff_client.post(
        f"/api/v1/admin/stock/variants/{variant.id}/adjust/",
        {"location": str(almacen.id), "delta": 5, "reason": "Entrada de mercancía"},
    )
    assert response.status_code == 200
    cuerpo = response.json()
    assert cuerpo["stock"] == 5
    # Regresión: `self.get_object()` precarga `stock_levels` con `prefetch_related` ANTES
    # del ajuste — sin refrescar esa caché, `levels` en esta misma respuesta se quedaba
    # mostrando la cantidad de antes (0) aunque `stock` sí saliera bien.
    niveles = {n["location_id"]: n["quantity"] for n in cuerpo["levels"]}
    assert niveles[str(almacen.id)] == 5

    variant.refresh_from_db()
    assert variant.stock == 5
    movimiento = StockMovement.objects.get(variant=variant)
    assert movimiento.delta == 5
    assert movimiento.quantity_before == 0
    assert movimiento.quantity_after == 5
    assert movimiento.reason == "Entrada de mercancía"


@pytest.mark.django_db
def test_adjust_negativo_por_debajo_de_cero_409(staff_client, variant, almacen):
    StockLevel.objects.create(variant=variant, location=almacen, quantity=2)
    response = staff_client.post(
        f"/api/v1/admin/stock/variants/{variant.id}/adjust/",
        {"location": str(almacen.id), "delta": -5, "reason": "Corrección"},
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "insufficient_stock"
    # No se ha escrito ningún movimiento a medias.
    assert not StockMovement.objects.exists()


@pytest.mark.django_db
def test_set_fija_la_cantidad_exacta(staff_client, variant, almacen):
    StockLevel.objects.create(variant=variant, location=almacen, quantity=10)
    response = staff_client.post(
        f"/api/v1/admin/stock/variants/{variant.id}/set/",
        {"location": str(almacen.id), "quantity": 3, "reason": "Inventario físico"},
    )
    assert response.status_code == 200
    cuerpo = response.json()
    assert cuerpo["stock"] == 3
    niveles = {n["location_id"]: n["quantity"] for n in cuerpo["levels"]}
    assert niveles[str(almacen.id)] == 3

    movimiento = StockMovement.objects.get(variant=variant)
    assert movimiento.delta == -7
    assert movimiento.quantity_before == 10
    assert movimiento.quantity_after == 3


@pytest.mark.django_db
def test_ajuste_en_ubicacion_no_vendible_no_cambia_variant_stock(
    staff_client, variant, almacen, tienda
):
    response = staff_client.post(
        f"/api/v1/admin/stock/variants/{variant.id}/adjust/",
        {"location": str(tienda.id), "delta": 4, "reason": "Muestra en tienda"},
    )
    assert response.status_code == 200
    variant.refresh_from_db()
    # D3: la tienda no es vendible, así que su stock no cuenta para lo que la web vende.
    assert variant.stock == 0


@pytest.mark.django_db
def test_desglose_por_ubicacion_incluye_todas_aunque_no_tengan_stocklevel(
    staff_client, variant, almacen, tienda
):
    response = staff_client.get(f"/api/v1/admin/stock/variants/{variant.id}/")
    assert response.status_code == 200
    niveles = {n["location_id"]: n["quantity"] for n in response.json()["levels"]}
    assert niveles[str(almacen.id)] == 0
    assert niveles[str(tienda.id)] == 0


# ---------- Sincronización con orders/services.py (checkout ya escribe variant.stock) ----------


@pytest.mark.django_db
def test_escribir_variant_stock_directamente_propaga_a_la_ubicacion_vendible(variant, almacen):
    # Mismo patrón que apps/orders/services.py: variant.stock -= cantidad; variant.save(...)
    variant.stock = 8
    variant.save(update_fields=["stock", "updated_at"])

    nivel = StockLevel.objects.get(variant=variant, location=almacen)
    assert nivel.quantity == 8

    variant.stock = 3
    variant.save(update_fields=["stock", "updated_at"])
    nivel.refresh_from_db()
    assert nivel.quantity == 3
