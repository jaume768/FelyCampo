"""
Test de la migración de datos `0002_backfill_stock_levels` (ver esa migración y el
docstring de módulo de `apps/stock/models.py`).

No usa un runner de migraciones aparte (no hay ninguna dependencia de ese tipo en el
proyecto, y añadir una para un solo test no está justificado): la función `RunPython` solo
usa `apps.get_model(...)`, así que se puede llamar directamente con el registro de apps
REAL (`django.apps.apps`) contra una base de datos de test de verdad — exactamente lo que
haría el runner de migraciones, sin el aparato de estado histórico que aquí no hace falta
(el modelo no ha cambiado de forma entre la 0001 y la 0002).

Ojo con el orden: pytest-django construye la base de datos de test corriendo TODAS las
migraciones reales, así que "ALM01" ya existe al empezar cualquier test de este archivo —
la propia migración ya se aplicó una vez para crear esa base. `_borrar_estado_previo_a_la_migracion`
deshace eso al principio de cada test, para poder probar la función igual que se ejecutaría
de verdad sobre una base que todavía no la había corrido.
"""

import importlib

import pytest
from django.apps import apps as real_apps

from apps.catalog.models import Color, Colorway, Family, Product, ProductStatus, Size, Variant
from apps.stock.models import Location, StockLevel

migracion = importlib.import_module("apps.stock.migrations.0002_backfill_stock_levels")


def _borrar_estado_previo_a_la_migracion():
    StockLevel.objects.all().delete()
    Location.objects.all().delete()


@pytest.fixture
def sin_ubicaciones(db):
    _borrar_estado_previo_a_la_migracion()


@pytest.fixture
def variant_con_stock(sin_ubicaciones):
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
    # Sin ubicación vendible todavía (`sin_ubicaciones` la ha quitado) — `Variant.save()`
    # no tiene dónde propagar, así que este `create` no deja ningún StockLevel por su
    # cuenta. Es justo el estado "antes de la Fase 3" que la migración tiene que resolver.
    return Variant.objects.create(colorway=colorway, size=size, stock=7)


@pytest.mark.django_db
def test_crea_la_ubicacion_vendible_por_defecto(sin_ubicaciones):
    assert not Location.objects.exists()

    migracion.crear_ubicacion_y_migrar_stock(real_apps, None)

    almacen = Location.objects.get(code="ALM01")
    assert almacen.is_sellable is True
    assert almacen.is_active is True
    assert almacen.kind == "warehouse"


@pytest.mark.django_db
def test_backfillea_un_stocklevel_por_variante_sin_cambiar_variant_stock(variant_con_stock):
    assert not StockLevel.objects.filter(variant=variant_con_stock).exists()

    migracion.crear_ubicacion_y_migrar_stock(real_apps, None)

    variant_con_stock.refresh_from_db()
    almacen = Location.objects.get(code="ALM01")
    nivel = StockLevel.objects.get(variant=variant_con_stock, location=almacen)

    assert nivel.quantity == 7
    # Lo importante del pedido explícito: "sin que cambie lo que la web puede vender".
    assert variant_con_stock.stock == 7


@pytest.mark.django_db
def test_es_idempotente_si_se_corre_dos_veces(variant_con_stock):
    migracion.crear_ubicacion_y_migrar_stock(real_apps, None)
    migracion.crear_ubicacion_y_migrar_stock(real_apps, None)

    assert Location.objects.filter(code="ALM01").count() == 1
    assert StockLevel.objects.filter(variant=variant_con_stock).count() == 1


@pytest.mark.django_db
def test_revertir_borra_la_ubicacion_y_su_stock(variant_con_stock):
    migracion.crear_ubicacion_y_migrar_stock(real_apps, None)
    assert StockLevel.objects.filter(variant=variant_con_stock).count() == 1

    migracion.revertir(real_apps, None)

    assert not Location.objects.filter(code="ALM01").exists()
    assert not StockLevel.objects.filter(variant=variant_con_stock).exists()
    # Revertir la migración de stock no debe borrar la variante ni tocar su `stock`.
    variant_con_stock.refresh_from_db()
    assert variant_con_stock.stock == 7
