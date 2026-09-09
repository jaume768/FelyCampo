"""
CRUD del panel admin sobre el catálogo. Todo hereda de `AdminModelViewSet`
(`apps.adminapi.viewsets`): exige `IsStaff`, pagina 20/página y va bajo el cupo de
ritmo `admin`. Sin filtro de publicación en ningún queryset — a diferencia de la API
pública, el panel necesita ver borradores y archivados.
"""

import django_filters as filters
from django.db.models import Prefetch, Q
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.response import Response

from apps.adminapi.viewsets import AdminModelViewSet

from .admin_serializers import (
    AdminCategorySerializer,
    AdminCollectionSerializer,
    AdminColorSerializer,
    AdminColorwaySerializer,
    AdminFabricSerializer,
    AdminFamilySerializer,
    AdminProductImageSerializer,
    AdminProductSerializer,
    AdminSizeSerializer,
    AdminVariantSerializer,
)
from .models import (
    Category,
    Collection,
    Color,
    Colorway,
    Fabric,
    Family,
    Product,
    ProductImage,
    Size,
    Variant,
)


class AdminFamilyFilter(filters.FilterSet):
    """
    `?line=atelier` devuelve las familias de esa línea **y** las que no acotan ninguna:
    `lines` vacío significa «en todas», así que excluirlas escondería las familias que
    existían antes de que este campo existiera.
    """

    line = filters.CharFilter(method="filter_line")

    class Meta:
        model = Family
        fields = ("is_active",)

    def filter_line(self, queryset, name, value):
        return queryset.filter(Q(lines__contains=[value]) | Q(lines=[]))


class AdminFamilyViewSet(AdminModelViewSet):
    queryset = Family.objects.all()
    serializer_class = AdminFamilySerializer
    search_fields = ("code", "name")
    ordering_fields = ("name", "code", "created_at")
    ordering = ("name",)
    filterset_class = AdminFamilyFilter


class AdminCategoryViewSet(AdminModelViewSet):
    queryset = Category.objects.select_related("parent").all()
    serializer_class = AdminCategorySerializer
    search_fields = ("name",)
    ordering_fields = ("position", "name", "created_at")
    ordering = ("position", "name")
    filterset_fields = ("is_active", "parent")


class AdminSizeViewSet(AdminModelViewSet):
    queryset = Size.objects.all()
    serializer_class = AdminSizeSerializer
    search_fields = ("code",)
    ordering_fields = ("position", "code")
    ordering = ("position",)
    filterset_fields = ("is_active",)


class AdminColorViewSet(AdminModelViewSet):
    queryset = Color.objects.all()
    serializer_class = AdminColorSerializer
    search_fields = ("code", "name")
    ordering_fields = ("name", "code")
    ordering = ("name",)


class AdminFabricViewSet(AdminModelViewSet):
    queryset = Fabric.objects.select_related("image").all()
    serializer_class = AdminFabricSerializer
    search_fields = ("name", "composition")
    ordering_fields = ("name", "created_at")
    ordering = ("name",)


class AdminCollectionViewSet(AdminModelViewSet):
    queryset = Collection.objects.all()
    serializer_class = AdminCollectionSerializer
    search_fields = ("name", "code")
    ordering_fields = ("position", "starts_on", "name")
    ordering = ("-position",)
    filterset_fields = ("is_active",)


class AdminColorwayViewSet(AdminModelViewSet):
    queryset = Colorway.objects.select_related("color", "product").prefetch_related(
        "variants__size", "images__asset"
    )
    serializer_class = AdminColorwaySerializer
    search_fields = ("sku", "product__name")
    ordering_fields = ("position", "sku", "created_at")
    ordering = ("position",)
    filterset_fields = ("product", "color", "is_active")


class AdminVariantViewSet(AdminModelViewSet):
    queryset = Variant.objects.select_related("size", "colorway")
    serializer_class = AdminVariantSerializer
    search_fields = ("colorway__sku",)
    ordering_fields = ("size__position", "stock", "created_at")
    ordering = ("size__position",)
    filterset_fields = ("colorway", "size", "is_active")


