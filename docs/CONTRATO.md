# Contrato frontend ↔ backend — estado real

**Fecha del inventario: 2026-09-08.** Este documento sustituye a `backend/INTEGRACION.md`,
que describe un frontend que no existe.

Todo lo de aquí está verificado contra el código en disco, no contra documentación previa:

- Esquema OpenAPI regenerado del backend en marcha
  (`curl http://localhost:8001/api/v1/schema/ -o backend/schema.yml`) — 228 KB, **40 rutas
  `/api/v1/admin/*`**. El anterior era de antes de las fases 2-3 y no traía ni una.
- Rutas del frontend listadas con `find src/app -name page.js` (38 públicas + 33 admin).
- **`grep -rE '\bfetch\(|axios|XMLHttpRequest' src/` → 0 resultados.** El frontend hoy no
  hace ni una llamada de red. Todo son datos estáticos importados en tiempo de build.

## Lo que la documentación vieja daba por existente y NO existe

Comprobado uno a uno con `find`:

| Lo que dice `INTEGRACION.md` / `CLAUDE.md` | Realidad |
|---|---|
| `src/lib/api/` (client.js, cart.js, catalog.js…) | **No existe.** `src/lib/` tiene 3 archivos: `atelierCategoriaSeo.js`, `precio.js`, `slugify.js`. Quedan `src/lib/api/` y `src/lib/adapters/` como directorios **vacíos** (residuo de un `git clean`; sin un solo archivo dentro). |
| `docs/integracion.md` | No existe. `docs/` del frontend tiene `adminpanel.md` y `design.md`. |
| `CarritoPageContent.jsx` | No existe. |
| `FichaProductoInteractiva.jsx` | No existe. |
| `NavbarMiniCarrito.jsx` | No existe. El carrito del Navbar es `CarritoPanel.jsx`. |
| Rutas `/pret-a-porter/*` | No existen. La tienda vive en **`/tienda/*`**. (`pret-a-porter` solo aparece como ruta del panel: `/admin/productos/pret-a-porter`.) |
| Rutas `/visitenos/*` | No existen. Son **`/visita-fely-campo/*`**. |
| `/about` | No existe. Es **`/sobre-fely`**. |

**Decidido:** las rutas actuales (`/tienda`, `/visita-fely-campo`, `/sobre-fely`) son las
definitivas y **no hacen falta redirecciones** desde las viejas — nunca estuvieron en
producción.

---

## Tabla A — Rutas públicas reales

Origen de datos hoy · endpoint que la serviría · estado.

| Ruta (`src/app/[locale]/…`) | Datos hoy | Endpoint que la serviría | ¿Existe? |
|---|---|---|---|
| `/` | hardcoded en `page.js` + `productosEjemplo` vía componentes | `catalog/products/?line=pret_a_porter` | ⚠️ sí, con desajuste de forma (D-2) |
| `/tienda` | `productosEjemplo` (24 objetos generados) | `GET /api/v1/catalog/products/` | ⚠️ sí, desajuste (D-2) |
| `/tienda/vestidos`, `/faldas`, `/tops-y-camisetas`, `/chaquetas-y-abrigos`, `/zapatos`, `/accesorios` | `productosEjemplo` filtrado en cliente | `catalog/products/?category=<slug>` | ⚠️ sí; las 6 categorías del menú no están sembradas como `Category` en BD |
| `/tienda/[producto]` | `productosEjemplo` buscando por slug del nombre | `GET /api/v1/catalog/products/{slug}/` | ⚠️ sí, desajuste (D-2) |
| `/tienda/[producto]` (reseñas) | `RESENAS_EJEMPLO` | — | ❌ **no existe modelo `Review`** (C-1) |
| `/atelier` | hardcoded | `catalog/products/?line=atelier` | ✅ |
| `/atelier/novias`, `/atelier/fiesta` | `productosEjemplo` | `catalog/products/?line=atelier&collection=…` | ⚠️ ver B-2 / decisión "novia y fiesta" |
| `/atelier/{novias,fiesta}/[producto]` | `productosEjemplo` | `catalog/products/{slug}/` | ⚠️ desajuste (D-2) |
| `/atelier/{novias,fiesta}/categoria/[categoria]` | `productosEjemplo` + `atelierCategoriaSeo.js` | `catalog/products/?category=` | ⚠️ categorías no sembradas |
| `/atelier/vosotras` | hardcoded (galería) | — | ❌ sin modelo (C-2) |
| `/archivo/runway` | `archivo/runway/colecciones.js` (`COLECCIONES`) | `catalog/collections/` — **solo existe en admin**, no público | ⚠️ falta endpoint público |
| `/archivo/runway/[coleccion]` | `COLECCIONES` (looks) | — | ❌ **no existe modelo `Look`** (C-3) |
| `/blog` | hardcoded | — | ❌ sin modelo (C-4) |
| `/carrito` | `CarritoContext` (localStorage) | `GET/POST /api/v1/cart/` | ⚠️ desajuste grave (D-1) |
| `/checkout` | *(directorio sin `page.js` — ruta no existe)* | `POST /api/v1/checkout/` | — |
| `/wishlist` | `productosEjemplo` | `GET /api/v1/account/favorites/` | ⚠️ desajuste (D-3) |
| `/mi-cuenta/panel` | `MiCuentaContext` + `productosEjemplo` | `account/me/`, `orders/`, `account/addresses/` | ✅ endpoints existen |
| `/visita-fely-campo` (+ `/madrid`, `/oviedo`, `/salamanca`) | `visita-fely-campo/ubicaciones.js` | — | ❌ `apps/appointments/models.py` está **vacío** (1 línea) (C-5) |
| `/visita-fely-campo/cita` | hardcoded (formulario sin envío) | — | ❌ sin modelo `Appointment` (C-5) |
| `/sobre-fely`, `/sobre-fely/talleres` | hardcoded | — | ❌ `apps/content/models.py` **vacío** (C-6) |
| `/about` | hardcoded (duplica `/sobre-fely`) | — | ❌ ídem |
| `/responsabilidad` | hardcoded | — | ❌ ídem |
| `/ayuda/atencion-cliente` | hardcoded | — | ❌ ídem |
| `/legal/{aviso-legal,cookies,privacidad,terminos}` | hardcoded | — | ❌ ídem (contenido estático; puede quedarse así) |

