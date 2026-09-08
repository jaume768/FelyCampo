"""
Purga de carritos. Sin esto la tabla crece indefinidamente: cada visitante anónimo que
añade algo y se va deja una fila para siempre.

Programar por cron, una vez al día.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.orders.models import Cart

ANONYMOUS_EMPTY_HOURS = 24
ANONYMOUS_ABANDONED_DAYS = 90
CHECKED_OUT_DAYS = 90


class Command(BaseCommand):
    help = "Borra carritos anónimos vacíos y carritos ya convertidos en pedido."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Cuenta lo que borraría sin borrar nada.",
        )

    def handle(self, *args, **options):
        now = timezone.now()

        # Anónimos y vacíos: nunca llegaron a contener nada.
        empty = Cart.objects.filter(
            user__isnull=True,
            checked_out_at__isnull=True,
            items__isnull=True,
            created_at__lt=now - timezone.timedelta(hours=ANONYMOUS_EMPTY_HOURS),
        )

        # Anónimos **con artículos** y sin tocar en meses. Son los que de verdad crecen:
        # sin cuenta no hay a quién devolvérselos, y son justo los que deja un bot que
        # hace POST. Se miran por `updated_at`, no por `created_at`, para no borrar un
        # carrito viejo que alguien sigue usando.
        abandoned = Cart.objects.filter(
            user__isnull=True,
            checked_out_at__isnull=True,
            updated_at__lt=now - timezone.timedelta(days=ANONYMOUS_ABANDONED_DAYS),
        ).exclude(items__isnull=True)

        # Ya convertidos en pedido: el pedido guarda su propia copia de las líneas, así
        # que el carrito no aporta nada pasado un tiempo prudencial.
        spent = Cart.objects.filter(
            checked_out_at__lt=now - timezone.timedelta(days=CHECKED_OUT_DAYS)
        )

        empty_count = empty.count()
        abandoned_count = abandoned.count()
        spent_count = spent.count()
        if not options["dry_run"]:
            empty.delete()
            abandoned.delete()
            spent.delete()

        prefix = "[simulación] " if options["dry_run"] else ""
        self.stdout.write(
            self.style.SUCCESS(
                f"{prefix}Carritos anónimos vacíos: {empty_count}. "
                f"Anónimos abandonados con artículos: {abandoned_count}. "
                f"Carritos ya facturados: {spent_count}."
            )
        )
