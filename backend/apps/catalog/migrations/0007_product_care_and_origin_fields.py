"""
Composición, cuidados y orígenes: de texto fijo del frontend a dato del producto.

El panel ya editaba estos campos, pero no tenían dónde guardarse y se perdían al pulsar
Guardar. `care_codes` guarda los CÓDIGOS de los iconos de cuidado ("wash_40"), no su
texto: la etiqueta la pone el frontend en cada idioma.

`Color.code` pasa de 8 a 32 caracteres porque el panel da de alta los colores desde su
lista curada, cuyos códigos son slugs legibles ("optic-white"). Solo se amplía, así que
ninguna fila existente se queda fuera.
"""

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0006_remove_product_catalog_product_price_required_unless_on_request_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='color',
            name='code',
            field=models.CharField(max_length=32, unique=True, verbose_name='código'),
        ),
        migrations.AddField(
            model_name='product',
            name='composition_en',
            field=models.CharField(blank=True, max_length=255, verbose_name='composición (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='care_en',
            field=models.TextField(blank=True, verbose_name='cuidados (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='care_codes',
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(max_length=40),
                blank=True,
                default=list,
                size=None,
                verbose_name='códigos de cuidado',
            ),
        ),
        migrations.AddField(
            model_name='product',
            name='designed_in',
            field=models.CharField(blank=True, max_length=120, verbose_name='diseñado en'),
        ),
        migrations.AddField(
            model_name='product',
            name='designed_in_en',
            field=models.CharField(blank=True, max_length=120, verbose_name='diseñado en (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='made_in',
            field=models.CharField(blank=True, max_length=120, verbose_name='fabricado en'),
        ),
        migrations.AddField(
            model_name='product',
            name='made_in_en',
            field=models.CharField(blank=True, max_length=120, verbose_name='fabricado en (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='dyeing_printing',
            field=models.CharField(blank=True, max_length=120, verbose_name='tintura y estampación'),
        ),
        migrations.AddField(
            model_name='product',
            name='dyeing_printing_en',
            field=models.CharField(blank=True, max_length=120, verbose_name='tintura y estampación (EN)'),
        ),
        migrations.AddField(
            model_name='product',
            name='fabric_origin',
            field=models.CharField(blank=True, max_length=120, verbose_name='origen del tejido'),
        ),
        migrations.AddField(
            model_name='product',
            name='fabric_origin_en',
            field=models.CharField(blank=True, max_length=120, verbose_name='origen del tejido (EN)'),
        ),
    ]
