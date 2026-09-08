# Arranque en local

Pasos exactos que funcionaron el 2026-09-08 (Docker 27.1.1, Compose v2.29.1, Windows 11).
`docker compose up` levanta cuatro servicios: `db`, `redis`, `backend`, `frontend`.

## 1. Variables de entorno

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Los dos hacen falta. El servicio `backend` del compose de la raíz lee **`backend/.env`**
directamente (`env_file: ./backend/.env`), no el `.env` de la raíz — así el backend sigue
funcionando standalone con `backend/docker-compose.dev.yml`.

### `DJANGO_SECRET_KEY` es obligatoria

`config/settings/base.py:11` hace `env("DJANGO_SECRET_KEY")` **sin default**: si falta, el
arranque revienta. `backend/.env.example` trae el placeholder `change-me-in-production`;
sustitúyelo por una clave de desarrollo:

```bash
python -c "import secrets,string; a=string.ascii_letters+string.digits+'!@#\$%^&*(-_=+)'; print('django-insecure-'+''.join(secrets.choice(a) for _ in range(50)))"
```

Y pégala en `backend/.env`:

```
DJANGO_SECRET_KEY=django-insecure-<lo-que-salga>
```

### CORS y CSRF

`backend/.env.example` ya trae los valores correctos para desarrollo — compruébalos:

```
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
```

**Nunca comodín, tampoco en desarrollo.** La sesión va por cookie y el frontend manda
`credentials: "include"`; con credenciales, la especificación de fetch prohíbe
`Access-Control-Allow-Origin: *` y el navegador **descarta la respuesta entera**. Por eso
`CORS_ALLOW_ALL_ORIGINS` no se usa en ningún entorno (ver el comentario en
`config/settings/base.py:213-219`).

## 2. Construir y levantar

```bash
docker compose up --build -d
```

La primera vez tarda: construye dos imágenes (`backend/Dockerfile` target `dev` con
Python 3.12, `frontend/Dockerfile` target `dev` con Node 22 + `npm ci`).

`backend` y `frontend` esperan a que `db` y `redis` estén *healthy* antes de arrancar.
El `entrypoint-dev.sh` del backend **ya corre `migrate` solo** al arrancar.

Comprobar:

```bash
docker compose ps
```

Los cuatro deben estar `Up`; `db`, `redis` y `backend` además `(healthy)`.

## 3. Migraciones y datos de ejemplo

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_demo
```

`seed_demo` crea catálogo de ejemplo, tallas agotadas, rebajas y el superusuario
**`admin@felycampo.test` / `admin12345`**. Solo funciona con `DEBUG=True`. Es idempotente:
al repetirlo dice `Productos nuevos: 0`.

## 4. Tests

```bash
docker compose exec backend pytest -q
```

Resultado el 2026-09-08: **277 pasan, 0 fallos** (~35 s). Los warnings de
`No directory at: /app/staticfiles/` son inocuos en desarrollo.

## 5. Comprobaciones

```bash
curl http://localhost:8001/api/v1/health/
# {"status":"ok","database":"ok","cache":"ok"}

curl "http://localhost:8001/api/v1/catalog/products/"
# {"count": 8, ...} — con price_gross ya calculado ("181.50")

curl -o /dev/null -w "%{http_code}\n" http://localhost:8001/api/v1/docs/    # 200 (Swagger)
curl -sL -o /dev/null -w "%{http_code}\n" http://localhost:3000             # 200
```

En el navegador:

| | URL |
|---|---|
| Home del frontend | http://localhost:3000 → redirige 307 a **`/es`** (next-intl) |
| Panel admin del frontend | http://localhost:3000/admin |
| API | http://localhost:8001/api/v1/ |
| Swagger | http://localhost:8001/api/v1/docs/ |
| Esquema OpenAPI | http://localhost:8001/api/v1/schema/ |
| Django admin | http://localhost:8001/admin/ |

Que `curl http://localhost:3000` devuelva **307** es correcto, no un fallo: `/` redirige al
locale por defecto. Con `curl -L` acaba en 200 sobre `/es`.

## Puertos

Los del host van desplazados a propósito (los estándar solían estar ocupados):

| Servicio | Host | Dentro de Docker |
|---|---|---|
| Backend (API) | **8001** | 8000 |
| Frontend | 3000 | 3000 |
| Postgres | **5433** | 5432 |
| Redis | **6380** | 6379 |
| debugpy | 5678 | 5678 |

