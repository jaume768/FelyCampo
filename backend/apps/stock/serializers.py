"""Serializers del panel admin para stock por ubicación (Fase 3, ver models.py)."""

from rest_framework import serializers

from apps.catalog.models import Variant
from apps.catalog.serializers import SizeSerializer
from apps.core.exceptions import BusinessRuleError

from .models import Location, StockMovement


class AdminLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("id", "code", "name", "kind", "is_sellable", "is_active", "position")

    def validate(self, attrs):
        # D3: como mucho una ubicación vendible a la vez — con dos, "de dónde se descuenta
        # lo vendido" queda indefinido (ver docstring de módulo en models.py). No es una
        # restricción de base de datos porque depende de comparar contra el resto de filas,
        # no solo de esta.
        marcando_vendible = attrs.get("is_sellable", getattr(self.instance, "is_sellable", False))
        if marcando_vendible:
            otras = Location.objects.filter(is_sellable=True)
            if self.instance:
                otras = otras.exclude(pk=self.instance.pk)
            otra = otras.first()
            if otra:
                raise BusinessRuleError(
                    f'Ya hay una ubicación vendible: "{otra.name}". Desmárcala antes de '
                    "marcar esta — con dos a la vez, de dónde se descuenta el stock "
                    "vendido quedaría indefinido.",
                    code="multiple_sellable_locations",
                )
        return attrs


class AdminStockVariantSerializer(serializers.ModelSerializer):
    """Lectura del desglose por ubicación de una `Variant` — nunca escribe `stock`
    directamente (eso es cosa de `adjust`/`set`, ver views.py)."""

    size_detail = SizeSerializer(source="size", read_only=True)
    colorway_detail = serializers.SerializerMethodField()
    available = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    levels = serializers.SerializerMethodField()

    class Meta:
        model = Variant
        fields = (
            "id",
            "colorway",
            "colorway_detail",
            "size",
            "size_detail",
            "stock",
            "reserved",
            "available",
            "in_stock",
            "is_active",
            "levels",
        )

    def get_colorway_detail(self, obj) -> dict:
        cw = obj.colorway
        return {
            "id": cw.id,
            "sku": cw.sku,
            "color_name": cw.color.name,
            "product_id": cw.product_id,
            "product_name": cw.product.name,
        }

    def get_levels(self, obj) -> list:
        # Las ubicaciones vienen precargadas en el context (ver
        # AdminStockVariantViewSet.get_serializer_context) para no pedirlas una vez por
        # variante. Una ubicación sin `StockLevel` propio para esta variante todavía
        # aparece en el desglose, con cantidad 0 — no se omite (más predecible para
        # pintar la tabla en el panel: siempre las mismas columnas).
        niveles = {nivel.location_id: nivel.quantity for nivel in obj.stock_levels.all()}
        return [
            {
                "location_id": ubicacion.id,
                "location_name": ubicacion.name,
                "location_kind": ubicacion.kind,
                "is_sellable": ubicacion.is_sellable,
                "is_active": ubicacion.is_active,
                "quantity": niveles.get(ubicacion.id, 0),
            }
            for ubicacion in self.context.get("locations", [])
        ]


class AdminStockMovementSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source="location.name", read_only=True)
    variant_sku = serializers.CharField(source="variant.colorway.sku", read_only=True)
    variant_size = serializers.CharField(source="variant.size.code", read_only=True)
    variant_product_name = serializers.CharField(
        source="variant.colorway.product.name", read_only=True
    )
    created_by_email = serializers.CharField(
        source="created_by.email", read_only=True, default=None
    )

    class Meta:
        model = StockMovement
        fields = (
            "id",
            "variant",
            "variant_product_name",
            "variant_sku",
            "variant_size",
            "location",
            "location_name",
            "delta",
            "quantity_before",
            "quantity_after",
            "reason",
            "created_by",
            "created_by_email",
            "created_at",
        )
        read_only_fields = fields


class StockAdjustSerializer(serializers.Serializer):
    """Body de `POST stock/variants/{id}/adjust/` — suma `delta` (puede ser negativo) al
    `StockLevel` actual de `location`. `set()` no se llama nunca: esto es un
    `serializers.Serializer` de validación de entrada, no un `ModelSerializer`."""

    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.filter(is_active=True))
    delta = serializers.IntegerField()
    reason = serializers.CharField(max_length=255)

    def validate_reason(self, value):
        if not value.strip():
            raise serializers.ValidationError("El motivo es obligatorio.")
        return value.strip()


class StockSetSerializer(serializers.Serializer):
    """Body de `POST stock/variants/{id}/set/` — fija la cantidad exacta en `location`
    (a diferencia de `adjust`, no es relativo al valor actual)."""

    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.filter(is_active=True))
    quantity = serializers.IntegerField(min_value=0)
    reason = serializers.CharField(max_length=255)

    def validate_reason(self, value):
        if not value.strip():
            raise serializers.ValidationError("El motivo es obligatorio.")
        return value.strip()
