> # ⚠️ DOCUMENTO OBSOLETO — no usar como descripción del presente
>
> **Sustituido por [`docs/CONTRATO.md`](docs/CONTRATO.md) (2026-09-08).**
>
> **Contra qué se escribió:** una versión del frontend que ya no existe en
> `frontend/`. Daba por existentes `src/lib/api/` (capa de llamadas a la API),
> `docs/integracion.md`, `CarritoPageContent.jsx`, `FichaProductoInteractiva.jsx`,
> `NavbarMiniCarrito.jsx` y las rutas `/pret-a-porter/*`, `/visitenos/*` y `/about`.
>
> **Por qué ya no aplica:** verificado con `find` y `grep` sobre el árbol real, **nada
> de eso está**. `src/lib/` contiene solo `atelierCategoriaSeo.js`, `precio.js` y
> `slugify.js`; la tienda vive en `/tienda/*`, las visitas en `/visita-fely-campo/*` y
> el "sobre nosotros" en `/sobre-fely`. Y sobre todo: **`grep -rE '\bfetch\(' src/`
> devuelve cero resultados** — el frontend actual no hace ni una llamada de red, todos
> sus datos son estáticos (`productosEjemplo.js`, `mockData.js`, `colecciones.js`,
> `ubicaciones.js`, `resenasEjemplo.js`). Este documento describe una integración que
> nunca llegó a existir en el código que hay.
>
> Su aviso previo también quedó desfasado en sentido contrario: dice que
> `ADMIN_API_PLAN.md` no existe. **Sí existe** hoy (`backend/ADMIN_API_PLAN.md`).
>
> **Sirve como:** pista histórica de qué integración se llegó a diseñar. Nunca como
> descripción del estado actual. No se borra por eso.

# Mapa de integración frontend ↔ backend

Estado real de cada ruta del frontend frente a lo que el backend implementa **hoy**
(Fase 1), a partir de: `backend/README.md`, `backend/DECISIONS_PENDING.md`, el esquema
OpenAPI real descargado del backend en marcha (`backend/schema.yml`, generado con
`GET /api/v1/schema/` — no un documento aparte, ver aviso abajo), `frontend/docs/adminpanel.md`,
`frontend/docs/design.md`, `frontend/src/components/admin/mockData.js` y una lectura
completa de `frontend/src/app/`. No se ha tocado ningún archivo de código para este documento.

## Aviso previo — `ADMIN_API_PLAN.md` no existe

Se pidió cruzar `backend/ADMIN_API_PLAN.md`. **Ese archivo no existe** en el repo (solo
existen `backend/README.md` y `backend/DECISIONS_PENDING.md`; búsqueda `find . -iname
"*ADMIN_API*"` sin resultados). No hay rastro de que se haya borrado ni de otro nombre
parecido. Como no hay plan escrito, la Tabla B de este documento usa como sustituto:

1. El esquema OpenAPI **real** — que hoy no tiene ni un solo endpoint bajo prefijo admin,
   solo la API pública (catálogo, cuentas, carrito, checkout, pedidos, webhooks, salud).
2. Los apartados **"Qué necesita el backend"** que ya cierra cada sección de
   `frontend/docs/adminpanel.md` — es, de facto, el plan más detallado que existe hoy,
   escrito desde el lado del frontend.
3. `backend/DECISIONS_PENDING.md`, para saber qué está cerrado a nivel de dominio y qué
   sigue abierto.

Si el plan existe en otro sitio (otra rama, otra sesión, un documento aparte), decímelo —
ver "Decisiones que necesito de ti" al final.

> **Actualización (sesión posterior).** `backend/ADMIN_API_PLAN.md` ya existe — se creó
> junto con la Fase 0/1 (auth de staff, `AdminModelViewSet`, medios) y la Fase 2 del
> backend (Collection/Fabric/Product.line·status, CRUD admin de familias/categorías/
> tallas/colores/tejidos/colecciones/productos/colorways/variantes/imágenes). La Tabla B
> de abajo describe el estado **de cuando se escribió este documento** (nada implementado
> todavía) — ha quedado desactualizada para esas filas; `ADMIN_API_PLAN.md` es ahora la
> fuente de verdad de qué endpoints admin existen. Se deja el resto del documento sin
> reescribir: sigue siendo un mapa correcto del resto del frontend (Tabla A, huecos de la
> Tabla C que siguen sin cubrir, y los desajustes de forma de la Tabla D que siguen
> aplicando donde el frontend todavía no se ha reconectado).
>
> **Aviso de almacenamiento (pedido explícitamente en el prompt de medios):** el storage
> de `media.MediaAsset` en producción sigue siendo `FileSystemStorage` — mismo
> PLACEHOLDER ya documentado en `config/settings/production.py` y `DECISIONS_PENDING.md`.
> Lo subido (imágenes de producto incluidas, ahora que existen de verdad) se pierde en
> cada despliegue hasta que se migre a almacenamiento de objetos (S3/R2, cambiar
> `STORAGES`). Es requisito antes de producción, no una mejora futura.

