from django.core.management.base import BaseCommand

from apps.catalog.services import send_pending_stock_notifications


class Command(BaseCommand):
    help = "Envía los avisos «avísame cuando haya stock» de artículos ya disponibles."

    def handle(self, *args, **options):
        sent = send_pending_stock_notifications()
        self.stdout.write(self.style.SUCCESS(f"Avisos enviados: {sent}"))
