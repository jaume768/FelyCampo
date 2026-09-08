"""Serializers del panel admin para pedidos y devoluciones (Fase 4, ver ADMIN_API_PLAN.md)."""

from rest_framework import serializers

from apps.catalog.models import Variant
from apps.core.media_urls import absolute_media_url

from .models import Order, OrderNote, OrderStatus, OrderStatusChange, Return
from .serializers import OrderLineSerializer, ReturnLineSerializer, StaffOrderSerializer


class AdminOrderLineSerializer(OrderLineSerializer):
    """Igual que la versión pública, más una imagen (el cliente no la necesita en su
    propio pedido — ya vio la ficha al comprar — pero el panel sí, para hojear rápido) y
    el id real del producto, para poder enlazar cada fila a su ficha de solo lectura
    (`/admin/productos/:id`) — `sku`/`product_name` son copia congelada y no sirven de FK
    si el producto se ha borrado o cambiado de nombre desde entonces (`product_id` es
    `None` en ese caso: `variant` es `on_delete=SET_NULL`)."""

    image = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()

    class Meta(OrderLineSerializer.Meta):
        fields = OrderLineSerializer.Meta.fields + ("image", "product_id")

    def get_image(self, obj) -> str | None:
        variant = obj.variant
        if variant is None:
            return None
        image = variant.colorway.images.first() or variant.colorway.product.images.first()
        if image is None:
            return None
        return absolute_media_url(image.asset.file.url)

    def get_product_id(self, obj) -> str | None:
        variant = obj.variant
        return str(variant.colorway.product_id) if variant is not None else None


class AdminReturnSerializer(serializers.ModelSerializer):
    lines = ReturnLineSerializer(many=True, read_only=True)
    order_reference = serializers.CharField(source="order.reference", read_only=True)

    class Meta:
        model = Return
        fields = (
            "id",
            "order",
            "order_reference",
            "status",
            "reason",
            "staff_note",
            "refund_amount_gross",
            "refunded_at",
            "restock",
            "lines",
            "created_at",
        )
        # `refund_amount_gross`/`refunded_at` no se tocan por PATCH libre — solo por
        # `accept`/`reject`/`mark-refunded` (ver admin_views.py), para no dejar anotado un
        # importe que no pasó por `calculate_refund_gross`.
        read_only_fields = (
            "id",
            "order",
            "order_reference",
            "status",
            "refund_amount_gross",
            "refunded_at",
            "lines",
            "created_at",
        )


class ReturnAcceptSerializer(serializers.Serializer):
    """Body de `POST returns/{id}/accept/` — `refund_amount_gross` es opcional: si no se
    manda, se calcula solo (`calculate_refund_gross`)."""

    refund_amount_gross = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class ReturnRefundedSerializer(serializers.Serializer):
    """Body de `POST returns/{id}/mark-refunded/` — el reembolso se ejecuta a mano en
    Stripe, esto solo anota que ya se hizo (ver Return.refunded_at)."""

    refunded_at = serializers.DateTimeField(required=False)


class ReturnRejectSerializer(serializers.Serializer):
    staff_note = serializers.CharField(required=False, allow_blank=True, default="")


class OrderStatusChangeSerializer(serializers.ModelSerializer):
    changed_by_email = serializers.CharField(
        source="changed_by.email", read_only=True, default=None
    )

    class Meta:
        model = OrderStatusChange
        fields = (
            "id",
            "from_status",
            "to_status",
            "changed_by",
            "changed_by_email",
            "note",
            "created_at",
        )
        read_only_fields = fields


class OrderStatusChangeWriteSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=OrderStatus.choices)
    note = serializers.CharField(required=False, allow_blank=True, default="")


class OrderNoteSerializer(serializers.ModelSerializer):
    author_email = serializers.CharField(source="author.email", read_only=True, default=None)

    class Meta:
        model = OrderNote
        fields = ("id", "author", "author_email", "body", "created_at")
        read_only_fields = ("id", "author", "author_email", "created_at")


class OrderNoteWriteSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=4000)

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError("La nota no puede estar vacía.")
        return value.strip()


class AdminOrderSerializer(StaffOrderSerializer):
    """Vista de pedido del panel — añade lo que no necesita el cliente: seguimiento
    interno (D4), historial de estado, notas en hilo, devoluciones y el flag de
    "retrasado" (ver `Order.is_delayed`)."""

    lines = AdminOrderLineSerializer(many=True, read_only=True)
    is_delayed = serializers.BooleanField(read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True, default=None)
    returns = AdminReturnSerializer(many=True, read_only=True)

    class Meta(StaffOrderSerializer.Meta):
        fields = StaffOrderSerializer.Meta.fields + (
            "is_delayed",
            "user_email",
            "tracking_carrier",
            "tracking_code",
            "tracking_url",
            "returns",
        )


class AdminOrderUpdateSerializer(serializers.ModelSerializer):
    """`PATCH orders/{id}/` — solo lo que tiene sentido tocar después de creado: el resto
    (importes, dirección, líneas...) es una copia congelada de la compra, no un
    formulario editable."""

    class Meta:
        model = Order
        fields = ("tracking_carrier", "tracking_code", "tracking_url", "staff_note")


class ManualOrderLineWriteSerializer(serializers.Serializer):
    variant = serializers.PrimaryKeyRelatedField(queryset=Variant.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class ManualOrderCreateSerializer(serializers.Serializer):
    """
    Alta manual de pedido desde el panel (venta por teléfono o en persona) — ver
    `apps.orders.services.create_manual_order`. Mismos campos de envío/facturación que
    `CheckoutSerializer` (checkout público), para poder reutilizar el mismo `Order.objects.create`.
    """

    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")
    shipping_recipient = serializers.CharField(max_length=150)
    shipping_line1 = serializers.CharField(max_length=255)
    shipping_line2 = serializers.CharField(
        max_length=255, required=False, allow_blank=True, default=""
    )
    shipping_postal_code = serializers.CharField(max_length=10)
    shipping_city = serializers.CharField(max_length=120)
    shipping_province = serializers.CharField(max_length=120)
    customer_note = serializers.CharField(
        max_length=1000, required=False, allow_blank=True, default=""
    )
    staff_note = serializers.CharField(
        max_length=4000, required=False, allow_blank=True, default=""
    )

    status = serializers.ChoiceField(
        choices=[
            (OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING_PAYMENT.label),
            (OrderStatus.PAID, OrderStatus.PAID.label),
            (OrderStatus.PROCESSING, OrderStatus.PROCESSING.label),
        ],
        default=OrderStatus.PAID,
    )
    lines = ManualOrderLineWriteSerializer(many=True)

    def validate_lines(self, value):
        if not value:
            raise serializers.ValidationError("El pedido necesita al menos un artículo.")
        return value