---

## Tabla B — Panel `/admin/*` contra los ViewSets reales

ViewSets verificados en `apps/catalog/admin_urls.py`, `apps/orders/admin_urls.py`,
`apps/stock/urls.py`, `apps/media/urls.py`, `apps/adminapi/urls.py`.

| Ruta del panel | Datos hoy | Endpoint admin real | ¿Existe? |
|---|---|---|---|
| `/admin` (dashboard) | `mockData` | — | ❌ sin endpoint de resumen |
| `/admin/productos` | hardcoded en `page.js` | `/api/v1/admin/products/` (`AdminProductViewSet`) | ✅ |
| `/admin/productos/pret-a-porter`, `/atelier` | `productosMock` | `admin/products/?line=` | ✅ |
| `/admin/productos/[id]`, `/[id]/editar` | `productosMock` | `admin/products/{id}/` | ✅ |
| `/admin/categorias` | `tiposProducto`, `categoriasMock` | `admin/categories/`, `admin/families/` | ✅ |
| `/admin/colecciones/{runway,novia,fiesta}` | `categoriasMock` (con `looks[]`) | `admin/collections/` | ⚠️ `Collection` existe; **`Look` no** (C-3) |
| `/admin/materiales`, `/materiales/tejidos` | hardcoded / `telasMock` | `admin/fabrics/` | ✅ |
| `/admin/materiales/colores` | `coloresMock`, `familiasColorMock` | `admin/colors/` | ⚠️ existe `Color`; **no hay modelo de familia de color** |
| `/admin/stock` | `filasStock()`, `nivelStock()` | `admin/stock/variants/`, `/movements/`, `/locations/` (+ `adjust/`, `set/`) | ✅ |
| `/admin/pedidos`, `/pedidos/[id]` | `pedidosMock` | `admin/orders/`, `{id}/status/`, `{id}/history/`, `{id}/notes/` | ✅ |
| `/admin/clientes`, `/clientes/[id]` | `clientesMock` | — | ❌ no hay ViewSet admin de usuarios |
| `/admin/resenas` | `resenasMock` | — | ❌ sin modelo `Review` (C-1) |
| `/admin/blog`, `/blog/nueva`, `/blog/[id]/editar` | `blogMock` | — | ❌ sin modelo (C-4) |
| `/admin/consultas`, `/consultas/[id]` | `consultasMock` | — | ⚠️ existe `ProductEnquiryView` (público, solo envía correo); **no persiste ni se lista** |
| `/admin/consultas-precio`, `/[id]` | `consultasPrecioMock` | — | ⚠️ ídem |
| `/admin/newsletter` | `newsletterMock` | — | ❌ sin modelo |
| `/admin/metricas`, `/metricas/kpi` | `kpisAnaliticas`, `metricasMensualesMock` | — | ❌ sin endpoints de analítica |
| `/admin/settings` | `ajustesTiendaMock` | — | ❌ sin modelo de ajustes |
| `/admin/diseno` | `disenoMock`, `paginasInternas`, `bancoImagenes`, `bancoVideos` | `admin/media/` cubre el banco de medios | ⚠️ parcial: sin modelo para el layout de la home |
| *(login)* | — | `GET /api/v1/admin/me/` (`AdminMeView`) | ✅ |

**Devoluciones** (`admin/returns/` + `accept/`, `reject/`, `mark-refunded/`) existen en el
backend y **el panel no tiene ninguna pantalla** para ellas.

---

## Tabla C — El frontend enseña algo y el backend no tiene ni modelo

| # | Qué muestra el frontend | Dónde | Falta en backend |
|---|---|---|---|
| C-1 | Reseñas de clientes (estrellas, texto, autor) y su moderación | `/tienda/[producto]`, `/admin/resenas`, `ResenasClientes.jsx` | Modelo `Review`, endpoints públicos (listar/crear) y admin (moderar) |
| C-2 | Galería "Vosotras" (fotos de clientas) | `/atelier/vosotras`, `GaleriaVosotras.jsx` | Modelo propio o reutilizar `MediaAsset` con una colección editorial |
| C-3 | **Looks** de una colección de pasarela | `/archivo/runway/[coleccion]`, `/admin/colecciones/*`, `FormularioLook.jsx` | Modelo `Look`. **Decidido:** entidad propia (foto de pasarela, orden dentro de la colección, enlace opcional a `Product`). No es un `Product` ni una simple imagen de `Collection` |
| C-4 | Blog (listado + editor) | `/blog`, `/admin/blog/*` | Modelo `Post` + endpoints |
| C-5 | Ubicaciones de tienda y reserva de cita | `/visita-fely-campo/*` | `apps/appointments/models.py` está **vacío**. Falta `Location`/`Appointment` (la integración con Calendly ya existe en `apps/integrations/calendly.py`, sin modelo detrás) |
| C-6 | Páginas de contenido editable (sobre nosotros, talleres, responsabilidad, ayuda) | `/sobre-fely`, `/responsabilidad`, `/ayuda/*` | `apps/content/models.py` está **vacío** |
| C-7 | Clientes en el panel | `/admin/clientes` | Existe `accounts.User`, pero **no hay ViewSet admin** que lo exponga |
| C-8 | Métricas / KPI | `/admin/metricas/*` | Sin endpoints de analítica |
| C-9 | Ajustes de tienda | `/admin/settings` | Sin modelo de configuración |
| C-10 | Newsletter | `/admin/newsletter` | Sin modelo de suscriptores |
| C-11 | Familias de color | `/admin/materiales/colores` | Existe `Color`; falta el agrupador `familiasColorMock` |
| C-12 | Consultas (producto y precio) listadas y gestionadas | `/admin/consultas*` | `ProductEnquiryView` envía correo y **no guarda nada**: no hay tabla que listar |

