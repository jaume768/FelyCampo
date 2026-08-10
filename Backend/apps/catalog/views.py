"""API pública de lectura del catálogo, más el alta de avisos de reposición."""

from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.integrations.emails import send_product_enquiry

from .filters import ProductFilter
from .models import Category, Colorway, Family, Product, ProductImage, Size, Variant
from .serializers import (
    CategorySerializer,
    FamilySerializer,
    ProductDetailSerializer,
    ProductEnquirySerializer,
    ProductListSerializer,
    SizeSerializer,
    StockNotificationSerializer,
)


class ProductViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    Catálogo público. Solo productos publicados: los borradores no se filtran, no existen
    para esta API.

    Se busca y se recupera por `slug`, que es lo que va en la URL del frontend.
    """

    permission_classes = [AllowAny]
    filterset_class = ProductFilter
    lookup_field = "slug"
    search_fields = ("name", "description", "colorways__sku", "family__name")
    ordering_fields = ("created_at", "price", "name")
    # El desempate por `id` es obligatorio para paginar: sin él, dos productos con el
    # mismo `created_at` (habitual tras una importación masiva) pueden repetirse entre
    # páginas o desaparecer, porque Postgres no garantiza un orden estable.
    ordering = ("-created_at", "id")

    def get_queryset(self):
        # Prefetch explícito: la ficha toca 5 niveles y sin esto el listado son N+1 consultas.
        active_colorways = Colorway.objects.filter(is_active=True).select_related("color")
        return (
            Product.objects.filter(is_published=True)
            .select_related("family")
            .prefetch_related(
                "categories",
                Prefetch("images", queryset=ProductImage.objects.order_by("position")),
                Prefetch(
                    "colorways",
                    queryset=active_colorways.prefetch_related(
                        Prefetch(
                            "variants",
                            queryset=Variant.objects.filter(is_active=True)
                            .select_related("size")
                            .order_by("size__position"),
                        ),
                        Prefetch("images", queryset=ProductImage.objects.order_by("position")),
                    ),
                ),
            )
        )

    def get_serializer_class(self):
        return ProductDetailSerializer if self.action == "retrieve" else ProductListSerializer


class FamilyViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Familias activas, para los menús de navegación."""

    permission_classes = [AllowAny]
    serializer_class = FamilySerializer
    queryset = Family.objects.filter(is_active=True)
    pagination_class = None


class CategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Árbol de categorías. Devuelve solo las raíces; las hijas van anidadas."""

    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True, parent__isnull=True)
            .prefetch_related("children")
            .order_by("position", "name")
        )


class SizeViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Tallas activas. Lista cerrada y común a todo el catálogo."""

    permission_classes = [AllowAny]
    serializer_class = SizeSerializer
    queryset = Size.objects.filter(is_active=True)
    pagination_class = None


class StockNotificationView(APIView):
    """
    «Avísame cuando haya stock». No requiere cuenta: basta el email y la variante.
    Repetir la petición no duplica el aviso.
    """

    permission_classes = [AllowAny]
    throttle_scope = "stock_notification"

    @extend_schema(
        request=StockNotificationSerializer, responses={201: StockNotificationSerializer}
    )
    def post(self, request):
        serializer = StockNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProductEnquiryView(APIView):
    """
    Consulta sobre un producto sin precio. Envía el mensaje a la dirección configurada;
    no se guarda nada en base de datos.
    """

    permission_classes = [AllowAny]
    throttle_scope = "enquiry"

    @extend_schema(request=ProductEnquirySerializer, responses={202: None})
    def post(self, request):
        serializer = ProductEnquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        send_product_enquiry(**serializer.validated_data)
        return Response(status=status.HTTP_202_ACCEPTED)
