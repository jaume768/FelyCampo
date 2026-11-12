from django.urls import path

from .views import AltaCitaView, AltaConsultaView, AltaSuscriptorView, EnvioEmailView

# Altas internas (solo el servidor del frontend, con el secreto compartido).
urlpatterns = [
    path("formularios/citas/", AltaCitaView.as_view(), name="alta-cita"),
    path("formularios/consultas/", AltaConsultaView.as_view(), name="alta-consulta"),
    path("formularios/newsletter/", AltaSuscriptorView.as_view(), name="alta-suscriptor"),
    path("formularios/email/", EnvioEmailView.as_view(), name="envio-email"),
]