---

## Tabla D — Desajustes de forma (ambos lados existen, pero no encajan)

### D-1 — Identidad de línea de carrito: `nombre__talla__color` vs `variant` (UUID)

**Hoy** (`src/context/CarritoContext.jsx:24-26`):

```js
function idLinea({ nombre, talla, color }) {
  return [nombre, talla, color].filter(Boolean).join('__');
}
```

El carrito vive **entero en `localStorage`** bajo la clave `fely-campo-carrito`, sin
backend. El propio archivo lo dice en su cabecera: *"sin backend real todavía"*.

**El backend** (`apps/orders/models.py:74`) usa `CartItem.variant` → FK a
`catalog.Variant` (UUID), con `UniqueConstraint(cart, variant)`. El carrito de invitado se
identifica con la cabecera **`X-Cart-Id`** (declarada en `CORS_ALLOW_HEADERS`), no con
localStorage. El precio **no se guarda en la línea**: se relee de la variante viva en cada
consulta (`CartItem.unit_price_net`).

Esto no es un cambio de campo: es cambiar de *"el carrito es una lista de strings en el
navegador"* a *"el carrito es un recurso del servidor y las líneas apuntan a variantes con
stock"*. Implicaciones:

- Hace falta que el frontend **conozca la variante** (`producto × color × talla` → UUID).
  Hoy no la conoce: `productosEjemplo` solo tiene `nombre`, `tallas[]`, `colores[]`, sin
  identificadores.
- `agregar()` pasa a ser asíncrono y puede fallar (sin stock, variante inactiva) — hoy es
  síncrono e infalible.
- El subtotal deja de calcularse en el cliente: lo da la API.
- Cambiar la talla desde `/carrito` deja de ser una edición de campo (`actualizarTalla`) y
  pasa a ser borrar una línea y crear otra: es **otra variante**.

**Componentes que se rompen al cambiarlo** (lista completa, verificada con grep):

| Archivo | Qué usa | Qué rompe |
|---|---|---|
| `src/context/CarritoContext.jsx` | todo | Reescritura completa: `idLinea`, localStorage, estado síncrono |
| `src/app/[locale]/layout.js` | monta `<CarritoProvider>` | Provider con otro contrato (estados de carga/error) |
| `src/components/ecommerce/FichaProductoAcciones.jsx:45` | `agregar({nombre, precio, imagen, talla, color, colorHex, tallasDisponibles})` | Debe pasar `variant` (UUID) + `quantity`; ahora puede fallar → necesita estados de carga y error |
| `src/app/[locale]/carrito/page.js:32` | `lineas, cantidadTotal, subtotal, quitar, actualizarCantidad, actualizarTalla` | `subtotal` viene de la API; `actualizarTalla` deja de existir tal cual; `linea.id` pasa a ser el UUID del `CartItem` |
| `src/components/ecommerce/CarritoPanel.jsx:22` | `lineas, panelAbierto, cerrarPanel, quitar, actualizarCantidad` | `linea.id` cambia de significado; operaciones asíncronas |
| `src/components/ecommerce/LineaCarrito.jsx` | props `precio` (string ya formateado), `talla`, `color` | El precio llega como decimal (ver D-2); el selector de talla cambia de semántica |
| `src/components/ecommerce/TarjetaCarrito.jsx` | ídem | ídem |
| `src/components/layout/Navbar/Navbar.jsx:95` | `cantidadTotal` | Deja de ser instantáneo: hay un estado "cargando carrito" en el primer render |
| `src/app/[locale]/wishlist/page.js` | `useCarrito` (añadir al carrito desde la wishlist) | Mismo cambio que la ficha de producto |

**Agravante independiente del carrito:** el sitio navega con `<a href>` normales, nunca
`next/link` (comentado en `CarritoContext.jsx:33-38`). Cada clic es una recarga completa.
Por eso el localStorage era imprescindible. Con carrito en servidor esto deja de ser un
problema de estado, pero **cada página vuelve a pedir el carrito a la API**.

### D-2 — Precio: string ya formateado vs decimal neto + `*_gross`

**Hoy** (`src/lib/precio.js`):

```js
export function parsearPrecio(precio) {
  if (!precio) return 0;
  return parseInt(String(precio).replace(/[^\d]/g, ''), 10) || 0;   // "1.050 €" → 1050
}
export function formatearPrecio(numero) {
  return `${Math.round(numero).toLocaleString('es-ES')} €`;
}
```

Los precios del catálogo son **strings con formato español ya aplicado**: `'990 €'`,
`'1.050 €'` (`productosEjemplo.js`, constante `PRECIOS`). Sin decimales: `parseInt` sobre
los dígitos. **`"1.050 €"` se lee como 1050, no como 1,05** — el punto es separador de
miles, y cualquier céntimo que llegara se perdería silenciosamente.

**El backend** guarda decimales **netos** (sin IVA) y la API añade los campos `*_gross`
con el 21 % ya aplicado (`apps/catalog/serializers.py:110-121`):
`price_gross`, `sale_price_gross`, `effective_price_gross` — y en pedidos,
`unit_price_gross`, `line_gross`. Salen como **string decimal**: `"181.50"`.

Choques concretos:

1. `parsearPrecio("181.50")` → **18150**. El punto decimal se traga como separador de
   miles. Es un fallo silencioso de factor 100, no un error visible.
2. **El frontend nunca debe recalcular el IVA**: se consume `*_gross` tal cual. Hoy no hay
   ninguna noción de IVA en el frontend, lo cual es correcto — pero también significa que
   los precios actuales no distinguen neto de bruto.
