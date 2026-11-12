import csv
import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db.models import Q
from django.http import HttpResponse
from django.utils.html import strip_tags
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.adminapi.permissions import IsStaff
from apps.adminapi.viewsets import AdminModelViewSet

from .internal import EsFrontendInterno, ThrottlePorVisitante
from .models import Cita, ConsultaVestido, Estado, Suscriptor
from .serializers import (
    AltaCitaSerializer,
    AltaConsultaSerializer,
    AltaSuscriptorSerializer,
    CitaAdminSerializer,
    ConsultaAdminSerializer,
    EnvioEmailSerializer,
    SuscriptorAdminSerializer,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------------------
# Altas: llamadas internas del frontend (ver internal.py)
# ---------------------------------------------------------------------------------------


class _AltaInterna(APIView):
    permission_classes = [EsFrontendInterno]
    authentication_classes = []
    throttle_classes = [ThrottlePorVisitante]
    serializer_class = None

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        instancia = serializer.save()
        return Response({"id": str(instancia.id)}, status=status.HTTP_201_CREATED)


class AltaCitaView(_AltaInterna):
    serializer_class = AltaCitaSerializer
    throttle_scope = "formulario"


class AltaConsultaView(_AltaInterna):
    serializer_class = AltaConsultaSerializer
    throttle_scope = "formulario"


class AltaSuscriptorView(_AltaInterna):
    """Idempotente: suscribirse dos veces no es un error (se reactiva si se había dado
    de baja). Así el formulario puede dar siempre las gracias."""

    serializer_class = AltaSuscriptorSerializer
    throttle_scope = "newsletter"

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        datos = serializer.validated_data
        suscriptor, creado = Suscriptor.objects.get_or_create(
            email=datos["email"].strip().lower(),
            defaults={"idioma": datos["idioma"], "origen": datos.get("origen", "")},
        )
        if not creado and not suscriptor.activo:
            suscriptor.activo = True
            suscriptor.save(update_fields=["activo", "updated_at"])
        return Response(
            {"id": str(suscriptor.id), "nueva": creado},
            status=status.HTTP_201_CREATED if creado else status.HTTP_200_OK,
        )


class EnvioFallido(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "El servidor de correo no ha aceptado el envío."
    default_code = "email_no_enviado"


def _texto_plano(html: str) -> str:
    """Versión de texto del email, para los clientes que no leen HTML."""
    con_saltos = html.replace("<br>", "\n").replace("</p>", "</p>\n").replace("</tr>", "</tr>\n")
    return strip_tags(con_saltos).strip()


class EnvioEmailView(APIView):
    """Envía un email de los formularios (aviso al equipo o confirmación a la clienta) por
    el SMTP de Django (`EMAIL_*`). El frontend compone asunto y HTML; el remitente es
    siempre `DEFAULT_FROM_EMAIL`, no lo elige quien llama. En desarrollo el backend de
    correo es la consola: los emails salen en `docker compose logs backend`."""

    permission_classes = [EsFrontendInterno]
    authentication_classes = []

    def post(self, request):
        serializer = EnvioEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        datos = serializer.validated_data
        mensaje = EmailMultiAlternatives(
            subject=datos["subject"],
            body=_texto_plano(datos["html"]),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=datos["to"],
            reply_to=[datos["reply_to"]] if datos.get("reply_to") else None,
        )
        mensaje.attach_alternative(datos["html"], "text/html")
        try:
            mensaje.send(fail_silently=False)
        except Exception as error:
            logger.exception("No se pudo enviar el email «%s»", datos["subject"])
            raise EnvioFallido() from error
        return Response({"ok": True})


# ---------------------------------------------------------------------------------------
# Panel
# ---------------------------------------------------------------------------------------


class _BandejaViewSet(AdminModelViewSet):
    """Bandeja del panel: listar (filtros `estado` y `q`), ver, cambiar estado / notas /
    asignación (PATCH) y borrar. Sin alta: llegan solo desde la web."""

    http_method_names = ["get", "patch", "delete", "head", "options"]
    campos_busqueda = ("nombre", "email", "telefono", "mensaje")

    def get_queryset(self):
        qs = self.queryset.all()
        estado = self.request.query_params.get("estado")
        if estado:
            qs = qs.filter(estado=estado)
        texto = (self.request.query_params.get("q") or "").strip()
        if texto:
            filtro = Q()
            for campo in self.campos_busqueda:
                filtro |= Q(**{f"{campo}__icontains": texto})
            qs = qs.filter(filtro)
        return qs


class CitaAdminViewSet(_BandejaViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaAdminSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        atelier = self.request.query_params.get("atelier")
        return qs.filter(atelier=atelier) if atelier else qs


class ConsultaAdminViewSet(_BandejaViewSet):
    queryset = ConsultaVestido.objects.all()
    serializer_class = ConsultaAdminSerializer
    campos_busqueda = ("nombre", "email", "telefono", "mensaje", "producto")


class SuscriptorAdminViewSet(AdminModelViewSet):
    queryset = Suscriptor.objects.all()
    serializer_class = SuscriptorAdminSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        texto = (self.request.query_params.get("q") or "").strip()
        return qs.filter(email__icontains=texto) if texto else qs

    @extend_schema(responses={(200, "text/csv"): str})
    @action(detail=False, methods=["get"], url_path="csv")
    def csv(self, request):
        """Toda la lista en CSV (para importarla en Substack u otra herramienta)."""
        respuesta = HttpResponse(content_type="text/csv; charset=utf-8")
        respuesta["Content-Disposition"] = 'attachment; filename="newsletter-fely-campo.csv"'
        respuesta.write("﻿")  # BOM: que Excel lea bien los acentos
        escritor = csv.writer(respuesta)
        escritor.writerow(["email", "idioma", "origen", "activa", "fecha"])
        for s in self.get_queryset():
            escritor.writerow(
                [s.email, s.idioma, s.origen, "sí" if s.activo else "no", s.created_at.date()]
            )
        return respuesta


class ResumenAdminView(APIView):
    """Cifras del inicio del panel."""

    permission_classes = [IsStaff]
    throttle_scope = "admin"

    def get(self, request):
        return Response(
            {
                "citas": Cita.objects.count(),
                "citas_pendientes": Cita.objects.filter(estado=Estado.PENDIENTE).count(),
                "consultas": ConsultaVestido.objects.count(),
                "consultas_pendientes": ConsultaVestido.objects.filter(
                    estado=Estado.PENDIENTE
                ).count(),
                "suscriptores": Suscriptor.objects.filter(activo=True).count(),
            }
        )
