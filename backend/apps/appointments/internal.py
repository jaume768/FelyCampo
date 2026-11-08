"""
Llamadas internas del servidor de Next (rutas `/api/cita`, `/api/consulta-vestido`,
`/api/newsletter` del frontend) para guardar lo que llega de los formularios.

No son endpoints para el navegador: el frontend valida, envía los emails y llama aquí por la
red interna con el secreto compartido (`REVALIDATE_SECRET`, el mismo con el que Django
avisa al frontend de lo publicado: compose lo pone igual en los dos servicios).

El límite de ritmo va por la IP de la VISITANTE, que el frontend reenvía en `X-Cliente-IP`.
Por IP de la petición no serviría: todas llegarían desde el contenedor del frontend y
compartirían el mismo cupo. Solo se confía en esa cabecera porque la petición ya ha
demostrado traer el secreto.
"""

import hmac

from django.conf import settings
from rest_framework.permissions import BasePermission

from apps.core.throttling import FailOpenScopedRateThrottle

CABECERA_SECRETO = "HTTP_X_INTERNO_SECRETO"
CABECERA_IP = "HTTP_X_CLIENTE_IP"


class EsFrontendInterno(BasePermission):
    message = "Solo para llamadas internas del frontend."

    def has_permission(self, request, view):
        esperado = settings.REVALIDATE_SECRET
        recibido = request.META.get(CABECERA_SECRETO, "")
        return bool(esperado) and hmac.compare_digest(recibido.encode(), esperado.encode())


class ThrottlePorVisitante(FailOpenScopedRateThrottle):
    """Cupo `throttle_scope` de la vista, contado por la IP de la visitante."""

    def get_cache_key(self, request, view):
        ip = request.META.get(CABECERA_IP, "").strip()[:64] or self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ip}
