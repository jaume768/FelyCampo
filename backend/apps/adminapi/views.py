from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsStaff
from .serializers import AdminUserSerializer


class AdminMeView(APIView):
    """
    Comprueba la sesión de staff. El frontend del panel llama aquí al arrancar (o al
    volver de una pestaña dormida) para decidir si muestra el panel o redirige a
    /admin/login — 401 sin sesión, 403 con sesión pero sin `is_staff`.
    """

    permission_classes = [IsStaff]
    throttle_scope = "admin"

    @extend_schema(responses={200: AdminUserSerializer})
    def get(self, request):
        return Response(AdminUserSerializer(request.user).data)
