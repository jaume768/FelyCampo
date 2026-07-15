from django.urls import path

from .views import LivenessView, ReadinessView

urlpatterns = [
    path("health/live/", LivenessView.as_view(), name="health-live"),
    path("health/ready/", ReadinessView.as_view(), name="health-ready"),
    # Alias compatible con la Fase 0. Equivale a readiness (comprueba la BD).
    path("health/", ReadinessView.as_view(), name="health"),
]
