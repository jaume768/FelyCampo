# Fely Campo

**Un solo repositorio.** `backend/` y `Frontend/` viven aquí, bajo
https://github.com/jaume768/FelyCampo. Un commit puede tocar los dos: ya no son repos
independientes.

## De dónde viene el frontend (2026-09-09)

`Frontend/` era un repo aparte con su propio remoto,
https://github.com/mreinab/felycampo. El 2026-09-09 se **fusionó aquí borrando su `.git`**:
se importó el árbol de archivos, no el historial. Consecuencias que conviene tener claras:

- Los **26 commits originales, todos de `mreinab`**, no están en este repositorio. Siguen
  existiendo en el suyo, que es su copia de referencia.
- **mreinab continúa trabajando en `mreinab/felycampo`**, que ya **no se sincroniza** con
  este. Son dos bifurcaciones sin vía automática entre ellas: lo que ella haga a partir de
  ahora hay que traerlo a mano (un `git remote add`, un `diff` y aplicar lo que interese),
  y lo que se haga aquí no le llega.
- `Frontend/.gitignore` **sigue vigente**: git aplica los `.gitignore` anidados, así que
  `node_modules/` y `.next/` se ignoran solos sin repetirlos en la raíz.

## Estado real (2026-09-08)

Lo importante antes de tocar nada:

- **El frontend no habla con el backend todavía.** `grep -rE '\bfetch\(|axios' Frontend/src/`
  devuelve **cero** resultados. Todas las pantallas leen datos estáticos importados en
  build: `productosEjemplo.js`, `mockData.js`, `resenasEjemplo.js`, `colecciones.js`,
  `ubicaciones.js`.
- **No existe `Frontend/src/lib/api/`.** `src/lib/` tiene tres archivos:
  `atelierCategoriaSeo.js`, `precio.js`, `slugify.js`. (Quedan `src/lib/api/` y
  `src/lib/adapters/` como directorios **vacíos**, residuo de un `git clean`.)
- El backend está bastante por delante: catálogo, cuentas, carrito/checkout, pedidos,
  devoluciones, stock, biblioteca de medios y **40 endpoints `/api/v1/admin/*`**.

**Lee [`docs/CONTRATO.md`](docs/CONTRATO.md) antes de conectar cualquier dato.** Es la foto
verificada de qué ruta del frontend se serviría con qué endpoint, qué falta y qué no encaja.

### Documentación que NO describe el presente

- **`INTEGRACION.md`** (raíz): obsoleto, ya marcado como tal en su cabecera. Describe un
  frontend con `src/lib/api/`, `CarritoPageContent.jsx`, `NavbarMiniCarrito.jsx` y rutas
  `/pret-a-porter`, `/visitenos`, `/about`. Nada de eso existe. Pista histórica, nunca
  descripción del estado actual.
- **`backend/schema.yml`**: regenerado el 2026-09-08 desde el backend en marcha, ahora sí
  incluye `/api/v1/admin/*`. Si vuelve a quedar desfasado:
  `curl http://localhost:8001/api/v1/schema/ -o backend/schema.yml`.

## Stack

**Backend** (`backend/`): Django 5.2 + Django REST Framework sobre PostgreSQL 16, caché y
throttling en Redis, Stripe, `drf-spectacular` para OpenAPI. Docker para desarrollo y
depuración (`debugpy`).

Apps: `core`, `accounts`, `catalog`, `orders`, `stock`, `media`, `adminapi`,
`integrations`. **`content` y `appointments` existen pero sus `models.py` están vacíos** —
por eso las páginas de contenido y las de reserva de cita no tienen backend detrás.

**Frontend** (`Frontend/`): Next.js 16 (App Router, Turbopack), JavaScript sin TypeScript,
CSS Modules, `next-intl` (locales `es` / `en`, `/` redirige a `/es`), Storybook + Vitest.
Sin backend propio.

## Arranque

Pasos completos y verificados en **[`docs/ARRANQUE.md`](docs/ARRANQUE.md)**. Resumen:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# genera un DJANGO_SECRET_KEY en backend/.env — el arranque falla sin él
docker compose up --build -d
docker compose exec backend python manage.py seed_demo
```

- Backend: http://localhost:8001/api/v1/ · Swagger `/api/v1/docs/` · Django admin `/admin/`
- Frontend: http://localhost:3000 (redirige 307 a `/es`) · panel en `/admin`
- Postgres `localhost:5433` · Redis `localhost:6380` (dentro de Docker: `db:5432`, `redis:6379`)

Superusuario del seed: `admin@felycampo.test` / `admin12345` (solo con `DEBUG=True`).

Cada servicio tiene **su propia imagen**: `backend/Dockerfile` y `Frontend/Dockerfile`
(ambos multi-stage, target `dev`). Nunca en la misma imagen.

## Comandos habituales

```bash
# --- Backend ---
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py makemigrations
docker compose exec backend pytest                       # 277 tests, todos en verde
docker compose exec backend ruff check . --fix && docker compose exec backend ruff format .
docker compose exec backend python manage.py seed_demo

