"""
Serializers de carrito y pedidos.

Decisión del cliente: **el estado del pedido no se expone al comprador**. Del envío se
encarga una empresa externa, así que el frontend muestra el histórico y remite al correo o
al teléfono para saber cómo va. Por eso `OrderSerializer` no incluye `status` — sí lo hace
`StaffOrderSerializer`, que solo usa el panel.
"""

from rest_framework import serializers

from apps.catalog.models import Variant
from apps.catalog.pricing import gross

from .models import Cart, CartItem, Order, OrderLine, Return, ReturnLine
from .services import quote_totals


class CartItemSerializer(serializers.ModelSerializer):
    """Línea de carrito con el precio vivo del catálogo, en neto y con IVA."""

    sku = serializers.CharField(source="variant.colorway.sku", read_only=True)
    product_name = serializers.CharField(source="variant.colorway.product.name", read_only=True)
    product_slug = serializers.CharField(source="variant.colorway.product.slug", read_only=True)
    color_name = serializers.CharField(source="variant.colorway.color.name", read_only=True)
    size_code = serializers.CharField(source="variant.size.code", read_only=True)
    image = serializers.SerializerMethodField()
    unit_price_net = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    unit_price_gross = serializers.SerializerMethodField()
    line_gross = serializers.SerializerMethodField()
    has_stock = serializers.BooleanField(read_only=True)
    available = serializers.IntegerField(source="variant.available", read_only=True)

    class Meta:
        model = CartItem
        fields = (
            "id",
            "variant",
            "quantity",
            "sku",
            "product_name",
            "product_slug",
            "color_name",
            "size_code",
            "image",
            "unit_price_net",
            "unit_price_gross",
            "line_gross",
            "has_stock",
            "available",
        )

    def get_image(self, obj) -> str | None:
        image = obj.variant.colorway.images.first() or obj.variant.colorway.product.images.first()
        if image is None:
            return None
        request = self.context.get("request")
        url = image.image.url
        return request.build_absolute_uri(url) if request else url

    def get_unit_price_gross(self, obj) -> str:
        return str(gross(obj.unit_price_net))

    def get_line_gross(self, obj) -> str:
        return str(gross(obj.line_net))


class CartSerializer(serializers.ModelSerializer):
    """Carrito con el desglose ya calculado: envío, IVA y total."""

    items = CartItemSerializer(many=True, read_only=True)
    totals = serializers.SerializerMethodField()
    has_stock_issues = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "items", "totals", "has_stock_issues")

    def get_totals(self, obj) -> dict:
        totals = quote_totals(obj.subtotal_net)
        return {key: str(value) for key, value in totals.items()}

    def get_has_stock_issues(self, obj) -> bool:
        """Avisa al frontend de que alguna línea ya no puede servirse."""
        return any(not item.has_stock for item in obj.items.all())


class CartItemWriteSerializer(serializers.Serializer):
    """Alta o cambio de cantidad de una línea."""

    variant = serializers.PrimaryKeyRelatedField(queryset=Variant.objects.filter(is_active=True))
    quantity = serializers.IntegerField(min_value=1, max_value=99)

    def validate(self, attrs):
        variant = attrs["variant"]
        product = variant.colorway.product
        if not product.is_published or not product.is_purchasable:
            raise serializers.ValidationError(
                {"variant": "Este artículo no puede comprarse desde la web."}
            )
        if variant.available < attrs["quantity"]:
            raise serializers.ValidationError(
                {"quantity": f"Solo quedan {variant.available} unidades."}
            )
        return attrs


class OrderLineSerializer(serializers.ModelSerializer):
    """Copia congelada de lo comprado. Los importes son los del momento de la compra."""

    unit_price_gross = serializers.SerializerMethodField()
    line_gross = serializers.SerializerMethodField()

    class Meta:
        model = OrderLine
        fields = (
            "id",
            "sku",
            "product_name",
            "color_name",
            "size_code",
            "quantity",
            "unit_price_net",
            "unit_price_gross",
            "line_net",
            "line_gross",
            "returnable_quantity",
        )

    def get_unit_price_gross(self, obj) -> str:
        return str(gross(obj.unit_price_net))

    def get_line_gross(self, obj) -> str:
        return str(gross(obj.line_net))


