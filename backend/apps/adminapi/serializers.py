from rest_framework import serializers

from apps.accounts.models import User


class AdminUserSerializer(serializers.ModelSerializer):
    """Identidad del miembro del staff conectado al panel. Solo lectura: no hay edición
    del propio perfil de staff desde aquí, para eso está el admin de Django."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "full_name", "is_staff", "is_superuser")
        read_only_fields = fields
