from django.db import migrations


def forwards(apps, schema_editor):
    """
    `status` se añadió en la migración anterior con default 'draft' para TODAS las filas
    existentes (así funciona `AddField` con un CharField no nulo) — esto corrige eso:
    is_published=True -> active, is_published=False -> draft (ya lo estaban).
    """
    Product = apps.get_model("catalog", "Product")
    Product.objects.filter(is_published=True).update(status="active")


def backwards(apps, schema_editor):
    # No hace falta deshacer nada: is_published no se toca en ningún sentido, y `status`
    # desaparece igualmente al revertir la migración anterior.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0002_collection_remove_productimage_image_product_line_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
