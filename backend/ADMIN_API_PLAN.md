# Plan de la API del panel admin

Este documento no existía en el repo (`INTEGRACION.md`, sesión anterior, ya lo señalaba
como decisión pendiente). Se creó junto con la Fase 0/1, porque los tres prompts que dieron
lugar a este trabajo la daban por hecha y no lo estaba — ver el aviso al principio de cada
sección de trabajo de esa conversación. A partir de aquí es la fuente de verdad: las fases
siguientes se construyen sobre esto, no se rediseña lo ya cerrado.

---

## Fase 0/1 — Fontanería: sesión de staff, base de escritura, medios

### Autenticación de staff

**No es un sistema de auth aparte.** Reutiliza `accounts.User.is_staff` (ya existía,
declarado como "acceso al admin") y la misma `SessionAuthentication` + cookie que ya usa
toda la API — el panel hace login contra el `POST /api/v1/auth/login/` público de
siempre, no hay un endpoint de login propio.

- `GET /api/v1/admin/me/` — comprueba la sesión. Sin sesión, **401**; con sesión pero sin
  `is_staff`, **403**. Ambos casos son el comportamiento estándar de DRF con
  `SessionAuthentication` (`APIView.handle_exception` reescribe `NotAuthenticated` a 403
  cuando ningún autenticador configurado expone `authenticate_header` — verificado en
  vivo, no es algo que haya que forzar a mano). El frontend del panel debe tratar **401 y
  403 igual**: sin panel, redirige a `/admin/login`.
- `apps.adminapi.permissions.IsStaff` — el único permiso nuevo. Se usa en absolutamente
  todo lo demás de este documento.
- `apps.adminapi.viewsets.AdminModelViewSet` — base de cualquier CRUD del panel:
  `IsStaff`, paginación `DefaultPagination` (20/página, máx. 100 — misma que la pública),
  `throttle_scope = "admin"` (cupo propio, `THROTTLE_ADMIN`, 300/min por defecto —
  personal identificado, no tráfico anónimo).

### Medios (`apps.media`)

Biblioteca de archivos reutilizable entre secciones (producto hoy; blog, contenido y
diseño de home cuando existan esas fases) — no está acoplada a "producto".

| Endpoint | Qué hace |
|---|---|
| `GET /api/v1/admin/media/` | Lista paginada. |
| `POST /api/v1/admin/media/` | Alta, multipart (`file` + `alt_text` opcional). |
| `PATCH /api/v1/admin/media/{id}/` | Solo `alt_text` — sustituir el archivo es un alta nueva. |
| `DELETE /api/v1/admin/media/{id}/` | Borra si nada lo usa; **409** con `details.usages` si está en uso. |

- **Imágenes**: reescaladas a máx. 2560px, convertidas a WEBP, con miniatura (600×600) y
  EXIF limpio — siempre en servidor (`apps.media.processing`), nunca se confía en la
  compresión que ya haga el navegador. Límite 25 MB. Formatos: JPEG, PNG, WebP, GIF.
- **Vídeos**: se guardan tal cual (sin reencodado ni miniatura — exigiría ffmpeg, fuera de
  alcance). Límite 100 MB. Formatos: MP4, WebM, MOV.
- **"En uso"**: `MediaAsset.usages()` es el único sitio que sabe quién referencia un
  archivo — hoy solo `catalog.ProductImage.asset`. Cualquier modelo nuevo que enlace a
  `MediaAsset` (blog, diseño de home...) debe registrarse ahí para que el 409 siga
  explicando dónde, en vez de fallar con un `IntegrityError` opaco.
