from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CitaAdminViewSet, ConsultaAdminViewSet, ResumenAdminView, SuscriptorAdminViewSet

router = DefaultRouter()
router.register("citas", CitaAdminViewSet, basename="admin-cita")
router.register("consultas", ConsultaAdminViewSet, basename="admin-consulta")
router.register("suscriptores", SuscriptorAdminViewSet, basename="admin-suscriptor")

urlpatterns = [
    path("resumen/", ResumenAdminView.as_view(), name="admin-resumen"),
    *router.urls,
]
