"""Endpoints transversales del panel: usuario actual y flags de funcionalidad."""

from drf_spectacular.utils import extend_schema
from rest_framework import mixins, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import FeatureFlag
from apps.core.permissions import IsStaff
from apps.core.throttling import FailOpenScopedRateThrottle

from .serializers import AdminUserSerializer, FeatureFlagSerializer
from .viewsets import AdminViewSetMixin


@extend_schema(tags=["Admin · Core"])
class AdminMeView(APIView):
    """
    Usuario del panel. El frontend lo llama al arrancar: si responde 403, redirige al login
    en lugar de pintar una interfaz que fallará en cada petición.
    """

    permission_classes = [IsStaff]
    throttle_classes = [FailOpenScopedRateThrottle]
    throttle_scope = "admin"

    @extend_schema(responses={200: AdminUserSerializer})
    def get(self, request):
        return Response(AdminUserSerializer(request.user).data)


@extend_schema(tags=["Admin · Extras"])
class FeatureFlagViewSet(
    AdminViewSetMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Flags de funcionalidad. Se listan y se activan; **no se crean ni se borran** desde el
    panel, porque un flag solo tiene sentido si hay código que lo consulta.

    Se busca por `key` y no por id: es lo estable y lo que el código usará.
    """

    serializer_class = FeatureFlagSerializer
    queryset = FeatureFlag.objects.all()
    lookup_field = "key"
    pagination_class = None
    ordering = ("name", "id")
