from pathlib import Path

import environ
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parents[2]

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env.bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
]

LOCAL_APPS = [
    "apps.core",
    "apps.accounts",
    "apps.catalog",
    "apps.content",
    "apps.orders",
    "apps.appointments",
    "apps.integrations",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {"default": env.db("DATABASE_URL")}
DATABASES["default"]["ATOMIC_REQUESTS"] = False
DATABASES["default"]["CONN_MAX_AGE"] = env.int("DB_CONN_MAX_AGE", default=60)

# Caché. Es donde viven los contadores del límite de ritmo, así que **debe ser compartida
# entre procesos**: con la caché en memoria de cada worker, `10/min` con 3 workers de
# gunicorn son en realidad 30/min, y los contadores se reinician en cada despliegue.
# Basta un Redis para caché; no hace falta Celery.
REDIS_URL = env("REDIS_URL", default="")
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
            # Timeouts cortos y explícitos: sin ellos, un Redis colgado bloquea el worker
            # hasta el timeout de red del sistema operativo (minutos), y basta con que
            # Redis se ralentice para agotar los workers de gunicorn.
            "OPTIONS": {"socket_timeout": 0.5, "socket_connect_timeout": 0.5},
        }
    }
else:
    CACHES = {
        "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"},
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es"
LANGUAGES = [("es", "Español"), ("en", "English")]
TIME_ZONE = "Europe/Madrid"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

# El login casa el email ignorando mayúsculas, igual que el índice único del modelo.
AUTHENTICATION_BACKENDS = ["apps.accounts.backends.CaseInsensitiveEmailBackend"]

# accounts.User no usa unique=True en el email: la unicidad es case-insensitive vía un
# UniqueConstraint sobre Lower("email"). Django no reconoce ese índice funcional como
# unicidad del USERNAME_FIELD, así que E003 es un falso positivo aquí y se silencia.
# auth.W004 sustituye a E003 al declarar un backend propio: Django avisa de que el
# USERNAME_FIELD no es único porque no reconoce el índice funcional. El backend
# CaseInsensitiveEmailBackend sí lo maneja, que es justo lo que pide el HINT.
SILENCED_SYSTEM_CHECKS = ["auth.E003", "auth.W004"]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.DefaultPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        # Añade `id` como desempate: sin él la paginación puede repetir u omitir filas.
        "apps.core.filters.StableOrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.core.exceptions.api_exception_handler",
    # Límite de ritmo. Sin esto quedan abiertos la fuerza bruta sobre el login, el alta
    # masiva de cuentas y —lo más caro— el envío masivo de correos a nuestros propios
    # buzones a través de las consultas y los avisos de stock.
    # Degradan en abierto: si Redis cae, se registra el error y se deja pasar. Ver
    # apps/core/throttling.py — la tienda no puede depender de Redis para vender.
    "DEFAULT_THROTTLE_CLASSES": [
        "apps.core.throttling.FailOpenAnonRateThrottle",
        "apps.core.throttling.FailOpenUserRateThrottle",
        "apps.core.throttling.FailOpenScopedRateThrottle",
    ],
    # Número de proxies de confianza delante de Django (nginx / ALB = 1).
    # **Crítico**: si vale None, DRF identifica al cliente por el contenido íntegro de
    # X-Forwarded-For, que el propio cliente controla. Bastaría mandar un valor distinto
    # en cada petición para obtener un cupo nuevo y anular todos los límites de abajo.
    "NUM_PROXIES": env.int("NUM_PROXIES", default=1),
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("THROTTLE_ANON", default="120/min"),
        "user": env("THROTTLE_USER", default="600/min"),
        # Endpoints sensibles, con su propio cupo (ver `throttle_scope` en las vistas).
        "login": env("THROTTLE_LOGIN", default="10/min"),
        "register": env("THROTTLE_REGISTER", default="5/hour"),
        "password_reset": env("THROTTLE_PASSWORD_RESET", default="5/hour"),
        # Estos dos disparan correos: se limitan mucho más.
        "enquiry": env("THROTTLE_ENQUIRY", default="5/hour"),
        "stock_notification": env("THROTTLE_STOCK_NOTIFICATION", default="20/hour"),
        # Consulta de pedido de invitado: contiene datos personales.
        "order_lookup": env("THROTTLE_ORDER_LOOKUP", default="20/hour"),
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Fely Campo API",
    "DESCRIPTION": "API REST de Fely Campo",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v1",
}

