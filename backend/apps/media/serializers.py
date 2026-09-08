import uuid

from rest_framework import serializers

from .models import MediaAsset, MediaKind
from .processing import process_image

MAX_IMAGE_BYTES = 25 * 1024 * 1024
MAX_VIDEO_BYTES = 100 * 1024 * 1024

IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
VIDEO_CONTENT_TYPES = {"video/mp4", "video/webm", "video/quicktime"}


class MediaAssetSerializer(serializers.ModelSerializer):
    """Lectura y edición de metadatos de un archivo ya subido. Solo `alt_text` es
    editable — sustituir el archivo en sí es un alta nueva (`MediaUploadSerializer`),
    no un PATCH sobre este, porque cambiaría dimensiones/miniatura/tipo a la vez."""

    class Meta:
        model = MediaAsset
        fields = (
            "id",
            "kind",
            "file",
            "thumbnail",
            "original_filename",
            "content_type",
            "size_bytes",
            "width",
            "height",
            "alt_text",
            "created_at",
        )
        read_only_fields = (
            "id",
            "kind",
            "file",
            "thumbnail",
            "original_filename",
            "content_type",
            "size_bytes",
            "width",
            "height",
            "created_at",
        )


class MediaUploadSerializer(serializers.Serializer):
    """
    Alta de un archivo (multipart). `kind`/`content_type`/peso/dimensiones se derivan
    siempre del propio archivo, nunca de lo que declare el cliente — así una extensión
    falsa no cuela un tipo distinto del real.
    """

    file = serializers.FileField()
    alt_text = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_file(self, value):
        content_type = value.content_type or ""
        if content_type in IMAGE_CONTENT_TYPES:
            kind, limit = MediaKind.IMAGE, MAX_IMAGE_BYTES
        elif content_type in VIDEO_CONTENT_TYPES:
            kind, limit = MediaKind.VIDEO, MAX_VIDEO_BYTES
        else:
            raise serializers.ValidationError(
                "Formato no admitido. Imágenes: JPEG, PNG, WebP, GIF. Vídeos: MP4, WebM, MOV."
            )
        if value.size > limit:
            raise serializers.ValidationError(
                f"El archivo pesa demasiado ({value.size // (1024 * 1024)} MB). "
                f"Límite: {limit // (1024 * 1024)} MB."
            )
        # Guardado aquí (no recalculado en create()) para no volver a abrir/leer el
        # archivo dos veces — validate_file ya lo tiene decidido.
        self._kind = kind
        return value

    def create(self, validated_data):
        upload = validated_data["file"]
        kind = self._kind

        asset = MediaAsset(
            kind=kind,
            original_filename=upload.name,
            content_type=upload.content_type or "",
            size_bytes=upload.size,
            alt_text=validated_data.get("alt_text", ""),
            uploaded_by=self.context["request"].user,
        )

        if kind == MediaKind.IMAGE:
            try:
                processed, thumbnail, width, height = process_image(upload)
            except Exception as exc:
                raise serializers.ValidationError(
                    {"file": "No se ha podido procesar la imagen. ¿Es un archivo válido?"}
                ) from exc
            filename = f"{uuid.uuid4().hex}.webp"
            asset.file.save(filename, processed, save=False)
            asset.thumbnail.save(filename, thumbnail, save=False)
            asset.width = width
            asset.height = height
        else:
            # Sin reencodado de vídeo (fuera de alcance, exigiría ffmpeg): se guarda tal
            # cual llegó, ya validado por tipo de contenido y peso arriba.
            asset.file.save(upload.name, upload, save=False)

        asset.save()
        return asset
