from django.contrib import admin

from .models import Document, DocumentRevision


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Solo lectura: el contenido se edita desde el panel del frontend, que es quien
    valida los campos. Editar el JSON a mano aquí se saltaría esa validación."""

    list_display = ("key", "version", "updated_at", "updated_by")
    readonly_fields = ("key", "data", "version", "updated_at", "updated_by", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(DocumentRevision)
class DocumentRevisionAdmin(admin.ModelAdmin):
    list_display = ("document", "version", "created_at", "created_by")
    list_filter = ("document__key",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
