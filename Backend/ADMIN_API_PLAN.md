# Plan — API de administración (`/api/v1/admin/`)

Fase 0: **plan, sin código**. Documenta el mapeo panel → modelos, los modelos nuevos, los
cambios sobre lo existente con su riesgo, las rutas, las decisiones que hay que tomar y el
orden de las fases.

Restricción rectora: **la API pública de Fase 1 no cambia de forma**. Todo cambio sobre
modelos existentes es aditivo (campo opcional con `default`) y ningún serializer público se
toca. Donde eso no ha sido posible, está marcado como decisión y **no se implementa hasta
tener respuesta**.

---

## 0. Dónde vive el código

Un paquete `admin_api/` dentro de cada app de dominio (`serializers.py`, `views.py`,
`urls.py`, `filters.py`), no una app nueva:

```
apps/catalog/admin_api/{serializers,views,filters,urls}.py
apps/orders/admin_api/…
apps/content/admin_api/…
apps/appointments/admin_api/…
apps/core/admin_api/…          # feature flags
config/admin_urls.py           # agrega los routers bajo admin/
```

Por qué:

- El dominio y sus reglas se quedan juntos; una app `dashboard` con serializers de catálogo,
  pedidos y contenido acabaría importando media base de código y volviéndose el sitio donde
  se cuela la lógica de negocio.
- El nombre `admin_api` (paquete) evita chocar con los `admin.py` de Django que ya existen en
  `catalog`, `orders` y `accounts`.
- `config/api_urls.py` gana una línea: `path("admin/", include("config.admin_urls"))`. La
  API pública no se reordena.

Piezas transversales nuevas en `apps/core`:

- `apps/core/permissions.py` → `IsStaff` (envoltorio sobre `IsAdminUser`, para poder endurecer
  después sin tocar 40 vistas).
- `apps/core/admin_api/viewsets.py` → `AdminModelViewSet`: `permission_classes = [IsStaff]`,
  `DefaultPagination`, `StableOrderingFilter`, y `throttle_scope = "admin"` (cupo propio, más
  holgado que `user`, porque el panel hace ráfagas al guardar productos con muchas variantes).

Convenciones que se respetan tal cual: `UUIDTimeStampedModel`, columnas gemelas `_en`,
`django-environ` para configuración, manejador de errores de `apps/core/exceptions.py`
(`BusinessRuleError` para reglas de negocio, `ValidationError` para campos), y `drf-spectacular`
con tags `Admin · <sección>`.

**Autenticación y códigos.** Sesión + cookie, igual que el resto. Con `SessionAuthentication`
sin cabecera `WWW-Authenticate`, DRF responde **403 a anónimos** (no 401), que es justo lo que
piden los tests de permisos.

---

## 1. Mapeo sección del panel → modelos

| Sección del panel | Modelos | Estado |
|---|---|---|
| Productos | `Product`, `Colorway`, `Variant`, `ProductImage`, `BundleComponent` | Existen. Cambios aditivos (§3) |
| Materiales · colores | `catalog.Color` | Existe |
| Materiales · telas | `catalog.Fabric` + M2M `Product.fabrics` | **Nuevo** |
| Colecciones | `catalog.Collection` + FK `Product.collection` | **Nuevo** |
| Stock | `catalog.Variant` (verdad de venta) + `Location`, `StockLevel`, `StockMovement` | **Nuevo** (§4) |
| Pedidos | `orders.Order`, `OrderLine`, `Return` + `OrderStatusChange`, `OrderNote` | Existen + **nuevo** |
| Consultas y citas | `appointments.Enquiry` | **Nuevo** (apps vacías) |
| Reseñas | `content.Review` | **Nuevo** |
| Blog | `content.BlogCategory`, `content.BlogPost` | **Nuevo** |
| Contenido (páginas fijas) | `content.Page`, `content.PageBlock` | **Nuevo** |
| Diseño (home) | `content.HomeBlock` (JSON tipado) | **Nuevo** (§5) |
| Biblioteca de medios | `content.MediaAsset` | **Nuevo** |
| Extras (flags) | `core.FeatureFlag` | **Nuevo** |

