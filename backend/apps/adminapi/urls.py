from django.urls import include, path

from .views import AdminMeView

# Los CRUD de cada dominio (medios, catálogo...) se registran cada uno en su propia app
# (apps.media, apps.catalog) y se incluyen aquí a medida que existen — mismo patrón que
# config/api_urls.py con el resto de la API pública. Esta app solo posee lo transversal
# al panel entero: sesión de staff, permiso, paginación, cupo de ritmo.
urlpatterns = [
    path("me/", AdminMeView.as_view(), name="admin-me"),
    path("", include("apps.media.urls")),
    path("", include("apps.catalog.admin_urls")),
    path("stock/", include("apps.stock.urls")),
    path("", include("apps.orders.admin_urls")),
]
