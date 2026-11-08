"""
Biblioteca de medios del panel admin — imágenes y vídeos ya subidos, reutilizables desde
cualquier sección (producto, blog, contenido, diseño de home).

PLACEHOLDER — el storage sigue siendo FileSystemStorage incluso en producción
(ver config/settings/production.py, "PLACEHOLDER — NO APTO PARA PRODUCCIÓN REAL"): lo
subido aquí se pierde en cada despliegue hasta que se migre a S3/R2 (cambiar STORAGES).
Es requisito antes de salir a producción, no una mejora futura — ver DECISIONS_PENDING.md
y INTEGRACION.md.
"""

import uuid
from pathlib import PurePosixPath

from django.conf import settings
from django.db import models
from django.db.models import TextField
from django.db.models.functions import Cast
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDTimeStampedModel


def media_upload_path(instance, filename):
    """
    `library/<tipo>/<nombre-seo>-<8 hex>.<ext>`. El nombre SEO lo pone quien sube (el
    panel manda uno descriptivo, como los de las fotos de la web: «fely-campo-…»); si no,
    el del archivo original. Siempre pasado por `slugify`: minúsculas, sin acentos ni «ñ»
    (Next no sirve los nombres con «ñ» en NFD) y sin espacios. El sufijo aleatorio evita
    choques y hace que un archivo nunca se sobrescriba (caché larga en Caddy).
    """
    base = slugify(getattr(instance, "nombre_seo", "") or PurePosixPath(filename).stem)[:80]
    base = base or "fely-campo"
    ext = "webp" if instance.kind == MediaKind.IMAGE else instance.content_type.split("/")[-1]
    if ext == "quicktime":
        ext = "mov"
    return f"library/{instance.kind}/{base}-{uuid.uuid4().hex[:8]}.{ext}"


def thumbnail_upload_path(instance, filename):
    del instance, filename
    return f"library/thumbnails/{uuid.uuid4().hex}.webp"


class MediaKind(models.TextChoices):
    IMAGE = "image", _("Imagen")
    VIDEO = "video", _("Vídeo")


class MediaAsset(UUIDTimeStampedModel):
    """
    Un archivo de la biblioteca. Las imágenes se normalizan en el servidor al subir
    (`apps.media.processing`): redimensionadas a un máximo de 2560px, convertidas a
    WebP, con miniatura propia y EXIF limpio — nunca se confía en que el cliente ya las
    comprimió bien (el canvas del navegador reescala, pero no limpia metadatos ni
    garantiza un peso de archivo razonable). Los vídeos se guardan tal cual llegan: no
    hay reencodado ni miniatura de vídeo (exigiría ffmpeg, fuera de alcance por ahora).
    """

    kind = models.CharField(_("tipo"), max_length=8, choices=MediaKind.choices)
    # 255 y no los 100 por defecto: las fotos de la web conservan sus nombres SEO
    # (`web/img/collections/fiesta/<coleccion>/fely-campo-coleccion-fiesta-…webp`), que
    # pasan de 100 caracteres. Ver apps/content/management/commands/importar_medios_web.py.
    file = models.FileField(_("archivo"), upload_to=media_upload_path, max_length=255)
    thumbnail = models.ImageField(
        _("miniatura"), upload_to=thumbnail_upload_path, null=True, blank=True, max_length=255
    )
    original_filename = models.CharField(_("nombre original"), max_length=255, blank=True)
    content_type = models.CharField(_("tipo de contenido"), max_length=100, blank=True)
    size_bytes = models.PositiveIntegerField(_("peso en bytes"), default=0)
    width = models.PositiveIntegerField(_("ancho"), null=True, blank=True)
    height = models.PositiveIntegerField(_("alto"), null=True, blank=True)
    alt_text = models.CharField(_("texto alternativo"), max_length=200, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_("subido por"),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_media",
    )

    class Meta:
        verbose_name = _("archivo de medios")
        verbose_name_plural = _("archivos de medios")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.original_filename or str(self.id)

    def usages(self) -> list[dict]:
        """
        Dónde se usa este archivo, para poder explicarlo en un 409 al borrar en vez de
        reventar con un IntegrityError opaco (`ProductImage.asset` es `on_delete=PROTECT`
        — esto se comprueba ANTES de llegar a esa protección de base de datos, para dar
        un mensaje útil en vez de un 500). Cada elemento: `{"type": str, "label": str}`
        — contrato que ya asume `apps.media.views.MediaAssetViewSet.perform_destroy`.

        Import perezoso (no al nivel de módulo): `catalog` no depende de `media` al
        revés, así que importar `ProductImage` arriba crearía un ciclo entre las dos apps.
        """
        from apps.catalog.models import ProductImage
        from apps.content.models import Document

        usages = [
            {"type": "product_image", "label": image.product.name}
            for image in ProductImage.objects.filter(asset=self).select_related("product")
        ]
        # El contenido de la web guarda las fotos como URL dentro del JSON, no como FK:
        # se busca la URL en el texto del documento. Borrar una foto que sale en la web
        # la dejaría rota sin que nadie se enterase hasta verla.
        if self.file:
            # Sin `file.url`: codifica espacios y acentos (%20…) y el JSON los guarda tal cual.
            url = f"/{settings.MEDIA_URL.strip('/')}/{self.file.name}"
            usages += [
                {"type": "content", "label": key}
                for key in Document.objects.annotate(texto=Cast("data", TextField()))
                .filter(texto__contains=url)
                .values_list("key", flat=True)
            ]
        return usages
