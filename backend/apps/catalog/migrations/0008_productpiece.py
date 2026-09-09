"""
«Prendas y SKU»: la lista de piezas del producto con su código de inventario.

El panel la editaba desde el principio y se perdía al guardar porque no había modelo
detrás. NO es `BundleComponent`: ese apunta a una `Variant` real y sirve para descontar
stock de un conjunto; esto es descriptivo, el código que lleva la etiqueta cosida.
"""

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0007_product_care_and_origin_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductPiece',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=120, verbose_name='prenda')),
                ('name_en', models.CharField(blank=True, max_length=120, verbose_name='prenda (EN)')),
                ('sku', models.CharField(blank=True, max_length=64, verbose_name='SKU')),
                ('position', models.PositiveSmallIntegerField(default=0, verbose_name='orden')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pieces', to='catalog.product', verbose_name='producto')),
            ],
            options={
                'verbose_name': 'prenda del producto',
                'verbose_name_plural': 'prendas del producto',
                'ordering': ['position', 'name'],
            },
        ),
    ]
