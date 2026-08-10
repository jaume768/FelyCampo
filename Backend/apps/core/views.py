from django.core.cache import cache
from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class LivenessView(APIView):
    """Liveness: el proceso Django responde. NO toca la base de datos."""

    authentication_classes: list = []
    permission_classes = [AllowAny]
    # Sin límite de ritmo: las sondas llegan siempre desde la misma IP y un 429 lo
    # interpretaría el orquestador como que el servicio está caído.
    throttle_classes: list = []

    @extend_schema(
        summary="Liveness probe",
        description="200 si el proceso Django está vivo. No comprueba dependencias.",
        responses={200: dict},
    )
    def get(self, request):
        return Response({"status": "ok"})


class ReadinessView(APIView):
    """
    Readiness: la app puede servir tráfico.

    **Solo la base de datos decide el 503.** La caché también se comprueba, pero un fallo
    suyo no marca el servicio como no disponible: los límites de ritmo degradan en abierto
    (ver `apps.core.throttling`), así que sin Redis la tienda sigue vendiendo, solo que sin
    límites. Sacar el proceso de rotación por eso sería peor que el problema.

    El estado de la caché se informa igualmente en `cache`, para que el fallo se vea en
    monitorización en lugar de pasar desapercibido.
    """

    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes: list = []

    @extend_schema(
        summary="Readiness probe",
        description=(
            "200 si la base de datos responde; 503 en caso contrario. El campo `cache` "
            "informa del estado de Redis, pero no afecta al código de respuesta."
        ),
        responses={200: dict, 503: dict},
    )
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            database = "ok"
        except Exception:
            database = "error"

        try:
            cache.set("health:ready", "1", 5)
            cache_state = "ok" if cache.get("health:ready") == "1" else "degraded"
        except Exception:
            cache_state = "error"

        ready = database == "ok"
        code = status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(
            {
                "status": "ok" if ready else "unavailable",
                "database": database,
                "cache": cache_state,
            },
            status=code,
        )
