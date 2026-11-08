from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.adminapi.permissions import IsStaff
from apps.core.throttling import FailOpenScopedRateThrottle

from .models import Document
from .serializers import (
    AdminDocumentSerializer,
    AdminDocumentSummarySerializer,
    PublicDocumentSerializer,
    PublishDocumentSerializer,
    RevisionSerializer,
    RevisionSummarySerializer,
)
from .services import publish_document

KEY_REGEX = r"[a-z0-9]+(?:-[a-z0-9]+)*"


class PublicDocumentView(RetrieveAPIView):
    """
    Lo publicado de una sección, tal cual lo guarda el panel. Lo pide el servidor de
    Next (red interna) y lo cachea por etiqueta: el navegador del visitante no llega
    aquí en una visita normal.

    OJO: el documento va ENTERO, incluidos los elementos marcados como ocultos (los
    filtra la web en `src/lib/`). Oculto significa «no se enseña», no «secreto».

    Sin el cupo `anon` general: todas las páginas se renderizan desde la misma IP (el
    contenedor del frontend) y un arranque en frío pide muchos documentos a la vez. Va
    con su propio cupo, más alto (`THROTTLE_CONTENT`).
    """

    queryset = Document.objects.all()
    serializer_class = PublicDocumentSerializer
    lookup_field = "key"
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [FailOpenScopedRateThrottle]
    throttle_scope = "content"


class PublicDocumentsView(APIView):
    """
    TODOS los documentos en una sola respuesta, `{clave: datos}` (~520 KB, ~70 KB con gzip).
    Es lo que pide el servidor de Next para renderizar: una sola petición, cacheada con la
    etiqueta `contenido` e invalidada al publicar (`revalidation.py`). Mismo criterio que
    `PublicDocumentView` sobre lo oculto y el cupo.
    """

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [FailOpenScopedRateThrottle]
    throttle_scope = "content"

    @extend_schema(responses={200: dict})
    def get(self, request):
        return Response(dict(Document.objects.values_list("key", "data")))


class AdminDocumentViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    """
    Edición del contenido desde el panel. `PUT` publica la sección entera:
    `{"data": …, "version": <la que se cargó>}`. Si otra persona publicó entretanto,
    409 `version_conflict` (ver `services.publish_document`).
    """

    queryset = Document.objects.select_related("updated_by")
    permission_classes = [IsStaff]
    throttle_scope = "admin"
    lookup_field = "key"
    lookup_value_regex = KEY_REGEX
    pagination_class = None
    http_method_names = ["get", "put", "head", "options"]

    def get_serializer_class(self):
        # ?con_datos=1: el panel carga todo de una vez al abrirse (19 documentos).
        if self.action == "list" and self.request.query_params.get("con_datos") != "1":
            return AdminDocumentSummarySerializer
        if self.action == "update":
            return PublishDocumentSerializer
        return AdminDocumentSerializer

    @extend_schema(request=PublishDocumentSerializer, responses={200: AdminDocumentSerializer})
    def update(self, request, *args, **kwargs):
        payload = PublishDocumentSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        try:
            document = publish_document(
                kwargs["key"],
                payload.validated_data["data"],
                expected_version=payload.validated_data["version"],
                user=request.user,
            )
        except ValueError as exc:
            raise serializers.ValidationError({"data": [str(exc)]}) from exc
        return Response(AdminDocumentSerializer(document).data)

    @extend_schema(responses={200: RevisionSummarySerializer(many=True)})
    @action(detail=True, methods=["get"], url_path="revisions")
    def revisions(self, request, key=None):
        document = self.get_object()
        revisions = document.revisions.select_related("created_by")
        return Response(RevisionSummarySerializer(revisions, many=True).data)

    @extend_schema(responses={200: RevisionSerializer})
    @action(detail=True, methods=["get"], url_path=r"revisions/(?P<version>\d+)")
    def revision(self, request, key=None, version=None):
        document = self.get_object()
        revision = get_object_or_404(document.revisions, version=version)
        return Response(RevisionSerializer(revision).data)
