"""
Da de alta en la biblioteca de medios las fotos y vídeos que usa el contenido.

La web estática de Miriam tenía sus fotos en `Frontend/public/img/…`. Las que salen en
el contenido editable se movieron al almacén de medios con la MISMA ruta debajo de
`web/` (`/img/a/b.webp` → `MEDIA_ROOT/web/img/a/b.webp`, servida en `/media/web/img/a/b.webp`)
y los documentos ya apuntan ahí. Este comando:

1. recorre todos los documentos buscando URLs `/media/web/…`;
2. si el archivo no está en `MEDIA_ROOT`, lo copia desde `--origen` (la carpeta `public/`
   del repo de Miriam, https://github.com/mreinab/felycampo, commit e556a76);
3. crea su `MediaAsset` (con miniatura, ancho y alto si es imagen) para que salgan en la
   biblioteca del panel y se puedan reutilizar;
4. genera sus versiones de 480/960/1600 px para el `srcset` (`apps/media/variants.py`).

Los nombres se conservan tal cual (son nombres SEO ya indexados): no se renombran a UUID
como las subidas nuevas, ni se recomprimen (ya son WebP de ≤2560 px).

Es idempotente: un archivo que ya tiene `MediaAsset` se salta.

    python manage.py importar_medios_web --origen /ruta/al/repo-de-miriam/public
"""

import io
import mimetypes
import re
import shutil
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from PIL import Image, ImageOps

from apps.content.models import Document
from apps.media.models import MediaAsset, MediaKind
from apps.media.processing import THUMBNAIL_SIZE, WEBP_QUALITY
from apps.media.variants import generate_variants

PREFIX = "/media/web/"
URL_RE = re.compile(r"^/media/web/[^#]+")
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov"}


def media_urls(value) -> set[str]:
    """Todas las URLs `/media/web/…` de un documento (sin el `#video` de las galerías)."""
    found: set[str] = set()
    if isinstance(value, str):
        match = URL_RE.match(value)
        if match:
            found.add(match.group(0))
    elif isinstance(value, dict):
        for item in value.values():
            found |= media_urls(item)
    elif isinstance(value, list):
        for item in value:
            found |= media_urls(item)
    return found


class Command(BaseCommand):
    help = "Registra en la biblioteca de medios las fotos y vídeos del contenido de la web."

    def add_arguments(self, parser):
        parser.add_argument(
            "--origen",
            help="Carpeta public/ del frontend estático, de donde copiar lo que falte.",
        )

    def handle(self, *args, origen, **options):
        source = Path(origen) if origen else None
        if source and not source.is_dir():
            raise CommandError(f"--origen no es una carpeta: {source}")

        urls: set[str] = set()
        for data in Document.objects.values_list("data", flat=True):
            urls |= media_urls(data)
        if not urls:
            raise CommandError("No hay documentos con medios. ¿Has ejecutado cargar_contenido?")

        media_root = Path(settings.MEDIA_ROOT)
        registered = set(
            MediaAsset.objects.filter(file__startswith="web/").values_list("file", flat=True)
        )
        copied = created = variants = 0
        missing: list[str] = []

        for url in sorted(urls):
            relative = url[len("/media/") :]  # web/img/…
            target = media_root / relative
            if not target.exists():
                origin_file = source / url[len(PREFIX) :] if source else None
                if not origin_file or not origin_file.exists():
                    missing.append(url)
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(origin_file, target)
                copied += 1
            if relative not in registered:
                self._asset(relative, target).save()
                created += 1
            variants += generate_variants(relative)  # salta las que ya existen

        self.stdout.write(
            self.style.SUCCESS(
                f"Medios: {len(urls)} referenciados, {copied} copiados, {created} registrados, "
                f"{variants} versiones reducidas."
            )
        )
        if missing:
            self.stdout.write(self.style.WARNING(f"{len(missing)} sin archivo (ni en --origen):"))
            for url in missing[:50]:
                self.stdout.write(f"  {url}")

    def _asset(self, relative: str, path: Path) -> MediaAsset:
        content_type = mimetypes.guess_type(path.name)[0] or ""
        is_video = path.suffix.lower() in VIDEO_EXTENSIONS
        asset = MediaAsset(
            kind=MediaKind.VIDEO if is_video else MediaKind.IMAGE,
            original_filename=path.name,
            content_type=content_type,
            size_bytes=path.stat().st_size,
        )
        asset.file.name = relative  # ya está en su sitio: se apunta, no se vuelve a guardar
        if not is_video:
            try:
                with Image.open(path) as image:
                    image = ImageOps.exif_transpose(image)
                    asset.width, asset.height = image.size
                    if image.mode not in ("RGB", "RGBA"):
                        image = image.convert("RGBA")
                    image.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
                    buffer = io.BytesIO()
                    image.save(buffer, format="WEBP", quality=WEBP_QUALITY)
                asset.thumbnail.save(
                    f"{path.stem}.webp", ContentFile(buffer.getvalue()), save=False
                )
            except (OSError, ValueError) as exc:
                self.stdout.write(self.style.WARNING(f"Sin miniatura para {relative}: {exc}"))
        return asset
