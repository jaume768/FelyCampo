"""
Publica los productos programados a los que ya les ha llegado la hora.

Pensado para cron, igual que `release_reservations` y `purge_carts`: la API pública filtra
por `is_published`, que es un campo **almacenado** (no se recalcula en cada lectura), así
que hace falta algo que lo pase a `True` cuando toca.

Es idempotente: los que ya están activos no vuelven a tocarse, y `published_at` se conserva
tal cual (es la fecha que eligió quien programó la publicación, no la de ejecución).
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.catalog.models import Product, ProductStatus


class Command(BaseCommand):
    help = "Pasa a «Activo» los productos programados cuya fecha de publicación ya ha pasado."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Enseña qué se publicaría, sin tocar nada.",
        )

    def handle(self, *args, **options):
        ahora = timezone.now()
        pendientes = Product.objects.filter(
            status=ProductStatus.SCHEDULED,
            published_at__isnull=False,
            published_at__lte=ahora,
        )

        if options["dry_run"]:
            for producto in pendientes:
                self.stdout.write(f"[dry-run] {producto.slug} (programado {producto.published_at:%Y-%m-%d %H:%M})")
            self.stdout.write(self.style.SUCCESS(f"[dry-run] {pendientes.count()} por publicar."))
            return

        publicados = 0
        for producto in pendientes:
            producto.status = ProductStatus.ACTIVE
            # `published_at` NO se toca: es la fecha elegida, no la de ejecución del cron.
            producto.save(update_fields=["status", "is_published", "updated_at"])
            publicados += 1
            self.stdout.write(f"Publicado: {producto.slug}")

        self.stdout.write(self.style.SUCCESS(f"{publicados} producto(s) publicado(s)."))
