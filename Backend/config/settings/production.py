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

# Sin caché compartida, los contadores del límite de ritmo son por proceso: con varios
# workers los cupos se multiplican y se reinician en cada despliegue. Es la diferencia
# entre tener límites y creer que se tienen.
#
# Exigir Redis NO lo convierte en un punto único de fallo: los throttles degradan en
# abierto (apps/core/throttling.py) y la caché lleva timeouts de 0,5 s. Si Redis cae, la
# tienda sigue vendiendo sin límites de ritmo y el fallo se registra en ERROR y aparece
# como `cache: error` en /health/ready/.
if not REDIS_URL:  # noqa: F405
    raise RuntimeError(
        "REDIS_URL es obligatorio en producción: los límites de ritmo necesitan una "
        "caché compartida entre procesos."
    )

# --- Correo ---
# Los envíos usan fail_silently=False a propósito (una factura que no sale debe romper,
# no perderse en silencio). Sin SMTP configurado, Django usaría webmaster@localhost y
# /request-invoice/ devolvería 500 en producción: por eso se exige aquí y no más tarde.
EMAIL_BACKEND = env(  # noqa: F405
    "EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = env("EMAIL_HOST", default="")  # noqa: F405
EMAIL_PORT = env.int("EMAIL_PORT", default=587)  # noqa: F405
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")  # noqa: F405
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")  # noqa: F405
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)  # noqa: F405
EMAIL_TIMEOUT = env.int("EMAIL_TIMEOUT", default=10)  # noqa: F405
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="")  # noqa: F405
SERVER_EMAIL = DEFAULT_FROM_EMAIL

if EMAIL_BACKEND.endswith("smtp.EmailBackend") and not EMAIL_HOST:
    raise RuntimeError("EMAIL_HOST es obligatorio en producción (SMTP de Brevo o similar).")
if not DEFAULT_FROM_EMAIL:
    raise RuntimeError(
        "DEFAULT_FROM_EMAIL es obligatorio en producción: sin él los correos saldrían "
        "como webmaster@localhost y los rechazaría cualquier servidor."
    )

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
