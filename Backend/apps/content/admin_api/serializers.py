from django.conf import settings
from rest_framework import serializers

from apps.content.models import MediaAsset, MediaKind
from apps.content.services import (
    ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_VIDEO_MIME_TYPES,
    MediaProcessingError,
    process_image,
)


class MediaAssetSerializer(serializers.ModelSerializer):
    """Lectura y edición de metadatos. El archivo no se sustituye: se sube otro."""

    url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    original_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            "id",
            "kind",
            "url",
            "thumbnail_url",
            "original_url",
            "title",
            "alt_text",
            "alt_text_en",
            "mime_type",
            "size_bytes",
            "width",
            "height",
            "tags",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "kind",
            "mime_type",
            "size_bytes",
            "width",
            "height",
            "created_at",
        ]

    def get_url(self, obj) -> str | None:
        return obj.file.url if obj.file else None

    def get_thumbnail_url(self, obj) -> str | None:
        return obj.thumbnail.url if obj.thumbnail else None

    def get_original_url(self, obj) -> str | None:
        return obj.original.url if obj.original else None


class MediaAssetUploadSerializer(serializers.ModelSerializer):
    """
    Subida. Acepta lo que el usuario tenga a mano y **normaliza en el servidor**: nadie del
    panel debería tener que preocuparse de redimensionar una foto antes de subirla.

    El límite de tamaño se comprueba antes de abrir el archivo con Pillow, para no gastar
    memoria decodificando algo que se va a rechazar igualmente.
    """

    file = serializers.FileField(write_only=True)

    class Meta:
        model = MediaAsset
        fields = ["file", "title", "alt_text", "alt_text_en", "tags"]

    def validate_file(self, uploaded):
        content_type = (uploaded.content_type or "").lower()

        if content_type in ALLOWED_IMAGE_MIME_TYPES:
            limit = settings.MEDIA_IMAGE_MAX_UPLOAD_BYTES
        elif content_type in ALLOWED_VIDEO_MIME_TYPES:
            limit = settings.MEDIA_VIDEO_MAX_UPLOAD_BYTES
        else:
            allowed = ", ".join(sorted(ALLOWED_IMAGE_MIME_TYPES | ALLOWED_VIDEO_MIME_TYPES))
            raise serializers.ValidationError(f"Formato no admitido. Se aceptan: {allowed}.")

        if uploaded.size > limit:
            raise serializers.ValidationError(
                f"El archivo pesa {uploaded.size // 1024 // 1024} MB y el máximo es "
                f"{limit // 1024 // 1024} MB."
            )
        return uploaded

    def create(self, validated_data):
        uploaded = validated_data.pop("file")
        content_type = (uploaded.content_type or "").lower()
        user = self.context["request"].user

        if content_type in ALLOWED_VIDEO_MIME_TYPES:
            # Los vídeos no se recomprimen: haría falta ffmpeg, una dependencia de sistema
            # pesada que nadie ha pedido. Solo se les aplica el límite de tamaño.
            asset = MediaAsset(
                kind=MediaKind.VIDEO,
                mime_type=content_type,
                size_bytes=uploaded.size,
                uploaded_by=user,
                **validated_data,
            )
            asset.file = uploaded
            asset.save()
            return asset

        try:
            processed = process_image(uploaded)
        except MediaProcessingError as exc:
            # Es un problema con el dato que envió el cliente, no un fallo del servidor.
            raise serializers.ValidationError({"file": str(exc)}) from exc

        asset = MediaAsset(
            kind=MediaKind.IMAGE,
            mime_type=processed.mime_type,
            size_bytes=processed.file.size,
            width=processed.width,
            height=processed.height,
            uploaded_by=user,
            **validated_data,
        )
        asset.file = processed.file
        if processed.thumbnail is not None:
            asset.thumbnail = processed.thumbnail
        if processed.original is not None:
            asset.original = processed.original
        asset.save()
        return asset

    def to_representation(self, instance):
        return MediaAssetSerializer(instance, context=self.context).data