3. `formatearPrecio` redondea a entero (`Math.round`). Con céntimos reales hay que pasar a
   `Intl.NumberFormat('es-ES', {style:'currency', currency:'EUR'})`.
4. Falta **precio rebajado**: `TarjetaProducto` acepta `precioRebajado`, y el backend tiene
   `sale_price` / `sale_price_gross` / `effective_price`. Nadie los conecta.

**Componentes afectados:**

| Archivo | Qué hace |
|---|---|
| `src/lib/precio.js` | Las dos funciones se sustituyen por formateo de decimales |
| `src/components/layout/CuadriculaProductos.jsx:25` | Tiene su **propia copia** de `parsearPrecio` (línea 25) para el filtro de precio y los ordenamientos `precioAsc`/`precioDesc` (líneas 171, 213, 217-218). Hay que cambiar las dos copias |
| `src/context/CarritoContext.jsx:88` | `subtotal` con `parsearPrecio` — desaparece (lo da la API) |
| `src/app/[locale]/carrito/page.js:26` | `formatearPrecio` + `parsearPrecio` para subtotal/envío/total |
| `TarjetaProducto.jsx`, `TarjetaCarrito.jsx`, `LineaCarrito.jsx`, `TarjetaWishlist.jsx`, `FichaProductoAtelier.jsx` | Reciben `precio` como **string ya formateado** y lo pintan tal cual. Pasan a recibir decimal + formatear, o a recibir el `*_gross` ya formateado por una capa común |
| `PanelFiltros.jsx` | El filtro de rango de precio opera sobre los enteros de `parsearPrecio` |

### D-3 — Wishlist: sin identidad de producto y sin sesión

`/wishlist` lee `productosEjemplo` — no hay noción de usuario ni de favorito persistido.
El backend tiene `accounts.Favorite` y `GET/POST/DELETE /api/v1/account/favorites/`, que
**exige sesión iniciada**.

**Decidido:** el invitado guarda sus favoritos en **localStorage**, y al iniciar sesión se
**fusionan** con `account/favorites/`. Sin cambios de backend; la lógica de merge vive en
el frontend. Queda por definir el criterio ante duplicados (unión, sin borrar nada del
servidor).

### D-4 — Producto sin identificador estable

Transversal a D-1, D-2 y D-3, y conviene tenerlo delante: hoy los productos **se
identifican por el slug de su nombre** (`src/lib/slugify.js`, usado en
`/tienda/[producto]`). El backend usa **UUID como PK en todo el dominio** y expone
`products/{slug}/` para el detalle público. El slug del backend es un campo propio del
modelo, no derivado del nombre en el cliente: en cuanto los datos vengan de la API, el slug
lo manda el servidor y `slugify.js` deja de generar rutas.

---

## Decisiones cerradas en esta revisión

| Pregunta | Decisión |
|---|---|
| Rutas renombradas (`/tienda`, `/visita-fely-campo`, `/sobre-fely`) | **Definitivas. Sin redirecciones** desde `/pret-a-porter`, `/visitenos`, `/about` |
| Novia y fiesta frente a `Product.line` | **Vía `Collection` dentro de `line=archive`.** No se añade campo ni se amplía `ProductLine` — confirma lo que ya dice el docstring del modelo |
| Qué es un "look" | **Entidad nueva.** Pieza editorial propia: foto de pasarela, orden dentro de la colección, enlace **opcional** al producto. No es un `Product` ni una imagen suelta de `Collection` |
| Wishlist de invitado | **localStorage + merge al iniciar sesión.** Sin wishlist de invitado en servidor |

## Sigue abierto

- Categorías del menú de tienda (`vestidos`, `faldas`, `tops-y-camisetas`,
  `chaquetas-y-abrigos`, `zapatos`, `accesorios`): no están sembradas como `Category`.
- Familias de color del panel (C-11).
- Persistencia de consultas de producto y de precio (C-12): hoy solo se envía correo.
- Devoluciones: el backend las tiene completas, el panel no tiene pantalla.
- Prioridad y orden de los modelos que faltan (Tabla C).

---

## Estado de migración a datos reales (2026-09-08)

### Ya van contra la API

| Ruta | Endpoint | Filtro |
|---|---|---|
| `/` (home, escaparate «destacados») | `catalog/products/` | `is_featured=true&ordering=featured_position` |
| `/` (bloque «por ocasión») | `catalog/products/` | `line=atelier` |
| `/tienda` | `catalog/products/` | `line=pret_a_porter` |
| `/tienda/vestidos` | `catalog/products/` | `family=vestidos` |
| `/tienda/faldas` | `catalog/products/` | `family=faldas` |
| `/tienda/tops-y-camisetas` | `catalog/products/` | `family=tops` |
| `/tienda/chaquetas-y-abrigos` | `catalog/products/` | `family=chaquetas` |
| `/tienda/zapatos` | — | **Sin `Family` en el backend**: vacío explicado |
| `/tienda/accesorios` | — | **Sin `Family` en el backend**: vacío explicado |
| `/tienda/[producto]` | `catalog/products/{slug}/` | 404 real si no existe |
| `/atelier/novias` | `catalog/products/` | `line=atelier&category=novia` |
| `/atelier/fiesta` | `catalog/products/` | `line=atelier&category=fiesta` |
| `/atelier/{novias,fiesta}/[producto]` | `catalog/products/{slug}/` | 404 real |
| `/atelier/{novias,fiesta}/categoria/[categoria]` | `catalog/products/` | `line=atelier&category=` |

Filtrado, orden y paginación **en el servidor**, con los filtros en la URL (`?talla=`,
`?orden=`, `?page=`): el enlace compartido reproduce el listado.

### Siguen con datos de ejemplo

