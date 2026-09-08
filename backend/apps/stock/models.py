"""
Stock por ubicación (Fase 3, ver ADMIN_API_PLAN.md).

    Location      una tienda o un almacén. `is_sellable` marca de dónde sale lo que se
                  vende — a propósito, como mucho UNA a la vez (D3: si hubiera dos
                  vendibles, "de dónde se descuenta" quedaría indefinido; lo valida
                  `AdminLocationSerializer.validate`, no el modelo).
    StockLevel    cuánto hay de una `Variant` en una `Location` concreta. Sustituye al
                  antiguo "una sola cifra" — ahora esa cifra es la suma de esto.
    StockMovement audita cada cambio de un `StockLevel`: quién, cuándo, cuánto, por qué.

`Variant.stock` (catalog/models.py) sigue existiendo como el campo que ya usa TODO el
resto del sistema (checkout, reservas, `available`/`in_stock`, `stock-notify`...) — no se
ha tocado ni un solo sitio que lo lea. Lo que cambia es que ahora es un valor DERIVADO: la
suma de los `StockLevel` de ubicaciones vendibles y activas (D3 — las prendas de tienda son
muestras, nunca se venden). Dos caminos lo mantienen sincronizado, en direcciones opuestas:

1. `stock/variants/{id}/adjust|set/` (este app) escribe el `StockLevel` de una ubicación y
   recalcula `Variant.stock` con un `.update()` (sin pasar por `save()`, ver views.py) —
   así no dispara el punto 2 y no hay doble contabilización.
2. Cualquier OTRO sitio que ya tocaba `Variant.stock` directamente (checkout al confirmar
   pago, devoluciones al reponer — `apps/orders/services.py`, sin tocar) sigue haciendo
   exactamente lo mismo que antes; `Variant.save()` (catalog/models.py) detecta el cambio
   y propaga el mismo delta a la ubicación vendible, para que su `StockLevel` no se quede
   desincronizado del campo que de verdad se usó para vender.
"""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDTimeStampedModel


class LocationKind(models.TextChoices):
    STORE = "store", _("Tienda")
    WAREHOUSE = "warehouse", _("Almacén")


class Location(UUIDTimeStampedModel):
    code = models.CharField(_("código"), max_length=16, unique=True)
    name = models.CharField(_("nombre"), max_length=120)
    kind = models.CharField(
        _("tipo"), max_length=16, choices=LocationKind.choices, default=LocationKind.WAREHOUSE
    )
    is_sellable = models.BooleanField(
        _("vendible"),
        default=False,
        help_text=_(
            "De aquí sale lo que se vende (D3) — como mucho una ubicación vendible a la "
            "vez, lo valida el serializer, no el modelo."
        ),
    )
    is_active = models.BooleanField(_("activa"), default=True)
    position = models.PositiveSmallIntegerField(_("orden"), default=0)

    class Meta:
        verbose_name = _("ubicación")
        verbose_name_plural = _("ubicaciones")
        ordering = ["position", "name"]

    def __str__(self) -> str:
        return self.name


class StockLevel(UUIDTimeStampedModel):
    """Cuánto hay de una `Variant` en una `Location`. `location` va con `on_delete=PROTECT`:
    no se puede borrar una ubicación con stock (o histórico) registrado — desactivarla
    (`is_active=False`) es el camino normal, no borrarla."""

    variant = models.ForeignKey(
        "catalog.Variant",
        verbose_name=_("variante"),
        on_delete=models.CASCADE,
        related_name="stock_levels",
    )
    location = models.ForeignKey(
        Location, verbose_name=_("ubicación"), on_delete=models.PROTECT, related_name="stock_levels"
    )
    quantity = models.PositiveIntegerField(_("cantidad"), default=0)

    class Meta:
        verbose_name = _("nivel de stock")
        verbose_name_plural = _("niveles de stock")
        ordering = ["location__position"]
        constraints = [
            models.UniqueConstraint(
                fields=["variant", "location"], name="stock_stocklevel_variant_location_unique"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.variant} @ {self.location}: {self.quantity}"


class StockMovement(UUIDTimeStampedModel):
    """Una fila por cada `adjust`/`set` (views.py) — auditoría, nunca se edita ni se
    borra desde la API (solo lectura, ver `AdminStockMovementViewSet`)."""

    variant = models.ForeignKey(
        "catalog.Variant",
        verbose_name=_("variante"),
        on_delete=models.CASCADE,
        related_name="stock_movements",
    )
    location = models.ForeignKey(
        Location,
        verbose_name=_("ubicación"),
        on_delete=models.PROTECT,
        related_name="stock_movements",
    )
    delta = models.IntegerField(
        _("cambio"), help_text=_("Positivo o negativo — cuánto varió respecto al valor anterior.")
    )
    quantity_before = models.PositiveIntegerField(_("cantidad anterior"))
    quantity_after = models.PositiveIntegerField(_("cantidad posterior"))
    reason = models.CharField(_("motivo"), max_length=255)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_("realizado por"),
        on_delete=models.SET_NULL,
        null=True,
        related_name="stock_movements",
    )

    class Meta:
        verbose_name = _("movimiento de stock")
        verbose_name_plural = _("movimientos de stock")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        signo = "+" if self.delta >= 0 else ""
        return f"{self.variant} @ {self.location}: {signo}{self.delta}"