> **Actualización (Prompt C — productos/categorías/materiales reconectados).**
> `/admin/productos`, `/admin/productos/pret-a-porter`, `/admin/productos/atelier`,
> `/admin/productos/[id]`, `/admin/productos/[id]/editar`, `/admin/categorias` (pestañas
> Prêt-à-porter/Atelier) y `/admin/materiales/{colores,tejidos}` ya van contra la API real
> (`AdminProductViewSet` y compañía) — `mockData.js` ha dejado de ser su fuente de datos.
> `frontend/src/lib/api/adminCatalog.js` (nuevo) es el cliente: un `crud()` genérico por
> recurso, más `estadoBadgeDesdeStatus`/`tipoDesdeLine`/`lineDesdeTipo` para traducir entre
> el vocabulario del `Product` real y el que ya usaba el resto del panel (`EstadoPublicacionBadge`,
> `tiposProducto`). Decisiones de alcance, todas explícitas en el código:
> - **Runway/Novia/Fiesta (`/admin/colecciones/*`) siguen 100% en mock, sin tocar.** Son el
>   archivo editorial (looks, no `Product` reales) — decisión ya cerrada en la Fase 2
>   ("Collection vs archivo editorial", ver `ADMIN_API_PLAN.md`). `ListaProductos.jsx` las
>   sigue sirviendo desde `productosMock`/`CategoriasProvider`; nunca llegan a pedir nada a
>   la API real porque esas rutas siempre resuelven en la rejilla de looks antes de llegar
>   a la tabla plana de productos.
> - **Categorías son compartidas, sin partición por línea.** El modelo real `Category` es
>   un único árbol (`parent`/`position`/`is_active`), a diferencia del mock (una lista por
>   tipo) — las pestañas Prêt-à-porter/Atelier de `/admin/categorias` muestran ahora el
>   MISMO listado real; es correcto, no un bug (cualquier categoría vale para cualquier línea).
> - **Los "conjuntos" (`Product.kind = 'bundle'`, `BundleComponent`) no tienen CRUD admin
>   todavía** — la Fase 2 solo cubrió productos simples. La antigua sección mock "Prendas y
>   SKU" (una aproximación de bundle sin backend real) se ha quitado de `FormularioProducto`
>   en vez de dejarla mostrando algo que no persiste. `kind` se manda siempre como `simple`.
> - **"Vincular a Runway/Novia/Fiesta"** (el enlace look↔producto de la versión mock) tampoco
>   tenía backend real (era puramente de maqueta, ver comentario original del archivo) — se
>   ha quitado del formulario reconectado por el mismo motivo que el punto anterior.
> - **Paginación/filtros de servidor de verdad** en la tabla/rejilla de productos (`page`,
>   `search`, `line`, `status`, `collection`, `category`), sustituyendo el recorte en
>   cliente de `TablaAdmin`/`GridProductos` — el conteo de la rejilla de categorías (tarjetas
>   "categoría → nº de productos") sigue siendo una aproximación de hasta 100 productos por
>   línea (razonable para un catálogo de panel admin, no de tráfico público).

> **Actualización (Fase 3 — stock por ubicación).** `/admin/stock` ya va contra
> `/api/v1/admin/stock/...` (`frontend/src/lib/api/adminStock.js`) — el antiguo
> `filasStock()`/mock de una sola cifra por producto+talla ha dejado de usarse ahí. La
> tabla sigue mostrando una fila por variante (Stock = suma de ubicaciones vendibles, D3);
> clicar una fila abre `DetalleStockModal.jsx`: desglose completo por ubicación, un
> formulario de ajuste/fijado que exige motivo (lo audita el backend en un
> `StockMovement`) y el historial de esa variante. Se añadió también una gestión mínima de
> ubicaciones (alta + activar/desactivar) directamente en la página, sin ruta ni entrada de
> sidebar propia — no estaba pedida explícitamente, pero sin ella el desglose por ubicación
> no tendría más que "Almacén principal" (la única que crea la migración) y la función
> quedaría inerte. Mismo criterio de "hasta 100 de una vez, filtros en cliente" que el resto
> del panel reconectado: `AdminStockVariantViewSet` no expone un filtro de categoría/colección
> propio (solo `colorway__product`/`is_active`), así que no hay paginación de servidor aquí
> como sí la hay en `/admin/productos`.

---

