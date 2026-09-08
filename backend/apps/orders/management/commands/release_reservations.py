"""
Libera las reservas de stock caducadas.

Antes esto corría en cada visita al carrito. Programarlo por cron (cada 5-10 min) evita
pagar un SELECT y una transacción por pedido caducado en la ruta caliente; el checkout lo
sigue ejecutando en línea, que es donde de verdad importa que el stock esté al día.
"""

from django.core.management.base import BaseCommand

from apps.orders.services import release_expired_reservations


class Command(BaseCommand):
    help = "Devuelve al stock las reservas de pedidos que caducaron sin pagarse."

    def handle(self, *args, **options):
        released = release_expired_reservations()
        self.stdout.write(self.style.SUCCESS(f"Reservas liberadas: {released}"))
