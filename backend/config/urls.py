from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.permissions import AllowAny, IsAdminUser

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("config.api_urls")),
    # El esquema OpenAPI es el mapa completo de la API. En desarrollo es abierto (lo
    # consumen Swagger y ReDoc); fuera de él solo lo ve el personal autenticado.
    path(
        "api/v1/schema/",
        SpectacularAPIView.as_view(
            permission_classes=[AllowAny] if settings.DEBUG else [IsAdminUser]
        ),
        name="schema",
    ),
]

# Documentación interactiva solo fuera de producción.
if settings.DEBUG:
    urlpatterns += [
        path(
            "api/v1/docs/",
            SpectacularSwaggerView.as_view(url_name="schema"),
            name="swagger-ui",
        ),
        path(
            "api/v1/redoc/",
            SpectacularRedocView.as_view(url_name="schema"),
            name="redoc",
        ),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
