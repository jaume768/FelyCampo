"""
Secuencia de Postgres para el número de pedido.

Se numera en la base de datos y no contando filas: dos checkouts simultáneos podrían leer
el mismo máximo y colisionar contra el unique de `Order.number`.
"""

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START WITH 1000;",
            reverse_sql="DROP SEQUENCE IF EXISTS orders_order_number_seq;",
        ),
    ]
