from .base import *  # noqa: F403

DEBUG = False

# SECRET_KEY ya es obligatorio (base.py lo lee sin default y falla si no existe).
# ALLOWED_HOSTS debe ser explícito: sin comodín y sin quedar vacío.
if not ALLOWED_HOSTS:  # noqa: F405
    raise RuntimeError("DJANGO_ALLOWED_HOSTS es obligatorio en producción.")
if "*" in ALLOWED_HOSTS:  # noqa: F405
    raise RuntimeError("DJANGO_ALLOWED_HOSTS no puede contener '*' en producción.")

# CORS/CSRF nunca comodín en producción: si el entorno no define orígenes, falla pronto.
CORS_ALLOW_ALL_ORIGINS = False
if not CORS_ALLOWED_ORIGINS:  # noqa: F405
    raise RuntimeError("CORS_ALLOWED_ORIGINS es obligatorio en producción.")

SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# PLACEHOLDER — NO APTO PARA PRODUCCIÓN REAL.
# El almacenamiento de media en disco local se pierde en despliegues efímeros y no se
# comparte entre réplicas. Debe sustituirse por almacenamiento de objetos (R2/S3) cuando
# se tome esa decisión (ver DECISIONS_PENDING.md). Mientras tanto queda así, documentado.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
