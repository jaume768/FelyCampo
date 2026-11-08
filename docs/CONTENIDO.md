# Contenido editable: base de datos, fotos y panel

**Fecha: 2026-11-08.** Sustituye a `docs/CONTRATO.md` (el contrato de la tienda online,
aparcada). Describe cómo pasa la web de Miriam de estática a servida desde la base de
datos, qué está hecho y qué falta.

## De dónde sale el frontend

`Frontend/` es una **copia del repo de Miriam en el commit
[`e556a76`](https://github.com/mreinab/felycampo/commit/e556a76)** (2026-11-07), la versión
que dio por terminada para producción. Se importó el árbol, no el historial (su `.git`
pesa 1,3 GB por las fotos). Su documentación sigue dentro y sigue valiendo:

- `Frontend/docs/ADMIN.md`: cómo está hecho el panel y **qué hay que hacer para
  conectarlo**. Es la guía de este trabajo.
- `Frontend/docs/PUBLICAR.md`: SEO, Search Console, redirecciones, variables.

Cambios sobre su copia, todos de infraestructura:

| Qué | Por qué |
|---|---|
| `Dockerfile`, `.dockerignore`, `output: 'standalone'` | Despliegue en Docker (ella usaba Netlify) |
| Fuera `netlify.toml` | Netlify sigue en **su** repo, para enseñar a los clientes; aquí no aplica |
| Rewrite `/media/*` → Django, **solo en desarrollo** (`next.config.mjs`) | En producción lo sirve Caddy |
| Rutas de fotos en `src/datos/*.js`: `/img/…` → `/media/web/img/…` | Ver «Fotos» |
| `src/app/api/revalidar/route.js` (nuevo) | El backend avisa de lo publicado |
| `scripts/exportar-contenido.mjs` (nuevo) | Vuelca `src/datos/` a JSON para la base de datos |
| `.env.prod.example` (nuevo) | Variables de servidor en producción |
| `<Suspense>` en `app/admin/puntos-de-venta/page.js` | **Su `e556a76` no compila** (`next build` falla al prerenderizar esa página por `useSearchParams`); las páginas hermanas ya lo tenían |
| 3 fotos `respaldo-*` del mapa a `public/` | Las construye `MapaPuntosVenta.jsx` en tiempo de ejecución; no aparecían literales en el código |

## Cómo se guarda el contenido

**Un documento JSON por sección** (`apps.content.Document`), con exactamente la forma de su
export de `Frontend/src/datos/`. 19 documentos, unos 520 KB en total:

| Clave | Archivo de `src/datos/` | Export |
|---|---|---|
| `landing` | `landing.js` | `LANDING` |
| `piezas-comunes` | `piezasComunes.js` | `PIEZAS_COMUNES` |
| `seo-textos` | `seoTextos.js` | `SEO_TEXTOS` |
| `sobre-fely` | `sobreFely.js` | `SOBRE_FELY` |
| `talleres` | `talleres.js` | `TALLERES` |
| `contacto` | `contacto.js` | `CONTACTO` |
| `cabeceras` | `cabeceras.js` | `CABECERAS` |
| `sedes` | `ateliers.js` | `SEDES` |
| `puntos-venta` | `puntosVenta.js` | `PUNTOS_VENTA` |
| `vosotras` | `vosotras.js` | `VOSOTRAS` |
| `articulos` / `episodios` | `blog.js` | `ARTICULOS` / `EPISODIOS` |
| `editorial-novias` / `-fiesta` / `-pret-a-porter` | `atelierEditorial.js` | `EDITORIAL_*` |
| `colecciones-fiesta` | `atelierFiesta.js` | `COLECCIONES_FIESTA` |
| `colecciones-novias` | `atelierNovias.js` | `COLECCIONES_NOVIAS` |
| `colecciones-runway` | `runway.js` | `COLECCIONES_RUNWAY` |
| `productos-pret-a-porter` | `pretAPorter.js` | `PRODUCTOS_PRET_A_PORTER` |

**Por qué documentos y no tablas:** el panel de Miriam edita cada sección entera y la
publica de una vez, y toda su lógica (orden, slugs, `slugsAnteriores`, visibilidad) está
escrita sobre esa forma en `Frontend/src/lib/`. Pasarla a tablas obligaría a reescribirla
sin ganar nada. Lo que **sí** son registros (citas, consultas, suscriptores) irá en
tablas.

**Varias personas editando:** cada documento tiene `version`. El panel manda la versión
con la que empezó a editar y, si alguien publicó entretanto, recibe **409
`version_conflict`** con quién y cuándo, en lugar de pisar su trabajo. Cada publicación
guarda una revisión (las 50 últimas) para ver quién cambió qué y volver atrás.

### API

| Método | Ruta | Quién | Qué |
|---|---|---|---|
| GET | `/api/v1/content/<clave>/` | público | `{key, data, version, updated_at}` |
| GET | `/api/v1/admin/content/` | staff | Listado sin `data` |
| GET | `/api/v1/admin/content/<clave>/` | staff | Documento con autora |
| PUT | `/api/v1/admin/content/<clave>/` | staff | `{data, version}` → publica, o 409 |
| GET | `/api/v1/admin/content/<clave>/revisions/` | staff | Historial |
| GET | `/api/v1/admin/content/<clave>/revisions/<n>/` | staff | Una versión antigua, con `data` |

El documento público va **entero, con lo oculto incluido** (lo filtra la web en
`src/lib/`): oculto significa «no se enseña», no «secreto». Si hiciera falta que fuera
secreto, habría que filtrar en el backend o exigir un token de servidor.

El backend solo valida **la estructura**: clave conocida (`apps/content/registry.py`), tipo
objeto o lista y como mucho 2 MB. La validación de campos (idiomas, longitudes, URLs) es de
Miriam y vive en `src/lib/` (`campos…()`, `validarExtra…()`), compartida entre web y panel.

### Publicar al momento

La web leerá cada documento con `fetch(..., { next: { tags: ['contenido:<clave>'] } })`. Al
publicar, Django llama (tras el commit, por la red interna) a
`http://frontend:3000/api/revalidar` con `REVALIDATE_SECRET`, y Next caduca esa etiqueta.
Si la llamada falla, la publicación **no** se deshace: se registra un aviso en el log.

## Fotos y vídeos

En el repo de Miriam, `public/` ocupa 797 MB con 2.636 archivos. Comparando cada ruta con el
código fuente:

| Grupo | Archivos | Peso | Qué se ha hecho |
|---|---|---|---|
| Los usa el **código** (logos, banderas, fotos fijas de componentes, respaldos del mapa) | 100 | ~54 MB | Se quedan en `Frontend/public/`, versionados |
| Los usa el **contenido editable** (`src/datos/`) | 1.494 | ~430 MB | Al almacén de medios del backend |
| **No los usa nadie** (originales, colecciones y looks retirados, duplicados) | 1.076 | ~362 MB | No se traen. Siguen en el repo de Miriam |

Las del contenido conservan **su ruta y su nombre SEO**, debajo de `web/`:

```
Frontend/public/img/landing/x.webp   →   MEDIA_ROOT/web/img/landing/x.webp
                                          URL: /media/web/img/landing/x.webp
```

No se renombran ni se recomprimen (ya son WebP de ≤2560 px con nombres indexados). Cada una
tiene su fila `MediaAsset` con miniatura, ancho y alto, así que salen en la biblioteca del
panel y se pueden reutilizar. **Los archivos no van en git**: `backend/media/` está ignorado.
Se traen del repo de Miriam con `importar_medios_web` (ver más abajo).

Las subidas nuevas desde el panel irán a la misma biblioteca. La base de datos guarda la
**URL** (dentro del JSON) y la fila `MediaAsset`; el archivo está en disco, en el volumen
`media_data`. En la base de datos no se guarda nunca el binario.

**No se puede borrar una foto que sale en la web:** `MediaAsset.usages()` busca su URL
dentro de los documentos y el `DELETE` responde 409 diciendo en cuál está.

### Cargarlo todo (desarrollo y servidor)

```bash
# 1. Contenido: crea los 19 documentos desde apps/content/seed/contenido.json.
#    Sin --sobrescribir no toca los que ya existen.
docker compose exec backend python manage.py cargar_contenido

# 2. Fotos: copia desde el repo de Miriam las que falten y las registra.
git clone https://github.com/mreinab/felycampo.git ../felycampo-miriam
git -C ../felycampo-miriam checkout e556a76
docker compose run --rm -v "$PWD/../felycampo-miriam/public:/origen:ro" \
  backend python manage.py importar_medios_web --origen /origen
```

Los dos son idempotentes. En el servidor se hace igual, con `-f docker-compose.prod.yml`.
Ahí `MEDIA_ROOT` es el volumen `media_data`, así que las fotos quedan en el volumen.

Si se cambia algo en `Frontend/src/datos/` antes de que la web lea de la API, hay que
regenerar la semilla:

```bash
cd Frontend && node scripts/exportar-contenido.mjs ../backend/apps/content/seed/contenido.json
```

## Estado

**Hecho (2026-11-08):**

- [x] Frontend de Miriam importado y funcionando en Docker: 250 páginas en español
      revisadas, 1.152 fotos y vídeos distintos, ninguno roto.
- [x] Fotos separadas (código / contenido / sin usar) y las del contenido en el almacén de
      medios, con su `MediaAsset`.
- [x] `apps.content`: modelo, API pública y de panel, versiones con 409, revisiones,
      aviso de revalidación, `cargar_contenido`, `importar_medios_web`. 19 tests.
- [x] Caddy: `/api/v1/*` a Django y el resto de `/api/*` a Next.
- [x] Variables: `REVALIDATE_SECRET` una sola vez en el `.env` de la raíz; NEXT_PUBLIC_*
      de Miriam como build args; `Frontend/.env.prod` para Resend.

**Hecho (2026-11-08, segunda parte):**

- [x] **Login del panel y prelanzamiento**: `/acceso`, cookie de equipo firmada y proxy.
      Detalle en `CLAUDE.md` («Acceso del equipo y prelanzamiento»).
- [x] **Rendimiento** (Lighthouse móvil, réplica local de producción tras Caddy):

      | Página | Peso antes → después | LCP antes → después |
      |---|---|---|
      | `/es` | 4,0 MB → 1,0 MB | 12,8 s → ~5 s |
      | `/es/atelier/fiesta` | 18,3 MB → 0,9 MB | 15,6 s → 4,0 s |
      | `/es/atelier/vosotras` | 12,0 MB → 2,1 MB | 11,6 s → 6,7 s |
      | `/es/sobre-fely` | 3,2 MB → 0,8 MB | 10,1 s → 3,7 s |
      | ficha de look | 7,6 MB → 1,1 MB | 13,4 s → 3,5 s |

      Cómo: páginas estáticas (sin `headers()` en el layout + `setRequestLocale`),
      versiones de 480/960/1600 px de cada foto con `srcset`, carga diferida de imágenes
      y vídeos, fuentes con `next/font`, caché de `/media` e `/img`, y sin el carrito de
      ejemplo de la tienda (descargaba ~700 KB en cada página).
- [x] Errores: el build de Miriam no compilaba; zona horaria de next-intl; contraste de
      Vosotras; orden de encabezados del pie. Recorrido con navegador real por 134 páginas
      públicas: **0 errores de consola, JS o red**.

**Pendiente, en este orden:**

1. **La web lee de la API.** Las `obtener…()` de `src/lib/` pasan a ser `async` y hacen
   `fetch` a `API_INTERNAL_URL` con su etiqueta. Hay que hacer dos cosas con cuidado:
   - Los componentes de cliente que leen datos (Navbar, `NewsletterModal`,
     `CabeceraPagina`, `MapaPuntosVenta`, `GaleriaVosotras`, `ListadoUbicaciones`,
     `ModalSolicitudAtelier`, el formulario de cita) tienen que recibirlos por props desde
     el servidor.
   - Las peticiones del servidor tienen que llevar `X-Forwarded-Proto: https`. Sin esa
     cabecera, `SECURE_SSL_REDIRECT` responde 301 a `https://backend:8000` y cada llamada
     se queda colgada (ver `DESPLIEGUE.md`, «La home tardaba 20 segundos»). El cliente
     antiguo que la ponía (`src/lib/api/client.js`) se fue con la tienda.
   - En el build de Docker no hay backend: las páginas no pueden pedir datos en tiempo de
     build. Tienen que renderizarse en la primera visita y quedarse en caché.
2. **El panel publica.** Las acciones `guardar`, `alternar`, `borrar` y `reordenar` de
   los proveedores (`Paginas.jsx`, `AtelierFiesta.jsx`, `Blog.jsx`…) hacen `PUT` con la
   versión y tratan el 409.
3. **Subida de fotos y vídeos.** Hoy el panel deja una URL `blob:`. Hay que subir el
   archivo a `/api/v1/admin/media/` y guardar la URL definitiva. Además:
   - nombres SEO en vez de UUID (`media_upload_path`);
   - límite de vídeo en el servidor (15 MB en escritorio, 8 MB en móvil) y, si se puede,
     recompresión con ffmpeg;
   - normalizar la «ñ» a NFC.
4. **Citas y consultas.** Modelos en `apps.appointments`. `/api/cita` y
   `/api/consulta-vestido` siguen mandando el email con Resend y además las guardan.
   Las bandejas `/admin/consultas` y `/admin/consultas-precio` dejan de usar los mocks.
5. **Newsletter.** Primero se guarda en la base de datos y sale en `/admin/newsletter`.
   Después se reenvía a Substack (`Frontend/docs/ADMIN.md` §5).
6. **Retirar `Frontend/src/datos/`** cuando todo lea de la API: la semilla ya vive en
   `backend/apps/content/seed/contenido.json`.
7. **Prêt-à-porter** sigue con un LCP alto (~9 s en móvil simulado): la cinta de arriba
   (`CarruselInfinito`) carga de golpe 26 recortes de pasarela (~2,7 MB). Necesita menos
   fotos o un ancho reservado por foto, y eso es decisión de diseño.
8. Las secciones ocultas de la tienda en el panel (`/admin/diseno`, `/admin/productos`,
   `/admin/resenas`) piden fotos de ejemplo que no existen. No afecta a nada visible.
