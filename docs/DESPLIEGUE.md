# Despliegue en servidor

Levanta el sitio en un servidor con HTTPS, detrás de Caddy. Probado contra
**websjfs.com** (A → `89.167.117.19`).

## Qué se levanta

```
                    ┌─────────┐
   internet ──443──►│  caddy  │  TLS automático (Let's Encrypt)
                    └────┬────┘
                         │
        ┌────────────────┼──────────────────┐
        │                │                  │
   /api/*          /media/*            todo lo demás
   /static/*     (desde el volumen)     incluido /admin
   /panel-django/*                     (panel del frontend)
        │                                   │
   ┌────▼────┐                        ┌─────▼────┐
   │ backend │  gunicorn              │ frontend │  Next standalone
   └──┬───┬──┘                        └──────────┘
      │   │
   ┌──▼─┐ ┌▼──────┐
   │ db │ │ redis │   sin puertos publicados
   └────┘ └───────┘
```

**Todo en un mismo origen.** Frontend y API comparten dominio, así que CORS es de mismo
origen y las cookies de sesión funcionan con `SameSite=Lax`, sin necesidad de
`None`+`Secure`.

> `CLAUDE.md` dice que el panel admin irá en un **subdominio aparte** en producción real.
> Aquí **no** se hace: esto es un entorno de pruebas en un solo dominio. Al separarlo habrá
> que listar los dos orígenes en `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS`, y pasar
> las cookies a `SameSite=None` + `Secure`.

## Requisitos en el servidor

- Docker y el plugin `docker compose`.
- Puertos **80 y 443 abiertos**. El 80 hace falta además del 443: Let's Encrypt lo usa
  para validar el dominio.
- El dominio apuntando aquí. Ya está: A `@` → `89.167.117.19` y CNAME `www` → apex.

## Pasos

### 1. Clonar

```bash
git clone https://github.com/jaume768/FelyCampo.git
cd FelyCampo
```

### 2. Variables

Son **dos** archivos, y ninguno se versiona:

```bash
cp .env.prod.example .env
cp backend/.env.prod.example backend/.env.prod
```

Rellena en **`.env`**:

| Variable | Qué poner |
|---|---|
| `DOMAIN` | `websjfs.com` |
| `PUBLIC_URL` | `https://websjfs.com` |
| `ACME_EMAIL` | Un correo real; ahí llegan los avisos de caducidad del certificado |
| `POSTGRES_PASSWORD` | `openssl rand -base64 32` |
| `DJANGO_ADMIN_PATH` | Sin barras. Algo poco adivinable |

Y en **`backend/.env.prod`**:

| Variable | Qué poner |
|---|---|
| `DJANGO_SECRET_KEY` | `python3 -c "import secrets; print(secrets.token_urlsafe(64))"` — **nueva**, no la de desarrollo |
| `DATABASE_URL` | La **misma** contraseña que `POSTGRES_PASSWORD` |
| `DJANGO_ADMIN_URL` | El mismo valor que `DJANGO_ADMIN_PATH`, pero **con barra final** |

Las demás ya vienen con el valor correcto para websjfs.com.

### 3. Levantar

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

La primera vez tarda: construye las dos imágenes y Caddy pide el certificado.

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f caddy   # ver la emisión del certificado
```

### 4. Superusuario

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

Datos de ejemplo (**solo si quieres el catálogo de prueba**; requiere `DEBUG=True`, así
que en producción normalmente NO se usa):

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_demo
```

### 5. Comprobar

```bash
curl -sI https://websjfs.com | head -1                    # 200
curl -s https://websjfs.com/api/v1/health/                # {"status":"ok",...}
curl -sI https://www.websjfs.com | head -1                # 301 al apex
```

| | URL |
|---|---|
| Tienda | https://websjfs.com |
| Panel de administración | https://websjfs.com/admin |
| API | https://websjfs.com/api/v1/ |
| Admin de Django | https://websjfs.com/panel-django/ |

## Cosas que conviene saber antes de que sorprendan

**Cambiar el dominio obliga a reconstruir el frontend.** `NEXT_PUBLIC_API_URL` se
**incrusta en el bundle del navegador durante el build**, no se lee al arrancar. Si
cambias `PUBLIC_URL`, reiniciar no basta:

```bash
docker compose -f docker-compose.prod.yml up -d --build frontend
```

**El admin de Django NO está en `/admin`.** Esa ruta es del panel del frontend. El de
Django vive en `DJANGO_ADMIN_PATH`. Si las dos coincidieran, ganaría Caddy y el panel
quedaría inaccesible.

**Las fotos las sirve Caddy, no Django.** Con `DEBUG=False` Django no sirve `/media/`
(el `static()` de `config/urls.py` solo se añade en desarrollo). Caddy monta el volumen en
solo lectura y las sirve él.

**Los archivos subidos viven en un volumen** (`media_data`), no en la imagen: sobreviven a
los redespliegues. Cópialo antes de un `down -v`.

> `production.py` avisa de que el almacenamiento en disco local **no es apto para
> producción real**: no se comparte entre réplicas y se pierde en despliegues efímeros.
> Para producción de verdad hay que pasar a S3/R2 (ver `DECISIONS_PENDING.md`).

**Los correos van al log, no se envían.** `backend/.env.prod` trae
`EMAIL_BACKEND=console`, así que el enlace de verificación y el de restablecer contraseña
se escriben en el log del contenedor:

```bash
docker compose -f docker-compose.prod.yml logs backend | grep -A5 "Confirma tu correo"
```

Para envíos reales: quita esa línea y rellena `EMAIL_HOST`, `EMAIL_HOST_USER`,
`EMAIL_HOST_PASSWORD`.

**Sin Stripe no hay cobro.** `STRIPE_SECRET_KEY` vacía: el checkout crea el pedido, reserva
el stock y devuelve `payment: null`; el pedido queda pendiente de pago. Es intencionado
(ver `docs/CONTRATO.md`).

**Postgres y Redis no publican puertos.** Solo se llegan por la red interna de Docker.
Publicarlos dejaría la base de datos accesible desde internet.

## Actualizar

```bash
cd FelyCampo
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

`migrate` y `collectstatic` los corre solo el entrypoint del backend en cada arranque.

## Copia de seguridad

```bash
# Base de datos
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U felycampo felycampo | gzip > copia-$(date +%F).sql.gz

# Archivos subidos
docker run --rm -v felycampo_media_data:/media -v "$PWD":/copia alpine \
  tar czf /copia/media-$(date +%F).tar.gz -C /media .
```

## Si algo falla

| Síntoma | Causa habitual |
|---|---|
| Caddy no consigue el certificado | Puerto 80 cerrado, o el DNS aún no ha propagado. `dig +short websjfs.com` |
| 403 en todos los POST | Falta el dominio en `CSRF_TRUSTED_ORIGINS` |
| Las imágenes no cargan | `BACKEND_PUBLIC_URL` mal puesto: es lo que se usa para construir sus URLs |
| El frontend pide a `localhost:8001` | Se construyó sin `PUBLIC_URL`. Reconstruir con `--build` |
| El backend no arranca | `production.py` valida al arrancar y dice qué falta: `logs backend` |