## Tabla A — Web pública (`frontend/src/app/[locale]/`)

31 rutas registradas (`page.js` bajo `[locale]/`). Leyenda de **Estado**: 🟢 maquetada
con datos reales del propio archivo (no mock, no API) · 🟡 placeholder de 13 líneas
("Página pendiente de maquetar. La ruta ya existe y navega.") · ⚪ estático, no necesita
API nunca (contenido editorial/legal fijo) · 🔵 código ya escrito pero **huérfano** (no
importado desde ningún `page.js`, así que no se ve navegando el sitio).

| Ruta | Qué datos necesita | Endpoint que lo serviría | Estado |
|---|---|---|---|
| `/` (home) | Productos "destacados" (4), productos "por ocasión" (4×4), 3 slides de hero | `GET catalog/products/` — **pero no hay campo `featured`/`destacado` en `ProductList`/`ProductDetail`** (verificado en `schema.yml`); hoy los 3 arrays van hardcoded dentro del propio `page.js`, no vienen de ningún mock ni API | 🟢 maquetada (126 líneas), datos 100% hardcoded en el archivo |
| `/about` | — | — | 🟡 placeholder |
| `/about/fely-campo` | — | — | 🟡 placeholder |
| `/archivo` | — | — | 🟡 placeholder |
| `/archivo/runway` | — | — | 🟡 placeholder |
| `/archivo/colecciones` | Listado de colecciones editoriales (Runway/Novia/Fiesta) | Ninguno — no existe entidad "colección editorial" en el backend (ver Tabla C) | 🟡 placeholder |
| `/archivo/colecciones/[coleccion]` | Detalle de una colección + sus looks | Ninguno — no existe modelo `Collection`/`Look` (ver Tabla C/D) | 🟡 stub (11 líneas, ni el texto placeholder estándar) |
| `/archivo/colecciones/[coleccion]/[look]` | Detalle de un look | Ninguno | 🟡 stub (11 líneas) |
| `/atelier` | — | — | 🟡 placeholder |
| `/atelier/fiesta` | Listado de productos Atelier/Fiesta | `GET catalog/products/?...` (categoría "Fiesta" existe como parte del árbol `Category`, pero el filtro concreto está por decidir) | 🟡 placeholder |
| `/atelier/novias` | Ninguno hoy — bloque editorial fijo (imagen + texto + CTA a `/visitenos/cita`) | — | 🟢 maquetada (15 líneas, `BloqueSeccion`), 100% estática |
| `/ayuda/atencion-cliente` | — | — | 🟡 placeholder |
| `/carrito` | Carrito de sesión/invitado: líneas + totales | `GET/PATCH/DELETE cart/*` — **implementado hoy** | 🟡 la ruta registrada sigue en placeholder, **pero** existe `CarritoPageContent.jsx` (144 líneas) ya escrito y **huérfano** — ver nota 🔵 abajo |
| `/legal/aviso-legal` | — | — | ⚪ estático |
| `/legal/cookies` | — | — | ⚪ estático |
| `/legal/privacidad` | — | — | ⚪ estático |
| `/legal/terminos` | — | — | ⚪ estático |
| `/pret-a-porter` | Listado de productos Prêt-à-porter | `GET catalog/products/?...` — implementado | 🟡 placeholder |
| `/pret-a-porter/accesorios` | ídem, filtrado por categoría | ídem | 🟡 placeholder |
| `/pret-a-porter/coats` | 4 abrigos (imagen, nombre, precio, colores) | `GET catalog/products/?...` — implementado, pero hoy el array va **hardcoded** en el propio archivo | 🟢 maquetada (22 líneas), usa `CuadriculaProductos` real con datos hardcoded, no mock ni API |
| `/pret-a-porter/faldas` | ídem | ídem | 🟡 placeholder |
| `/pret-a-porter/tops` | ídem | ídem | 🟡 placeholder |
| `/pret-a-porter/vestidos` | ídem | ídem | 🟡 placeholder |
| `/pret-a-porter/zapatos` | ídem | ídem | 🟡 placeholder |
| `/pret-a-porter/[producto]` | Ficha completa: colorways, tallas, stock, precio, galería | `GET catalog/products/{slug}/` — implementado | 🟡 la ruta registrada es un stub (26 líneas) que solo pinta el slug, **pero** existe `FichaProductoInteractiva.jsx` (315 líneas) huérfana — ver nota 🔵 abajo |
| `/responsabilidad` | — | — | 🟡 placeholder |
| `/visitenos` | — | — | 🟡 placeholder |
| `/visitenos/cita` | Reserva de cita en atelier | Ninguno — no existe backend de citas (ver Tabla C) | 🟡 placeholder |
| `/visitenos/madrid` | Info fija de local (dirección, horario) | Ninguno hoy; si se hace editable necesitaría un modelo de "atelier" que no existe (`DECISIONS_PENDING.md`: "Ateliers: cuántos, dónde, horarios... pendiente") | 🟡 placeholder |
| `/visitenos/oviedo` | ídem | ídem | 🟡 placeholder |
| `/visitenos/salamanca` | ídem | ídem | 🟡 placeholder |

