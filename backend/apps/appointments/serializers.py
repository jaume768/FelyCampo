from rest_framework import serializers

from .models import Cita, ConsultaVestido, Estado, Suscriptor

CAMPOS_COMUNES = (
    "id",
    "nombre",
    "email",
    "telefono",
    "mensaje",
    "idioma",
    "acepta_legal",
    "estado",
    "notas",
    "historial",
    "created_at",
)
SOLO_LECTURA = ("id", "historial", "created_at")


def _ruta_propia(valor: str) -> str:
    """Solo rutas de la propia web (empiezan por "/"), nunca una URL de fuera."""
    valor = (valor or "").strip()
    return valor if valor.startswith("/") and not valor.startswith("//") else ""


# ---------- Email de los formularios (llamada interna del frontend) ----------


class EnvioEmailSerializer(serializers.Serializer):
    to = serializers.ListField(child=serializers.EmailField(), min_length=1, max_length=10)
    subject = serializers.CharField(max_length=300)
    html = serializers.CharField(max_length=100_000)
    reply_to = serializers.EmailField(required=False, allow_blank=True)

    def validate_subject(self, valor):
        # Un salto de línea en el asunto permitiría inyectar cabeceras.
        return " ".join(valor.split())


# ---------- Alta (llamada interna del frontend) ----------


class AltaCitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = (
            "nombre",
            "email",
            "telefono",
            "mensaje",
            "idioma",
            "acepta_legal",
            "tipo",
            "atelier",
            "fecha_evento",
        )

    def validate_acepta_legal(self, valor):
        if not valor:
            raise serializers.ValidationError("Hay que aceptar la política de privacidad.")
        return valor

    def create(self, datos):
        # Empieza asignada al atelier que eligió la clienta.
        return Cita.objects.create(**datos, asignado=datos["atelier"])


class AltaConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultaVestido
        fields = (
            "nombre",
            "email",
            "telefono",
            "mensaje",
            "idioma",
            "acepta_legal",
            "tipo",
            "producto",
            "color",
            "color_hex",
            "ruta",
            "imagen",
        )

    def validate_acepta_legal(self, valor):
        if not valor:
            raise serializers.ValidationError("Hay que aceptar la política de privacidad.")
        return valor

    def validate_ruta(self, valor):
        return _ruta_propia(valor)

    def validate_imagen(self, valor):
        return _ruta_propia(valor)


class AltaSuscriptorSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=160)
    idioma = serializers.ChoiceField(choices=["es", "en"], default="es")
    origen = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")


# ---------- Panel ----------


class _GestionMixin:
    """`estado`, `notas` y (en citas) `asignado` son lo único que el equipo cambia; el
    cambio de estado queda en el historial con la fecha del servidor y quién lo hizo."""

    def update(self, instancia, datos):
        nuevo = datos.get("estado")
        if nuevo and nuevo != instancia.estado:
            instancia.registrar_estado(nuevo, self.context["request"].user)
        return super().update(instancia, datos)


class CitaAdminSerializer(_GestionMixin, serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = (*CAMPOS_COMUNES, "tipo", "atelier", "fecha_evento", "asignado")
        read_only_fields = (
            tuple(f for f in fields if f not in ("estado", "notas", "asignado")) + SOLO_LECTURA
        )


class ConsultaAdminSerializer(_GestionMixin, serializers.ModelSerializer):
    class Meta:
        model = ConsultaVestido
        fields = (*CAMPOS_COMUNES, "tipo", "producto", "color", "color_hex", "ruta", "imagen")
        read_only_fields = tuple(f for f in fields if f not in ("estado", "notas")) + SOLO_LECTURA


class SuscriptorAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suscriptor
        fields = ("id", "email", "idioma", "origen", "activo", "created_at")
        read_only_fields = ("id", "email", "idioma", "origen", "created_at")


ESTADOS = [valor for valor, _ in Estado.choices]
