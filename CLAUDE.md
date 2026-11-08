# Fely Campo

**Un solo repositorio.** `backend/` y `Frontend/` viven aquí, bajo
https://github.com/jaume768/FelyCampo. Un commit puede tocar los dos.

## Qué es el proyecto ahora (2026-11-08)

**Una web de atelier con panel de administración. La tienda online queda aparcada** para
más adelante. Para el lanzamiento hacen falta:

- la web pública de Miriam (textos, fotos, vídeos, contacto, formularios de cita y de
  consulta);
- su panel `/admin`, para que **varias personas** editen textos, fotos y vídeos;
- todo servido desde **un servidor con Docker y Caddy, en el dominio `felycampo.com`**, con
  el panel en `felycampo.com/admin` (mismo dominio, **sin** subdominio aparte);
- los formularios llegan **por email (Resend) y además se guardan** para verlos en el
  panel;
- la newsletter se guarda primero en el panel y más adelante se conecta a Substack.

**Lee [`docs/CONTENIDO.md`](docs/CONTENIDO.md) antes de tocar nada:** cómo se guarda el
contenido, qué se ha hecho con las fotos y la lista de lo que falta, en orden.

## De dónde viene el frontend

`Frontend/` es una **copia del repo de Miriam (`mreinab/felycampo`) en el commit
`e556a76` (2026-11-07)**: el árbol, no el historial. Ella da el frontend por terminado y
**ya no lo va a tocar**. Su repo sigue publicado en Netlify, solo para enseñárselo a los
clientes; no es producción.

- Su documentación sigue dentro y vale: **`Frontend/docs/ADMIN.md`** (cómo está hecho el
  panel y cómo conectarlo; es la guía de este trabajo) y `Frontend/docs/PUBLICAR.md`
  (SEO, Search Console, redirecciones).
- Lo que se cambió sobre su copia está en la tabla de `docs/CONTENIDO.md`, todo
  infraestructura. **Su `e556a76` no compilaba** (`next build`, por `/admin/puntos-de-venta`);
  está arreglado.
- La integración con la tienda que había aquí antes (`src/lib/api/`, `AdminAuthGate`,
  formulario de producto conectado) se retiró con la copia vieja. Si hace falta, está en
  el historial de git, antes del commit de la importación.

### Cómo está hecho el frontend de Miriam

- El contenido vive en **`src/datos/*.js`** (16 archivos, 19 exports). Es «sustituto
  provisional de la base de datos». La web lo lee **solo** a través de funciones
  `obtener…()` de `src/lib/`.
- El panel guarda a través de unos pocos proveedores (`components/admin/Paginas.jsx`,
  `AtelierFiesta.jsx`, `Blog.jsx`, `Runway.jsx`…). Sus acciones `guardar`, `alternar`,
  `borrar` y `reordenar` son las que tienen que llamar a la API.
- La validación de campos son funciones puras de `src/lib/` (`campos…()`,
  `validarExtra…()`), compartidas entre la web y el editor.
- `src/proxy.js` lleva unas 800 redirecciones 301 de la web de WordPress. **No las toques**
  sin leer `Frontend/docs/PUBLICAR.md`.

## Estado real

- **Backend:** `apps.content` hecho: documentos JSON por sección, versiones con 409,
  revisiones, aviso de revalidación a Next, `cargar_contenido` e `importar_medios_web`.
  Los 19 documentos y las 1.494 fotos ya están cargados en la base de datos de desarrollo.
- **Frontend:** sigue leyendo `src/datos/` (estático). Las rutas de las fotos del
  contenido ya apuntan a `/media/web/…` (almacén de medios), así que la web funciona
  igual antes y después de conectarla.
- **Login hecho** (ver «Acceso del equipo y prelanzamiento»). **El panel todavía no guarda
  nada**: lo publicado vive en memoria hasta conectarlo a `apps.content`.
- Siguen en el código, sin usar: el catálogo, los pedidos, el stock y Stripe del backend
  (para cuando vuelva la tienda), y el carrito, la wishlist y la cuenta del frontend
  (ocultos, ver `Frontend/docs/ADMIN.md` §6). **No los conectes.**

