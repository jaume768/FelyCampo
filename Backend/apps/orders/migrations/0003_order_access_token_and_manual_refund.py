"""
Añade `access_token` (consulta de pedido sin cuenta) y `needs_manual_refund`.

`access_token` es único y obligatorio, así que no puede añadirse de golpe sobre una tabla
con filas: se crea opcional, se rellena fila a fila con un secreto distinto, y solo
entonces se aplica la unicidad.
"""

import secrets

from django.db import migrations, models


def generate_tokens(apps, schema_editor):
    Order = apps.get_model("orders", "Order")
    for order_id in Order.objects.filter(access_token__isnull=True).values_list("id", flat=True):
        Order.objects.filter(id=order_id).update(access_token=secrets.token_urlsafe(32))


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0002_order_number_sequence"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="needs_manual_refund",
            field=models.BooleanField(
                default=False,
                help_text=(
                    "Se cobró un pedido que no puede servirse (caducó, o el importe no "
                    "cuadra). Hay que devolver el dinero a mano en Stripe."
                ),
                verbose_name="requiere reembolso manual",
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="access_token",
            field=models.CharField(max_length=43, null=True, editable=False),
        ),
        migrations.RunPython(generate_tokens, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="order",
            name="access_token",
            field=models.CharField(
                editable=False,
                help_text=(
                    "Secreto que se envía al comprador para consultar su pedido sin "
                    "cuenta. La referencia es correlativa y por tanto adivinable; esto no."
                ),
                max_length=43,
                unique=True,
                verbose_name="token de consulta",
            ),
        ),
    ]
