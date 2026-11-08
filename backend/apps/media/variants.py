"""
Versiones reducidas de cada imagen, para `srcset`.

Sin esto, una tarjeta de 300 px de ancho en un móvil descargaba la foto de 2560 px: las
páginas con cuadrícula pesaban entre 6 y 18 MB (Lighthouse, 2026-11-08).

Junto a cada imagen `…/nombre.webp` se guardan `nombre.w480.webp`, `nombre.w960.webp` y
`nombre.w1600.webp`. Los nombres son deterministas a propósito: el frontend los construye
a partir de la URL de la foto (`Frontend/src/lib/imagenes.js`), sin tener que preguntar
nada al backend, y Caddy los sirve como cualquier otro archivo.

Se generan SIEMPRE las tres, también si la original es más estrecha (entonces se guarda al
tamaño original): así el `srcset` nunca apunta a un archivo que no existe.
"""

import io
from pathlib import PurePosixPath

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image, ImageOps

WIDTHS = (480, 960, 1600)
QUALITY = 80
IMAGE_SUFFIXES = {".webp", ".jpg", ".jpeg", ".png"}


def variant_name(name: str, width: int) -> str:
    """`web/img/a/foto.jpg` → `web/img/a/foto.w960.webp`."""
    path = PurePosixPath(name)
    return str(path.with_name(f"{path.stem}.w{width}.webp"))


def _looks_like_variant(path: PurePosixPath) -> bool:
    sufijo = path.stem.rsplit(".", 1)
    return len(sufijo) == 2 and sufijo[1] in {f"w{w}" for w in WIDTHS}


def generate_variants(name: str, *, overwrite: bool = False) -> int:
    """
    Crea las versiones reducidas de la imagen `name` (ruta dentro del storage). Devuelve
    cuántas ha escrito. No falla si la imagen no se puede abrir: devuelve 0.
    """
    path = PurePosixPath(name)
    if path.suffix.lower() not in IMAGE_SUFFIXES or _looks_like_variant(path):
        return 0
    pending = [w for w in WIDTHS if overwrite or not default_storage.exists(variant_name(name, w))]
    if not pending:
        return 0
    try:
        with default_storage.open(name, "rb") as source:
            image = Image.open(source)
            image = ImageOps.exif_transpose(image)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            image.load()
    except (OSError, ValueError):
        return 0

    written = 0
    for width in pending:
        copy = image.copy()
        if copy.width > width:
            height = round(copy.height * width / copy.width)
            copy = copy.resize((width, height), Image.LANCZOS)
        buffer = io.BytesIO()
        copy.save(buffer, format="WEBP", quality=QUALITY, method=4)
        target = variant_name(name, width)
        if default_storage.exists(target):
            default_storage.delete(target)
        default_storage.save(target, ContentFile(buffer.getvalue()))
        written += 1
    return written


def delete_variants(name: str) -> None:
    for width in WIDTHS:
        target = variant_name(name, width)
        if default_storage.exists(target):
            default_storage.delete(target)
