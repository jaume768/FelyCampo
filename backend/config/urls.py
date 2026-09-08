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

# Ruta del admin de Django, configurable por entorno.
#
# En producción TIENE que cambiarse: el panel del frontend vive en `/admin` del mismo
# dominio, así que dejar aquí "admin/" hace que las dos cosas peleen por la misma URL y
# gana quien esté delante en el proxy. Además, mover el admin de su ruta por defecto
# quita de encima el ruido de los bots que la escanean.
ADMIN_URL = settings.DJANGO_ADMIN_URL

urlpatterns = [
    path(ADMIN_URL, admin.site.urls),
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
