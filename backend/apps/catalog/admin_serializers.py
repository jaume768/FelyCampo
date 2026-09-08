"""
Serializers del panel admin — a diferencia de `serializers.py` (público, solo lectura de
lo publicado), aquí se escribe de verdad y se ven campos que el cliente nunca ve
(`stock`/`reserved` reales, `status` interno, productos en borrador).

Patrón repetido a propósito: cada relación (`family`, `collection`, `categories`...)
lleva un campo *_detail de solo lectura con el objeto anidado, además del campo
PrimaryKeyRelatedField normal (escribible) — mismo criterio que ya usaba
`FavoriteSerializer.product_detail` en accounts/serializers.py. Así el panel puede leer
la ficha completa de una tirada y escribir mandando solo ids, sin dos peticiones.
"""

from django.utils import timezone
from rest_framework import serializers

from apps.media.serializers import MediaAssetSerializer

from .models import (
    Category,
    Collection,
    Color,
    Colorway,
    Fabric,
    Family,
    Product,
    ProductImage,
    ProductStatus,
    SaleMode,
    Size,
    Variant,
)
from .serializers import ColorSerializer, FamilySerializer, SizeSerializer


class AdminFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ("id", "code", "name", "name_en", "slug", "is_active")


class AdminCategorySerializer(serializers.ModelSerializer):
    """Plana (sin `children` anidados, a diferencia de la pública): el panel construye
    el árbol en cliente a partir de `parent`, más fácil de reordenar/editar así."""

    parent_name = serializers.CharField(source="parent.name", read_only=True, default=None)

    class Meta:
        model = Category
        fields = ("id", "parent", "parent_name", "name", "name_en", "slug", "position", "is_active")


class AdminSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ("id", "code", "position", "is_active")


class AdminColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ("id", "code", "name", "name_en", "hex_value")


class AdminFabricSerializer(serializers.ModelSerializer):
    image_detail = MediaAssetSerializer(source="image", read_only=True)

    class Meta:
        model = Fabric
        fields = ("id", "name", "name_en", "composition", "image", "image_detail")


class AdminCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = (
            "id",
            "code",
            "name",
            "name_en",
            "starts_on",
            "ends_on",
            "position",
            "is_active",
        )


class AdminVariantSerializer(serializers.ModelSerializer):
    """A diferencia de la pública (`VariantSerializer`, solo `available`), aquí se ve y
    edita el `stock` real — es la vista de quien repone inventario, no de quien compra."""

    size_detail = SizeSerializer(source="size", read_only=True)
    available = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Variant
        fields = (
            "id",
            "colorway",
            "size",
            "size_detail",
            "stock",
            "reserved",
            "available",
            "in_stock",
            "is_active",
        )
        read_only_fields = ("reserved",)  # solo la toca el propio checkout/reserva


class AdminProductImageSerializer(serializers.ModelSerializer):
    """`position` es escribible aquí a propósito: reordenar es un PATCH normal de este
    campo, fila a fila — sin endpoint aparte para eso."""

    asset_detail = MediaAssetSerializer(source="asset", read_only=True)

    class Meta:
        model = ProductImage
        fields = ("id", "product", "colorway", "asset", "asset_detail", "alt_text", "position")


class AdminColorwaySerializer(serializers.ModelSerializer):
    color_detail = ColorSerializer(source="color", read_only=True)
    variants = AdminVariantSerializer(many=True, read_only=True)
    images = AdminProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Colorway
        fields = (
            "id",
            "product",
            "color",
            "color_detail",
            "sku",
            "position",
            "is_active",
            "variants",
            "images",
        )
        # El SKU se autogenera en Colorway.save() si se deja vacío, pero sigue siendo
        # editable a mano (ver DECISIONS_PENDING.md) — no es read-only, solo no obligatorio.
        extra_kwargs = {"sku": {"required": False}}


class AdminProductSerializer(serializers.ModelSerializer):
    family_detail = FamilySerializer(source="family", read_only=True)
    collection_detail = AdminCollectionSerializer(source="collection", read_only=True)
    categories_detail = serializers.SerializerMethodField()
    fabrics_detail = AdminFabricSerializer(source="fabrics", many=True, read_only=True)
    colorways = AdminColorwaySerializer(many=True, read_only=True)
    images = AdminProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "family",
            "family_detail",
            "line",
            "categories",
            "categories_detail",
            "collection",
            "collection_detail",
            "fabrics",
            "fabrics_detail",
            "design_code",
            "name",
            "name_en",
            "slug",
            "description",
            "description_en",
            "composition",
            "care",
            "kind",
            "sale_mode",
            "price",
            "sale_price",
            "is_outlet",
            "is_featured",
            "featured_position",
            "status",
            "is_published",
            "published_at",
            "colorways",
            "images",
            "created_at",
            "updated_at",
        )
        # `published_at` YA NO es de solo lectura: es la fecha a partir de la cual se
        # publica un producto programado. `is_published` sigue derivándose en
        # `Product.save()` y no se acepta del cliente.
        read_only_fields = ("is_published", "created_at", "updated_at")
        extra_kwargs = {
            "slug": {"required": False},  # autogenerado en Product.save() si se deja vacío
            "published_at": {"required": False, "allow_null": True},
        }

    def validate(self, attrs):
        """
        `SCHEDULED` sin fecha no significa nada: el producto se quedaría invisible para
        siempre, sin que nada lo publique. Se exige la fecha, y que sea futura — programar
        para el pasado es publicar ya, y para eso está `ACTIVE`.
        """
        status = attrs.get("status", getattr(self.instance, "status", None))
        published_at = attrs.get(
            "published_at", getattr(self.instance, "published_at", None)
        )

        # La base de datos tiene un CheckConstraint
        # (`catalog_product_price_required_unless_on_request`) que exige precio salvo en
        # los productos de solo consulta. Sin reflejarlo aquí, guardar un borrador sin
        # precio —lo más normal del mundo en el panel— revienta con un IntegrityError y
        # un 500 opaco en vez de señalar el campo.
        sale_mode = attrs.get("sale_mode", getattr(self.instance, "sale_mode", SaleMode.IN_STOCK))
        price = attrs.get("price", getattr(self.instance, "price", None))
        # Al crear se comprueba siempre (no mandar el campo es exactamente el caso que
        # reventaba); al editar, solo si el resultado se queda sin precio.
        if sale_mode != SaleMode.ON_REQUEST and price is None:
            raise serializers.ValidationError(
                {
                    "price": (
                        "Indica el precio. Solo puede quedar vacío en los productos de "
                        "«solo consulta»."
                    )
                }
            )

        if status == ProductStatus.SCHEDULED:
            if published_at is None:
                raise serializers.ValidationError(
                    {"published_at": "Indica la fecha desde la que se publicará."}
                )
            # Solo se comprueba cuando la fecha viene en ESTA petición: si no, editar
            # cualquier otro campo de un programado ya vencido daría un error inútil.
            if "published_at" in attrs and published_at <= timezone.now():
                raise serializers.ValidationError(
                    {
                        "published_at": (
                            "La fecha debe ser futura. Para publicar ahora, usa el estado "
                            "«Activo»."
                        )
                    }
                )

        return attrs

    def get_categories_detail(self, obj) -> list:
        from .serializers import CategorySerializer

        return CategorySerializer(obj.categories.all(), many=True, context=self.context).data