### Los tres "tipos" del panel y la "sección web"

- **"Sección web"** → `Category`. Ya es el eje de navegación jerárquico y es M2M: encaja sin
  tocar nada.
- **prêt-à-porter / atelier / archivo** → **no encajan en nada existente**:
  - `Product.kind` es `simple | bundle` (prenda vs conjunto) y lo consume `BundleComponent`
    y la ficha pública. Reutilizarlo rompería el catálogo.
  - `Family` es el primer segmento del SKU (`VE` = vestidos): taxonomía de prenda, no línea
    comercial. Un vestido puede ser prêt-à-porter o atelier.
  - `sale_mode = on_request` **correlaciona** con atelier pero no es lo mismo: describe cómo
    se compra, y una pieza de archivo también puede ir sin precio.

  Por eso propongo campo nuevo `Product.line` → **decisión D1**. Es lo único de esta sección
  que necesita respuesta antes de la migración.

---

## 2. Modelos nuevos

### `apps/catalog`

**`Fabric`** — biblioteca de telas reutilizable.
`code` (único, corto), `name` / `name_en`, `composition` / `composition_en` (texto libre,
p. ej. "70% seda, 30% algodón"), `notes` (interno), `is_active`.
Relación: `Product.fabrics = M2M(Fabric, blank=True, related_name="products")`.
Nota: `Product.composition` (CharField) ya existe y lo lee la ficha pública. **No se borra**;
pasa a ser el texto libre de la ficha y las telas son el dato estructurado. Que convivan es
feo pero es el precio de no romper la API pública → **decisión D7**.

**`Collection`** — temporada.
`code` (`fw27`, `ss26`; único, `max_length=12`), `name` / `name_en` ("Otoño-Invierno 2027"),
`starts_on` / `ends_on` (opcionales, informativos), `position`, `is_active`.
Relación: `Product.collection = FK(null=True, blank=True, on_delete=PROTECT)`. `PROTECT`
para que borrar una colección no deje productos huérfanos en silencio.

**`Location`** — ubicación física de stock.
`code` (único), `name`, `kind` (`store | warehouse`), `is_sellable` (bool), `is_active`,
`position`.
`is_sellable` es el campo clave: **las tiendas guardan muestras que no se venden nunca**
(decidido, D3). Solo las ubicaciones vendibles cuentan para lo que la web puede vender.

**`StockLevel`** — desglose por ubicación.
`variant` FK, `location` FK, `quantity` (`PositiveIntegerField`). Único por
(`variant`, `location`).

**`StockMovement`** — auditoría de ajustes.
`variant`, `location`, `delta` (entero con signo), `reason` (choices:
`manual_adjustment | reception | return | correction | sale`), `note`, `created_by` FK a User
(`SET_NULL`), `created_at`. Sin esto, "el stock no cuadra" es imposible de investigar.

### `apps/appointments`

**`Enquiry`** — consultas y solicitudes de cita, misma forma con un discriminador.
`kind` (`product_enquiry | appointment_request`), `name`, `email`, `phone`, `subject`,
`message`, `product` FK a `catalog.Product` (`null`, `SET_NULL`), `preferred_at`
(`DateTimeField`, null — la fecha propuesta para la cita), `status`
(`pending | contacted | closed`, default `pending`, `db_index=True`), `staff_note`,
`handled_by` FK a User (`SET_NULL`), `handled_at`, `source` (`web | admin`).

Un solo modelo y no dos porque el panel muestra la misma tabla con el mismo ciclo de estados;
dos tablas obligarían a unir listados en memoria y a duplicar filtros y tests. La decisión
Calendly-vs-nativo sigue pendiente en `DECISIONS_PENDING.md` y **este modelo no la prejuzga**:
guarda *solicitudes*, no disponibilidad ni calendario.

### `apps/content`

