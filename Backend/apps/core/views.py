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
    """Readiness: la app puede servir tráfico (incluye la base de datos)."""

    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes: list = []

    @extend_schema(
        summary="Readiness probe",
        description="200 si la base de datos responde; 503 en caso contrario.",
        responses={200: dict, 503: dict},
    )
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            database = "ok"
        except Exception:
            database = "error"

        ready = database == "ok"
        code = status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(
            {"status": "ok" if ready else "unavailable", "database": database},
            status=code,
        )
