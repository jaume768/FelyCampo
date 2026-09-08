from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response

from apps.adminapi.viewsets import AdminModelViewSet
from apps.core.exceptions import BusinessRuleError

from .models import MediaAsset
from .serializers import MediaAssetSerializer, MediaUploadSerializer


class MediaAssetViewSet(AdminModelViewSet):
    """
    Biblioteca de medios del panel. `POST` es multipart (`file` + `alt_text` opcional) y
    devuelve el `MediaAsset` ya procesado; el resto de acciones trabajan sobre archivos
    ya subidos. Sin `PUT`: sustituir el archivo es un alta nueva, no una edición.
    """

    queryset = MediaAsset.objects.all()
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        return MediaUploadSerializer if self.action == "create" else MediaAssetSerializer

    @extend_schema(request=MediaUploadSerializer, responses={201: MediaAssetSerializer})
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        asset = serializer.save()
        output = MediaAssetSerializer(asset, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        usages = instance.usages()
        if usages:
            lugares = "; ".join(f"{u['type']} · {u['label']}" for u in usages)
            raise BusinessRuleError(
                f"Este archivo está en uso y no se puede borrar: {lugares}.",
                code="media_in_use",
                details={"usages": usages},
            )
        # Borra los ficheros del storage antes de la fila: si el storage falla, mejor
        # dejar un archivo huérfano en disco que una fila sin archivo detrás.
        instance.file.delete(save=False)
        if instance.thumbnail:
            instance.thumbnail.delete(save=False)
        instance.delete()