### 🔵 Nota — código de integración ya escrito pero no conectado a ninguna ruta

Además de las páginas de arriba, hay **cuatro archivos que ya asumen la API real** y que
`git status` marca como *untracked* en el repo de frontend, sin que ningún `page.js` los
importe todavía (`grep` de sus nombres en `src/` no devuelve ningún import):

- `src/app/[locale]/carrito/CarritoPageContent.jsx` (144 líneas)
- `src/app/[locale]/pret-a-porter/[producto]/FichaProductoInteractiva.jsx` (315 líneas)
- `src/components/layout/Navbar/NavbarMiniCarrito.jsx` (64 líneas)
- `src/navigation.js` (helper de `next-intl`, 16 líneas — este sí es una pieza de base,
  no de página)

Lo notable: estos tres componentes **ya están escritos contra la forma real del backend**
(`item.product_name`, `item.size_code`, `item.line_gross`, `totals.subtotal_net` /
`shipping_net` / `vat_total` / `total_gross`, `product.colorways`, `colorway.variants`,
`variant.size.code`, `product.effective_price_gross`, `product.sale_mode === 'on_request'`)
— coinciden campo a campo con `CartItem`/`Cart`/`ProductDetail` en `schema.yml`. **No hay
desajuste de forma en esta parte** (a diferencia del panel admin, ver Tabla D).

Lo que falta para que dejen de ser código muerto: los tres importan módulos que **no
existen todavía en el repo** — `@/context/CarritoContext`, `@/lib/adapters`,
`@/lib/api/endpoints` (confirmado con `find src -iname context` / `find src/lib` → sin
resultados). `frontend/docs/integracion.md` describe con detalle cómo debería
organizarse esa capa (`src/lib/api/client.js`, `endpoints.js`, `src/lib/adapters/`) —
**es un documento de diseño, no una descripción de código existente**: nada de esa
carpeta está creado hoy. Es la pieza base que bloquea conectar el carrito y la ficha de
producto (ver "Orden de trabajo" más abajo).

---

## Tabla B — Panel (`frontend/src/app/admin/`)

Todas las páginas de `/admin` leen de `useState(xMock)` sobre
`src/components/admin/mockData.js`; nada persiste, no hay ni una llamada `fetch` en todo
el árbol `/admin` (confirmado en `adminpanel.md` §1 y por inspección). **Ningún endpoint
admin existe hoy** — el esquema real solo tiene la API pública. La columna "¿Implementado
hoy?" es por tanto "No" en todas las filas; lo que varía es si el **dato** que hace falta
ya existe en el modelo Fase 1 (aunque sin endpoint admin) o si no existe ni el modelo.