### Acceso del equipo y prelanzamiento

- **`/acceso`** (`Frontend/src/app/acceso/route.js`) es a la vez el login del panel y el
  anuncio «la nueva web estará disponible el…». HTML propio desde un Route Handler, no una
  página de React, para poder responder 503.
- **Quien autentica es Django.** El navegador inicia sesión en `/api/v1/auth/login/`,
  luego `/api/acceso` pregunta a `/api/v1/admin/me/` si la persona es staff y emite la
  cookie **`fc_equipo`**, firmada con HMAC y `SESION_EQUIPO_SECRET`
  (`src/lib/sesionEquipo.js`). El proxy solo verifica esa firma; no llama a Django en
  cada visita.
- **El proxy** (`src/proxy.js`) exige `fc_equipo` en `/admin/*` (sin ella, 307 a
  `/acceso?destino=…`). Con **`PRELANZAMIENTO=true`** reescribe además **toda** la web
  pública a `/acceso` para quien no sea del equipo: **503 + `Retry-After` + `noindex`**,
  antes incluso de los 301 de WordPress. La URL del navegador no cambia; tras iniciar
  sesión, el equipo vuelve a donde iba.
- La cookie solo deja **ver**. Guardar sigue pasando por la sesión de Django e `IsStaff`.
  `SesionAdmin.jsx` comprueba al cargar el panel que esa sesión sigue viva.
- **Abrir la web el día del lanzamiento:** `PRELANZAMIENTO=false` en el `.env` y
  `docker compose -f docker-compose.prod.yml up -d frontend`. Se lee al arrancar: **no**
  hace falta `--build`.

### Rutas públicas (las de Miriam, definitivas)

`/`, `/atelier`, `/atelier/{novias,fiesta,vosotras}`, `/atelier-fiesta/<sede>`,
`/pret-a-porter`, `/colecciones-fely-campo`, `/runways-<slug>`, `/sobre-fely`,
`/talleres-fely-campo`, `/blog`, `/visita-fely-campo` (+ `/cita`),
`/puntos-de-venta-fely-campo`, `/legal/*`. Todas bajo `/es` y `/en`.

**Ya no existen** `/tienda`, `/carrito`, `/wishlist` ni `/mi-cuenta`: redirigen. Lo de
«`/tienda` es definitiva» de versiones anteriores de este archivo ya no vale.

### Documentación que NO describe el presente

- **`docs/CONTRATO.md`**: contrato de la tienda online. Obsoleto y marcado como tal.
- **`INTEGRACION.md`** (raíz): más antiguo todavía. Pista histórica como mucho.
- **`backend/schema.yml`**: no incluye `content`. Para regenerarlo:
  `curl http://localhost:8001/api/v1/schema/ -o backend/schema.yml`.

## Fotos y vídeos

Resumen; el detalle está en `docs/CONTENIDO.md`:

- **Los que usa el código** (logos, banderas, fotos fijas de componentes): en
  `Frontend/public/`, versionados (unos 54 MB).
- **Los del contenido editable**: en el almacén de medios del backend con su ruta y su
  nombre SEO (`MEDIA_ROOT/web/img/…`, URL `/media/web/img/…`), con fila `MediaAsset`.
  **No van en git**: se traen del repo de Miriam con `importar_medios_web`.
- **Sin usar** (1.076 archivos, 362 MB): no se trajeron. Siguen en el repo de Miriam.
- En la base de datos se guarda **la URL** (dentro del JSON) y la fila `MediaAsset`;
  **el binario nunca**. Los archivos están en disco: el volumen `media_data` en
  producción, `backend/media/` en desarrollo.
- `/media/*` lo sirve **Caddy** en producción, con caché de 30 días. En desarrollo, Next
  lo reenvía a Django (rewrite en `next.config.mjs`, solo si `NODE_ENV` no es
  `production`).