## Regenerar el esquema OpenAPI

Con el backend en marcha:

```bash
curl http://localhost:8001/api/v1/schema/ -o backend/schema.yml
```

## Problemas encontrados y su arreglo

### `apps/media` no estaba en git (arreglado)

`backend/.gitignore` tenía el patrón **`media/` sin barra inicial**, que en git casa con
*cualquier* carpeta llamada `media` a cualquier profundidad — se tragaba la app Django
`backend/apps/media/` entera, además de la carpeta de subidas.

Como `config/settings/base.py` lista `apps.media` en `LOCAL_APPS` y
`apps/adminapi/urls.py` hace `include("apps.media.urls")`, un clon limpio del repo **no
arrancaba**.

Arreglado anclando el patrón a la raíz del repo (`MEDIA_ROOT = BASE_DIR / "media"` →
`backend/media/`):

```gitignore
# Carpeta de archivos subidos (MEDIA_ROOT = BASE_DIR / "media"). Anclada con "/" inicial
# para NO tragarse la app Django "apps/media/", que sí va versionada.
/media/
```

Verificable:

```bash
cd backend
git check-ignore -v apps/media/models.py                       # sin salida → NO ignorado ✅
git check-ignore -v media/library/image/cualquiera.webp        # ignorado ✅
```

La app estaba completa en el working tree (12 archivos, con su `0001_initial`); se versionó
tal cual, no hizo falta reescribir nada.

### El frontend no tenía Dockerfile (creado)

`docker-compose.yml` de la raíz esperaba `context: ./frontend, target: dev`, pero el
Dockerfile no existía. Creado siguiendo el estilo multi-stage de `backend/Dockerfile`:
`base` (Node 22 slim + `npm ci`) → `dev` / `build` → `prod`. Añadido también
`frontend/.dockerignore`.

`node_modules` y `.next` van como **volúmenes anónimos** en compose para que el bind mount
del host no pise lo instalado en la imagen.

> El target `prod` asume `output: "standalone"` en `next.config.mjs`, que **hoy no está
> puesto**. El target `dev` —el único que usa compose— funciona sin eso.

## Comandos habituales

```bash
# Backend
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py makemigrations
docker compose exec backend pytest
docker compose exec backend ruff check . --fix
docker compose exec backend python manage.py seed_demo

# Frontend
docker compose exec -e NODE_ENV=production frontend npm run build   # NODE_ENV explícito: ver nota abajo
docker compose exec frontend npx vitest        # sin script "test" propio todavía
docker compose exec frontend npm run storybook # puerto 6006, no publicado por compose

# Logs y parada
docker compose logs -f backend
docker compose down          # conserva el volumen de Postgres
docker compose down -v       # borra también la base de datos
```

### `npm run build` dentro del contenedor de desarrollo

`NODE_ENV=production` es obligatorio al lanzar `next build` desde el contenedor `dev`.
Ese contenedor corre con `NODE_ENV=development` (como debe), y con ese valor Next enlaza
React en modo desarrollo: el prerender revienta con
`TypeError: Cannot read properties of null (reading 'useContext')`, un error que no
señala a ninguna página en concreto y despista.

```bash
docker compose exec -e NODE_ENV=production frontend npm run build
```

El target `build` del `Dockerfile` ya fija `NODE_ENV=production` por su cuenta, así que
una imagen de producción no necesita nada de esto.

### Rutas que dan 404 en desarrollo aunque el archivo exista

Turbopack puede quedarse con un manifiesto de rutas obsoleto tras un cambio grande: las
páginas que **no** se han tocado desde entonces devuelven 404 en `next dev`, mientras que
el build de producción sí las lista. Pasó con `/legal/cookies`, `/sobre-fely/talleres`,
`/ayuda/atencion-cliente` y `/mi-cuenta/panel`.

No es un fallo del código. Se arregla vaciando `.next` (es un volumen anónimo, así que
`rm -rf /app/.next` falla con «Device or resource busy» — hay que vaciar su contenido):

```bash
docker compose exec frontend sh -c "rm -rf /app/.next/* /app/.next/.[!.]*"
docker compose restart frontend
```

Para comprobar si una ruta existe de verdad, mírala en la lista del build:

```bash
docker compose exec -e NODE_ENV=production frontend npm run build | grep mi-cuenta
```
