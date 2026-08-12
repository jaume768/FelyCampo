import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class TimeStampedModel(models.Model):
    """created_at / updated_at para cualquier modelo. Abstracto: no crea tabla."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """Clave primaria UUID, no expone conteos ni permite enumeración. Abstracto."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class UUIDTimeStampedModel(UUIDModel, TimeStampedModel):
    """Base habitual del dominio: UUID + timestamps. Abstracto."""

    class Meta:
        abstract = True


class FeatureFlag(UUIDTimeStampedModel):
    """
    Interruptor de funcionalidad activable desde el panel.

    **Solo almacena y expone el estado**: el comportamiento que cada flag activa no está
    implementado (decidido así). Un flag encendido hoy no cambia nada por sí solo; es el
    código que lo consulte, cuando exista, el que cambiará.

    Las filas las crea una migración y no el panel: un flag sin código que lo lea es un
    interruptor desconectado, y dejar que se creen desde la interfaz garantiza acumularlos.
    Por eso la API expone lectura y cambio de estado, pero no alta ni baja.
    """

    key = models.SlugField(_("clave"), max_length=64, unique=True)
    name = models.CharField(_("nombre"), max_length=120)
    description = models.TextField(_("descripción"), blank=True)
    is_enabled = models.BooleanField(_("activo"), default=False)

    class Meta:
        verbose_name = _("flag de funcionalidad")
        verbose_name_plural = _("flags de funcionalidad")
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.key} = {self.is_enabled}"