| Ruta / bloque | Fuente | Motivo |
|---|---|---|
| `/carrito` | `CarritoContext` (localStorage) | Pendiente: carrito de servidor (D-1) |
| `/wishlist` | `productosEjemplo` | Pendiente: `account/favorites/` + merge (D-3) |
| Reseñas de la ficha | `resenasEjemplo` | **No existe modelo `Review`** (C-1) |
| `/archivo/runway/*` | `colecciones.js` | **No existe modelo `Look`** (C-3) |
| `/blog` | hardcoded | **Sin modelo** (C-4) |
| `/visita-fely-campo/*` | `ubicaciones.js` | `apps/appointments` **vacía** (C-5) |
| `/sobre-fely`, `/responsabilidad`, `/ayuda/*`, `/legal/*` | hardcoded | `apps/content` **vacía** (C-6) |
| `/mi-cuenta/panel` | `productosEjemplo` | Pendiente |
| `/atelier/vosotras` | hardcoded | **Sin modelo** (C-2) |
| Todo `/admin/*` | `mockData.js` | Pendiente |
| «Estilo y silueta» (filtro de atelier) | `estiloSiluetaGrupos.js` | **No existe ese atributo** en el backend: da título y miga de pan, no filtra |
| «Colección» del panel de filtros | listas en las páginas | Existe `Collection` pero **ninguna sembrada** para atelier |

`productosEjemplo.js` sigue en el repo: lo usan las rutas de arriba y hace de respaldo en
la home si la API no responde.

### Cambios de backend hechos para esto

- **`Product.is_featured` + `featured_position`** (migración `catalog/0004`): el escaparate
  de la home no tenía de dónde salir. Editable desde el panel y desde el Django admin,
  filtrable con `?is_featured=true`, ordenable con `?ordering=featured_position`.
- **`seed_demo`**: las piezas `on_request` ahora se siembran con `line=atelier`, que es lo
  que dice el modelo. Antes iban como `pret_a_porter` y `/atelier/*` salía vacío pese a que
  el filtro era correcto. Se añade una pieza de fiesta y se marcan cuatro destacados.

### Dos trampas encontradas al migrar, por si reaparecen

1. **`TarjetaProducto` enlazaba con `slugify(nombre)`**, no con el slug de la API. El slug
   real lleva familia y código detrás (`vestido-aria-ve-120`), así que todos los enlaces
   apuntaban a fichas inexistentes. Ahora acepta un prop `slug` opcional, y se cae a
   `slugify` solo para los datos de ejemplo.
2. **Un `loading.js` en un segmento padre rompe el 404 de sus rutas hijas.** El
   `loading.js` de `tienda/` envolvía también a `tienda/[producto]`: con la respuesta ya
   transmitiéndose, el `notFound()` de una ficha inexistente no puede cambiar el status y
   devolvía **200**. La solución es `<Suspense>` dentro de la página, que no crea límite
   para las rutas hijas. Un `error.js` de segmento tiene el mismo problema: captura también
   la excepción de `notFound()`, así que los fallos de las fichas se tratan dentro de la
   propia página.

### Decisiones tomadas el 2026-09-08 (segunda tanda)

| Tema | Decisión |
|---|---|
| Menú de Tienda | Eje = **`Family`** + tabla de mapeo en el frontend (`FAMILIA_POR_RUTA`). `zapatos` y `accesorios` no tienen `Family`: rutas vivas con vacío explicado |
| Escaparate de la home | **Campo nuevo `Product.is_featured`** (+ `featured_position`), no una `Collection` |
| `/atelier/{novias,fiesta}` | **`line=atelier` + `category`** (ambas categorías ya existían) |
| Carrito viejo en localStorage | **Descartar con aviso**, no migrar: `nombre__talla__color` no resuelve una variante real |
| Errores del carrito | **En la propia línea**, no un aviso global |
| Estados de pedido en el panel | **Los 8 reales de `Order.status`**, rehaciendo `EstadoPedidoBadge` y `EstadoTimeline`. Se acabó el par `estadoPago`/`estadoEnvío` inventado |
| Persistir consultas | **No por ahora**: `catalog/enquiries/` sigue siendo solo correo. `/admin/consultas` y `/admin/consultas-precio` se quedan con datos de ejemplo (C-12) |
| Reserva de cita | **Sin decidir**: `/visita-fely-campo/cita` sigue con formulario estático y `apps/appointments` vacía (C-5) |

### Flujos públicos conectados (sin backend nuevo)

| Componente | Endpoint | Notas |
|---|---|---|
| `ModalSolicitudAtelier.jsx` | `POST catalog/enquiries/` | **Identifica el producto por SLUG, no por UUID** (`SlugRelatedField`). Solo acepta `sale_mode=on_request`; un producto comprable devuelve 400 con motivo. Fire-and-forget: envía correo y no guarda fila. Límite 5/hora |
| `AvisoReposicion.jsx` (nuevo), desde la ficha cuando la talla elegida está agotada | `POST catalog/stock-notifications/` | Sin cuenta, solo correo + variante. Límite 20/hora. Aparece solo si la variante EXISTE y no tiene stock — una combinación inexistente no se puede reponer |

### Enlaces de los correos (verificado en `apps/integrations/emails.py`)

Se construyen con `FRONTEND_BASE_URL` (hoy `http://localhost:3000`) y **sin prefijo de
locale**:

```
/restablecer-contrasena/?uid=<uid>&token=<token>
/verificar-correo/?uid=<uid>&token=<token>
```

Ninguna de las dos rutas existe todavía en el frontend. El middleware de next-intl
(`localePrefix: 'always'`) redirigirá a `/es/...` conservando los query params.

### Checkout: simulación de pago, NO de pedido (2026-09-08)

`/checkout` existe y va contra `POST /api/v1/checkout/`. **El pedido es real**: se crea
en base de datos con su referencia (`FC-001006`) y reserva el stock una hora.

Lo único simulado es el cobro, y ni siquiera se simula — se omite:

