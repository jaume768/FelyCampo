"""
Registro, sesión y área privada del cliente.

**Autenticación por sesión + cookie** (`SessionAuthentication`), que es lo que ya estaba
configurado en DRF. Requiere que el frontend mande la cookie CSRF en las escrituras. Si
quien haga el frontend prefiere JWT, se cambia solo la clase de autenticación: ninguna
vista depende del mecanismo. Ver DECISIONS_PENDING.md.
"""

from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.middleware.csrf import get_token
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Cart
from apps.orders.services import merge_carts

from .models import Address, Favorite
from .serializers import (
    AddressSerializer,
    FavoriteSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    RegisterSerializer,
    UserSerializer,
)


class CSRFTokenView(APIView):
    """
    Entrega la cookie CSRF. El frontend la pide una vez antes del primer POST.
    """

    permission_classes = [AllowAny]

    @extend_schema(responses={200: None})
    def get(self, request):
        return Response({"csrf_token": get_token(request)})


class RegisterView(APIView):
    """Alta de cliente. Deja la sesión iniciada para no pedir login justo después."""

    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        django_login(request, user, backend="apps.accounts.backends.CaseInsensitiveEmailBackend")
        _adopt_guest_cart(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses={200: UserSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        django_login(request, user)
        _adopt_guest_cart(request, user)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        django_logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(RetrieveUpdateAPIView):
    """Datos del cliente. GET para leerlos, PATCH para editarlos."""

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=PasswordChangeSerializer, responses={204: None})
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password", "updated_at"])
        # Cambiar la contraseña invalida la sesión; se vuelve a iniciar para no echar
        # al cliente de la web justo después de acertar.
        django_login(request, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AddressViewSet(viewsets.ModelViewSet):
    """Direcciones del cliente. Cada uno solo ve las suyas."""

    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    pagination_class = None
    # Solo para que drf-spectacular deduzca el modelo; get_queryset es el que manda.
    queryset = Address.objects.none()

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Favoritos del área privada."""

    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteSerializer
    pagination_class = None
    queryset = Favorite.objects.none()

    def get_queryset(self):
        return (
            Favorite.objects.filter(user=self.request.user)
            .select_related("product__family")
            .prefetch_related("product__images", "product__colorways__color")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


def _adopt_guest_cart(request, user) -> None:
    """
    Al identificarse, el carrito que traía como invitado se funde con el suyo. Sin esto,
    lo que había metido antes de entrar se perdería.
    """
    cart_id = request.data.get("cart_id") or request.headers.get("X-Cart-Id")
    if not cart_id:
        return
    guest_cart = Cart.objects.filter(id=cart_id, user__isnull=True, checked_out_at=None).first()
    if guest_cart is not None:
        merge_carts(guest_cart=guest_cart, user=user)
