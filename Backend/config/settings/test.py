from .base import *  # noqa: F403

DEBUG = False
ALLOWED_HOSTS = ["*"]

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Caché en memoria del proceso: los tests no dependen de un Redis levantado. El conftest
# raíz la limpia entre tests para que los contadores de ritmo no se contaminen.
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

# Contraseñas rápidas y sin logging ruidoso durante los tests.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
LOGGING["root"]["level"] = "WARNING"  # noqa: F405