**`MediaAsset`** — banco de imágenes y vídeos.
`file` (`FileField`, el archivo que se sirve), `original` (`FileField`, null — el que subió el
usuario), `thumbnail` (`ImageField`, null), `kind` (`image | video`), `title`,
`alt_text` / `alt_text_en`, `mime_type`, `size_bytes`, `width` / `height` (null en vídeo),
`uploaded_by` (`SET_NULL`), `tags`.

**Procesado de imágenes en la subida (D12).** El usuario sube lo que quiera y el backend
normaliza, con Pillow (ya es dependencia: `ImageField` lo exige):

1. Reescala si el lado mayor supera `MEDIA_IMAGE_MAX_DIMENSION` (2560 px por defecto). Nadie
   necesita más para web, y una foto de 6000 px son ~15 MB por nada.
2. Convierte a **WebP** con calidad `MEDIA_IMAGE_WEBP_QUALITY` (82 por defecto). WebP soporta
   transparencia, así que los PNG con alfa no se estropean.
3. Genera una **miniatura** (400 px) para la rejilla del panel, que si no cargaría decenas de
   imágenes a tamaño completo.
4. Corrige la orientación EXIF y **descarta el resto de metadatos** (un EXIF lleva GPS y modelo
   de cámara; publicarlo es una fuga de datos gratis).
5. Guarda el **original intacto** en `original`. Cuesta almacenamiento, pero permite
   regenerar todo si mañana cambian los tamaños o WebP deja de convenir. Sin original, esa
   decisión es irreversible.

Todo síncrono, en la propia petición: es una subida de personal interno, tarda del orden de un
segundo y este proyecto **no tiene Celery** a propósito.

Un GIF animado no se convierte (Pillow lo aplanaría a un fotograma): se guarda tal cual.
**Los vídeos no se comprimen** — haría falta ffmpeg, que es una dependencia de sistema pesada.
Para vídeo solo hay límite de tamaño.

Con esto, el límite de subida puede ser generoso (**25 MB en imagen**, porque lo que se
almacena servido ya va comprimido; **100 MB en vídeo**), todo configurable por entorno.

Restricción real: `production.py` sigue con `FileSystemStorage` marcado como PLACEHOLDER. Una
biblioteca de medios sobre disco local **no sobrevive a un despliegue con más de un contenedor**
→ ver riesgos (§6). El procesado descrito arriba es independiente del storage: cuando entre S3,
se cambia `STORAGES` y nada más.

**`Review`** — reseña **de un producto** (D5).
`author_name`, `author_email` (interno, no público), `rating` (1-5, validadores), `body`,
`photo` FK a `MediaAsset` (`null`), `product` FK a `catalog.Product` (`SET_NULL`),
`status` (`published | hidden`, default `hidden`), `is_featured` (destacada en home),
`source` (`web | woocommerce | manual`), `published_at`.

`product` es **obligatorio en el panel** y nulable solo en base de datos: la migración de
WooCommerce puede traer reseñas cuyo producto no exista ya, y prefiero importarlas huérfanas y
reasignarlas a que la importación reviente a mitad.

Vive en `content` y no en `catalog` porque lleva foto (`MediaAsset`) y alimenta las reseñas
destacadas de la home. Ponerla en `catalog` cruzaría las dependencias entre las dos apps en
ambos sentidos.

**`BlogCategory`**: `name` / `name_en`, `slug`, `position`, `is_active`.
**`BlogPost`**: `title` / `title_en`, `slug` (único), `category` FK (`PROTECT`), `cover` FK a
`MediaAsset` (`null`), `excerpt` / `excerpt_en`, `body` / `body_en`, `status`
(`draft | published`), `published_at`, `author` FK a User (`SET_NULL`).

**`Page`** — página fija. `key` (choices cerradas: `about | visit | help`), `title` / `title_en`,
`seo_title` / `seo_description` (+ `_en`). Choices cerradas porque el frontend tiene rutas fijas:
crear páginas nuevas desde el panel implicaría rutas dinámicas, que nadie ha pedido.
**`PageBlock`**: `page` FK, `position`, `title` / `title_en`, `body` / `body_en`, `image` FK a
`MediaAsset` (`null`), `is_active`.

