"""
Vistas admin de stock (Fase 3). `AdminStockVariantViewSet`/`AdminStockMovementViewSet` no
heredan de `AdminModelViewSet` (`apps.adminapi.viewsets`) porque no son CRUD completo:
la variante en sí se crea/edita desde `apps.catalog` (`AdminVariantViewSet`) y los
movimientos son de solo lectura (los crea `adjust`/`set`, nunca un POST directo). Repiten
a mano los mismos atributos (`IsStaff`, `DefaultPagination`, `throttle_scope="admin"`) por
eso — no heredan de una base pensada para `ModelViewSet`.
"""

from django.db import transaction
from django.db.models import Sum
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.adminapi.permissions import IsStaff
from apps.adminapi.viewsets import AdminModelViewSet
from apps.catalog.models import Variant
from apps.core.exceptions import BusinessRuleError
from apps.core.pagination import DefaultPagination

from .models import Location, StockLevel, StockMovement
from .serializers import (
    AdminLocationSerializer,
    AdminStockMovementSerializer,
    AdminStockVariantSerializer,
    StockAdjustSerializer,
    StockSetSerializer,
)


class AdminLocationViewSet(AdminModelViewSet):
    queryset = Location.objects.all()
    serializer_class = AdminLocationSerializer
    search_fields = ("code", "name")
    ordering_fields = ("position", "name", "created_at")
    ordering = ("position", "name")
    filterset_fields = ("kind", "is_sellable", "is_active")


def _registrar_movimiento(*, variant, location, nivel, nueva_cantidad, reason, user) -> None:
    """Escribe el nuevo `StockLevel.quantity`, deja rastro en `StockMovement` y recalcula
    `Variant.stock` (suma de ubicaciones vendibles y activas) — los tres pasos van dentro
    de la misma `transaction.atomic()` de quien llama, así que si algo falla no queda
    ninguno a medias.

    El recálculo usa `.update()` (no `variant.save()`) a propósito: `Variant.save()`
    (catalog/models.py) propaga cambios de `stock` DE VUELTA a la ubicación vendible — si
    aquí se llamara `save()`, este mismo cambio se aplicaría dos veces.
    """
    antes = nivel.quantity
    nivel.quantity = nueva_cantidad
    nivel.save(update_fields=["quantity", "updated_at"])
    StockMovement.objects.create(
        variant=variant,
        location=location,
        delta=nueva_cantidad - antes,
        quantity_before=antes,
        quantity_after=nueva_cantidad,
        reason=reason,
        created_by=user,
    )
    total = (
        StockLevel.objects.filter(
            variant=variant, location__is_sellable=True, location__is_active=True
        ).aggregate(total=Sum("quantity"))["total"]
        or 0
    )
    Variant.objects.filter(pk=variant.pk).update(stock=total)


class AdminStockVariantViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    permission_classes = [IsStaff]
    pagination_class = DefaultPagination
    throttle_scope = "admin"
    serializer_class = AdminStockVariantSerializer
    search_fields = ("colorway__sku", "colorway__product__name")
    ordering_fields = ("stock", "colorway__sku", "colorway__product__name")
    ordering = ("colorway__product__name", "colorway__sku", "size__position")
    filterset_fields = ("colorway__product", "is_active")

    def get_queryset(self):
        return Variant.objects.select_related(
            "size", "colorway__product", "colorway__color"
        ).prefetch_related("stock_levels__location")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Una sola consulta para las N variantes de esta página, no una por variante — ver
        # AdminStockVariantSerializer.get_levels.
        context["locations"] = list(Location.objects.all().order_by("position", "name"))
        return context

    @action(detail=True, methods=["post"])
    def adjust(self, request, pk=None):
        variant = self.get_object()
        entrada = StockAdjustSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        location = entrada.validated_data["location"]
        delta = entrada.validated_data["delta"]
        reason = entrada.validated_data["reason"]

        with transaction.atomic():
            nivel, _creado = StockLevel.objects.select_for_update().get_or_create(
                variant=variant, location=location, defaults={"quantity": 0}
            )
            nueva_cantidad = nivel.quantity + delta
            if nueva_cantidad < 0:
                raise BusinessRuleError(
                    f"No hay suficiente stock en {location.name} para aplicar este "
                    f"ajuste (quedaría en {nueva_cantidad}).",
                    code="insufficient_stock",
                )
            _registrar_movimiento(
                variant=variant,
                location=location,
                nivel=nivel,
                nueva_cantidad=nueva_cantidad,
                reason=reason,
                user=request.user,
            )

        # No `variant.refresh_from_db()`: `self.get_object()` (arriba) viene de
        # `get_queryset()`, que precarga `stock_levels` con `prefetch_related` — esa
        # caché no se entera de que `_registrar_movimiento` acaba de escribir un
        # `StockLevel` distinto (por su propio `get_or_create`), así que `levels` en la
        # respuesta se quedaría con la cantidad de ANTES del ajuste. Pedir la instancia
        # de nuevo fuerza una precarga fresca.
        variant = self.get_queryset().get(pk=variant.pk)
        return Response(self.get_serializer(variant).data)

    @action(detail=True, methods=["post"])
    def set(self, request, pk=None):
        variant = self.get_object()
        entrada = StockSetSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        location = entrada.validated_data["location"]
        nueva_cantidad = entrada.validated_data["quantity"]
        reason = entrada.validated_data["reason"]

        with transaction.atomic():
            nivel, _creado = StockLevel.objects.select_for_update().get_or_create(
                variant=variant, location=location, defaults={"quantity": 0}
            )
            _registrar_movimiento(
                variant=variant,
                location=location,
                nivel=nivel,
                nueva_cantidad=nueva_cantidad,
                reason=reason,
                user=request.user,
            )

        variant = self.get_queryset().get(pk=variant.pk)
        return Response(self.get_serializer(variant).data)


class AdminStockMovementViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Solo lectura — un `StockMovement` lo crea `adjust`/`set` de arriba, nunca un POST
    directo a este endpoint (sería auditoría que se audita a sí misma sin control)."""

    permission_classes = [IsStaff]
    pagination_class = DefaultPagination
    throttle_scope = "admin"
    serializer_class = AdminStockMovementSerializer
    filterset_fields = ("variant", "location")
    ordering_fields = ("created_at",)
    ordering = ("-created_at",)

    def get_queryset(self):
        return StockMovement.objects.select_related(
            "location", "variant__colorway__product", "variant__size", "created_by"
        )
