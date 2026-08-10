# Fely Campo — Backend

API REST en Django + DRF sobre PostgreSQL. Docker para desarrollo y depuración.

**Estado: Fase 1** — catálogo, cuentas, carrito, checkout con Stripe y devoluciones.
Las reglas de negocio cerradas y lo que sigue pendiente están en
[`DECISIONS_PENDING.md`](DECISIONS_PENDING.md).

## API

Todo cuelga de `/api/v1/`. Los precios se **guardan sin IVA** y la API devuelve además el
importe con IVA (`*_gross`) ya calculado, para no reimplementar el 21% en el frontend.

### Catálogo (público)
| Endpoint | Qué hace |
|---|---|
| `GET  catalog/products/` | Listado. Filtros: `family`, `category`, `color`, `size`, `sale_mode`, `is_outlet`, `kind`, `in_stock`, `price_min`, `price_max`. Además `search`, `ordering`, `page`, `page_size`. |
| `GET  catalog/products/{slug}/` | Ficha completa: colores, tallas, disponibilidad, galería y piezas del conjunto. |
| `GET  catalog/families/` · `categories/` · `sizes/` | Datos de navegación. Categorías en árbol. |
| `POST catalog/stock-notifications/` | «Avísame cuando haya stock». No requiere cuenta. |
| `POST catalog/enquiries/` | Consulta de un producto sin precio; se envía por correo. |

### Cuentas
| Endpoint | Qué hace |
|---|---|
| `GET  auth/csrf/` | Cookie CSRF. Pedirla una vez antes del primer POST. |
| `POST auth/register/` · `login/` · `logout/` · `password/` | Sesión + cookie. |
| `GET/PATCH account/me/` | Datos del cliente. |
| `account/addresses/` · `account/favorites/` | CRUD del área privada. |

### Carrito y pedidos
| Endpoint | Qué hace |
|---|---|
| `GET/POST cart/` | Carrito actual con totales. Sin sesión, el frontend manda la cabecera `X-Cart-Id`. |
| `PATCH/DELETE cart/items/{id}/` | Cambiar cantidad o quitar línea. |
| `POST checkout/` | Crea el pedido, **reserva el stock 1 hora** y devuelve el `client_secret` de Stripe. |
| `GET  orders/` · `orders/{id}/` | Historial del cliente. **Sin estado de envío** (lo lleva una empresa externa). |
| `GET  orders/lookup/?reference=&email=` | Consulta de pedido para quien compró sin cuenta. |
| `POST orders/{id}/request-invoice/` | Envía a administración el correo para emitir la factura. |
| `POST orders/{id}/returns/` | Solicita devolución total o parcial (14 días). |
| `POST orders/{id}/cancel/` | Cancela un pedido no pagado y libera la reserva. |
| `POST webhooks/stripe/` | Confirma el pago y descuenta el stock. Idempotente. |

### Ciclo del stock

1. `checkout/` **reserva** (`Variant.reserved += n`) durante `STOCK_RESERVATION_MINUTES`.
2. El webhook de Stripe **confirma**: baja el stock real y suelta la reserva.
3. Si el pago no llega a tiempo, la reserva se **libera** sola en la siguiente lectura.

No hace falta Celery: la liberación es perezosa y va dentro de una transacción con
`select_for_update`.

### Tarea programada

```bash
python manage.py send_stock_notifications   # avisos de reposición; programar por cron
```

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
  accounts/     User (email login), direcciones, favoritos, registro/sesión
  catalog/      Family → Product → Colorway (SKU) → Variant (stock); precios, outlet
  orders/       carrito, checkout, reserva de stock, pedidos, devoluciones
  content/      vacío (pendiente de decisiones)
  appointments/ vacío (Calendly o sistema propio, sin decidir)
  integrations/ Stripe, correos transaccionales; Brevo y Calendly pendientes
```

## Convenciones fijadas

- API versionada bajo `/api/v1/`.
- Errores uniformes: `{"error": {"code", "message", "details"}}` (`apps/core/exceptions.py`).
- Paginación por defecto 20, `?page=&page_size=` (máx. 100).
- Logging estructurado JSON (`DJANGO_LOG_FORMAT=json|simple`), sin datos personales.
- OpenAPI con `drf-spectacular`.
- Modelos de dominio heredarán de `apps.core.models` (`UUIDTimeStampedModel`).
