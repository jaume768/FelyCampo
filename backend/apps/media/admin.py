from django.contrib import admin

from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("original_filename", "kind", "size_bytes", "uploaded_by", "created_at")
    list_filter = ("kind",)
    search_fields = ("original_filename", "alt_text")
    readonly_fields = ("content_type", "size_bytes", "width", "height", "created_at", "updated_at")
