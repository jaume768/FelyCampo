"""
Rutas del panel de administración, bajo `/api/v1/admin/`.

Solo agrega: cada app expone las suyas en su paquete `admin_api`, para que las reglas de
negocio se queden con su dominio en lugar de acumularse en un módulo común. Todas exigen
`is_staff` (ver `apps.core.permissions.IsStaff`).
"""

from django.urls import include, path

urlpatterns = [
    path("", include("apps.core.admin_api.urls")),
    path("", include("apps.content.admin_api.urls")),
]