### `apps/core`

**`FeatureFlag`**: `key` (`SlugField` único), `name`, `description`, `is_enabled`.
Solo almacenamiento y lectura; **el comportamiento que activan no se implementa** en estas fases.

### `apps/orders`

**`OrderStatusChange`**: `order` FK, `from_status`, `to_status`, `note`, `changed_by`
(`SET_NULL`), `created_at`. Escrito **siempre desde el servicio**, nunca desde la vista.
**`OrderNote`**: `order` FK, `body`, `author` (`SET_NULL`). El panel muestra un hilo de notas;
`Order.staff_note` es un único campo y se quedaría corto. `staff_note` **no se toca**
(lo usa el flujo de devoluciones) → **decisión D6**.

---

## 3. Cambios sobre modelos existentes

| Cambio | Riesgo | Mitigación |
|---|---|---|
| `Product.line` (choices, default `pret_a_porter`) | **Bajo** — aditivo, no aparece en serializers públicos | D1 antes de migrar |
| `Product.status` (`draft | active | archived`) coexistiendo con `is_published` | **Medio** — dos fuentes de verdad | `status` es canónico; `save()` deriva `is_published = (status == active)`. Los querysets públicos (`filter(is_published=True)`) siguen funcionando **sin tocarse**. Migración de datos: `True → active`, `False → draft` |
| `Product.collection` FK null | Bajo | `PROTECT` |
| `Product.fabrics` M2M | Bajo | — |
| `Order.tracking_carrier` / `tracking_code` / `tracking_url` (blank) | Bajo, pero **contradice** "sin tracking" de `DECISIONS_PENDING.md` | D4: campos informativos internos, **no** expuestos en la API pública de pedidos |
| `Variant.stock` pasa a ser suma de `StockLevel` | **Alto** si se toca la reserva | §4: no se toca la reserva. `stock` sigue siendo la columna que lee el checkout |
| `catalog.ProductEnquiryView` pasa a **persistir** además de enviar el email | Bajo | Misma request, misma respuesta 202, mismo throttle. Solo se añade un `INSERT`. Es la única modificación a una vista pública y el propio encargo la pide |

No hay ningún cambio incompatible propuesto. Si al implementar aparece uno, me paro y pregunto.

---

## 4. Stock por ubicación — diseño (D3 resuelta)

Hoy: `Variant.stock` y `Variant.reserved`, con `CheckConstraint(reserved <= stock)`, y todo el
ciclo de checkout (`create_order_from_cart` → `mark_order_paid` → `release_expired_reservations`)
opera sobre esas dos columnas con `select_for_update`.

**Regla de negocio cerrada (2026-08-12):** toda compra online sale **únicamente del almacén**.
Lo que hay en tienda son **muestras** y **no se vende nunca**.

Esto no es un matiz: cambia qué significa `Variant.stock`.

- `StockLevel(variant, location, quantity)` es el desglose operativo.
- `Location.is_sellable` marca qué ubicaciones cuentan como stock vendible (almacén sí,
  tienda no).
- **`Variant.stock` = `SUM(StockLevel.quantity)` de las ubicaciones vendibles**, no de todas.
  Sigue siendo la única columna que el checkout lee y escribe: el camino de pago **no se toca**.
- Las muestras de tienda se ven en el panel, se ajustan como cualquier otra ubicación y
  **jamás** entran en el número que la web ofrece.

Si `Variant.stock` fuese la suma de todas las ubicaciones, la web ofrecería las muestras y se
venderían prendas que no se pueden servir. Es exactamente el fallo que el sistema evita hoy
bloqueando el checkout a cero, así que aquí no cabe aproximar.

**Ajustes desde el panel**, siempre en una transacción: escribe/actualiza `StockLevel`,
registra `StockMovement` y recalcula `Variant.stock` con `select_for_update` sobre el variante.

