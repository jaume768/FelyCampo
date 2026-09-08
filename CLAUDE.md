# Fely Campo

`felycampo/` es solo una carpeta de trabajo local, **no un monorepo**. `backend/` y
`frontend/` son dos repos git independientes, cada uno con su propio remoto y su propio
`.gitignore`:

- `backend/`  → https://github.com/jaume768/FelyCampo (remote `origin` de este propio repo;
  el checkout ya vive bajo `backend/` en vez de en la raíz).
- `frontend/` → https://github.com/mreinab/felycampo

No hay historial compartido entre ambos ni se ha reescrito nada al juntarlos aquí.

## Stack

**Backend** (`backend/`): Django 5 + Django REST Framework sobre PostgreSQL 16, caché/
throttling con Redis, Stripe para pagos, `drf-spectacular` para OpenAPI. Docker para
desarrollo y depuración (`debugpy`).

**Frontend** (`frontend/`): Next.js 16 (App Router), JavaScript (sin TypeScript), CSS
Modules, `next-intl` para i18n, Storybook + Vitest para componentes. Sin backend propio:
todo lo que no sea UI estática vive en la API de Django.

## Arranque (todo junto, desde la raíz)

```bash
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up --build
```

- Backend:  http://localhost:8001/api/v1/  · Swagger en `/api/v1/docs/` · Admin en `/admin/`
- Frontend: http://localhost:3000
- Postgres: `localhost:5433` (dentro de la red de Docker sigue siendo `db:5432`)
- Redis:    `localhost:6380` (dentro de la red de Docker sigue siendo `redis:6379`)

`docker-compose.yml` (raíz) reutiliza `backend/Dockerfile` (target `dev`) y el mismo
mapeo de puertos que `backend/docker-compose.dev.yml`, que sigue funcionando standalone
para quien solo quiera tocar el backend. El frontend corre en **su propia imagen**
(`frontend/Dockerfile`, target `dev`), nunca en la misma imagen que el backend.

Seed de datos de ejemplo (catálogo, tallas agotadas, rebajas, superusuario
`admin@felycampo.test` / `admin12345`; solo con `DEBUG=True`):

```bash
docker compose exec backend python manage.py seed_demo
```

## Comandos habituales

```bash
# --- Backend ---
C="docker compose exec backend"
$C python manage.py migrate                 # migraciones
$C python manage.py makemigrations
$C pytest                                    # tests
$C ruff check . --fix && $C ruff format .    # lint y formato
$C python manage.py seed_demo                # datos de ejemplo

# --- Frontend ---
F="docker compose exec frontend"
$F npm run build                             # build de producción
$F npx vitest                                # tests (Vitest; sin script "test" propio aún)
docker compose exec frontend npm run storybook  # Storybook (puerto 6006, no expuesto por compose)
```

No hay lint configurado todavía en `frontend/` (sin ESLint ni script `lint` en
`package.json`) — no lo añadas por tu cuenta sin que te lo pidan explícitamente.

## Convenciones que NO se tocan

- **API bajo `/api/v1/`.** Todo cuelga de ese prefijo (`backend/config/api_urls.py`).
- **Errores uniformes**: `{"error": {"code", "message", "details"}}`
  (`backend/apps/core/exceptions.py`). No devuelvas otro shape de error.
- **Precios netos + `*_gross`**: se guardan **sin IVA**; la API añade el campo `*_gross`
  ya con el 21% aplicado (`VAT_RATE`). No reimplementes el cálculo del IVA en el frontend.
- **Sesión por cookie**, no por token. El frontend manda `credentials: "include"` en cada
  fetch; el carrito de invitado va por la cabecera `X-Cart-Id`
  (declarada en `CORS_ALLOW_HEADERS`, no la quites). Para escrituras hace falta pedir antes
  `GET /api/v1/auth/csrf/` y mandar `X-CSRFToken`.
- **UUIDs** como clave primaria en los modelos de dominio (`apps.core.models.UUIDTimeStampedModel`).
- **CORS/CSRF nunca con comodín**: `CORS_ALLOW_ALL_ORIGINS` no se usa en ningún entorno,
  tampoco desarrollo — con credenciales, el navegador descarta cualquier respuesta con
  `Access-Control-Allow-Origin: *`. Los orígenes van explícitos en `CORS_ALLOWED_ORIGINS` /
  `CSRF_TRUSTED_ORIGINS`.
- **La forma de la API pública de Fase 1 no cambia.** Los endpoints descritos en
  `backend/README.md` (catálogo, cuentas, carrito/checkout, pedidos, devoluciones) son el
  contrato con el frontend. Se puede añadir, pero no renombrar campos, cambiar tipos ni
  romper el shape de respuesta sin decisión explícita — el frontend Fase 1 asume esa forma.
- **Toda llamada a la API pasa por `frontend/src/lib/api/`.** Ningún componente hace
  `fetch` directo ni lee `campo_en` a mano (usa `pickLocalized`). Ver
  `frontend/src/lib/api/README.md` para cuándo llamarla desde Server vs Client Component.
  El carrito de invitado vive en `localStorage` (no cookie), así que `cart.js`/`orders.js`/
  `account.js` solo se llaman desde Client Components.
- **`NEXT_PUBLIC_API_URL`** (navegador) vs **`API_INTERNAL_URL`** (solo servidor, dentro de
  Docker apunta a `http://backend:8000`): no las confundas ni hagas que una sustituya a la
  otra — `client.js` ya elige la correcta según dónde se ejecuta.

## Admin panel: dominio aparte (decisión pendiente de aplicar en producción)

El panel `/admin` del **frontend** (`frontend/app/admin`, distinto del Django admin en
`/admin/` del backend) se desplegará en un **subdominio aparte** de la web pública en
producción (p. ej. `admin.felycampo.com` vs `felycampo.com`). Implicaciones para cuando se
configure el entorno de producción — **nada de esto aplica todavía en dev**, donde todo
corre en `localhost`:

- `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` deberán listar **ambos** orígenes
  (web pública + subdominio admin), no solo uno.
- Las cookies de sesión/CSRF necesitarán `SameSite=None` + `Secure` (HTTPS obligatorio)
  para el subdominio admin, en vez del `Lax` que basta cuando frontend y API comparten
  dominio registrable. Ver el comentario en `backend/config/settings/base.py` sobre
  `COOKIE_SAMESITE`.
- **No** poner `CSRF_COOKIE_DOMAIN` para "compartir" la cookie entre subdominios: amplía
  su alcance sin resolver nada (ver `backend/README.md`, sección CSRF).

## Puertos de desarrollo

| Servicio | Host | Dentro de Docker |
|---|---|---|
| Backend (API) | 8001 | 8000 |
| Frontend | 3000 | 3000 |
| Postgres | 5433 | 5432 |
| Redis | 6380 | 6379 |
| debugpy | 5678 | 5678 |

Los puertos de host están desplazados (8001, 5433, 6380) porque los estándar (8000, 5432,
6379) ya solían estar ocupados en la máquina de desarrollo original del backend.