class OrderSerializer(serializers.ModelSerializer):
    """
    Pedido tal como lo ve el cliente. **Sin estado de envío**: la logística la lleva una
    empresa externa y al cliente se le remite al correo o al teléfono.
    """

    lines = OrderLineSerializer(many=True, read_only=True)
    reference = serializers.CharField(read_only=True)
    is_paid = serializers.BooleanField(read_only=True)
    can_be_returned = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "reference",
            "created_at",
            "email",
            "phone",
            "shipping_recipient",
            "shipping_line1",
            "shipping_line2",
            "shipping_postal_code",
            "shipping_city",
            "shipping_province",
            "shipping_country",
            "subtotal_net",
            "shipping_net",
            "vat_rate",
            "vat_total",
            "total_gross",
            "currency",
            "is_paid",
            "paid_at",
            "can_be_returned",
            "invoice_requested",
            "customer_note",
            "lines",
        )


class StaffOrderSerializer(OrderSerializer):
    """Vista del panel: añade el estado y las notas internas."""

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + (
            "number",
            "status",
            "user",
            "shipped_at",
            "delivered_at",
            "cancelled_at",
            "stripe_payment_intent_id",
            "reserved_until",
            "stock_committed",
            "billing_name",
            "billing_tax_id",
            "billing_address",
            "staff_note",
        )


class CheckoutSerializer(serializers.Serializer):
    """
    Datos que faltan para cerrar la compra. Se acepta **sin cuenta**: basta el email.

    Solo Península por ahora, de ahí que el país no sea configurable desde aquí.
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

    # Facturación: opcional, solo si el cliente la pide.
    invoice_requested = serializers.BooleanField(default=False)
    billing_name = serializers.CharField(
        max_length=150, required=False, allow_blank=True, default=""
    )
    billing_tax_id = serializers.CharField(
        max_length=20, required=False, allow_blank=True, default=""
    )
    billing_address = serializers.CharField(
        max_length=400, required=False, allow_blank=True, default=""
    )

    def validate(self, attrs):
        if attrs.get("invoice_requested") and not attrs.get("billing_tax_id"):
            raise serializers.ValidationError(
                {"billing_tax_id": "El NIF/CIF es obligatorio para emitir factura."}
            )
        return attrs


class ReturnLineWriteSerializer(serializers.Serializer):
    order_line = serializers.PrimaryKeyRelatedField(queryset=OrderLine.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class ReturnLineSerializer(serializers.ModelSerializer):
    sku = serializers.CharField(source="order_line.sku", read_only=True)
    product_name = serializers.CharField(source="order_line.product_name", read_only=True)

    class Meta:
        model = ReturnLine
        fields = ("id", "order_line", "sku", "product_name", "quantity")


class ReturnSerializer(serializers.ModelSerializer):
    lines = ReturnLineSerializer(many=True, read_only=True)

    class Meta:
        model = Return
        fields = (
            "id",
            "order",
            "status",
            "reason",
            "refund_amount_gross",
            "refunded_at",
            "lines",
            "created_at",
        )
        read_only_fields = ("id", "status", "refund_amount_gross", "refunded_at", "created_at")


class ReturnCreateSerializer(serializers.Serializer):
    """
    Solicitud de devolución, total o parcial. Plazo de 14 días; el retorno lo paga el
    cliente. Aquí solo se registra: la aceptación y el reembolso los hace el panel.
    """

    reason = serializers.CharField(max_length=2000)
    lines = ReturnLineWriteSerializer(many=True)

    def validate_lines(self, lines):
        if not lines:
            raise serializers.ValidationError("Indica qué artículos quieres devolver.")
        order = self.context["order"]
        for line in lines:
            order_line = line["order_line"]
            if order_line.order_id != order.id:
                raise serializers.ValidationError("Alguna línea no pertenece a este pedido.")
            if line["quantity"] > order_line.returnable_quantity:
                raise serializers.ValidationError(
                    f"De «{order_line.product_name}» solo puedes devolver "
                    f"{order_line.returnable_quantity} unidad(es)."
                )
        return lines
