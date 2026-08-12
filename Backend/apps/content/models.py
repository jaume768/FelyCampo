"""
Contenido editorial. En esta fase, solo la **biblioteca de medios**: el banco de imágenes y
vídeos que reutilizarán Diseño (home), Blog y Contenido.

Las imágenes se normalizan al subirlas (reescalado, WebP, miniatura, EXIF limpiado); ver
`apps.content.services`. El original se conserva aparte para poder regenerar los derivados
si algún día cambian los tamaños.
"""

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDTimeStampedModel


class MediaKind(models.TextChoices):
    IMAGE = "image", _("Imagen")
    VIDEO = "video", _("Vídeo")


class MediaAsset(UUIDTimeStampedModel):
    """
    Un archivo del banco de medios, reutilizable desde varias secciones del panel.

    `file` es lo que se sirve al público (WebP en imágenes). `original` guarda lo que subió
    el usuario **solo cuando hubo conversión**: sin él, cambiar la calidad o el tamaño
    máximo en el futuro sería irreversible sobre lo ya subido.
    """

    kind = models.CharField(
        _("tipo"),
        max_length=8,
        choices=MediaKind.choices,
        default=MediaKind.IMAGE,
        db_index=True,
    )
    file = models.FileField(_("archivo"), upload_to="media-library/%Y/%m/")
    original = models.FileField(
        _("archivo original"),
        upload_to="media-library/originals/%Y/%m/",
        blank=True,
        help_text=_("Lo que subió el usuario, antes de convertir. Vacío si no hubo conversión."),
    )
    thumbnail = models.ImageField(
        _("miniatura"),
        upload_to="media-library/thumbs/%Y/%m/",
        blank=True,
        help_text=_("Solo en imágenes. La rejilla del panel no puede cargarlas a tamaño real."),
    )

    title = models.CharField(_("título"), max_length=200, blank=True)
    alt_text = models.CharField(_("texto alternativo"), max_length=200, blank=True)
    alt_text_en = models.CharField(_("texto alternativo (EN)"), max_length=200, blank=True)

    mime_type = models.CharField(_("tipo MIME"), max_length=80, blank=True)
    size_bytes = models.PositiveBigIntegerField(_("tamaño en bytes"), default=0)
    width = models.PositiveIntegerField(_("ancho"), null=True, blank=True)
    height = models.PositiveIntegerField(_("alto"), null=True, blank=True)

    # ArrayField y no una tabla aparte: son etiquetas libres para buscar en el panel, sin
    # ciclo de vida propio ni nada que colgar de ellas. El proyecto ya es Postgres-only
    # (secuencias nativas para el número de pedido, índices funcionales en accounts).
    tags = ArrayField(
        models.CharField(max_length=40),
        verbose_name=_("etiquetas"),
        default=list,
        blank=True,
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_("subido por"),
        on_delete=models.SET_NULL,
        related_name="uploaded_media",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = _("archivo de medios")
        verbose_name_plural = _("archivos de medios")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title or self.file.name
