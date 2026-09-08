"""
Fase 3 — migración de datos (ver apps/stock/models.py, docstring de módulo, y
ADMIN_API_PLAN.md).

Antes de esta migración, `Variant.stock` era la única cifra de stock que existía. Después,
es la suma de los `StockLevel` de ubicaciones vendibles y activas. Para que el stock que ya
existía no se pierda ni cambie lo que la web puede vender, esta migración:

1. Crea UNA ubicación vendible por defecto ("Almacén principal") — sin esto, todo el stock
   existente no tendría dónde vivir y `Variant.stock` (recalculado a partir de aquí en
   adelante por `stock/variants/{id}/adjust|set/`) se quedaría en 0 para todo el catálogo.
2. Crea un `StockLevel` por cada `Variant` existente, con `quantity = variant.stock` — así
   la suma coincide exactamente con lo que ya había, no se pierde ni se inventa una unidad.

Deliberadamente NO toca `Variant.stock` (ya es correcto, es la fuente que se está
copiando) ni crea ninguna ubicación de tienda (`kind='store'`) — eso es alta de datos de
negocio, no algo que una migración de esquema deba inventar.
"""

from django.db import migrations

DEFAULT_LOCATION_CODE = "ALM01"
DEFAULT_LOCATION_NAME = "Almacén principal"


def crear_ubicacion_y_migrar_stock(apps, schema_editor):
    Location = apps.get_model("stock", "Location")
    StockLevel = apps.get_model("stock", "StockLevel")
    Variant = apps.get_model("catalog", "Variant")

    almacen, _creado = Location.objects.get_or_create(
        code=DEFAULT_LOCATION_CODE,
        defaults={
            "name": DEFAULT_LOCATION_NAME,
            "kind": "warehouse",
            "is_sellable": True,
            "is_active": True,
            "position": 1,
        },
    )

    StockLevel.objects.bulk_create(
        [StockLevel(variant_id=variant.id, location=almacen, quantity=variant.stock) for variant in Variant.objects.all()],
        ignore_conflicts=True,
    )


def revertir(apps, schema_editor):
    # Borrar la ubicación arrastra en cascada sus StockLevel (Location -> StockLevel es
    # on_delete=PROTECT en el modelo real, pero en el estado histórico de la migración
    # inversa no hay stock que proteja nada más que sí mismo — se borran ambos a mano
    # en el orden correcto para no chocar con PROTECT).
    Location = apps.get_model("stock", "Location")
    StockLevel = apps.get_model("stock", "StockLevel")
    almacen = Location.objects.filter(code=DEFAULT_LOCATION_CODE).first()
    if almacen:
        StockLevel.objects.filter(location=almacen).delete()
        almacen.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("stock", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(crear_ubicacion_y_migrar_stock, revertir),
    ]
