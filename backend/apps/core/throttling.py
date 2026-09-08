"""
Límites de ritmo que **degradan en abierto**.

Los contadores viven en Redis. `SimpleRateThrottle` llama a `cache.get()` en cada petición
y `RedisCache` no tiene `IGNORE_EXCEPTIONS`, así que un Redis caído o lento haría que
**toda** la API devolviera 500: Redis pasaría a ser un punto único de fallo de la tienda
entera, solo por contar peticiones.

Aquí se invierte esa decisión: si la caché falla, se registra el error y se deja pasar la
petición. Un rato sin límites de ritmo es peor que tenerlos, pero mucho mejor que un rato
sin tienda. El fallo queda en el log en ERROR para que se note.
"""

import logging

from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle, UserRateThrottle

logger = logging.getLogger(__name__)


class FailOpenMixin:
    def allow_request(self, request, view):
        try:
            return super().allow_request(request, view)
        except Exception:
            logger.error(
                "throttle_cache_unavailable",
                exc_info=True,
                extra={"throttle": type(self).__name__, "path": request.path},
            )
            return True


class FailOpenAnonRateThrottle(FailOpenMixin, AnonRateThrottle):
    pass


class FailOpenUserRateThrottle(FailOpenMixin, UserRateThrottle):
    pass


class FailOpenScopedRateThrottle(FailOpenMixin, ScopedRateThrottle):
    pass