| Página admin | Entidad de `mockData.js` | Qué necesitaría del backend | ¿Implementado hoy? |
|---|---|---|---|
| `/admin/pedidos`, `/admin/pedidos/[id]` | `pedidosMock` | Endpoints admin `GET/PATCH` sobre `Order` (existe como modelo Fase 1, `apps/orders/models.py`) + relaciones por id en vez de nombre en `items[]` | **No.** El modelo existe pero sin endpoint admin ni serializer que exponga lo que pide el panel (ver Tabla D, mismatch de estados) |
| `/admin/consultas`, `/admin/consultas/[id]` | `consultasMock` | Persistir consulta general/cita con estado (`Pendiente`/`Contactado`/`Cerrado`) + historial con timestamp de servidor | **No.** No hay modelo que lo cubra; no es lo mismo que `catalog/enquiries/` (ver Tabla C) |
| `/admin/consultas-precio`, `/admin/consultas-precio/[id]` | `consultasPrecioMock` | Persistir la consulta (hoy `catalog/enquiries/` solo envía email, no guarda fila) + estado + relación por `productoId` | **Parcial.** El endpoint público que **dispara** esto (`POST catalog/enquiries/`) sí existe y es Fase 1, pero no persiste nada ni tiene vista admin |
| `/admin/productos`, `/pret-a-porter`, `/atelier`, `/admin/colecciones/{runway,novia,fiesta}` | `productosMock`, `categoriasMock`, `coloresMock`, `telasMock`, `coleccionesMock` | CRUD admin de `Product`/`Category`/`Color` (existen, Fase 1) + subida real de imágenes + modelo nuevo de `Tela`/`Collection`/`Look` (no existen, ver Tabla C/D) | **No.** Product/Category/Color son de solo lectura pública hoy; Tela/Collection/Look no existen en absoluto |
| `/admin/productos/[id]`, `/[id]/editar` | `productosMock` | `GET/PATCH /admin/products/:id` | **No** |
| `/admin/metricas`, `/metricas/[id]`, `/metricas/kpi/[id]` | `kpisAnaliticas`, `metricasMensualesMock`, `topProductosPorMesMock` | Endpoints de agregación sobre pedidos reales | **No.** Ni modelo ni endpoint — 100% estático hoy y los tres mocks ni siquiera cuadran entre sí (lo dice el propio `adminpanel.md` §6) |
| `/admin/stock` | `filasStock()` (deriva de `productosMock.tallas`) | `GET /admin/stock?...` de agregación sobre `Variant.stock`/`reserved` | **Parcial.** El dato (`Variant.stock`) existe en el modelo Fase 1 — es el corazón del sistema de reservas — pero no hay endpoint de listado/agregación admin |
| `/admin/materiales/colores` | `coloresMock` | CRUD admin sobre `Color` | **No.** `Color` existe como modelo (Fase 1, "catálogo global reutilizable") pero sin endpoint admin |
| `/admin/materiales/tejidos` | `telasMock` | CRUD admin sobre una entidad `Tela`/`Fabric` reutilizable | **No, y no es solo falta de endpoint: el modelo no existe.** `ProductDetail.composition`/`care` son campos de texto libre en el propio producto, no una entidad aparte (ver Tabla D) |
| `/admin/resenas`, `/resenas/nueva`, `/resenas/[id]/editar` | `resenasMock` | Modelo `Review` + endpoint público de alta (con auth de cliente) + admin de moderación | **No.** No existe ningún modelo de reseñas (`DECISIONS_PENDING.md`: "falta modelo y moderación") |
| `/admin/diseno` | `disenoMock`, `paginasInternas`, `bancoImagenes`, `bancoVideos` | Modelo de "bloques de página" — hoy mitad mock, mitad claves de `messages/{locale}.json` estáticas | **No.** `apps/content/models.py` está vacío (`# Fase 0: sin modelos de negocio todavía`, verificado leyendo el archivo) |
| `/admin` (dashboard) | Agrega varios mocks de arriba | Depende de que el resto exista | **No** |
| `/admin/clientes`, `/clientes/[id]` | `clientesMock` (nombre, pedidos, gastoTotal, fechaAlta, estado, cumpleaños) | Vista admin agregada sobre `accounts.User` + pedidos | **Parcial.** El usuario (`accounts.User`) existe como modelo Fase 1; las métricas agregadas (pedidos, gasto total) y la vista admin no |
| `/admin/newsletter` | `newsletterMock` | Modelo de suscripción + integración Brevo real | **No.** `BREVO_API_KEY` existe como variable de config (`apps/integrations/`) pero sin lógica ninguna detrás (`DECISIONS_PENDING.md`: "Brevo... pendientes") |
| `/admin/blog`, `/blog/nueva`, `/blog/[id]/editar` | `blogMock` | Modelo de entradas de blog | **No.** Mismo `apps/content` vacío que Diseño |
| `/admin/settings` | `ajustesTiendaMock` | Endpoint admin de configuración editable en BD | **No, y desajuste de modelo, no solo de endpoint** — ver Tabla D |

---

## Tabla C — Huecos sin cubrir (ni existe ni está planificado)

Confirmando/corrigiendo la sospecha inicial, con evidencia de código:

