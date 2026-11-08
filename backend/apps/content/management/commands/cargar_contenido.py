"""
Carga inicial del contenido de la web desde un JSON `{clave: datos}`.

El JSON lo genera `Frontend/scripts/exportar-contenido.mjs` a partir de
`Frontend/src/datos/` (el contenido de la web estática de Miriam), y el de partida va
versionado en `apps/content/seed/contenido.json`.

    python manage.py cargar_contenido                  # solo crea lo que falta
    python manage.py cargar_contenido --sobrescribir   # pisa lo publicado (nueva versión)

Sin `--sobrescribir` es seguro repetirlo: un documento que ya existe no se toca, así que
no se pierde nada de lo que se haya editado desde el panel.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from apps.content.models import Document
from apps.content.registry import DOCUMENTS
from apps.content.services import publish_document

DEFAULT_SEED = Path(__file__).resolve().parents[2] / "seed" / "contenido.json"


class Command(BaseCommand):
    help = "Carga el contenido inicial de la web (documentos de apps.content)."

    def add_arguments(self, parser):
        parser.add_argument("ruta", nargs="?", default=str(DEFAULT_SEED))
        parser.add_argument(
            "--sobrescribir",
            action="store_true",
            help="Publica también los documentos que ya existen (crea una versión nueva).",
        )

    def handle(self, *args, ruta, sobrescribir, **options):
        try:
            payload = json.loads(Path(ruta).read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise CommandError(f"No se puede leer {ruta}: {exc}") from exc

        unknown = sorted(set(payload) - set(DOCUMENTS))
        if unknown:
            raise CommandError(f"Claves que no están en apps/content/registry.py: {unknown}")
        missing = sorted(set(DOCUMENTS) - set(payload))
        if missing:
            self.stdout.write(self.style.WARNING(f"El JSON no trae: {', '.join(missing)}"))

        existing = set(Document.objects.values_list("key", flat=True))
        created = updated = skipped = 0
        for key, data in payload.items():
            if key in existing and not sobrescribir:
                skipped += 1
                continue
            try:
                publish_document(key, data, expected_version=None, revalidate=False)
            except ValueError as exc:
                raise CommandError(str(exc)) from exc
            if key in existing:
                updated += 1
            else:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Contenido: {created} creados, {updated} sobrescritos, {skipped} sin tocar."
            )
        )
