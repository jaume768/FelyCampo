"""
Serializers de lectura del catálogo. El frontend recibe **siempre** los precios ya
calculados con IVA además del neto, para no reimplementar el 21% en JavaScript.
"""

from rest_framework import serializers

from .models import (
    Category,
    Color,
    Colorway,
    Family,
    Product,
    ProductImage,
    SaleMode,
    Size,
    StockNotification,
    Variant,
)
from .pricing import gross


class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ("id", "code", "name", "name_en", "slug")


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "name_en", "slug", "position", "children")

    def get_children(self, obj) -> list:
        return CategorySerializer(
            [c for c in obj.children.all() if c.is_active], many=True, context=self.context
        ).data


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ("id", "code", "name", "name_en", "hex_value")


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ("id", "code", "position")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "position", "colorway")


class VariantSerializer(serializers.ModelSerializer):
    """
    Se expone `available` (unidades comprables ahora) y no `stock`, para no filtrar el
    inventario real ni las reservas en curso.
    """

    size = SizeSerializer(read_only=True)
    available = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Variant
        fields = ("id", "size", "available", "in_stock")


class ColorwaySerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    variants = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Colorway
        fields = ("id", "sku", "color", "variants", "images")

    def get_variants(self, obj) -> list:
        active = [v for v in obj.variants.all() if v.is_active]
        return VariantSerializer(active, many=True, context=self.context).data


class PriceMixin(serializers.Serializer):
    """Precios netos (como se guardan) y con IVA (como se muestran)."""

    price_gross = serializers.SerializerMethodField()
    sale_price_gross = serializers.SerializerMethodField()
    effective_price_gross = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()

    def get_price_gross(self, obj) -> str | None:
        return str(gross(obj.price)) if obj.price is not None else None

    def get_sale_price_gross(self, obj) -> str | None:
        return str(gross(obj.sale_price)) if obj.sale_price is not None else None

    def get_effective_price_gross(self, obj) -> str | None:
        price = obj.effective_price
        return str(gross(price)) if price is not None else None

    def get_is_on_sale(self, obj) -> bool:
        return obj.sale_price is not None and obj.price is not None


class ProductListSerializer(PriceMixin, serializers.ModelSerializer):
    """Versión ligera para listados y rejillas."""

    family = FamilySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "slug",
            "name",
            "name_en",
            "family",
            "kind",
            "sale_mode",
            "price",
            "sale_price",
            "price_gross",
            "sale_price_gross",
            "effective_price_gross",
            "is_on_sale",
            "is_outlet",
            "primary_image",
            "colors",
            "in_stock",
        )

    def get_primary_image(self, obj) -> dict | None:
        image = next(iter(obj.images.all()), None)
        return ProductImageSerializer(image, context=self.context).data if image else None

    def get_colors(self, obj) -> list:
        colors = [cw.color for cw in obj.colorways.all() if cw.is_active]
        return ColorSerializer(colors, many=True, context=self.context).data

    def get_in_stock(self, obj) -> bool:
        if obj.sale_mode != SaleMode.IN_STOCK:
            return False
        return any(
            v.in_stock for cw in obj.colorways.all() if cw.is_active for v in cw.variants.all()
        )


class ProductDetailSerializer(ProductListSerializer):
    """Ficha completa: colores, tallas, disponibilidad, galería y piezas del conjunto."""

    colorways = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    components = serializers.SerializerMethodField()
    enquiry_only = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            "description",
            "description_en",
            "composition",
            "care",
            "categories",
            "colorways",
            "images",
            "components",
            "enquiry_only",
        )

    def get_colorways(self, obj) -> list:
        active = [cw for cw in obj.colorways.all() if cw.is_active]
        return ColorwaySerializer(active, many=True, context=self.context).data

    def get_components(self, obj) -> list:
        """Piezas de un conjunto. Vacío en prendas sueltas."""
        return [
            {
                "quantity": c.quantity,
                "sku": c.variant.colorway.sku,
                "product_name": c.variant.colorway.product.name,
                "product_slug": c.variant.colorway.product.slug,
                "size": c.variant.size.code,
                "color": c.variant.colorway.color.name,
            }
            for c in obj.components.select_related(
                "variant__colorway__product", "variant__colorway__color", "variant__size"
            )
        ]

    def get_enquiry_only(self, obj) -> bool:
        """True cuando el producto no tiene precio y hay que consultar por email."""
        return obj.sale_mode == SaleMode.ON_REQUEST


class StockNotificationSerializer(serializers.ModelSerializer):
    """«Avísame cuando haya stock». No exige cuenta: basta un email."""

    class Meta:
        model = StockNotification
        fields = ("id", "variant", "email", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_variant(self, variant):
        if variant.in_stock:
            raise serializers.ValidationError("Este artículo ya está disponible.")
        return variant

    def create(self, validated_data):
        notification, _created = StockNotification.objects.get_or_create(
            variant=validated_data["variant"],
            email=validated_data["email"],
            notified_at=None,
        )
        return notification


class ProductEnquirySerializer(serializers.Serializer):
    """
    Consulta sobre un producto sin precio. Los artículos `ON_REQUEST` no se compran: se
    pregunta por email. No se persiste nada, solo se envía el aviso.
    """

    product = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Product.objects.filter(is_published=True),
    )
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")
    message = serializers.CharField(max_length=2000)

    def validate_product(self, product):
        if product.sale_mode != SaleMode.ON_REQUEST:
            raise serializers.ValidationError("Este producto puede comprarse directamente.")
        return product
