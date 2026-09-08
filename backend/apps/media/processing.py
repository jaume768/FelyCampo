"""
Normalización de imágenes al subir: redimensiona, convierte a WebP, genera miniatura y
limpia EXIF — siempre en el servidor. Nunca se confía en que el cliente ya comprimió
bien: el canvas del navegador reescala, pero no limpia metadatos ni garantiza un peso de
archivo razonable, y duplicar la compresión en dos sitios solo degrada la imagen dos
veces (JPEG/WebP son con pérdida).
"""

import io

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

MAX_DIMENSION = 2560
THUMBNAIL_SIZE = (600, 600)
WEBP_QUALITY = 85


def process_image(uploaded_file) -> tuple[ContentFile, ContentFile, int, int]:
    """
    @param uploaded_file: `django.core.files.uploadedfile.UploadedFile` recibido en el
      multipart (ya validado como imagen por el serializer, ver `serializers.py`).
    @returns (archivo_principal, miniatura, ancho, alto) — ambos ya en WEBP, listos para
      `FieldFile.save(...)`.
    """
    image = Image.open(uploaded_file)

    # El EXIF trae la orientación real de la cámara (fotos verticales de móvil vienen
    # giradas en los píxeles crudos) — hay que aplicarla ANTES de tirar los metadatos, o
    # la imagen "limpia" queda tumbada.
    image = ImageOps.exif_transpose(image)

    if image.mode not in ("RGB", "RGBA"):
        image = image.convert(
            "RGBA" if "transparency" in image.info or image.mode == "P" else "RGB"
        )

    # thumbnail() reescala IN-PLACE conservando proporción y solo reduce (nunca amplía
    # una imagen ya más pequeña que el máximo).
    image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    main_buffer = io.BytesIO()
    # Reencodar a WEBP sin pasar ningún bloque `exif=` es, en sí mismo, cómo se limpian
    # los metadatos: Pillow no copia el EXIF si no se le pide explícitamente.
    image.save(main_buffer, format="WEBP", quality=WEBP_QUALITY)
    width, height = image.size

    thumbnail = image.copy()
    thumbnail.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
    thumb_buffer = io.BytesIO()
    thumbnail.save(thumb_buffer, format="WEBP", quality=WEBP_QUALITY)

    return (
        ContentFile(main_buffer.getvalue()),
        ContentFile(thumb_buffer.getvalue()),
        width,
        height,
    )
