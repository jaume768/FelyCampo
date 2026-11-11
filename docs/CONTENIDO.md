# Contenido editable: base de datos, fotos, panel y formularios

**Fecha: 2026-11-09.** Cómo funciona la web de Miriam ahora que todo sale de la base de
datos y se edita desde el panel. Sustituye a `docs/CONTRATO.md` (el contrato de la tienda
online, aparcada).

## Resumen

| Qué | Dónde se guarda | Se edita en | La web lo lee |
|---|---|---|---|
| Textos, fotos y vídeos de todas las páginas, colecciones, looks, blog, Vosotras, ateliers, puntos de venta, contacto, textos de Google | `apps.content.Document` (19 documentos JSON) | Panel `/admin` | De la API, con caché; se actualiza al publicar |
| Archivos de fotos y vídeos | Disco (volumen `media_data`) + fila `apps.media.MediaAsset` | Se suben desde el panel al publicar | `/media/…` (Caddy) |
| Citas | `apps.appointments.Cita` | Bandeja `/admin/consultas` | — |
| Consultas de vestidos | `apps.appointments.ConsultaVestido` | Bandeja `/admin/consultas-precio` | — |
| Suscriptoras de la newsletter | `apps.appointments.Suscriptor` | `/admin/newsletter` (+ CSV) | — |

`Frontend/src/datos/` **ya no existe**. Era el «sustituto provisional de la base de datos»
de Miriam y su contenido es ahora la semilla, `backend/apps/content/seed/contenido.json`.
Sigue disponible en su repo, commit `e556a76`.

## De dónde sale el frontend