- `STRIPE_SECRET_KEY` está vacía, así que `CheckoutView._start_payment` devuelve `null`
  y la respuesta trae `payment: null`. Ese comportamiento **ya estaba en el backend**:
  el fallo de la pasarela no debe hacer perder el pedido.
- El pedido nace en `pending_payment` y **ahí se queda**: solo el webhook de Stripe lo
  marca pagado. Nada en el frontend finge un cobro; la confirmación lo dice en claro
  ("la pasarela aún no está activa, tu pedido queda pendiente de pago").
- Al integrar Stripe no hay que deshacer nada: basta rellenar `STRIPE_SECRET_KEY` y
  consumir el `client_secret` que entonces sí llegará en `payment`.

Se compra **sin cuenta**: `CheckoutSerializer` solo exige el correo. Verificado de punta
a punta contra la API (carrito → checkout → pedido `FC-001006`, total 242,00 €).

Campos que el backend exige y el formulario recoge: `email`, `shipping_recipient`,
`shipping_line1`, `shipping_postal_code`, `shipping_city`, `shipping_province`. País no
editable: solo Península. `invoice_requested` obliga a `billing_tax_id` (validado en los
dos lados).

**Decidido sobre la verificación de correo**: quien se registra debe verificar su correo;
quien compra sin registrarse no. El checkout de invitado no consulta `email_verified`.

## Panel admin — sección 1: listado de productos (2026-09-09)

`/admin/productos` y sus subrutas por tipo leen ya de `GET /api/v1/admin/products/`.

Nuevo: `src/lib/api/adminCatalog.js` (`crud()` genérico + traductores de vocabulario),
`src/components/admin/useProductosAdmin.js` (listado y escrituras) y
`src/components/admin/AdminAuthGate.jsx`.

### Desajustes resueltos

| Desajuste | Cómo queda |
|---|---|
| Relaciones por NOMBRE (`.find(p => p.nombre === x)`) | Por **UUID**. El adapter da `familiaId`/`categoriaIds` para escribir y `familia`/`categorias` para pintar |
| Precios como string con formato (`"890 €"`) | **Decimales tipados** en el dato; se formatean solo en la vista con `formatearImporte` |
| Filtrado y paginación en cliente (`Array.filter` sobre el mock) | **En servidor**: `?search=&line=&status=&page=&page_size=`. Verificado: `page=1` y `page=2` no comparten ninguna fila |
| Estado `Activo/Archivado/Borrador` | ↔ `status` `active/archived/draft` |
| Tipo del panel (5) vs `line` (3) | `pret-a-porter`/`atelier`/`archivo` ↔ `line`. `novia`/`fiesta` **no son líneas**: van por `Collection` dentro de `archive` |

### Campo que el panel enseña y el modelo NO tiene

**`Programado` ("Esperando a publicar")** en `EstadoPublicacionBadge` y en las pestañas de
filtro. `ProductStatus` solo tiene `draft`, `active` y `archived`: **no hay publicación
programada**. Comprobado contra la API: `?status=scheduled` devuelve **400**
(*"Escoja una opción válida"*).

No se ha quitado el valor del badge porque es suyo y lo usan otras pantallas, pero el
filtro ya no lo manda a la API (devolvería 400) y la lista vacía lo explica en su mensaje.
**Decisión pendiente**: quitarlo del badge, o añadir publicación programada al backend.

### Sesión de staff

No existían ni login ni guard (`AdminAuthGate` y `/admin/login` los borró el `git clean`
de la primera sesión). Sin ellos **todo el panel daba 401 en silencio**.

`AdminAuthGate` comprueba `GET /admin/me/` al montar y distingue los tres casos: 401 sin
sesión (pide login), 403 con sesión sin `is_staff` (cuenta de cliente), y fallo de red.

**Guard en cliente, no en el middleware de Next**: el middleware corre en el Edge y no
puede validar una cookie de sesión de Django sin llamar a la API en cada navegación —
latencia en todas las rutas para proteger unas pocas.

### Lo que NO está conectado todavía

- **`FormularioProducto`** (alta y edición): siguiente iteración. Ahora avisa en claro de
  que no ha guardado, en vez de meter la fila en estado local y aparentar que sí.
- **Duplicar / "variante de color"**: el mock trata cada color como un **Product** aparte;
  el backend tiene **un Product con varios `Colorway`**. No es un cambio de campo, es otro
  modelo de datos — hay que rehacer ese flujo.
- `/admin/colecciones/*`: bloqueado, no existe el modelo `Look`.
- El resto del panel sigue con `mockData.js`.

## Publicación programada y formulario de producto que guarda (2026-09-09)

### Publicación programada (backend)

`ProductStatus` pasa de 3 a 4 valores: se añade **`scheduled`** («Esperando a publicar»).
Migración `catalog/0005`.

- `published_at` **deja de ser de solo lectura** en el panel: es la fecha *desde la que* se
  publicará. `is_published` sigue derivándose en `Product.save()` y nunca se acepta del
  cliente.
- `Product.save()` deriva `is_published` mirando también la fecha: un programado cuya hora
  ya pasó se da por publicado aunque el cron todavía no haya corrido, para que no se quede
  invisible.
- **`publish_scheduled`** (comando nuevo, para cron, junto a `release_reservations` y
  `purge_carts`): pasa a `active` los vencidos y **conserva la fecha elegida**, no la de
  ejecución. Tiene `--dry-run`.
- Validación en el panel: `scheduled` **exige** `published_at`, y **futura**. Programar
  para el pasado es publicar ya, y para eso está `active`. La comprobación de «futura»
  solo se aplica cuando la fecha viene en la petición, para no romper un PATCH parcial
  sobre un programado ya vencido.
- Verificado: un programado a futuro **no aparece en la API pública** (`count: 0`) y pasa a
  aparecer tras correr el comando.