# --- Frontend ---
docker compose exec -e NODE_ENV=production frontend npm run build
docker compose exec frontend npx vitest                  # sin script "test" propio aún
docker compose exec frontend npm run storybook           # 6006, no publicado por compose
```

No hay lint configurado en `Frontend/` (ni ESLint ni script `lint`). **No lo añadas sin que
te lo pidan explícitamente**, ni añadas dependencias al frontend por tu cuenta.

## Convenciones que NO se tocan

- **API bajo `/api/v1/`.** Todo cuelga de ese prefijo (`backend/config/api_urls.py`); el
  panel bajo `/api/v1/admin/` (`apps/adminapi/urls.py`).
- **Errores uniformes**: `{"error": {"code", "message", "details"}}`
  (`apps/core/exceptions.py`). No devuelvas otro shape.
- **Precios netos + `*_gross`**: se guardan **sin IVA**; la API añade `price_gross`,
  `sale_price_gross`, `effective_price_gross`, `unit_price_gross`, `line_gross` con el 21 %
  ya aplicado (`VAT_RATE`). **El frontend no recalcula el IVA jamás**: consume `*_gross`.
  Ojo con `src/lib/precio.js`, que hoy asume strings tipo `"1.050 €"` sin decimales — ver
  `docs/CONTRATO.md`, desajuste D-2.
- **Sesión por cookie**, no por token. El frontend manda `credentials: "include"`; el
  carrito de invitado va por la cabecera **`X-Cart-Id`** (declarada en `CORS_ALLOW_HEADERS`,
  no la quites). Para escrituras hay que pedir antes `GET /api/v1/auth/csrf/` y mandar
  `X-CSRFToken`.
- **UUID como clave primaria** en todo el dominio (`apps.core.models.UUIDTimeStampedModel`).
- **CORS/CSRF nunca con comodín**, en ningún entorno — tampoco desarrollo. Con credenciales,
  el navegador descarta cualquier respuesta con `Access-Control-Allow-Origin: *`. Orígenes
  explícitos en `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS`.
- **La forma de la API pública no cambia.** Los endpoints de `backend/README.md` son el
  contrato. Se puede añadir; **no** renombrar campos, cambiar tipos ni romper el shape sin
  decisión explícita.
- **`NEXT_PUBLIC_API_URL`** (navegador, `http://localhost:8001`) vs **`API_INTERNAL_URL`**
  (solo servidor; dentro de Docker `http://backend:8000`). No las confundas ni sustituyas
  una por otra: desde un Server Component, `localhost` es el contenedor del frontend.
- **`backend/.gitignore` usa `/media/` anclado**, no `media/`. Sin la barra inicial, git
  ignora también la app `backend/apps/media/` y el backend deja de arrancar en un clon
  limpio. No lo "simplifiques".

## Decisiones de producto cerradas

- Las rutas del frontend actuales son **definitivas**: `/tienda`, `/visita-fely-campo`,
  `/sobre-fely`. **Sin redirecciones** desde `/pret-a-porter`, `/visitenos`, `/about`.
- `Product.line` se queda con **tres** valores (`pret_a_porter` / `atelier` / `archive`).
  Los "tipos" novia y fiesta del panel son **colecciones dentro de `line=archive`**, vía
  `Collection` — no líneas comerciales ni campo nuevo.
- Un **look** (de `/archivo/runway/[coleccion]`) es una **entidad nueva**: pieza editorial
  con foto de pasarela, orden dentro de la colección y enlace **opcional** a un `Product`.
  Aún no existe el modelo.
- **Wishlist**: el invitado guarda en `localStorage` y al iniciar sesión se **fusiona** con
  `account/favorites/`. No hay wishlist de invitado en servidor.

## Admin panel: dominio aparte (pendiente de aplicar en producción)

El panel `/admin` del **frontend** (`Frontend/src/app/admin`, distinto del Django admin en
`/admin/` del backend) irá en un **subdominio aparte** (`admin.felycampo.com` vs
`felycampo.com`). **Nada de esto aplica en dev**, donde todo es `localhost`:

- `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` deberán listar **ambos** orígenes.
- Las cookies de sesión/CSRF necesitarán `SameSite=None` + `Secure` (HTTPS), en vez del
  `Lax` que basta cuando comparten dominio registrable. Ver el comentario sobre
  `COOKIE_SAMESITE` en `backend/config/settings/base.py`.
- **No** pongas `CSRF_COOKIE_DOMAIN` para "compartir" la cookie entre subdominios: amplía
  su alcance sin resolver nada (ver `backend/README.md`, sección CSRF).

## Puertos de desarrollo

| Servicio | Host | Dentro de Docker |
|---|---|---|
| Backend (API) | 8001 | 8000 |
| Frontend | 3000 | 3000 |
| Postgres | 5433 | 5432 |
| Redis | 6380 | 6379 |
| debugpy | 5678 | 5678 |

Los puertos del host van desplazados porque los estándar (8000, 5432, 6379) solían estar
ocupados en la máquina de desarrollo original.
