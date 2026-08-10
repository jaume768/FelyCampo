from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models.functions import Lower
from rest_framework import serializers

from apps.catalog.serializers import ProductListSerializer

from .models import Address, Favorite

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Datos del cliente en su área privada."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "accepts_marketing",
            "date_joined",
        )
        read_only_fields = ("id", "email", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name", "phone", "accepts_marketing")

    def validate_email(self, value):
        # La unicidad es case-insensitive (índice funcional sobre Lower(email)); se
        # comprueba aquí para devolver un error de campo y no un 500 por IntegrityError.
        taken = User.objects.annotate(email_lower=Lower("email")).filter(email_lower=value.lower())
        if taken.exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if user is None:
            # Mensaje deliberadamente genérico: no revelar si el email existe.
            raise serializers.ValidationError("Correo o contraseña incorrectos.")
        attrs["user"] = user
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("La contraseña actual no es correcta.")
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context["request"].user)
        return value


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "label",
            "recipient",
            "phone",
            "line1",
            "line2",
            "postal_code",
            "city",
            "province",
            "country",
            "tax_id",
            "is_default_shipping",
            "is_default_billing",
        )


class FavoriteSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source="product", read_only=True)

    class Meta:
        model = Favorite
        fields = ("id", "product", "product_detail", "created_at")
        read_only_fields = ("id", "created_at")
