from rest_framework import serializers

from apps.core.models import FeatureFlag


class AdminUserSerializer(serializers.Serializer):
    """
    Quién ha iniciado sesión en el panel. No reutiliza el serializer del área de cliente:
    aquí interesan los permisos, y allí los datos de contacto y marketing.
    """

    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)


class FeatureFlagSerializer(serializers.ModelSerializer):
    """
    Los flags se declaran en migraciones, no se crean desde el panel: lo único editable es
    si están activos. `key`, `name` y `description` van de solo lectura para que el panel
    no pueda dejar un flag sin la clave que el código busca.
    """

    class Meta:
        model = FeatureFlag
        fields = ["id", "key", "name", "description", "is_enabled", "updated_at"]
        read_only_fields = ["id", "key", "name", "description", "updated_at"]
