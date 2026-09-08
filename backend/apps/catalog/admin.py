from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import (
    BundleComponent,
    Category,
    Collection,
    Color,
    Colorway,
    Fabric,
    Family,
    Product,
    ProductImage,
    Size,
    StockNotification,
    Variant,
)


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code", "name")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "position", "is_active")
    list_filter = ("is_active", "parent")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "hex_value")
    search_fields = ("code", "name")


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ("code", "position", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code",)


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "starts_on", "ends_on", "position", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "code")
    prepopulated_fields = {"code": ("name",)}


@admin.register(Fabric)
class FabricAdmin(admin.ModelAdmin):
    list_display = ("name", "composition")
    search_fields = ("name", "composition")
    autocomplete_fields = ("image",)


class VariantInline(admin.TabularInline):
    model = Variant
    extra = 0
    fields = ("size", "stock", "reserved", "available_display", "is_active")
    readonly_fields = ("reserved", "available_display")

    @admin.display(description=_("disponibles"))
    def available_display(self, obj: Variant) -> int:
        return obj.available


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ("asset", "colorway", "alt_text", "position")
    autocomplete_fields = ("asset",)


class ColorwayInline(admin.TabularInline):
    model = Colorway
    extra = 0
    fields = ("color", "sku", "position", "is_active")
    show_change_link = True


class BundleComponentInline(admin.TabularInline):
    model = BundleComponent
    fk_name = "bundle"
    extra = 0
    autocomplete_fields = ("variant",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "family",
        "line",
        "design_code",
        "sale_mode",
        "price",
        "sale_price",
        "is_outlet",
        "status",
    )
    list_filter = ("line", "status", "family", "sale_mode", "kind", "is_outlet", "categories")
    search_fields = ("name", "design_code", "colorways__sku")
    autocomplete_fields = ("family", "collection")
    filter_horizontal = ("categories", "fabrics")
    # is_published/published_at son de solo lectura: status es la fuente de verdad
    # (se deriva en Product.save()) — editarlos aquí a mano no tendría efecto real.
    readonly_fields = ("is_published", "published_at")
    inlines = (ColorwayInline, ProductImageInline, BundleComponentInline)
    fieldsets = (
        (None, {"fields": ("family", "line", "design_code", "kind", "categories")}),
        (_("Textos"), {"fields": ("name", "name_en", "slug", "description", "description_en")}),
        (_("Ficha"), {"fields": ("composition", "care", "fabrics", "collection")}),
        (
            _("Venta y precio (sin IVA)"),
            {"fields": ("sale_mode", "price", "sale_price", "is_outlet")},
        ),
        (_("Publicación"), {"fields": ("status", "is_published", "published_at")}),
    )


@admin.register(Colorway)
class ColorwayAdmin(admin.ModelAdmin):
    list_display = ("sku", "product", "color", "is_active")
    list_filter = ("is_active", "color", "product__family")
    search_fields = ("sku", "product__name")
    autocomplete_fields = ("product", "color")
    inlines = (VariantInline,)


@admin.register(Variant)
class VariantAdmin(admin.ModelAdmin):
    list_display = ("__str__", "stock", "reserved", "is_active")
    list_filter = ("is_active", "size", "colorway__product__family")
    search_fields = ("colorway__sku", "colorway__product__name")
    autocomplete_fields = ("colorway", "size")


@admin.register(StockNotification)
class StockNotificationAdmin(admin.ModelAdmin):
    list_display = ("email", "variant", "created_at", "notified_at")
    list_filter = ("notified_at",)
    search_fields = ("email", "variant__colorway__sku")
    autocomplete_fields = ("variant",)
