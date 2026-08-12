"""Base común de todas las vistas del panel de administración."""

from rest_framework import viewsets

from apps.core.permissions import IsStaff
from apps.core.throttling import FailOpenScopedRateThrottle


class AdminViewSetMixin:
    """
    Lo que comparte todo `/api/v1/admin/`: permiso de staff y cupo de ritmo propio.

    El cupo merece explicación. Si se dejaran las clases de throttle por defecto, el límite
    de `user` (600/min) seguiría aplicándose y sería el más restrictivo de los dos, con lo
    que el ámbito `admin` quedaría de adorno. Guardar un producto con doce variantes son
    doce peticiones seguidas, y el panel encadena varias pantallas así: el límite pensado
    para clientes de la tienda no sirve aquí. Por eso se sustituyen, no se añaden.

    El throttle sigue siendo de los que **degradan en abierto**: si Redis cae, el panel no
    se queda inutilizable (ver `apps.core.throttling`).
    """

    permission_classes = [IsStaff]
    throttle_classes = [FailOpenScopedRateThrottle]
    throttle_scope = "admin"


class AdminModelViewSet(AdminViewSetMixin, viewsets.ModelViewSet):
    """CRUD completo del panel. Paginación, filtros y orden salen de los ajustes de DRF."""


class AdminReadOnlyModelViewSet(AdminViewSetMixin, viewsets.ReadOnlyModelViewSet):
    """Solo lectura, para los recursos del panel que no se crean desde él."""