| Hueco | Confirmado? | Evidencia |
|---|---|---|
| `/admin/clientes` | **Confirmado, parcial.** El modelo base (`accounts.User`) sí existe — no es un hueco total, falta la capa admin/agregación | `backend/apps/accounts/models.py` tiene `User`; no hay ningún endpoint `/admin/customers` en `schema.yml` |
| `/admin/metricas` | **Confirmado, hueco total.** | Sin modelo de agregación ni endpoint en `schema.yml`; los 3 mocks de métricas ni siquiera son consistentes entre sí (`adminpanel.md` §6) |
| `/admin/newsletter` | **Confirmado, hueco total.** | Sin modelo; `BREVO_API_KEY` es config sin lógica (`apps/integrations/`) |
| `/admin/settings` | **Confirmado, pero es un desajuste de modelo más que un hueco puro** — los valores que el panel quiere editar (envío, importe mínimo, IVA, ventana de devolución, minutos de reserva) **sí existen**, como variables de entorno (`SHIPPING_FLAT_RATE`, `ORDER_MINIMUM_TOTAL`, `VAT_RATE`, `RETURN_WINDOW_DAYS`, `STOCK_RESERVATION_MINUTES` en `backend/.env.example`) | `backend/config/settings/base.py` líneas 218-227 |
| Blog público | **Confirmado, hueco doble.** No hay ninguna ruta `/blog` bajo `src/app/[locale]/` (no aparece en el listado completo de 29 rutas) **y** el backend (`apps/content`) está vacío | `find` de rutas + `apps/content/models.py` |
| Reserva de cita — `/visitenos/cita` | **Confirmado.** | `apps/appointments/models.py` vacío (`# Fase 0: sin modelos de negocio todavía`); `DECISIONS_PENDING.md`: "Calendly vs sistema nativo: pendiente de decidir" |
| Looks de `/archivo/colecciones/[coleccion]/[look]` | **Confirmado.** No existe modelo `Collection` (temporada) ni `Look` en ningún sitio del backend | `grep -i "collection\|look"` en `schema.yml` no devuelve ninguna entidad de dominio con ese nombre; el único "kind" de producto es `Product.kind` (`BUNDLE`/pieza suelta), un concepto distinto (conjunto vendible, no colección editorial) |
| **Añadido, no estaba en la sospecha inicial — Reseñas** | Hueco total: ni modelo `Review`, ni endpoint público de alta, ni auth de cliente en el sitio público para poder escribirlas | `DECISIONS_PENDING.md`: "Reseñas: se migran desde WooCommerce, pero falta modelo y moderación"; `EscribirResena.jsx` es "placeholder de solo UI" (`adminpanel.md` §9) |
| **Añadido — Materiales/Tejidos** | Hueco de modelo (no solo de endpoint): no existe entidad `Tela`/`Fabric` reutilizable, solo `composition`/`care` como texto libre en `Product` | `ProductDetail` en `schema.yml`, propiedades `composition`/`care` (`type: string`) |
| **Añadido — Autenticación del panel admin** | Hueco total y transversal: `/admin/*` no comprueba sesión de ningún tipo | `adminpanel.md` §1: "No hay autenticación ni autorización... `layout.js` es un root layout independiente... no comprueba sesión de ningún tipo" — el propio documento lo marca como el hueco #1 más urgente |
| **Añadido — Subida real de imágenes/storage** | Hueco total, transversal a Producto/Looks/Reseñas/Diseño | `DECISIONS_PENDING.md`: "Almacenamiento de media en producción (R2/S3): pendiente. `production.py` usa `FileSystemStorage` marcado como PLACEHOLDER no apto para producción" |
| **Añadido — "Destacados" de la home** | Hueco de campo: no existe `featured`/flag equivalente en `Product` | `ProductList`/`ProductDetail` en `schema.yml` — sin ese campo, hoy va hardcoded en `page.js` |

---

## Tabla D — Desajustes de forma entre el mock/panel y la API real