**Ventas:** descuentan de `Variant.stock` como hoy y, además, del `StockLevel` del almacén,
con un `StockMovement` de `reason = sale`. Con una sola ubicación vendible no hay ambigüedad
sobre de dónde sale la unidad, que era justo lo que bloqueaba esta decisión.

**Por qué no reservar por ubicación:** con una única ubicación vendible, reservar por ubicación
no aporta nada y multiplicaría los `select_for_update` en el camino de pago, abriendo
interbloqueos nuevos a cambio de cero funcionalidad.

**Guarda:** si algún día existe más de una ubicación vendible, la regla "de dónde se descuenta"
vuelve a estar indefinida. Se añade una validación que impide marcar una segunda ubicación como
vendible sin decidirlo antes, en lugar de dejar que el sistema elija en silencio.

**Coste de rendimiento:** cero en el camino de venta. El panel paga un `prefetch_related` extra
en el listado de stock.

---

## 5. Editor de la home — JSON tipado, no modelos polimórficos

**Propuesta: un solo modelo.**

```
HomeBlock(UUIDTimeStampedModel):
    block_type  # choices cerradas: hero, text, media_banner, product_row,
                # split_media, tabs_row, image_text, featured_reviews
    position    # orden en la landing
    is_active
    data        # JSONField, forma validada por tipo en el serializer
```

**Por qué JSON y no 8 modelos (ni un modelo base + 8 hijos):**

- Ocho tipos con formas dispares darían 8 tablas + 8 serializers + 8 rutas o un polimorfismo
  a mano; reordenar la landing pasaría de un `UPDATE position` a coordinar varias tablas.
- La forma de estos bloques la dicta una maqueta que va a seguir moviéndose. Con tablas, cada
  ajuste visual es una migración; con JSON validado, es un cambio de serializer y de tests.
- No hay consultas por el contenido de los bloques: la home se lee entera de una vez. El
  argumento fuerte a favor de columnas (filtrar, agregar, unir) aquí no aplica.

**Cómo se evita que "JSON" signifique "sin validar":**

- Un serializer por tipo (`HeroDataSerializer`, `ProductRowDataSerializer`…), en un registro
  `BLOCK_SERIALIZERS[block_type]`. El serializer de `HomeBlock` elige por `block_type` y valida
  `data` contra él. Un tipo desconocido es error de validación.
- Las referencias van como **UUID validados contra la BD** en el serializer:
  `media_id → MediaAsset`, `product_ids → Product`, `review_ids → Review`. Lo que se pierde
  frente a una FK es el `ON DELETE`: por eso el borrado de un `MediaAsset` en uso se rechaza
  (D11) y la lectura de la home ignora referencias muertas en vez de romperse.
- **CTAs**: enum cerrado `CtaTarget` en Python (`home`, `shop`, `product_detail`, `collection`,
  `atelier`, `archive`, `blog`, `blog_post`, `about`, `visit`, `help`, `contact`), más
  `params` validados por destino. **Nunca texto libre**, como pide el encargo.
- `drf-spectacular`: `PolymorphicProxySerializer` sobre `block_type` para que el esquema
  documente cada forma en vez de un `object` opaco.

El coste real de esta elección: la integridad referencial de las referencias dentro de `data`
la sostiene el código, no la base de datos. Es el único punto donde acepto eso, y a cambio de
que la sección más volátil del panel no arrastre migraciones.

---

## 6. Rutas propuestas

Todas bajo `/api/v1/admin/`, todas con `IsStaff`, todas paginadas y ordenables salvo donde se
indique.

