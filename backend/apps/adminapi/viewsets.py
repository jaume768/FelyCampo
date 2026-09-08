from rest_framework import viewsets

from apps.core.pagination import DefaultPagination

from .permissions import IsStaff


class AdminModelViewSet(viewsets.ModelViewSet):
    """
    Base de todo endpoint del panel admin: exige `IsStaff`, pagina igual que la API
    pública (20/página, máx. 100 — `DefaultPagination`) y va bajo el cupo de límite de
    ritmo `admin`, aparte del público (`DEFAULT_THROTTLE_RATES` en settings/base.py) —
    personal identificado, no tráfico anónimo, así que el cupo es más generoso.
    """

    permission_classes = [IsStaff]
    pagination_class = DefaultPagination
    throttle_scope = "admin"