- **Cada imagen tiene versiones de 480, 960 y 1600 px** (`foto.w960.webp`, junto a la
  original; `backend/apps/media/variants.py`). Las generan la subida,
  `importar_medios_web` y `generar_variantes`. **En el frontend, toda `<img>` de
  contenido va con `atributosImagen(src, { sizes, prioridad })`** (`src/lib/imagenes.js`):
  pone el `srcSet` y la carga diferida. `prioridad: true` solo para la imagen grande de
  arriba (el hero). Los vídeos decorativos van con `components/ui/VideoDiferido.jsx`.

## Rendimiento: reglas que no se rompen

- **Las páginas públicas son estáticas** (`●` en `next build`). **No leas `headers()`,
  `cookies()` ni `searchParams` en `app/[locale]/layout.js`**: harían dinámicas todas las
  páginas a la vez. Así estaba (`x-pathname`) y se movió a
  `components/layout/MarcoRuta.jsx` (`usePathname`).
- **`setRequestLocale(locale)`** al principio de cada página y layout de `[locale]`. Sin
  él, next-intl lee el idioma de las cabeceras y la página deja de ser estática.
- Siguen siendo dinámicas, a propósito, las que leen `?previa=` (vista previa del admin) o
  `?coleccion=`: `/atelier/fiesta`, las fichas de looks y prendas, los artículos y Runway.
- **Fuentes con `next/font`** (`src/styles/fuentes.js`), sin `@import` de Google Fonts.

## Stack

**Backend** (`backend/`): Django 5.2 + Django REST Framework sobre PostgreSQL 16, caché y
throttling en Redis, `drf-spectacular` para OpenAPI. Docker para desarrollo y depuración
(`debugpy`).

Apps: `core`, `accounts`, `content`, `media`, `adminapi`, `appointments` (vacía; aquí irán
las citas y consultas), `integrations`, y las de la tienda aparcada: `catalog`, `orders`,
`stock`.

**Frontend** (`Frontend/`): Next.js 16 (App Router, Turbopack), JavaScript sin TypeScript,
CSS Modules, `next-intl` (`es` / `en`), Leaflet (mapa de puntos de venta), Storybook +
Vitest. Rutas de servidor propias: `/api/cita` y `/api/consulta-vestido` (emails con
Resend) y `/api/revalidar`.

## Arranque

Pasos completos en **[`docs/ARRANQUE.md`](docs/ARRANQUE.md)**. Resumen:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
# genera un DJANGO_SECRET_KEY en backend/.env — el arranque falla sin él
docker compose up --build -d
docker compose exec backend python manage.py seed_demo          # superusuario
docker compose exec backend python manage.py cargar_contenido   # contenido de la web
# + importar_medios_web con el repo de Miriam (ver ARRANQUE.md)
```

- Web: http://localhost:3000 (redirige a `/es`) · panel en `/admin`
- Backend: http://localhost:8001/api/v1/ · Swagger `/api/v1/docs/` · Django admin `/admin/`
- Postgres `localhost:5433` · Redis `localhost:6380` (dentro de Docker: `db:5432`, `redis:6379`)

Superusuario del seed: `admin@felycampo.test` / `admin12345` (solo con `DEBUG=True`).

Despliegue: **[`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md)**. Cada servicio tiene **su
propia imagen** (`backend/Dockerfile`, `Frontend/Dockerfile`, multi-stage). Nunca en la
misma.

## Comandos habituales

```bash
# --- Backend ---
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py makemigrations
docker compose exec backend pytest                       # 319 tests, todos en verde
docker compose exec backend ruff check <rutas> && docker compose exec backend ruff format <rutas>
docker compose exec backend python manage.py cargar_contenido   # --sobrescribir pisa lo publicado
docker compose exec backend python manage.py generar_variantes  # versiones 480/960/1600 de las fotos

# --- Frontend ---
docker compose restart frontend   # tras cambiar código: en Docker sobre Windows NO recarga solo
docker compose exec -e NODE_ENV=production frontend npm run build
docker compose exec frontend npm run storybook           # 6006, no publicado por compose
node Frontend/scripts/exportar-contenido.mjs backend/apps/content/seed/contenido.json
```