**Catálogo** — tag `Admin · Catálogo`
```
products/                       GET POST
products/{id}/                  GET PATCH DELETE       (DELETE = archivar, ver D8)
products/{id}/colorways/        GET POST
colorways/{id}/                 GET PATCH DELETE
colorways/{id}/variants/        GET POST
variants/{id}/                  GET PATCH DELETE
products/{id}/images/           GET POST (multipart)
products/{id}/images/reorder/   POST  {"order": [id, id, …]}   (transaccional)
images/{id}/                    PATCH DELETE
products/{id}/components/       GET POST      (BundleComponent)
families/ categories/ sizes/    CRUD
colors/                         CRUD
fabrics/                        CRUD
collections/                    CRUD
```
Filtros del listado de productos: `line`, `status`, `family`, `category`, `collection`,
`sale_mode`, `is_outlet`, `kind`, `search`, `ordering`.

**Stock** — tag `Admin · Stock`
```
stock/variants/                 GET   (SKU, talla, total, reservado, disponible, desglose)
stock/variants/{id}/            GET
stock/variants/{id}/adjust/     POST  {"location": id, "delta": n, "reason", "note"}
stock/variants/{id}/set/        POST  {"levels": [{"location": id, "quantity": n}], "reason"}
stock/movements/                GET   (auditoría, filtrable por variante, ubicación, fecha)
locations/                      CRUD
```

**Pedidos** — tag `Admin · Pedidos`
```
orders/                         GET   (filtros: status, fechas, email, referencia, pagado)
orders/{id}/                    GET PATCH   (PATCH: tracking, datos de facturación)
orders/{id}/status/             POST  {"status", "note"}   → valida transición + registra
orders/{id}/history/            GET   (OrderStatusChange)
orders/{id}/notes/              GET POST
returns/                        GET
returns/{id}/                   GET PATCH   (aceptar/rechazar, importe, refunded_at)
```

**Consultas y citas** — tag `Admin · Consultas`
```
enquiries/                      GET POST
enquiries/{id}/                 GET PATCH   (estado, nota interna, responsable)
```

**Contenido** — tags `Admin · Reseñas`, `Admin · Blog`, `Admin · Contenido`, `Admin · Diseño`
```
reviews/                        CRUD    (+ filtros status, is_featured, product)
blog/categories/                CRUD
blog/posts/                     CRUD
pages/                          GET PATCH        (lista cerrada, sin POST/DELETE)
pages/{key}/blocks/             GET POST
pages/{key}/blocks/reorder/     POST
page-blocks/{id}/               PATCH DELETE
home/blocks/                    GET POST
home/blocks/{id}/               GET PATCH DELETE
home/blocks/reorder/            POST
home/cta-targets/               GET   (enum cerrado, para que el panel pinte el selector)
```

**Medios** — tag `Admin · Medios`
```
media/                          GET POST (multipart)    (filtros: kind, search, tags)
media/{id}/                     GET PATCH DELETE        (DELETE rechaza si está en uso)
```

**Extras** — tag `Admin · Extras`
```
feature-flags/                  GET
feature-flags/{key}/            GET PATCH
```

**Contexto del panel** — tag `Admin · Core`
```
me/          GET   (usuario staff actual)
summary/     GET   (contadores del dashboard: pedidos pendientes, consultas sin atender,
                    variantes sin stock, reseñas por moderar)
```

---

## 7. Decisiones — **resueltas el 2026-08-12**

| # | Decisión | Resolución |
|---|---|---|
| **D1** | prêt-à-porter / atelier / archivo | **Campo nuevo `Product.line`** (choices, default `pret_a_porter`) |
| **D2** | Borrador / Activo / Archivado | **`Product.status` canónico**, `is_published` derivado en `save()`. La API pública no se toca |
| **D3** | Stock por ubicación | **La venta online sale solo del almacén; las prendas de tienda son muestras y no se venden.** `Location.is_sellable`; `Variant.stock` = suma de ubicaciones vendibles. Checkout intacto (§4) |
| **D4** | Tracking | **Sí**, tres campos de texto **internos**. No se exponen en la API pública del cliente |
| **D5** | Reseñas | **De producto**: `product` obligatorio en el panel, nulable en BD solo por la importación de WooCommerce. El modelo vive en `content` |
| **D6** | Notas internas de pedido | **`OrderNote`** (hilo con autor y fecha). `staff_note` se queda como está |
| **D7** | `composition` vs `Fabric` | **Conviven**. Unificar se valorará aparte, más adelante |
| **D8** | Borrado | **`DELETE` archiva** en `Product`. Borrado real solo en catálogos auxiliares sin uso, con `PROTECT` |
| **D9** | Roles | **Un solo rol `is_staff`** por ahora; el sistema de roles y permisos llega después. Se deja `IsStaff` como único punto a tocar |
| **D10** | Bilingüe | Telas, blog, páginas, home y colecciones **sí**; reseñas y notas internas **no** |
| **D11** | Borrar un `MediaAsset` en uso | **Se rechaza** con `BusinessRuleError` 409, listando dónde se usa |
| **D12** | Subidas | **Normalización en el servidor**: reescalado a 2560 px, conversión a **WebP**, miniatura, EXIF limpiado y original conservado. Límites 25 MB imagen / 100 MB vídeo. Vídeo sin comprimir. Detalle en §2 → `MediaAsset` |