class AdminProductImageViewSet(AdminModelViewSet):
    """
    `position` es un campo normal del serializer: reordenar la galería de un producto es
    un `PATCH` de `position` por cada imagen (el frontend ya sabe el orden tras arrastrar,
    solo tiene que mandarlo) — no hace falta un endpoint de "reordenar" aparte.
    """

    queryset = ProductImage.objects.select_related("asset", "product", "colorway")
    serializer_class = AdminProductImageSerializer
    ordering_fields = ("position", "created_at")
    ordering = ("position",)
    filterset_fields = ("product", "colorway")


class AdminProductFilter(filters.FilterSet):
    family = filters.CharFilter(field_name="family__slug", lookup_expr="iexact")
    category = filters.CharFilter(field_name="categories__slug", lookup_expr="iexact")
    collection = filters.CharFilter(field_name="collection__code", lookup_expr="iexact")

    class Meta:
        model = Product
        fields = (
            "family",
            "line",
            "status",
            "kind",
            "sale_mode",
            "is_outlet",
            "is_featured",
            "category",
            "collection",
        )


class AdminProductViewSet(AdminModelViewSet):
    """
    Sin filtro de `status`/`is_published` en el queryset (a diferencia de la pública,
    `ProductViewSet`): el panel necesita ver y editar borradores y archivados.
    "Borrar" archiva en vez de eliminar la fila (D8, ver ADMIN_API_PLAN.md) — conserva el
    histórico de pedidos/reseñas que lo referencien.
    """

    serializer_class = AdminProductSerializer
    filterset_class = AdminProductFilter
    search_fields = ("name", "description", "colorways__sku", "family__name")
    ordering_fields = ("created_at", "price", "name")
    ordering = ("-created_at", "id")

    def get_queryset(self):
        active_colorways = Colorway.objects.select_related("color").prefetch_related(
            Prefetch("variants", queryset=Variant.objects.select_related("size")),
            Prefetch(
                "images", queryset=ProductImage.objects.select_related("asset").order_by("position")
            ),
        )
        return (
            Product.objects.select_related("family", "collection")
            .prefetch_related(
                "categories",
                "fabrics__image",
                Prefetch(
                    "images",
                    queryset=ProductImage.objects.select_related("asset").order_by("position"),
                ),
                Prefetch("colorways", queryset=active_colorways.order_by("position")),
            )
            .distinct()
        )

    def perform_destroy(self, instance):
        instance.archive()

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "force",
                bool,
                description=(
                    "Borrar de verdad la fila en vez de archivarla. Se ignora —y el "
                    "producto se archiva igual— si alguna línea de pedido lo referencia."
                ),
            )
        ],
        responses={200: None, 204: None},
    )
    def destroy(self, request, *args, **kwargs):
        """
        Sin `?force=1`: ARCHIVA (comportamiento de siempre, ADMIN_API_PLAN.md D8).

        Con `?force=1`: borra la fila **solo si nadie la ha comprado nunca**. Si hay
        líneas de pedido colgando de alguna de sus variantes, se archiva igualmente y se
        dice por qué: `OrderLine.variant` es `SET_NULL`, así que un borrado a lo bruto
        dejaría los pedidos antiguos sin enlace al producto. El panel necesitaba poder
        quitar de en medio las pruebas y los borradores, que es el caso real, sin abrir la
        puerta a romper el histórico.
        """
        instance = self.get_object()
        forzar = str(request.query_params.get("force", "")).lower() in ("1", "true", "yes")

        if not forzar:
            self.perform_destroy(instance)
            return Response(status=204)

        from apps.orders.models import OrderLine

        vendido = OrderLine.objects.filter(variant__colorway__product=instance).exists()
        if vendido:
            instance.archive()
            return Response(
                {
                    "deleted": False,
                    "archived": True,
                    "reason": (
                        "El producto aparece en pedidos ya realizados, así que se ha "
                        "archivado en vez de borrarse: borrarlo dejaría esos pedidos sin "
                        "el producto que se vendió."
                    ),
                }
            )

        instance.delete()
        return Response({"deleted": True, "archived": False, "reason": ""})