**Pasa `ruff format` solo por lo que hayas tocado**, no por `.`: hay archivos de la tienda
sin formatear, y reformatearlos ensucia el diff con cambios que no son tuyos.

No hay lint configurado en `Frontend/` (ni ESLint ni script `lint`). **No lo añadas sin que
te lo pidan explícitamente**, ni añadas dependencias al frontend por tu cuenta.

## Convenciones que NO se tocan

- **API bajo `/api/v1/`.** Todo cuelga de ese prefijo (`backend/config/api_urls.py`); el
  panel bajo `/api/v1/admin/` (`apps/adminapi/urls.py`). **Caddy envía a Django solo
  `/api/v1/*`**: el resto de `/api/*` es de Next. No lo amplíes a `/api/*`, o los
  formularios darán 404.
- **Errores uniformes**: `{"error": {"code", "message", "details"}}`
  (`apps/core/exceptions.py`). No devuelvas otro shape.
- **Contenido = un documento JSON por sección**, con la forma exacta de su export de
  `src/datos/`. La lista de claves es cerrada (`apps/content/registry.py`, la misma que
  `Frontend/scripts/exportar-contenido.mjs`). **No partas un documento en tablas** sin
  decisión explícita: la lógica de Miriam en `src/lib/` cuenta con esa forma.
- **Publicar exige `version`**; si no coincide, 409 `version_conflict`. Varias personas
  editan a la vez: no lo quites ni lo hagas opcional.
- **La validación de campos es la de Miriam** (`src/lib/`); el backend valida estructura.
- **Sesión por cookie**, no por token. El frontend manda `credentials: "include"`. Para
  escrituras hay que pedir antes `GET /api/v1/auth/csrf/` y mandar `X-CSRFToken`.
- **Las llamadas del servidor de Next a Django llevan `X-Forwarded-Proto: https`.** Sin esa
  cabecera, `SECURE_SSL_REDIRECT` responde 301 a `https://backend:8000` y cada llamada se
  cuelga 10 s (`docs/DESPLIEGUE.md`).
- **`REVALIDATE_SECRET` se define una sola vez**, en el `.env` de la raíz, y compose lo
  pasa a backend y frontend. No lo repitas en `backend/.env*`. Igual con
  `SESION_EQUIPO_SECRET`, `PRELANZAMIENTO` y `PRELANZAMIENTO_FECHA` (solo frontend).
- **OneDrive:** el proyecto vive dentro de una carpeta de OneDrive y, al borrar muchos
  archivos de golpe, OneDrive llegó a **restaurar 209 archivos ya borrados** como
  marcadores «solo en la nube» (atributo `O`). Después de un borrado grande, comprueba
  que no han vuelto (`git status`, `attrib`). Lo sano es sacar el repo de OneDrive.
- **UUID como clave primaria** en todo el dominio (`apps.core.models.UUIDTimeStampedModel`).
- **CORS/CSRF nunca con comodín**, en ningún entorno, tampoco en desarrollo. Orígenes
  explícitos en `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS`.
- **La forma de la API pública no cambia.** Se puede añadir; **no** renombrar campos,
  cambiar tipos ni romper el shape sin decisión explícita.
- **`NEXT_PUBLIC_API_URL`** (navegador) vs **`API_INTERNAL_URL`** (solo servidor; en Docker
  `http://backend:8000`). No las confundas: desde un Server Component, `localhost` es el
  contenedor del frontend.
- **Las `NEXT_PUBLIC_*` y `SITIO_INDEXABLE` se incrustan en el build** (build args en
  `docker-compose.prod.yml`). Cambiarlas exige `--build`. `SITIO_INDEXABLE=true` **solo**
  en felycampo.com.
- **`backend/.gitignore` usa `/media/` anclado**, no `media/`. Sin la barra inicial, git
  ignora también la app `backend/apps/media/` y el backend deja de arrancar en un clon
  limpio. No lo «simplifiques».
- Tienda (cuando vuelva): precios netos + `*_gross` con el IVA ya aplicado, carrito de
  invitado por `X-Cart-Id` (no la quites de `CORS_ALLOW_HEADERS`). Ver `docs/CONTRATO.md`.

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