Todas quedan registradas en `DECISIONS_PENDING.md`.

---

## 8. Riesgos abiertos que no resuelve este plan

- **Almacenamiento de media en producción.** `production.py` usa `FileSystemStorage` marcado
  como PLACEHOLDER. Una biblioteca de medios sobre disco local pierde los archivos en cada
  despliegue y no funciona con más de un contenedor. La biblioteca de medios **se puede
  construir igual** (el modelo y la API no cambian al mover el storage), pero **no se puede
  poner en producción** hasta cerrar R2/S3. Ya figura en `DECISIONS_PENDING.md`.
- **`django-axes`** sigue pendiente y ahora hay una superficie de admin autenticada más ancha.
- **Subidas y CSRF/CORS**: el panel Next.js tendrá su propio origen; hay que añadirlo a
  `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` (variables de entorno, sin código nuevo).

---

## 9. Fases propuestas, por dependencia

Una fase = un commit coherente, con su migración, sus tests (permisos: anónimo 403 / usuario
403 / staff 200, creación válida, validación que falla) y el esquema OpenAPI validado. Al
cerrar cada una: `pytest` y `manage.py check --deploy` con settings de producción, y **espero
tu aprobación** antes de seguir.

| Fase | Contenido | Depende de |
|---|---|---|
| **1** | Infraestructura admin: `IsStaff`, `AdminModelViewSet`, throttle `admin`, `config/admin_urls.py`, tags spectacular, `core.FeatureFlag`, `content.MediaAsset` + subida, `admin/me/` | — |
| **2** | Catálogo: `Collection`, `Fabric`, `Product.line`/`status`/`collection`/`fabrics` (D1, D2, D7) + CRUD de producto/colorway/variante/imágenes con reordenación, y CRUD de familias, categorías, tallas y colores | 1 |
| **3** | Stock: `Location`, `StockLevel`, `StockMovement`, endpoints de lectura y ajuste (D3) | 2 |
| **4** | Pedidos: `OrderStatusChange`, `OrderNote`, campos de tracking, listado/detalle/cambio de estado con validación de transiciones, devoluciones desde el panel (D4, D6) | 1 |
| **5** | Consultas y citas: `appointments.Enquiry`, admin CRUD, y persistencia en `ProductEnquiryView` sin cambiar su contrato | 1, 2 |
| **6** | Reseñas: `content.Review`, moderación y destacadas (D5) | 1 |
| **7** | Blog y contenido: `BlogCategory`, `BlogPost`, `Page`, `PageBlock` | 1 |
| **8** | Diseño de la home: `HomeBlock` + serializers por tipo + `CtaTarget` + reordenación (§5) | 1, 2, 6, 7 |
| **9** | Cierre: `admin/summary/`, repaso del esquema OpenAPI completo, actualización de `README.md` y `DECISIONS_PENDING.md` | todas |

La 4, 5, 6 y 7 son independientes entre sí: se pueden reordenar según lo que más te urja del
panel. La 8 va la última a propósito, porque referencia productos, reseñas y medios.