| # | Mock/panel asume | API real (evidencia) | Desajuste |
|---|---|---|---|
| 1 | Relaciones por **nombre de texto libre**: `pedidosMock.items[].producto`/`.color`, `pedidosMock.cliente`, `consultasMock.productoRelacionado`, `consultasPrecioMock.producto` — todas strings resueltas con `.find(p => p.nombre === x)` | Todo lo real usa **UUID** como PK (`id: format: uuid` en `Product`/`Colorway`/`Variant`/`Order`/etc., `apps/core/models.UUIDTimeStampedModel`) | El panel necesita `productoId`/`varianteId`/`clienteId` reales; el propio `adminpanel.md` §11.4 ya lo marca como "el fix de datos más importante" |
| 2 | El usuario planteaba `"tipo"` del panel (`pret-a-porter`/`atelier`/`archivo`/`novia`/`fiesta`) equivalente a **`Product.line`** | **`Product.line` no existe.** `ProductDetail`/`ProductList` no tienen ningún campo `line`; lo que hay es `family` (FK a `Family`, agrupación de catálogo) y `categories` (árbol, vía `Category`) | **Corrección, no confirmación**: no hay un campo plano de 5 valores en el backend. El "tipo" del panel probablemente debería mapear a `family` + un flag para distinguir "archivo editorial" (que hoy no tiene ningún equivalente, ver Tabla C) de catálogo vivo |
| 3 | `coleccionesMock` (fw27/ss26...) como colección editorial con `temporada` (`Otoño-Invierno 26/27` → `AW27`) — el usuario lo comparaba con un posible **`Collection` como temporada** | **No existe ninguna entidad `Collection`/`season`/`temporada`** en ningún componente de `schema.yml` (`grep -i "collection"` sin resultados de dominio) | No es un desajuste de nombre, es ausencia total de modelo — ver Tabla C. Si se construye, hay que decidir si vive como campo en `Product` o como entidad propia (el mock ya la trata como entidad propia, con `id`/`nombre`/`numeroLooks`/`looks[]`) |
| 4 | Pedido con **dos** estados separados: `estadoPago` (`Pendiente`/`Pagado`/`Fallido`) y `estadoEnvio` (`Procesando`/`Enviado`/`Entregado`) | `Order.status` es **un único campo** de 8 valores: `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`, `partially_refunded` (`apps/orders/models.py`, `OrderStatus`). La API pública además solo expone `is_paid`/`paid_at`, nunca el `status` completo (`DECISIONS_PENDING.md`: "el estado existe en el modelo... pero la API pública no lo expone") | Mismatch confirmado con evidencia de modelo, no solo de esquema público: no hay "Fallido" como estado de pago en el backend (lo más parecido es `cancelled`), y "Procesando/Enviado/Entregado" habría que mapearlo a `processing`/`shipped`/`delivered` — pero el backend no distingue "pago fallido" de "cancelado", y el panel tampoco modela `refunded`/`partially_refunded` en absoluto |
| 5 | `producto.estado` con 4 valores (`Borrador`/`Activo`/`Programado`/`Archivado`) | `ProductDetail`/`ProductList` no exponen ningún campo de estado de publicación en el esquema público | No verificable si existe a nivel de modelo Django sin serializar (igual que pasó con `Order.status`) — habría que mirar `apps/catalog/models.py` directamente o que se confirme; no lo doy por hueco total porque el patrón de `Order` sugiere que podría existir oculto |
| 6 | `precio`/`total` como **string libre con formato**: `"890 €"`, `"1.310 €"` (se parsean quitando todo lo que no sea dígito para ordenar) | `price`/`sale_price`/`subtotal_net`/etc. son `decimal` tipado (`pattern: ^-?\d{0,8}(?:\.\d{0,2})?$`), moneda aparte (`currency`) | Desajuste de tipo, no solo de nombre — el panel tendría que dejar de formatear en el propio dato y formatear solo en la vista |
| 7 | `ajustesTiendaMock` — el panel asume que el envío/importe mínimo/IVA se editan en caliente desde `/admin/settings` | Son variables de entorno (`SHIPPING_FLAT_RATE`, `ORDER_MINIMUM_TOTAL`, `VAT_RATE`, `RETURN_WINDOW_DAYS`, `STOCK_RESERVATION_MINUTES`) que exigen redeploy | Desajuste de "dónde vive la fuente de verdad" — pasar esto a editable desde BD es un cambio de arquitectura, no solo un CRUD nuevo |
| 8 | `pedidosMock.cliente` es un nombre string suelto; `consultasMock.cliente` es un objeto `{nombre, email}` sin id; `consultasPrecioMock.clienteId` sí es un id real opcional | Solo hay una entidad cliente real: `accounts.User` | Los 3 usos del panel referencian "cliente" de 3 formas distintas y ninguna coincide entre sí, no solo con el backend |
| 9 | **Punto a favor, no un problema**: `productosMock.colorIds`/`.telaIds` ya son arrays de FK reales (no nombre de texto) | `Color` es "catálogo global reutilizable" (modelo real, Fase 1) | Esta parte del panel **ya está alineada** con el patrón que espera el backend — no tocar, replicar este patrón en el resto |
| 10 | **Punto a favor, no un problema**: el código huérfano del sitio público (`CarritoPageContent.jsx`, `FichaProductoInteractiva.jsx`, `NavbarMiniCarrito.jsx`, ver Tabla A) | `Cart`/`CartItem`/`ProductDetail` reales | Cero mismatch de campos — ya sigue la forma real de la API. El problema ahí es solo que falta la capa base (`src/lib/api`, `src/context/CarritoContext`), no la forma de los datos |

---

## Orden de trabajo propuesto

**Fase 1 — Cablear el sitio público a lo que YA existe (solo frontend, cero cambios de backend).**
Bloquea todo lo demás del sitio público porque `CarritoPageContent.jsx`/
`FichaProductoInteractiva.jsx`/`NavbarMiniCarrito.jsx` ya están escritos pero importan
módulos inexistentes:
1. Crear `src/lib/api/client.js` (fetch + CSRF), `src/lib/api/endpoints.js`,
   `src/lib/adapters/` — según el diseño ya descrito en `frontend/docs/integracion.md`.
2. Crear `src/context/CarritoContext`.
3. Wire `carrito/page.js` → `CarritoPageContent`, `pret-a-porter/[producto]/page.js` →
   `FichaProductoInteractiva`, Navbar → `NavbarMiniCarrito`.
