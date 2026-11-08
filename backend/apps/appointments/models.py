"""
Lo que llega desde los formularios de la web: citas, consultas de vestidos y suscriptoras de
la newsletter. Son registros (cada uno es de una persona), no contenido editable: por eso
tienen tabla propia y no van en `apps.content`.

El email lo sigue enviando el frontend (Resend, `Frontend/src/lib/emailFormularios.js`);
aquí se guarda cada solicitud para que el equipo la gestione desde las bandejas del panel
(`/admin/consultas`, `/admin/consultas-precio`, `/admin/newsletter`).
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDTimeStampedModel


class Estado(models.TextChoices):
    """Los mismos de las bandejas del panel (`ESTADOS_CITA` en el frontend)."""

    PENDIENTE = "pendiente", _("Pendiente")
    CONTACTADA = "contactada", _("Contactada")
    CONFIRMADA = "confirmada", _("Cita confirmada")
    CERRADA = "cerrada", _("Cerrada")


class Idioma(models.TextChoices):
    ES = "es", _("Español")
    EN = "en", _("Inglés")


class Solicitud(UUIDTimeStampedModel):
    """
    Base común de cita y consulta. `historial` es la lista de cambios de estado
    `[{"estado", "fecha", "por"}]` con la fecha del SERVIDOR (no la del navegador de quien
    lo cambió): es lo que enseña el panel en «Historial de estado».
    """

    nombre = models.CharField(_("nombre"), max_length=120)
    email = models.EmailField(_("email"), max_length=160)
    telefono = models.CharField(_("teléfono"), max_length=40, blank=True)
    mensaje = models.TextField(_("mensaje"), max_length=2000, blank=True)
    idioma = models.CharField(_("idioma"), max_length=2, choices=Idioma.choices, default="es")
    acepta_legal = models.BooleanField(_("acepta la política de privacidad"), default=False)
    estado = models.CharField(
        _("estado"), max_length=12, choices=Estado.choices, default=Estado.PENDIENTE, db_index=True
    )
    notas = models.TextField(_("notas internas"), blank=True)
    historial = models.JSONField(_("historial de estado"), default=list, blank=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.nombre} <{self.email}>"

    def registrar_estado(self, estado: str, usuario=None) -> None:
        self.historial = [
            *self.historial,
            {
                "estado": estado,
                "fecha": timezone.now().isoformat(),
                "por": getattr(usuario, "email", None),
            },
        ]

    def save(self, *args, **kwargs):
        # La primera entrada del historial es la llegada, con su fecha.
        if self._state.adding and not self.historial:
            self.registrar_estado(self.estado)
        super().save(*args, **kwargs)


class Cita(Solicitud):
    """Formulario «Pedir cita» (`/visita-fely-campo/cita` → `/api/cita`)."""

    class Tipo(models.TextChoices):
        NOVIA = "novia", _("Novia")
        INVITADA = "invitada", _("Invitada")

    tipo = models.CharField(_("tipo de cita"), max_length=10, choices=Tipo.choices, blank=True)
    # id del atelier elegido (salamanca, madrid, oviedo: `ATELIERES_CITA` en el frontend).
    atelier = models.CharField(_("atelier elegido"), max_length=40)
    fecha_evento = models.CharField(_("fecha del evento (AAAA-MM)"), max_length=7)
    # id del punto de venta que la atiende (empieza siendo el atelier elegido; el equipo
    # puede pasarla a otro atelier o a una boutique: `puntoCercano.js` en el frontend).
    asignado = models.CharField(_("asignada a"), max_length=80, blank=True)

    class Meta(Solicitud.Meta):
        verbose_name = _("cita")
        verbose_name_plural = _("citas")


class ConsultaVestido(Solicitud):
    """«Contacta con nosotros» de las fichas (`ModalSolicitudAtelier` → `/api/consulta-vestido`)."""

    tipo = models.CharField(_("sección"), max_length=20, blank=True)
    producto = models.CharField(_("vestido"), max_length=160)
    color = models.CharField(_("color"), max_length=80, blank=True)
    color_hex = models.CharField(_("color (hex)"), max_length=9, blank=True)
    # Ruta de la ficha en la web (solo rutas propias, empiezan por "/").
    ruta = models.CharField(_("página"), max_length=300, blank=True)
    imagen = models.CharField(_("foto"), max_length=300, blank=True)

    class Meta(Solicitud.Meta):
        verbose_name = _("consulta de vestido")
        verbose_name_plural = _("consultas de vestidos")


class Suscriptor(UUIDTimeStampedModel):
    """
    Suscriptora de la newsletter (pie de página y ventana de la home). Se guarda aquí antes
    de conectar Substack: es la copia propia de la lista (ver `Frontend/docs/ADMIN.md` §5).
    """

    email = models.EmailField(_("email"), max_length=160, unique=True)
    idioma = models.CharField(_("idioma"), max_length=2, choices=Idioma.choices, default="es")
    # Dónde se suscribió: "pie" (footer) o "ventana" (popup de la home).
    origen = models.CharField(_("origen"), max_length=20, blank=True)
    activo = models.BooleanField(_("activa"), default=True)

    class Meta:
        verbose_name = _("suscriptora")
        verbose_name_plural = _("suscriptoras")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.email