- **PLACEHOLDER — no apto para producción.** El storage sigue siendo `FileSystemStorage`
  incluso en `production.py` (comentario ya existente ahí: "PLACEHOLDER — NO APTO PARA
  PRODUCCIÓN REAL"). Lo subido se pierde en cada despliegue hasta que se migre a S3/R2
  (cambiar `STORAGES`). **Es requisito antes de salir a producción**, no una mejora
  futura — ver `DECISIONS_PENDING.md` e `INTEGRACION.md`.

---

## Fase 2 — Catálogo: `line`/`status`, `Collection`, `Fabric`, CRUD admin

### Decisiones de modelado (confirmadas antes de escribir código, no adivinadas)

- **`Product.line`** (`pret_a_porter` | `atelier` | `archive`, default `pret_a_porter`):
  los "tipos" `archivo`/`novia`/`fiesta` de `productosMock` (panel) **colapsan los tres en
  `archive`** — no son líneas comerciales aparte, son colecciones editoriales dentro del
  archivo. `line` no distingue Runway de Novia de Fiesta; eso queda fuera de esta fase
  (ver el punto siguiente).
- **`Collection` vs. las "colecciones editoriales" del archivo**: son cosas **distintas**.
  `Collection` (este modelo) es una etiqueta de **temporada** (`code`, `name`/`name_en`,
  `starts_on`/`ends_on`, `position`, `is_active`), reutilizable por cualquier producto de
  cualquier `line`. El sistema de colecciones con looks que hoy vive en
  `categoriasMock` (Runway/Novia/Fiesta, cada una con `numeroLooks`/`looks[]`) **no lo
  cubre este modelo** — necesitaría una entidad `Look` que no existe todavía. Las páginas
  `/admin/colecciones/{runway,novia,fiesta}` del panel **siguen en mock** tras esta fase;
  conectarlas es trabajo de una fase futura, no de esta.
- **`Product.status`** (`draft` | `active` | `archived`, default `draft`) es la fuente de
  verdad de la publicación. `Product.is_published` (ya existía, la usa
  `ProductViewSet.get_queryset` público) **se deriva de `status` en `Product.save()`** —
  no se edita a mano, se sobrescribe. Migración de datos: `is_published=True` →
  `active`, `is_published=False` → `draft` (`0003_backfill_product_status_from_is_published.py`).
- **D7 — `composition` (texto libre) convive con `Fabric` (biblioteca)**: no son
  excluyentes. `composition` sigue siendo la descripción en prosa de la ficha; `fabrics`
  (M2M) es la biblioteca reutilizable, mismo patrón que `Color`.
- **D8 — borrar un producto archiva, no elimina la fila**: `AdminProductViewSet.perform_destroy`
  llama a `Product.archive()` (pone `status=archived`), nunca `.delete()`. Conserva el
  histórico de pedidos/reseñas que lo referencien.
- **`ProductImage` ya no guarda el archivo**: referencia un `media.MediaAsset`
  (`on_delete=PROTECT`). El serializer público (`ProductImageSerializer.image`) sigue
  devolviendo la misma URL de siempre — se resuelve por dentro contra `asset.file.url`,
  la API pública no cambió de forma. Sin datos que migrar: no había ninguna imagen de
  producto subida antes de esta fase.

### La API pública no se tocó

Confirmado por lo que NO cambió: `ProductListSerializer`/`ProductDetailSerializer` no
ganaron campos nuevos (`line`/`status`/`collection`/`fabrics` no aparecen ahí — a
propósito), `ProductViewSet.get_queryset` sigue filtrando por `is_published=True` sin
tocar una línea, y `ProductImageSerializer.image` devuelve exactamente la misma forma.

### CRUD admin

Todo bajo `AdminModelViewSet` (staff, paginado, cupo `admin`). Las relaciones llevan
siempre un campo escribible (`family`, `collection`...) más un `*_detail` de solo lectura
con el objeto anidado, para poder leer la ficha completa de una tirada y escribir
mandando solo ids — mismo patrón que ya usaba `FavoriteSerializer.product_detail`.

| Recurso | Endpoint | Notas |
|---|---|---|
| Productos | `/api/v1/admin/products/` | Ve borradores/archivados (a diferencia del público). `DELETE` archiva. Filtros: `family`, `line`, `status`, `kind`, `sale_mode`, `is_outlet`, `category`, `collection`. |
| Colorways | `/api/v1/admin/colorways/` | `sku` autogenerado si se deja vacío, editable a mano. |
| Variantes | `/api/v1/admin/variants/` | `stock` real editable; `reserved` de solo lectura (la toca el checkout). |
| Imágenes de producto | `/api/v1/admin/product-images/` | Reordenar = `PATCH position` por fila; sin endpoint aparte. |
| Familias | `/api/v1/admin/families/` | |
| Categorías | `/api/v1/admin/categories/` | Plana (`parent` escribible), no anidada — el árbol se construye en cliente. |
| Tallas | `/api/v1/admin/sizes/` | |
| Colores | `/api/v1/admin/colors/` | |
| Tejidos | `/api/v1/admin/fabrics/` | `image` referencia `media.MediaAsset`. |
| Colecciones (temporada) | `/api/v1/admin/collections/` | Ver aviso de modelado arriba — no son las colecciones editoriales del archivo. |

### Borrado con dependencias: 409, no 500

Cualquier `on_delete=PROTECT` (Family, Category.parent, Product.collection,
ProductImage.asset...) que antes hubiera reventado con un `ProtectedError` crudo ahora lo
captura `apps.core.exceptions.api_exception_handler` y lo convierte en `409` con
`code: "protected"` y `details.protected_objects` — arreglo transversal, no solo de este
CRUD, cualquier `PROTECT` futuro en cualquier app se beneficia igual.

### Qué NO cubre esta fase (fuera de alcance, no descuidado)

- Looks / colecciones editoriales del archivo (Runway/Novia/Fiesta) — ver decisión de
  modelado arriba.
- `BundleComponent` (piezas de un conjunto `kind=bundle`) sin CRUD admin propio todavía —
  no estaba en la lista explícita de este prompt ni lo consume ninguna página del panel
  reconectada en esta ronda.
- Reconexión de `/admin/colecciones/*`, `/admin/diseno`, `/admin/resenas`, etc. — fuera
  de las páginas listadas para esta ronda (`/admin/productos*`, `/admin/categorias`,
  `/admin/materiales/*`).

---

## Verificado (no por suposición)

Backend en marcha con `seed_demo`, comprobado en vivo antes de dar por cerrado cada
punto: `admin/me/` (401 anónimo, 403 no-staff, 200 staff), subida real de imagen
(redimensionado a 2560px confirmado, WEBP real, EXIF vacío comprobado con Pillow),
`PATCH`/`DELETE` de medios, alta/edición/borrado de cada recurso del CRUD, `PATCH status`
de un producto ocultándolo y volviendo a publicarlo en la API pública en el mismo
proceso, borrado de familia en uso devolviendo 409 con el producto que la bloquea, imagen
adjuntada a un producto apareciendo como `primary_image` en la ficha pública con la URL
correcta. 224 tests (`pytest`), `ruff check`/`format --check`, `spectacular --validate
--fail-on-warn` y `check --deploy` contra `production.py`, todo en verde.

---

## Fase 3 — Stock por ubicación (`apps.stock`, nueva app)

Modelos: `Location` (code/name/kind `store`|`warehouse`/`is_sellable`/`is_active`/`position`),
`StockLevel` (variant+location, único por par, `quantity`), `StockMovement` (auditoría:
variant, location, delta, quantity_before/after, reason, created_by, solo lectura desde la
API — lo crea `adjust`/`set`, nunca un POST directo).

**D3 — `Variant.stock` sigue siendo el mismo campo de siempre, ahora derivado.** No se ha
tocado ni un solo sitio que ya lo leyera (`available`/`in_stock`, checkout, reservas,
`apps/orders/services.py` al confirmar pago o al reponer en una devolución — todo eso
sigue exactamente igual). Lo que cambia es que ahora es la suma de los `StockLevel` de
ubicaciones **vendibles y activas** (las prendas de tienda son muestras, nunca se venden).
Dos caminos lo mantienen sincronizado, ver docstring de módulo en `apps/stock/models.py`
y el `save()` de `Variant` en `apps/catalog/models.py`:

1. `stock/variants/{id}/adjust|set/` escribe el `StockLevel` y recalcula `Variant.stock`
   con un `.update()` (sin pasar por `save()`, para no disparar el punto 2).
2. Cualquier otro sitio que ya escribía `Variant.stock` directamente (checkout, devoluciones)
   sigue haciendo lo mismo de siempre; `Variant.save()` detecta el cambio y propaga el
   mismo delta a la ubicación vendible, para que su desglose no se desincronice.

**Guarda explícita — como mucho una ubicación vendible a la vez.** Marcar una segunda como
`is_sellable=True` deja indefinido de dónde se descuenta lo vendido — lo bloquea
`AdminLocationSerializer.validate()` con `BusinessRuleError` (409, `code:
"multiple_sellable_locations"`), no una constraint de base de datos (depende de comparar
contra el resto de filas).

**Migración de datos** (`apps/stock/migrations/0002_backfill_stock_levels.py`): crea una
única ubicación vendible por defecto ("Almacén principal", code `ALM01`) y un `StockLevel`
por cada `Variant` existente con `quantity = variant.stock` — así la suma coincide
exactamente con lo que ya había, sin cambiar lo que la web puede vender. No crea ninguna
ubicación de tienda (alta de datos de negocio, no algo que una migración de esquema deba
inventar). Con test propio (`apps/stock/tests/test_backfill_migration.py`): backfill
correcto, idempotencia, reversión.

**Endpoints** (`/api/v1/admin/stock/...`):

| Recurso | Endpoint | Notas |
|---|---|---|
| Variantes (lectura + desglose) | `GET stock/variants/`, `GET stock/variants/{id}/` | `levels`: una fila por ubicación (incluidas las que todavía no tienen `StockLevel` propio, con cantidad 0 — para que la tabla del panel tenga siempre las mismas columnas). |
| Ajustar | `POST stock/variants/{id}/adjust/` | Body `{location, delta, reason}` — `delta` puede ser negativo; rechaza con 409 (`insufficient_stock`) si dejaría la ubicación por debajo de 0. |
| Fijar | `POST stock/variants/{id}/set/` | Body `{location, quantity, reason}` — cantidad exacta, no relativa. |
| Movimientos (histórico) | `GET stock/movements/` | Solo lectura, filtrable por `variant`/`location`. |
| Ubicaciones | `/api/v1/admin/stock/locations/` | CRUD completo (`AdminModelViewSet`). |

`reason` es obligatorio en ambas acciones (400 si va vacío) — el pedido explícito de
"los ajustes exigen motivo" se cumple en el propio serializer de entrada, no solo en el
frontend.

### Verificado

24 tests nuevos de `apps.stock` + los 224 anteriores intactos (248 en total), incluidos
los de checkout/devoluciones de `apps.orders` (confirman que el ciclo de reserva no se ha
tocado). `ruff check`/`format --check`, `makemigrations --check --dry-run`, `spectacular
--validate --fail-on-warn`, `check --deploy`, todo en verde.

---

## Fase 4 — Pedidos (`apps.orders`, reutiliza el `Order`/`Return` ya existentes)

No hace falta una app nueva: `Order`/`OrderLine`/`Return`/`ReturnLine` ya existían (los
usa el checkout público desde la Fase 1). Lo nuevo son dos modelos de auditoría y tres
campos, más todo el CRUD/acciones admin (`admin_serializers.py`/`admin_views.py`/
`admin_urls.py`, mismo patrón que Fases 1-3).

**`OrderStatusChange`** — una fila por cada cambio real de `Order.status`, la crea
`change_order_status()` (nunca a mano). **`OrderNote`** — hilo con autor y fecha (D6);
`Order.staff_note` (un único campo, sin historial) se deja intacto porque lo sigue
usando el flujo de devoluciones, conviven los dos. **Tracking (D4)** —
`tracking_carrier`/`tracking_code`/`tracking_url` en `Order`, texto libre (sin
integración con transportista real), **fuera de `OrderSerializer` público** — el
cliente nunca ve estado de envío (ver docstring de esa clase).

**Transiciones de estado validadas.** El mock dejaba saltar libremente entre sus 3
estados; el modelo real tiene 8 (`pending_payment/paid/processing/shipped/delivered/
cancelled/refunded/partially_refunded`), y no todos tiene sentido tocarlos a mano desde
el panel — `paid` lo pone el webhook de Stripe, `cancelled` la cancelación pre-pago,
`refunded`/`partially_refunded` las devoluciones aceptadas. `change_order_status()`
(`apps/orders/services.py`) solo permite moverse, libremente en cualquier dirección
(mismo criterio "sin flujo forzado" del mock), dentro de `{processing, shipped,
delivered}`, y solo si el pedido ya está pagado — cualquier otro objetivo es 409
(`invalid_status_target`/`order_not_paid`).

**"Retrasado" — decisión explícita del prompt: en backend.** `Order.is_delayed`
(propiedad + filtro `?is_delayed=true` en `AdminOrderFilter`) — 14+ días desde
`created_at` y `status == processing`. Única fuente de verdad, filtrable/ordenable
server-side, no una comparación contra `Date.now()` recalculada en cada render del
frontend como hacía el mock.

**Alta manual (`POST admin/orders/`).** `create_manual_order()` — venta por teléfono o
en persona, sin carrito ni Stripe. Sin reserva de 1h (esa ambigüedad no existe: quien
la da de alta ya sabe si se cobró): si el estado inicial es `paid`/`processing`
descuenta stock de verdad ahí mismo; si es `pending_payment`, stock intacto. **Nunca
se vincula a `request.user`** — lo crea la empleada, no la clienta; el pedido nace
siempre anónimo (bug real encontrado y corregido en vivo durante esta fase: la primera
versión sí lo vinculaba, apareciendo como un pedido propio de quien lo daba de alta).

**Devoluciones.** `accept`/`reject`/`mark-refunded` sobre `AdminReturnViewSet` — reutiliza
`accept_return()` (ya existía desde la Fase 1, sin tocar); `reject_return()` es nuevo
(rechaza sin tocar stock). El reembolso se ejecuta a mano en Stripe — estos endpoints
solo registran qué y cuándo (`refunded_at`), nunca llaman a la pasarela.

**Endpoints** (`/api/v1/admin/...`):

| Recurso | Endpoint | Notas |
|---|---|---|
| Pedidos | `GET/POST orders/`, `GET/PATCH orders/{id}/` | Filtros: `status`, `email`, `reference`, `paid`, `is_delayed`, `date_from`/`date_to`. `PATCH` solo toca `tracking_*`/`staff_note` — el resto es copia congelada de la compra. |
| Cambiar estado | `POST orders/{id}/status/` | Body `{status, note?}` — valida transición, crea `OrderStatusChange`. |
| Historial | `GET orders/{id}/history/` | Solo lectura. |
| Notas | `GET/POST orders/{id}/notes/` | Hilo, autor = `request.user`. |
| Devoluciones | `GET/PATCH returns/`, `returns/{id}/{accept,reject,mark-refunded}/` | Sin `create` (nace de la solicitud del cliente, API pública). |

### Verificado

277 tests (103 nuevos de `apps.orders`), `ruff check`/`format --check`,
`makemigrations --check --dry-run`, `spectacular --validate --fail-on-warn`,
`check --deploy`, todo en verde. Alta manual, cambio de estado, historial, notas y
aceptar/rechazar devolución probados en vivo contra el backend en marcha (no solo
pytest) — así se encontró el bug de atribución de usuario de arriba.
