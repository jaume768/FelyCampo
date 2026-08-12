"""Biblioteca de medios del panel."""

from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import FormParser, MultiPartParser

from apps.content.models import MediaAsset
from apps.content.services import media_asset_usages
from apps.core.admin_api.viewsets import AdminModelViewSet
from apps.core.exceptions import BusinessRuleError

from .serializers import MediaAssetSerializer, MediaAssetUploadSerializer


class MediaAssetFilter(filters.FilterSet):
    tag = filters.CharFilter(field_name="tags", lookup_expr="icontains")

    class Meta:
        model = MediaAsset
        fields = ["kind", "tag"]


@extend_schema(tags=["Admin · Medios"])
class MediaAssetViewSet(AdminModelViewSet):
    """
    Banco de imágenes y vídeos, reutilizable desde Diseño, Blog y Contenido.

    La subida va en `multipart/form-data`. Las imágenes se normalizan en el servidor
    (reescalado, WebP, miniatura, EXIF descartado); ver `apps.content.services`.
    """

    queryset = MediaAsset.objects.all()
    filterset_class = MediaAssetFilter
    search_fields = ("title", "alt_text", "tags")
    ordering_fields = ("created_at", "title", "size_bytes")
    ordering = ("-created_at", "id")
    # Sin JSONParser: aquí siempre viaja un archivo.
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        return MediaAssetUploadSerializer if self.action == "create" else MediaAssetSerializer

    def perform_destroy(self, instance):
        """
        Borrar un archivo en uso deja un hueco en la home o en una entrada del blog que
        nadie ve hasta que lo ve un cliente. Se rechaza diciendo dónde se está usando, para
        que quien borra pueda ir a quitarlo de ahí primero.
        """
        usages = media_asset_usages(instance)
        if usages:
            raise BusinessRuleError(
                "Este archivo se está usando y no puede eliminarse.",
                code="media_asset_in_use",
                details={"usages": usages},
            )
        instance.delete()
