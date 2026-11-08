import mimetypes

from django.apps import AppConfig


class MediaConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.media"

    def ready(self):
        # La imagen de Python (slim) no trae /etc/mime.types con WebP: sin esto, el
        # servidor de desarrollo sirve las fotos como application/octet-stream y el
        # `content_type` de las importadas queda vacío. En producción las sirve Caddy,
        # que ya conoce estos tipos.
        mimetypes.add_type("image/webp", ".webp")
        mimetypes.add_type("video/mp4", ".mp4")
        mimetypes.add_type("video/webm", ".webm")