### Bug encontrado y corregido: 500 al crear sin precio

La BD tenía el `CheckConstraint` `catalog_product_price_required_unless_on_request`, pero
el serializer del panel no lo reflejaba: **crear un producto sin precio devolvía un 500
`IntegrityError`** con HTML en vez de un 400. Guardar un borrador sin precio todavía puesto
es de lo más normal en el panel, así que se topaba constantemente.

Ahora da `400` con `{"price": ["Indica el precio. Solo puede quedar vacío en los productos
de «solo consulta»."]}`. Los `on_request` siguen pudiendo no tener precio, y un PATCH
parcial no obliga a reenviarlo. Es un fallo anterior a esta migración, no una regresión.

### El formulario ya guarda

`FormularioProducto` persiste vía `POST/PATCH /api/v1/admin/products/`
(`src/components/admin/guardarProducto.js` hace de puente: el formulario conserva su forma
interna y el módulo traduce).

**Añadido: selector de familia.** `Product.family` es FK obligatoria y el formulario no
tenía dónde elegirla —el mock no tenía familias—, así que cualquier alta habría dado 400.
También un `datetime-local` que solo aparece con el estado «Programado».

### Campos que el formulario edita y el modelo NO tiene

**No se mandan, y se avisa al usuario con un toast al guardar** en vez de desaparecer en
silencio (`camposQueNoSeGuardan`):

| Campo del formulario | Por qué no se guarda |
|---|---|
| `disenadoEn`, `fabricadoEn`, `tinturaEstampacion`, `origenTejido` | Los cuatro «orígenes» de la ficha son **texto fijo traducido** en `messages/*.json`, no datos del producto |
| `cuidadoIds` | El modelo solo tiene `care`, texto libre. No hay catálogo de iconos de cuidado |
| `prendas` | Existe `BundleComponent`, pero es otra cosa (componentes de un conjunto) y tiene endpoint propio |
| `estampadoId` | No hay modelo de estampado; `Colorway` referencia un `Color` |
| `lookVinculado` | No existe el modelo `Look` (C-3) |
| `resenas` | No existe el modelo `Review` (C-1) |
| `composicion.en` | El modelo tiene una sola `composition`, sin variante EN |
| `categoriaId` | Las categorías del panel vienen de `CategoriasProvider` (contexto local, ids `cat1`), no de `Category`. Solo se manda si el id es un UUID |

**Decisión pendiente**: o se crean esos modelos, o se quitan del formulario. Hoy se pueden
rellenar y no se guardan (avisando).

### Lo que sigue sin conectar

- **Variantes de color**: el formulario puede emitir varias, y el mock las trataba como
  **productos distintos**. En el modelo real son **`Colorway` de un mismo `Product`**. Al
  guardar solo se crea la raíz y se avisa de las que no se han creado. Rehacer ese flujo es
  trabajo aparte.
- **Imágenes, tallas y stock**: viven en `ProductImage`/`Variant`, con endpoints propios.
- `/admin/colecciones/*`: bloqueado sin el modelo `Look`.

## Panel: pedidos y stock (2026-09-09)

Nuevo: `src/lib/api/adminOrders.js`, `src/lib/api/adminStock.js`,
`src/lib/api/adminMedia.js`, `src/components/admin/DetalleStockModal.jsx`,
`src/components/admin/useRecursoAdmin.js`.

### Pedidos: los ocho estados reales

`EstadoPedidoBadge` y `EstadoTimeline` rehechos. Se acabaron los dos ejes inventados
(`estadoPago` + `estadoEnvío`), que dejaban fuera `refunded` y `partially_refunded` —un
pedido reembolsado no se podía ver— e inventaban un «pago fallido» que no existe.

**La línea de tiempo solo pinta la secuencia normal** (pendiente → pagado → preparación →
enviado → entregado). Cancelado y los reembolsos **no son un paso más, son una salida**:
pintarlos como sexto paso daría a entender que un pedido cancelado ha avanzado. La línea
se corta donde se quedó (`interrumpido`).

### Hallazgo: solo TRES estados se pueden cambiar a mano

Probando contra la API salió que `pending_payment → paid` devuelve **409
`invalid_status_target`**. `MANUALLY_SETTABLE_STATUSES` (apps/orders/services.py) son solo
`processing`, `shipped` y `delivered`, y además **el pedido tiene que estar pagado**.

Los demás los deciden sus propios flujos: `paid` lo confirma el webhook de Stripe,
`cancelled` tiene su acción, y los reembolsos salen del flujo de devoluciones.

La ficha ofrece **solo esos tres botones**, y cuando el pedido no admite cambio manual lo
explica («pendiente de pago: se desbloquea cuando Stripe confirme el cobro») en vez de
dejar cinco botones que siempre fallarían.

### Stock

Una fila por **variante**, con las tres cifras separadas: `físico`, `reservado`
(comprometido por checkouts en curso) y `disponible` = físico − reservado. **Disponible es
la cifra principal**, porque es la que decide si una talla sale agotada en la tienda.

`DetalleStockModal` da el desglose por ubicación, el ajuste y el historial. Dos modos que
no son intercambiables: **sumar/restar** manda un `delta` relativo (recepción, corrección;
no pisa un cambio simultáneo de otra persona) y **fijar cantidad** manda el total absoluto
(recuento físico).

**El motivo es obligatorio.** Verificado: sin él, `400 {"reason": ["Este campo es
requerido."]}`. Con él, el backend crea el `StockMovement` con quién, cuándo, dónde y por
qué. No hay forma de mover stock sin dejar rastro.

Con una sola ubicación creada («Almacén principal», la que trae la migración) el desglose
coincide siempre con el total: la pantalla lo avisa en vez de enseñar una columna que
siempre dice lo mismo.

## Panel de catálogo: colores y tejidos (2026-09-09)

