from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Nada de `CORS_ALLOW_ALL_ORIGINS` tampoco aquí: con `CORS_ALLOW_CREDENTIALS = True`, el
# comodín `Access-Control-Allow-Origin: *` hace que el navegador **descarte** la respuesta,
# porque la especificación de fetch prohíbe mandar credenciales a un origen comodín. Con el
# comodín, el frontend no mantendría sesión ni en local.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list(  # noqa: F405
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000", "http://127.0.0.1:3000"],
)
CSRF_TRUSTED_ORIGINS = env.list(  # noqa: F405
    "CSRF_TRUSTED_ORIGINS",
    default=["http://localhost:3000", "http://127.0.0.1:3000"],
)
