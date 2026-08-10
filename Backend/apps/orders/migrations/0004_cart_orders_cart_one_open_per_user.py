"""
Un solo carrito abierto por usuario.

Antes de aplicar la constraint hay que resolver los duplicados que pudieran existir: se
conserva el más reciente y el resto se fusiona en él, para no perder lo que el cliente
tuviera dentro.
"""

from django.conf import settings
from django.db import migrations, models


def deduplicate_open_carts(apps, schema_editor):
    Cart = apps.get_model("orders", "Cart")
    CartItem = apps.get_model("orders", "CartItem")

    user_ids = (
        Cart.objects.filter(checked_out_at__isnull=True, user__isnull=False)
        .values_list("user_id", flat=True)
        .distinct()
    )

    for user_id in list(user_ids):
        carts = list(
            Cart.objects.filter(
                user_id=user_id, checked_out_at__isnull=True
            ).order_by("-updated_at")
        )
        if len(carts) < 2:
            continue

        keeper, duplicates = carts[0], carts[1:]
        for duplicate in duplicates:
            for item in CartItem.objects.filter(cart=duplicate):
                existing = CartItem.objects.filter(cart=keeper, variant=item.variant).first()
                if existing is None:
                    CartItem.objects.filter(pk=item.pk).update(cart=keeper)
                else:
                    CartItem.objects.filter(pk=existing.pk).update(
                        quantity=existing.quantity + item.quantity
                    )
                    CartItem.objects.filter(pk=item.pk).delete()
            Cart.objects.filter(pk=duplicate.pk).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0003_order_access_token_and_manual_refund"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(deduplicate_open_carts, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="cart",
            constraint=models.UniqueConstraint(
                condition=models.Q(("checked_out_at__isnull", True), ("user__isnull", False)),
                fields=("user",),
                name="orders_cart_one_open_per_user",
            ),
        ),
    ]
