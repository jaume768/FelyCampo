# Fely Campo — Backend

API REST en Django + DRF sobre PostgreSQL. Docker para desarrollo y depuración.

**Estado: Fase 0** — base técnica ejecutable, sin modelos de negocio. Las reglas de
ecommerce están fuera de alcance y documentadas en [`DECISIONS_PENDING.md`](DECISIONS_PENDING.md).

## Requisitos
- Docker y Docker Compose.

## Arranque

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up --build
```

Las migraciones se aplican solas al arrancar el contenedor `web`.

- API:        http://localhost:8001/api/v1/
- Liveness:   http://localhost:8001/api/v1/health/live/   (no toca la BD)
- Readiness:  http://localhost:8001/api/v1/health/ready/  (503 si la BD no responde)
- Health:     http://localhost:8001/api/v1/health/        (alias de readiness, compat. Fase 0)
- Swagger:    http://localhost:8001/api/v1/docs/   (solo con DEBUG)
- ReDoc:      http://localhost:8001/api/v1/redoc/  (solo con DEBUG)
- Admin:      http://localhost:8001/admin/

> Puertos del host **8001** (API) y **5433** (Postgres): en esta máquina el 8000 y el 5432
> estaban ocupados. Dentro de la red de Docker siguen siendo 8000 y 5432, así que
> `DATABASE_URL` no cambia.

## Comandos habituales

```bash
C=docker compose -f docker-compose.dev.yml exec web

# Migraciones
$C python manage.py makemigrations
$C python manage.py migrate

# Superusuario (email como identificador, sin username)
$C python manage.py createsuperuser --email admin@felycampo.test

# Comprobación del proyecto
$C python manage.py check

# Tests (settings de test, DB efímera)
$C pytest

# Lint y formato
$C ruff check . --fix
$C ruff format .

# Auditoría de vulnerabilidades de dependencias
$C pip-audit

# Validar el esquema OpenAPI
$C python manage.py spectacular --validate --fail-on-warn --file schema.yml
```

## Integración continua

`.github/workflows/ci.yml` corre en cada push y pull request con Python 3.12 y Postgres 16:
`ruff check`, `ruff format --check`, `manage.py check`, `makemigrations --check`, `pytest`,
validación del esquema OpenAPI, `check --deploy` con settings de producción y `pip-audit`.

## pre-commit (en el host)

```bash
pip install pre-commit && pre-commit install
pre-commit run --all-files
```

## Depurar dentro de Docker (debugpy)

`debugpy` escucha en el puerto `5678`, expuesto por Compose.

1. Arranca con `DEBUGPY_ENABLED=true` (valor por defecto de `.env.example`).
2. VS Code → **Run and Debug → "Docker: attach to Django"** (ver `.vscode/launch.json`).
3. Pon breakpoints; el volumen `.:/app` los mapea al contenedor.

Para depurar el propio arranque, pon `DEBUGPY_WAIT_FOR_CLIENT=true`: el proceso espera al
depurador antes de iniciar. Con debugpy activo el autoreload se desactiva (`--noreload`);
para hot-reload sin depurar, pon `DEBUGPY_ENABLED=false`.

## Entornos y configuración

Settings separados en `config/settings/`:

| Módulo         | Uso                                                        |
|----------------|------------------------------------------------------------|
| `base`         | Común. Lee todo de entorno; sin secretos.                  |
| `development`  | `DEBUG=True`, email a consola, docs y CORS abiertos.       |
| `test`         | Usado por pytest. Hashing rápido, email en memoria.        |
| `production`   | Seguridad reforzada; **exige** CORS explícito (nunca `*`). |

Toda la configuración sensible vive en `.env` (nunca commiteado). Plantilla en `.env.example`.

## Estructura

```
config/
  settings/     base · development · test · production
  urls.py       raíz; api_urls.py engancha /api/v1/
apps/
  core/         modelos base (UUID, timestamps), paginación, errores, logging, health
  accounts/     User personalizado (UUID PK, email login), manager, admin
  catalog/      vacío (pendiente de decisiones)
  content/      vacío
  orders/       vacío
  appointments/ vacío (Calendly)
  integrations/ interfaces vacías: Stripe, Brevo, Calendly
```

## Convenciones fijadas

- API versionada bajo `/api/v1/`.
- Errores uniformes: `{"error": {"code", "message", "details"}}` (`apps/core/exceptions.py`).
- Paginación por defecto 20, `?page=&page_size=` (máx. 100).
- Logging estructurado JSON (`DJANGO_LOG_FORMAT=json|simple`), sin datos personales.
- OpenAPI con `drf-spectacular`.
- Modelos de dominio heredarán de `apps.core.models` (`UUIDTimeStampedModel`).
