from .base import *  # noqa: F403

DEBUG = False
ALLOWED_HOSTS = ["*"]

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Contraseñas rápidas y sin logging ruidoso durante los tests.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
LOGGING["root"]["level"] = "WARNING"  # noqa: F405
