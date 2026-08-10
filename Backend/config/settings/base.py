from pathlib import Path

import environ

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
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.core.exceptions.api_exception_handler",
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
