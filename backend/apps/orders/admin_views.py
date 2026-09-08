"""
Vistas admin de pedidos y devoluciones (Fase 4, ver ADMIN_API_PLAN.md).

`AdminOrderViewSet` no permite `destroy` (un pedido no se borra nunca, ni archivado —
es un documento contable) ni `put` (solo `PATCH` parcial tiene sentido sobre lo poco que
es editable después de creado). El alta manual (`create`) no usa el `Order` real como
serializer de entrada: pasa por `ManualOrderCreateSerializer` + el servicio
`create_manual_order`, que hace su propia validación de stock/estado — igual que
`AdminProductViewSet` reutiliza servicios en vez de reinventar la escritura en el
serializer.
"""

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django_filters import rest_framework as filters
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.adminapi.permissions import IsStaff
from apps.adminapi.viewsets import AdminModelViewSet
from apps.core.exceptions import BusinessRuleError
from apps.core.pagination import DefaultPagination

from .admin_serializers import (
    AdminOrderSerializer,
    AdminOrderUpdateSerializer,
    AdminReturnSerializer,
    ManualOrderCreateSerializer,
    OrderNoteSerializer,
    OrderNoteWriteSerializer,
    OrderStatusChangeSerializer,
    OrderStatusChangeWriteSerializer,
    ReturnAcceptSerializer,
    ReturnRefundedSerializer,
    ReturnRejectSerializer,
)
from .models import Order, OrderNote, OrderStatus, Return, ReturnStatus
from .services import accept_return, change_order_status, create_manual_order, reject_return


class AdminOrderFilter(filters.FilterSet):
    email = filters.CharFilter(field_name="email", lookup_expr="icontains")
    reference = filters.CharFilter(method="filter_reference")
    date_from = filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    date_to = filters.DateFilter(field_name="created_at", lookup_expr="date__lte")
    paid = filters.BooleanFilter(method="filter_paid")
    is_delayed = filters.BooleanFilter(method="filter_is_delayed")

    class Meta:
        model = Order
        fields = ("status", "email", "reference", "date_from", "date_to", "paid", "is_delayed")

    def filter_reference(self, queryset, name, value):
        # La referencia visible es "FC-000123" (Order.reference, propiedad derivada de
        # `number`) — no es una columna real que se pueda filtrar directamente.
        digits = "".join(ch for ch in value if ch.isdigit())
        if not digits:
            return queryset.none()
        return queryset.filter(number=int(digits))

    def filter_paid(self, queryset, name, value):
        return queryset.filter(paid_at__isnull=not value)

    def filter_is_delayed(self, queryset, name, value):
        threshold = timezone.now() - timezone.timedelta(days=Order.DELAYED_THRESHOLD_DAYS)
        delayed = Q(status=OrderStatus.PROCESSING, created_at__lte=threshold)
        return queryset.filter(delayed) if value else queryset.exclude(delayed)


class AdminOrderViewSet(AdminModelViewSet):
    http_method_names = ["get", "post", "patch", "head", "options"]
    serializer_class = AdminOrderSerializer
    filterset_class = AdminOrderFilter
    search_fields = ("email", "shipping_recipient")
    ordering_fields = ("created_at", "total_gross", "number")
    ordering = ("-created_at",)

    def get_queryset(self):
        return Order.objects.select_related("user").prefetch_related(
            "lines__variant__colorway__product",
            "lines__variant__colorway__color",
            "lines__variant__colorway__images__asset",
            "lines__variant__colorway__product__images__asset",
            "lines__variant__size",
            "status_changes__changed_by",
            "notes__author",
            "returns__lines__order_line",
        )

    def get_serializer_class(self):
        if self.action == "create":
            return ManualOrderCreateSerializer
        if self.action in {"update", "partial_update"}:
            return AdminOrderUpdateSerializer
        return AdminOrderSerializer

    def create(self, request, *args, **kwargs):
        entrada = ManualOrderCreateSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        datos = dict(entrada.validated_data)
        lines_data = datos.pop("lines")
        status_final = datos.pop("status")
        # Sin `user`: quien da de alta el pedido es el/la empleada (`request.user`), no
        # la clienta — vincularlo a su cuenta de staff lo dejaría apareciendo como un
        # pedido propio de esa persona en vez de uno anónimo a nombre de quien compró.
        order = create_manual_order(lines_data=lines_data, checkout_data=datos, status=status_final)
        return Response(AdminOrderSerializer(order).data, status=201)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        entrada = AdminOrderUpdateSerializer(instance, data=request.data, partial=partial)
        entrada.is_valid(raise_exception=True)
        entrada.save()
        instance.refresh_from_db()
        return Response(AdminOrderSerializer(instance).data)

    @action(detail=True, methods=["post"], url_path="status")
    def set_status(self, request, pk=None):
        order = self.get_object()
        entrada = OrderStatusChangeWriteSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        order = change_order_status(
            order=order,
            new_status=entrada.validated_data["status"],
            user=request.user,
            note=entrada.validated_data["note"],
        )
        return Response(AdminOrderSerializer(order).data)

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        order = self.get_object()
        return Response(OrderStatusChangeSerializer(order.status_changes.all(), many=True).data)

    @action(detail=True, methods=["get", "post"], url_path="notes")
    def notes(self, request, pk=None):
        order = self.get_object()
        if request.method == "GET":
            return Response(OrderNoteSerializer(order.notes.all(), many=True).data)

        entrada = OrderNoteWriteSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        nota = OrderNote.objects.create(
            order=order, author=request.user, body=entrada.validated_data["body"]
        )
        return Response(OrderNoteSerializer(nota).data, status=201)


class AdminReturnViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Sin `create`: una devolución nace de la solicitud del cliente
    (`OrderViewSet.create_return`, API pública), el panel solo la gestiona."""

    permission_classes = [IsStaff]
    pagination_class = DefaultPagination
    throttle_scope = "admin"
    serializer_class = AdminReturnSerializer
    filterset_fields = ("status", "order")
    ordering_fields = ("created_at",)
    ordering = ("-created_at",)

    def get_queryset(self):
        return Return.objects.select_related("order").prefetch_related("lines__order_line")

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        return_request = self.get_object()
        entrada = ReturnAcceptSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        with transaction.atomic():
            return_request = accept_return(
                return_request=return_request,
                refund_amount_gross=entrada.validated_data.get("refund_amount_gross"),
            )
        return Response(AdminReturnSerializer(return_request).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return_request = self.get_object()
        entrada = ReturnRejectSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        return_request = reject_return(
            return_request=return_request, staff_note=entrada.validated_data["staff_note"]
        )
        return Response(AdminReturnSerializer(return_request).data)

    @action(detail=True, methods=["post"], url_path="mark-refunded")
    def mark_refunded(self, request, pk=None):
        return_request = self.get_object()
        if return_request.status != ReturnStatus.ACCEPTED:
            raise BusinessRuleError(
                "Solo se puede anotar el reembolso de una devolución aceptada.",
                code="return_not_accepted",
            )
        entrada = ReturnRefundedSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        return_request.refunded_at = entrada.validated_data.get("refunded_at") or timezone.now()
        return_request.save(update_fields=["refunded_at", "updated_at"])
        return Response(AdminReturnSerializer(return_request).data)