4. Conectar listados de catálogo (`/pret-a-porter`, `/atelier`, categorías) a
   `GET catalog/products/` desde Server Components (ver criterio ya documentado en
   `docs/integracion.md`).

**Fase 2 — Autenticación y autorización del panel admin.**
Sin dependencias técnicas de la Fase 1, pero lógicamente debería ir antes que cablear
cualquier dato real del panel (`adminpanel.md` §11 lo marca como el hueco #1). Bloquea
en la práctica toda la Fase 3.

**Fase 3 — Backend admin sobre lo que YA tiene modelo Fase 1 (falta exponer, no crear
desde cero):**
- Productos/Categorías/Colores: CRUD admin + arreglo de relaciones por id (Tabla D #1).
- Pedidos: endpoint admin que exponga `status` real y decida cómo mapearlo a lo que
  necesita el panel (Tabla D #4 — requiere una decisión, ver abajo).
- Stock: endpoint de agregación admin sobre `Variant`.
- Subida real de imágenes (storage) — resolverlo una vez aquí, no repetirlo por sección;
  bloquea también Reseñas y Diseño en la Fase 4.

**Fase 4 — Backend: modelo nuevo desde cero, sin bloqueo de decisiones de producto:**
- Consultas (general + precio) como entidad persistida con estado.
- Tejidos/Telas como entidad reutilizable (mismo patrón que `Color`).
- Reseñas + autenticación de cliente pública para escribirlas.
- Métricas (agregación sobre pedidos reales).
- Clientes (vista admin agregada sobre `User` + pedidos).

**Fase 5 — Bloqueadas por decisión de producto, no solo por trabajo técnico** (ver
`DECISIONS_PENDING.md` "⏳ Pendiente" y la siguiente sección):
- Colecciones editoriales / Looks / Archivo.
- Citas (Calendly vs sistema propio).
- Newsletter (integración Brevo real).
- Blog / CMS de contenido.
- Diseño (editor de home): requiere decidir una única fuente por bloque antes de tocar
  backend.
- Settings como entidad editable en BD.

---

## Decisiones que necesito de ti

1. **`ADMIN_API_PLAN.md` no existe en el repo.** ¿Lo tenías en otra rama/sesión, o hay
   que crearlo desde cero? Mientras tanto he derivado la Tabla B de `DECISIONS_PENDING.md`
   + los "Qué necesita el backend" de `adminpanel.md` + el esquema real — dímelo si eso
   no es lo que querías usar como fuente.
2. **Tabla D #2** — no existe `Product.line`. ¿A qué campo real te referías, o el "tipo"
   del panel (pret-a-porter/atelier/archivo/novia/fiesta) es un concepto que hay que
   crear desde cero combinando `family` + un flag nuevo de "archivo editorial"?
3. **Tabla D #3** — no existe ninguna entidad de temporada/colección hoy, ni con el
   nombre `Collection` ni con otro. ¿Se modela como campo nuevo en `Product`, como
   entidad independiente (como ya la trata el mock, con looks colgando de ella), o se
   deja fuera del alcance por ahora?
4. **Consultas generales vs `catalog/enquiries/`** — el endpoint que existe hoy es
   fire-and-forget por email, sin persistir fila ni estado. ¿La sección "Consultas/Citas"
   del panel debe construirse ampliando ese endpoint, o es un flujo aparte (incluye citas
   de atelier, que no tienen relación ninguna con consultas de producto)?
5. **Tabla D #4** — confirmado con el modelo real que `Order.status` es un único campo de
   8 valores, sin "Fallido" como estado de pago independiente y sin distinguir
   `refunded`/`partially_refunded` en el panel. ¿Cómo quieres mapear los 8 valores reales
   a lo que ve el admin: los expandes tal cual, o mantienes las dos vistas separadas
   (pago/envío) derivándolas de `status`?
6. **Tabla D #5** — no puedo confirmar desde el esquema público si `Product` tiene un
   campo de estado de publicación oculto (como pasa con `Order.status`, que existe en el
   modelo pero no se serializa). Si me dejas mirar `apps/catalog/models.py` en una
   próxima sesión lo confirmo con evidencia de código en vez de dejarlo abierto.
7. **Settings** — ¿pasan a ser datos editables en BD/API (lo que asume el panel) o siguen
   siendo variables de entorno y el panel solo las muestra en modo lectura?
8. **Nota aparte, no es del backend pero es una contradicción documentada**: el propio
   `adminpanel.md` (§10 y §12) señala que el sidebar marca "Consultas/Citas" y "Diseño"
   con la píldora "Por hacer" aunque ambas secciones **ya están construidas** — queda sin
   resolver si es intencional o un desajuste entre lo que se pidió marcar y lo que
   realmente falta.
