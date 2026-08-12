"""
Flags iniciales.

Se crean aquí y no desde el panel a propósito: un flag solo significa algo si hay código que
lo consulta, y ese código se escribe con la migración delante. Dejar que se creen desde la
interfaz garantiza acabar con interruptores que no están conectados a nada.

**Ninguno cambia todavía el comportamiento del sistema**: en esta fase solo se almacena y se
lee el estado (decidido así). Arrancan desactivados para que encenderlos sea un acto
deliberado.
"""

from django.db import migrations

FLAGS = [
    {
        "key": "automatic-emails",
        "name": "Emails automáticos",
        "description": (
            "Envío automático de correos transaccionales desde el panel. Sin efecto hasta "
            "que se implemente el comportamiento asociado."
        ),
    },
    {
        "key": "stock-by-location",
        "name": "Stock por ubicación",
        "description": (
            "Muestra el desglose de stock por tienda y almacén. Sin efecto hasta que se "
            "implemente el comportamiento asociado."
        ),
    },
]


def create_flags(apps, schema_editor):
    FeatureFlag = apps.get_model("core", "FeatureFlag")
    for flag in FLAGS:
        # get_or_create y no create: la migración debe poder reejecutarse sobre una base de
        # datos donde alguien ya creó el flag a mano desde el admin de Django.
        FeatureFlag.objects.get_or_create(key=flag["key"], defaults=flag)


def delete_flags(apps, schema_editor):
    FeatureFlag = apps.get_model("core", "FeatureFlag")
    FeatureFlag.objects.filter(key__in=[flag["key"] for flag in FLAGS]).delete()


class Migration(migrations.Migration):
    dependencies = [("core", "0001_initial")]

    operations = [migrations.RunPython(create_flags, delete_flags)]
