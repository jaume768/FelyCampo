"""
Normalización de los archivos que entran en la biblioteca de medios, y comprobación de uso
antes de borrarlos.

**Todo síncrono, dentro de la propia petición.** Es una subida de personal interno y ronda
el segundo; este proyecto no tiene Celery a propósito (ver DECISIONS_PENDING.md) y meter una
cola solo para redimensionar imágenes no compensa.
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError

logger = logging.getLogger(__name__)

# Formatos aceptados. Lista blanca y no lista negra: lo que no se reconoce se rechaza.
ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
}
ALLOWED_VIDEO_MIME_TYPES = {"video/mp4", "video/webm", "video/quicktime"}


class MediaProcessingError(Exception):
    """El archivo no se puede procesar. Lo traduce a 400 el serializer que lo llama."""


@dataclass(frozen=True)
class ProcessedImage:
    """Resultado de normalizar una imagen."""

    file: ContentFile
    thumbnail: ContentFile | None
    original: ContentFile | None
    width: int
    height: int
    mime_type: str


def process_image(uploaded) -> ProcessedImage:
    """
    Reescala, convierte a WebP y genera miniatura.

    Pasos y por qué:

    1. **Límite de píxeles**: una imagen de pocos KB puede descomprimirse a gigabytes
       ("decompression bomb"). Pillow lo detecta y aquí se convierte en error de validación
       en lugar de en un worker muerto por falta de memoria.
    2. **`exif_transpose`**: aplica la orientación del EXIF a los píxeles. Sin esto, las
       fotos hechas con el móvil en vertical salen tumbadas en cuanto se descarta el EXIF.
    3. **Se descarta el resto del EXIF**: lleva GPS, número de serie y modelo de cámara.
       Publicarlo tal cual es una fuga de datos gratuita.
    4. **WebP**: pesa bastante menos que JPEG a calidad equivalente y admite transparencia,
       así que los PNG con alfa no se estropean al convertirlos.
    """
    try:
        image = Image.open(uploaded)
        image.load()
    except Image.DecompressionBombError as exc:
        raise MediaProcessingError(
            "La imagen es demasiado grande al descomprimirse y se ha rechazado."
        ) from exc
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise MediaProcessingError("El archivo no es una imagen válida.") from exc

    stem = Path(getattr(uploaded, "name", "media") or "media").stem or "media"

    # Un GIF animado se aplanaría a un solo fotograma al convertirlo, así que se guarda tal
    # cual y solo se le genera miniatura.
    if getattr(image, "is_animated", False):
        uploaded.seek(0)
        raw = uploaded.read()
        return ProcessedImage(
            file=ContentFile(raw, name=f"{stem}.gif"),
            thumbnail=_build_thumbnail(image, stem),
            original=None,
            width=image.width,
            height=image.height,
            mime_type="image/gif",
        )

    image = ImageOps.exif_transpose(image) or image
    image = _to_web_mode(image)

    max_dimension = settings.MEDIA_IMAGE_MAX_DIMENSION
    resized = max(image.width, image.height) > max_dimension
    if resized:
        # `thumbnail` conserva la proporción y nunca amplía.
        image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    buffer = io.BytesIO()
    # `method=6` es la compresión más lenta y más pequeña de WebP. Se paga una vez, al
    # subir; el ahorro lo cobra cada visita a la web.
    image.save(buffer, format="WEBP", quality=settings.MEDIA_IMAGE_WEBP_QUALITY, method=6)
    processed = ContentFile(buffer.getvalue(), name=f"{stem}.webp")

    uploaded.seek(0)
    original = ContentFile(uploaded.read(), name=Path(uploaded.name).name)

    return ProcessedImage(
        file=processed,
        thumbnail=_build_thumbnail(image, stem),
        original=original,
        width=image.width,
        height=image.height,
        mime_type="image/webp",
    )


def _to_web_mode(image: Image.Image) -> Image.Image:
    """
    Lleva la imagen a RGB o RGBA. Los modos de paleta (`P`) y escala de grises no se pueden
    guardar como WebP directamente, y convertir a RGB una imagen con transparencia la
    pintaría de negro donde era transparente.
    """
    has_alpha = image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info)
    return image.convert("RGBA" if has_alpha else "RGB")


def _build_thumbnail(image: Image.Image, stem: str) -> ContentFile:
    """Miniatura para la rejilla del panel, que si no cargaría decenas de imágenes enteras."""
    size = settings.MEDIA_THUMBNAIL_SIZE
    thumb = _to_web_mode(image.copy())
    thumb.thumbnail((size, size), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    thumb.save(buffer, format="WEBP", quality=75, method=6)
    return ContentFile(buffer.getvalue(), name=f"{stem}-thumb.webp")


# --- Uso de un archivo antes de borrarlo -------------------------------------------------

# Comprobaciones que no son claves ajenas. Las secciones que referencian medios desde un
# JSON (el editor de la home) no tienen integridad referencial en base de datos, así que
# registran aquí su propia comprobación. Cada entrada es un callable que recibe el asset y
# devuelve una lista de descripciones legibles de dónde se usa.
EXTRA_USAGE_CHECKS: list = []


def media_asset_usages(asset) -> list[str]:
    """
    Dónde se está usando este archivo. Lista vacía = se puede borrar.

    Recorre las relaciones inversas reales (portadas de blog, fotos de reseña, bloques de
    página) en vez de enumerarlas a mano, para que las fases siguientes queden cubiertas al
    declarar su clave ajena y no por acordarse de tocar este archivo.
    """
    usages: list[str] = []

    for relation in asset._meta.related_objects:
        accessor = relation.get_accessor_name()
        if accessor is None:
            continue
        related = getattr(asset, accessor, None)
        if related is None:
            continue
        label = relation.related_model._meta.verbose_name_plural
        if relation.one_to_one:
            usages.append(str(label))
            continue
        count = related.count()
        if count:
            usages.append(f"{label}: {count}")

    for check in EXTRA_USAGE_CHECKS:
        usages.extend(check(asset))

    return usages
