from django.contrib import admin

from .models import Location, StockLevel, StockMovement


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "kind", "is_sellable", "is_active", "position")
    list_filter = ("kind", "is_sellable", "is_active")
    search_fields = ("code", "name")


@admin.register(StockLevel)
class StockLevelAdmin(admin.ModelAdmin):
    list_display = ("variant", "location", "quantity", "updated_at")
    list_filter = ("location",)
    search_fields = ("variant__colorway__sku",)


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "variant",
        "location",
        "delta",
        "quantity_after",
        "reason",
        "created_by",
        "created_at",
    )
    list_filter = ("location",)
    search_fields = ("variant__colorway__sku", "reason")
    readonly_fields = (
        "variant",
        "location",
        "delta",
        "quantity_before",
        "quantity_after",
        "reason",
        "created_by",
        "created_at",
    )

    def has_add_permission(self, request):
        return False
