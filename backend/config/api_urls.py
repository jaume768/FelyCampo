from django.urls import include, path

urlpatterns = [
    path("", include("apps.core.urls")),
    path("", include("apps.accounts.urls")),
    path("", include("apps.catalog.urls")),
    path("", include("apps.orders.urls")),
    path("", include("apps.content.urls")),
    path("", include("apps.appointments.urls")),
    path("admin/", include("apps.adminapi.urls")),
]
