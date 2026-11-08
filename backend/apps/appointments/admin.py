from django.contrib import admin

from .models import Cita, ConsultaVestido, Suscriptor


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "email", "atelier", "fecha_evento", "estado", "created_at")
    list_filter = ("estado", "atelier", "tipo")
    search_fields = ("nombre", "email", "telefono")


@admin.register(ConsultaVestido)
class ConsultaVestidoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "email", "producto", "estado", "created_at")
    list_filter = ("estado", "tipo")
    search_fields = ("nombre", "email", "producto")


@admin.register(Suscriptor)
class SuscriptorAdmin(admin.ModelAdmin):
    list_display = ("email", "idioma", "origen", "activo", "created_at")
    list_filter = ("activo", "idioma", "origen")
    search_fields = ("email",)
