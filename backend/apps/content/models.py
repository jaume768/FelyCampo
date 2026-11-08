"""
Contenido editable de la web: un documento JSON por sección.

Por qué documentos y no tablas relacionales: el frontend (Miriam, `Frontend/src/lib/`) ya
trabaja con cada sección entera — el panel la edita completa y la publica de una vez, y
toda la lógica de orden, slugs, `slugsAnteriores` y visibilidad está escrita sobre esa
forma. Partirla en tablas obligaría a reescribir esa lógica en dos sitios sin que la web
gane nada: no hay consultas cruzadas que hacer sobre el contenido.

Lo que SÍ son registros (citas, consultas, suscriptores) va en tablas propias, no aquí.
"""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDTimeStampedModel


class Document(UUIDTimeStampedModel):
    """
    Lo publicado de una sección. `version` sube en cada guardado y el panel la devuelve
    al guardar: si no coincide, otra persona ha publicado entretanto y se rechaza con 409
    en vez de pisar su trabajo (varias personas editan a la vez).
    """

    key = models.SlugField(_("clave"), max_length=64, unique=True)
    data = models.JSONField(_("contenido"))
    version = models.PositiveIntegerField(_("versión"), default=1)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_("modificado por"),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        verbose_name = _("documento de contenido")
        verbose_name_plural = _("documentos de contenido")
        ordering = ["key"]

    def __str__(self) -> str:
        return f"{self.key} (v{self.version})"


class DocumentRevision(UUIDTimeStampedModel):
    """Copia de cada versión publicada, para ver quién cambió qué y poder volver atrás."""

    document = models.ForeignKey(
        Document, verbose_name=_("documento"), on_delete=models.CASCADE, related_name="revisions"
    )
    version = models.PositiveIntegerField(_("versión"))
    data = models.JSONField(_("contenido"))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_("publicado por"),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        verbose_name = _("revisión de contenido")
        verbose_name_plural = _("revisiones de contenido")
        ordering = ["document", "-version"]
        constraints = [
            models.UniqueConstraint(
                fields=["document", "version"], name="content_revision_unique_version"
            )
        ]

    def __str__(self) -> str:
        return f"{self.document.key} v{self.version}"
