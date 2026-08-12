from django.urls import include, path

urlpatterns = [
    path("", include("apps.core.urls")),
    path("", include("apps.accounts.urls")),
    path("", include("apps.catalog.urls")),
    path("", include("apps.orders.urls")),
    # Panel de administración. Namespace aparte y con permiso propio: la API pública de
    # arriba no cambia por esto.
    path("admin/", include("config.admin_urls")),
]