# CORS / CSRF: siempre desde entorno, nunca comodín. Producción lo refuerza (ver production.py).
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# La autenticación es por **sesión + cookie**, así que el navegador tiene que poder mandar
# la cookie en peticiones entre orígenes. Sin esto, el frontend no mantiene sesión.
#
# Ojo: con credenciales, el comodín `Access-Control-Allow-Origin: *` **no vale** — la
# especificación de fetch prohíbe expresamente enviar credenciales a una respuesta con
# comodín. Por eso ningún entorno usa `CORS_ALLOW_ALL_ORIGINS`, ni siquiera desarrollo.
CORS_ALLOW_CREDENTIALS = True

# `x-cart-id` es cabecera propia: sin declararla, el preflight de **todo el carrito** de
# invitado falla y el navegador ni llega a enviar la petición real.
CORS_ALLOW_HEADERS = (*default_headers, "x-cart-id")

# SameSite de las cookies de sesión y CSRF. **Decidido**: frontend y API comparten dominio
# registrable (felycampo.com + api.felycampo.com), así que "Lax" es suficiente y evita las
# restricciones de cookies de terceros de Safari/ITP. Queda por entorno por si algún día
# el frontend se mueve a otro dominio, donde haría falta "None" (que exige HTTPS).
SESSION_COOKIE_SAMESITE = env("COOKIE_SAMESITE", default="Lax")
CSRF_COOKIE_SAMESITE = SESSION_COOKIE_SAMESITE

# Base de las URLs que van dentro de los correos (seguimiento de pedido, restablecer
# contraseña, verificar correo). Es el dominio del frontend, no el de la API.
FRONTEND_BASE_URL = env("FRONTEND_BASE_URL", default="http://localhost:3000")

# Validez de los enlaces de restablecimiento y verificación: 24 horas.
PASSWORD_RESET_TIMEOUT = env.int("PASSWORD_RESET_TIMEOUT", default=60 * 60 * 24)

# --- Reglas de negocio ---
# Los precios se guardan SIN IVA; el tipo se aplica al calcular (apps/catalog/pricing.py).
VAT_RATE = env("VAT_RATE", default="0.21")
CURRENCY = "EUR"
# Envío: tarifa plana única, independiente del número de artículos. Importes PENDIENTES
# de que los facilite el cliente; estos son placeholders.
SHIPPING_FLAT_RATE = env("SHIPPING_FLAT_RATE", default="0.00")
ORDER_MINIMUM_TOTAL = env("ORDER_MINIMUM_TOTAL", default="0.00")
# Minutos que se retiene el stock mientras el cliente paga.
STOCK_RESERVATION_MINUTES = env.int("STOCK_RESERVATION_MINUTES", default=60)
# Días para devolver. El retorno lo paga el cliente; el reembolso se ejecuta a mano.
RETURN_WINDOW_DAYS = env.int("RETURN_WINDOW_DAYS", default=14)
# Destino de las solicitudes de factura. PLACEHOLDER: falta la dirección real.
INVOICE_REQUEST_EMAIL = env("INVOICE_REQUEST_EMAIL", default="facturacion@example.com")
# Destino de las consultas de productos sin precio. PLACEHOLDER: falta la dirección real.
PRODUCT_ENQUIRY_EMAIL = env("PRODUCT_ENQUIRY_EMAIL", default="info@example.com")

# --- Integraciones (solo configuración; sin lógica en Fase 0) ---
STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY", default="")
# El timeout por defecto de la librería ronda los 80 s: demasiado para una petición web.
STRIPE_TIMEOUT_SECONDS = env.int("STRIPE_TIMEOUT_SECONDS", default=10)
STRIPE_MAX_RETRIES = env.int("STRIPE_MAX_RETRIES", default=2)
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET", default="")
BREVO_API_KEY = env("BREVO_API_KEY", default="")
CALENDLY_WEBHOOK_SIGNING_KEY = env("CALENDLY_WEBHOOK_SIGNING_KEY", default="")

# --- Logging estructurado (JSON en una línea por registro) ---
LOG_LEVEL = env("DJANGO_LOG_LEVEL", default="INFO")
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "apps.core.logging.JSONFormatter",
        },
        "simple": {"format": "{levelname} {asctime} {name} {message}", "style": "{"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": env("DJANGO_LOG_FORMAT", default="json"),
        },
    },
    "root": {"handlers": ["console"], "level": LOG_LEVEL},
    "loggers": {
        "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": False},
    },
}