`Frontend/` es una **copia del repo de Miriam en el commit
[`e556a76`](https://github.com/mreinab/felycampo/commit/e556a76)** (2026-11-07). Se trajo el
árbol, no el historial. Su `Frontend/docs/ADMIN.md` sigue explicando cómo está hecho el
panel; el «§4 Conectar la base de datos» ya está hecho como se describe aquí.

## Contenido: un documento JSON por sección

19 documentos, cada uno con la forma exacta de lo que era su export de `src/datos/`:

`landing`, `piezas-comunes`, `seo-textos`, `sobre-fely`, `talleres`, `contacto`,
`cabeceras`, `sedes`, `puntos-venta`, `vosotras`, `articulos`, `episodios`,
`editorial-novias`, `editorial-fiesta`, `editorial-pret-a-porter`, `colecciones-fiesta`,
`colecciones-novias`, `colecciones-runway`, `productos-pret-a-porter`.

La lista es cerrada: está en `backend/apps/content/registry.py`.

**Por qué documentos y no tablas:** el panel de Miriam edita cada sección entera y la publica
de una vez, y toda su lógica (orden, slugs, `slugsAnteriores`, visibilidad) está escrita
sobre esa forma en `Frontend/src/lib/`. Las citas, consultas y suscriptoras sí son
registros y van en tablas.

### API

| Método | Ruta | Quién | Qué |
|---|---|---|---|
| GET | `/api/v1/content/` | público | Los 19 documentos, `{clave: datos}` (lo usa la web) |
| GET | `/api/v1/content/<clave>/` | público | Uno |
| GET | `/api/v1/admin/content/?con_datos=1` | staff | Los 19 con versión (lo usa el panel al abrirse) |
| PUT | `/api/v1/admin/content/<clave>/` | staff | `{data, version}` → publica, o **409 `version_conflict`** |
| GET | `/api/v1/admin/content/<clave>/revisions/[<n>/]` | staff | Historial (50 últimas) |

El documento público va **entero, con lo oculto incluido**: lo filtra la web. Oculto significa
«no se enseña», no «secreto».

## Cómo lee la web (`Frontend/src/lib/contenido*.js`)

- **`src/lib/contenido.js`** es un almacén en memoria. Las funciones `obtener…()` de
  `src/lib/` (las de Miriam) siguen siendo síncronas y leen de ahí. Así las ~40 pantallas
  y componentes que las llaman no han cambiado.
- **`cargarContenido()`** (`contenidoServidor.js`) pide `GET /api/v1/content/` **una vez
  por petición** y lo guarda en la caché de datos de Next con la etiqueta `contenido`.
  **Toda página, layout y `generateMetadata`** lo espera justo después de
  `setRequestLocale(locale)`. También el sitemap y `/acceso`.
- **`<ContenidoCliente claves={…}>`** pasa al navegador solo los documentos que necesitan
  sus componentes de cliente:
  - el layout: `piezas-comunes`, `contacto`, `cabeceras` y `sedes`;
  - `/atelier/vosotras`: `vosotras`;
  - el mapa de Visítanos y de Puntos de venta: `puntos-venta`.

  Si un componente de cliente pide un documento que no le ha llegado, `contenido()` lanza
  un error con la clave. Es la pista de qué añadir.
- **Nada de leer contenido al importar un módulo.** El contenido llega después. Lo que antes
  eran constantes (`tiendaProductos`, `fiestaProductos`, los submenús del Navbar,
  `vosotrasFotos`…) son ahora funciones memorizadas con `derivado()`.
- **Las páginas no se generan en el build**, porque en el build de Docker no hay API
  (`generateStaticParams` devuelve `[]` en `app/[locale]/layout.js`). Cada una se genera en
  su primera visita y queda **estática en caché** hasta que se publica algo.
- Las que leen la URL (`?previa=`, `?coleccion=`) llevan `dynamic = 'force-dynamic'`:
  `/atelier/fiesta`, las fichas de looks y prendas, los artículos y Runway. Sin eso fallan
  en producción con `DYNAMIC_SERVER_USAGE`. Siguen siendo rápidas: el contenido sale de
  la caché de datos.

### Publicar al momento

Django, tras guardar, llama por la red interna a `http://frontend:3000/api/revalidar` con
`REVALIDATE_SECRET` y las etiquetas `contenido` y `contenido:<clave>`. Next caduca la caché,
y la siguiente visita a cualquier página la regenera con lo nuevo. Si la llamada falla, la
publicación no se deshace: queda un aviso en el log.

Comprobado en un build de producción: la página en caché sigue sirviendo lo anterior hasta
el aviso, y a partir de ahí sirve lo nuevo.

## Cómo publica el panel (`components/admin/ContenidoAdmin.jsx`)

- Al abrir el panel se cargan los 19 documentos con su versión. Hasta entonces se ve
  «Cargando el contenido de la web…».
- Cada proveedor de sección usa **`useDocumentoAdmin(clave)`**, que se usa igual que
  `useState`: `const [datos, setDatos] = useDocumentoAdmin('articulos')`. Cada `setDatos`
  hace lo siguiente:
  1. aplica el cambio al momento en pantalla;
  2. **sube las fotos y vídeos nuevos** (las URL `blob:` del navegador) a
     `/api/v1/admin/media/` con nombre SEO (`fely-campo-<clave>-<8 hex>.webp`) y las
     sustituye por su ruta `/media/library/…`;
  3. hace un `PUT` con la versión cargada.

  Los cambios de un documento van en cola, de uno en uno. Mientras hay alguno pendiente se
  ve «Guardando…» y el navegador avisa si se intenta cerrar la pestaña.
- **Si otra persona publicó entretanto (409)** o falla algo, se avisa, se descarta lo
  pendiente de ese documento y se carga lo publicado. El editor conserva su borrador:
  basta revisarlo y volver a publicar. Nadie pisa el trabajo de otra persona sin enterarse.
- `Paginas.jsx` sitúa cada página del panel dentro de su documento. Las cabeceras y los
  tres ateliers comparten documento (`cabeceras`, `sedes`), así que dos personas editando
  ateliers distintos a la vez pueden recibir un aviso de conflicto aunque no se pisen.
  Basta con volver a publicar.

## Fotos y vídeos

- **Las del contenido** (1.494, ~430 MB) están en el almacén de medios con su ruta y su
  nombre SEO de siempre: `/media/web/img/…`. **No van en git**: se traen del repo de Miriam
  con `importar_medios_web`.
- **Las que usa el código** (logos, banderas…; ~54 MB) siguen en `Frontend/public/`.
- **Las subidas desde el panel** van a `/media/library/{image,video}/…`:
  - imágenes: convertidas a WebP de ≤2560 px, sin EXIF y con miniatura;
  - vídeos: tal cual, con un **máximo de 15 MB** en el servidor.
- **Cada imagen tiene versiones de 480, 960 y 1600 px** (`foto.w960.webp`). La web
  construye el `srcset` con `atributosImagen()` (`src/lib/imagenes.js`).
- **No se puede borrar una foto que sale en la web:** la biblioteca responde 409 diciendo en
  qué documento está.

### Cargarlo todo (desarrollo y servidor)

```bash
# 1. Contenido: crea los 19 documentos desde apps/content/seed/contenido.json.
#    Sin --sobrescribir no toca los que ya existen (lo editado en el panel se respeta).
docker compose exec backend python manage.py cargar_contenido

# 2. Fotos: copia desde el repo de Miriam las que falten, las registra y genera sus versiones.
git clone https://github.com/mreinab/felycampo.git ../felycampo-miriam
git -C ../felycampo-miriam checkout e556a76
docker compose run --rm -v "$PWD/../felycampo-miriam/public:/origen:ro" \
  backend python manage.py importar_medios_web --origen /origen
```

Los dos son idempotentes. En el servidor se hace igual, con `-f docker-compose.prod.yml`.

## Formularios

| Formulario | Ruta de Next | Guarda en | Email (Resend) |
|---|---|---|---|
| Pedir cita | `/api/cita` | `Cita` | Al equipo y a la clienta |
| Contacta con nosotros (fichas) | `/api/consulta-vestido` | `ConsultaVestido` | Al equipo y a la clienta |
| Newsletter (pie, ventana y «Muy pronto») | `/api/newsletter` | `Suscriptor` | — (se reenvía a Substack) |

- **Next valida, guarda y después envía los emails.** Guarda llamando a Django por la red
  interna (`/api/v1/formularios/…`) con `REVALIDATE_SECRET`, que hace de secreto compartido
  entre los dos servicios, y la IP de la visitante (`src/lib/backendInterno.js`).
- **El límite de ritmo es por visitante**: 10 envíos por hora en cita y consulta, 20 en
  newsletter. Si se supera, no se envía nada (429).
- **Si falla el email al equipo pero la solicitud está guardada**, la clienta ve el
  «gracias» igualmente: el equipo la tiene en la bandeja.
- **En las bandejas** el equipo cambia el estado (Pendiente → Contactada → Cita confirmada →
  Cerrada), la asignación (citas) y las notas internas. Cada cambio de estado queda en el
  historial con la fecha del servidor y quién lo hizo. Los datos de la clienta no se pueden
  modificar.
- La newsletter guarda la lista propia (CSV desde el panel) y **después reenvía cada email
  a Substack** (`SUBSTACK_URL`, `POST /api/v1/free`, sin credenciales). Ese endpoint no es
  oficial: si falla, se ve en el log (`[newsletter] Substack …`) y la suscripción sigue en
  el panel para importarla con el CSV. Se suscribe desde el pie, la ventana de la home y la
  pantalla «Muy pronto» del prelanzamiento (origen `proximamente`).

## Estado (2026-11-09)

**Comprobado en el navegador, de punta a punta:**
- **Página de inicio:** cambiar la frase y la foto en el panel → se guarda (v1 → v2), la
  foto se sube con nombre SEO y versión de 480 px → la web pública lo enseña.
- **Listados:** ocultar y volver a mostrar un artículo del Blog y una colección de Fiesta →
  se guarda y la web deja de enseñarlo. Al recargar el panel, lo publicado sigue ahí.
- **Formularios y bandejas:** una cita, una consulta y una suscripción enviadas desde la
  web aparecen en sus bandejas; cambiar estado, asignación y notas se guarda con
  historial, y la lista de la newsletter sale en CSV.
- **Build de producción** sin API disponible (como en Docker): compila. En ejecución, 134
  páginas sin errores de consola, de JS ni de red, y la caché se invalida al publicar.
- **Backend:** 334 tests.

**Pendiente:**
1. ~~Substack~~ conectado (no oficial; ver arriba).
2. **Vídeos:** se guardan tal cual (máx. 15 MB). Recomprimirlos en el servidor necesitaría
   ffmpeg en la imagen del backend.
3. **Vista previa entre dispositivos:** el borrador de la vista previa sigue en el
   `localStorage` del navegador que edita (como lo dejó Miriam).
4. **Prêt-à-porter** sigue con un LCP alto (~9 s en móvil simulado): la cinta de arriba
   carga 26 recortes de pasarela. Es decisión de diseño.
5. Las secciones ocultas de la tienda en el panel (pedidos, productos, reseñas, diseño…)
   siguen con datos de ejemplo. Son de la tienda aparcada y no se conectan.
