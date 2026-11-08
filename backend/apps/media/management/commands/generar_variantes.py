"""
Genera las versiones reducidas (480/960/1600 px) de todas las imágenes de la biblioteca.

    python manage.py generar_variantes              # solo las que faltan
    python manage.py generar_variantes --rehacer    # todas otra vez

Las subidas nuevas e `importar_medios_web` ya las generan solas: esto es para las que
había antes y para cuando se cambien los anchos (`apps/media/variants.py`).
"""

from django.core.management.base import BaseCommand

from apps.media.models import MediaAsset, MediaKind
from apps.media.variants import generate_variants


class Command(BaseCommand):
    help = "Genera las versiones reducidas de las imágenes (para srcset)."

    def add_arguments(self, parser):
        parser.add_argument("--rehacer", action="store_true", help="Sobrescribe las existentes.")

    def handle(self, *args, rehacer, **options):
        names = list(MediaAsset.objects.filter(kind=MediaKind.IMAGE).values_list("file", flat=True))
        written = 0
        for index, name in enumerate(names, start=1):
            written += generate_variants(name, overwrite=rehacer)
            if index % 200 == 0:
                self.stdout.write(f"  {index}/{len(names)}…")
        self.stdout.write(
            self.style.SUCCESS(f"Variantes: {written} escritas para {len(names)} imágenes.")
        )
