import uuid

from django.db import models


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