- **Colores** (`/admin/materiales/colores`) → `/admin/colors/`. Dos cambios obligados:
  `code` (tercer segmento del SKU) es **obligatorio y único** y no se pedía; y las
  **familias de color no existen** en el backend (`Color` solo tiene
  code/name/name_en/hex_value), así que la rejilla es plana. Ver C-11.
- **Tejidos** (`/admin/materiales/tejidos`) → `/admin/fabrics/`, con **subida real de
  imagen en dos pasos**: `POST /admin/media/` (multipart) y luego la tela referenciando el
  `MediaAsset`. Se quitó la compresión en el navegador: el servidor ya normaliza
  (2560px, WebP, miniatura, EXIF limpio).
- Borrar un color o tela **en uso** devuelve 409 y se enseña el motivo. Verificado.

### `/admin/categorias`: REDISEÑADA (no migrada)

El panel tiene `categorias[tipo]` — listas por tipo de producto
(`pret-a-porter`/`atelier`/`archivo`/`novia`/`fiesta`), con `numeroLooks` y `looks[]`. El
backend tiene `Category`: un **árbol** plano-con-padre de ocasión (fiesta, novia, outlet),
sin relación con el tipo de producto.

No son el mismo concepto con otros nombres: son dos modelos distintos.

**Decidido y hecho: la pantalla se rediseñó contra el árbol real.** Ya no agrupa por tipo
de producto. Un producto tiene `line` (su tipo) **y** `categories` (M2M al árbol): dos ejes
independientes, y mezclarlos era el error de partida. La pantalla lo explica en su cabecera
para que no se vuelva a confundir.

Detalles que impone el modelo:
- **`slug` es obligatorio y único**, y el backend **no lo autogenera** (`400` sin él). Se
  propone desde el nombre y se deja editar.
- El orden vive en `position` (campo del servidor), no en el índice de un array del cliente.
- Borrar una categoría en uso devuelve **409 `protected`** (`on_delete=PROTECT`): se enseña
  el motivo. Verificado con «Fiesta», que es madre de «Cóctel» y tiene productos.
- Árbol de dos niveles en la interfaz: el modelo admite más, pero la navegación pública
  solo usa raíz → hija (`filter_category` ya incluye las hijas al pedir la madre).

`CategoriasProvider` (contexto local) **sigue existiendo** para `/admin/colecciones/*`, que
continúa bloqueado sin el modelo `Look`. Esa pantalla no se ha tocado.

## Cuentas de cliente y clientes del panel (2026-09-09)

### Registro y login: ya funcionan, sin verificación de correo

No hizo falta tocar el backend: `RegisterView` ya deja la sesión iniciada al registrar, y
**`LoginView` no comprueba `email_verified`**. El correo de verificación se envía (en dev
va a consola) pero **no bloquea nada**: se puede entrar y comprar sin confirmarlo.

Verificado de punta a punta: registro 201 → sesión activa → logout → login 200 sin
verificar. Contraseña incorrecta → `400 {"non_field_errors": ["Correo o contraseña
incorrectos."]}`; correo repetido → `400 {"email": ["Ya existe una cuenta con este
correo."]}`.

`MiCuentaModal` conectado. **Dos cambios obligados** respecto al diseño de partida:

| Antes | Ahora | Por qué |
|---|---|---|
| Registro sin contraseña | Con contraseña | El backend la exige; sin ella no hay alta |
| Pedía fecha de nacimiento | Quitada | `accounts.User` no tiene ese campo: era un dato que se tiraba |
| «Entrar con Google» navegaba al panel | Botón inerte y explicado | No hay OAuth en el backend. Antes **fingía autenticar** y llevaba al panel sin comprobar nada |

El nombre completo se parte en `first_name` / `last_name`, que es como lo guarda el modelo.
Al entrar se manda el `X-Cart-Id` y el backend **fusiona** el carrito de invitado.

El Navbar refleja la sesión: con ella, «Mi cuenta» deja de abrir el modal y enlaza al panel.

### Clientes: comprar NO crea cliente

**Respuesta a la pregunta de si los clientes se crean con los pedidos: no.** El checkout
acepta pedidos sin cuenta (`CheckoutSerializer` solo exige el correo) y esos pedidos
guardan `Order.email` con **`Order.user = NULL`**. Quien compra sin registrarse no es un
usuario y no existe como cliente.

En los datos de hoy eso se ve claro: **2 clientes registrados con 0 pedidos, y 3 personas
que han comprado sin cuenta**.

Nuevo endpoint `/api/v1/admin/customers/` (cierra el hueco C-7), con:
- clientes registrados (`is_staff=False`), con `orders_count`, `paid_orders_count`,
  `total_spent` y `last_order_at` anotados. Los pedidos cancelados **cuentan como pedido
  pero no como gasto**;
- `/admin/customers/guests/`: los pedidos sin cuenta agrupados por correo, para que esa
  otra mitad **sea visible en vez de silenciosa**.

Solo lectura salvo `is_active` (bloquear una cuenta). Sin `create` ni `destroy`: un cliente
nace registrándose, y borrarlo rompería el histórico de pedidos. El correo tampoco se edita
desde el panel — dejaría al cliente sin poder entrar con el suyo.

`/admin/clientes` tiene dos pestañas, «Registrados» y «Sin cuenta», con el recuento de cada
una a la vista.

**Pendiente de decidir**: si al comprar como invitado con un correo que ya tiene cuenta,
ese pedido debería enlazarse al usuario. Hoy no se enlaza.

### Login del panel

`AdminAuthGate` (reconstruido antes) usa el **mismo** `POST /auth/login/`: no hay un
sistema de autenticación aparte, `is_staff` es un flag más del mismo usuario. Verificado
que un cliente normal identificado recibe **403** en `/admin/me/` y en `/admin/customers/`.

### Pendiente

`/admin/clientes/[id]` (ficha) sigue con datos de ejemplo; el listado ya no enlaza a ella.
