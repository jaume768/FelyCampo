from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# En desarrollo se permite cualquier origen para no fricción con el frontend en marcha.
CORS_ALLOW_ALL_ORIGINS = True
