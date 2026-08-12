# Decisiones de dominio

Registro de lo cerrado en reunión y lo que sigue bloqueando desarrollo. Lo cerrado ya no
se rediscute; lo pendiente no se implementa hasta tener respuesta, porque condiciona
migraciones difíciles de revertir.

---

# ✅ Decidido (reunión de 2026-08-10)

## Catálogo
- **Tres niveles**: `Product` (familia + diseño/modelo) → `Colorway` (un color, **dueño del
  SKU**) → `Variant` (una talla, **dueña del stock**). La talla **no** entra en el código.
- **SKU** = `familia-diseño-color`. Se **autogenera**, pero es **editable a mano** para poder
  importar el catálogo existente sin pelearse con el generador.
- **Tallas**: lista **cerrada y común** a todo el catálogo (modelo `Size` con orden).
- **Colores**: **catálogo global reutilizable** (modelo `Color`), no por diseño.
- **Conjuntos**: las piezas se venden por separado y además existe el conjunto. Se modela
  como `Product.kind = BUNDLE` con `BundleComponent` apuntando a variantes reales; el stock
  del conjunto se deriva de sus piezas (no se duplica).
- **Modos de venta** (`Product.sale_mode`):
  - `IN_STOCK` — descuenta stock, bloquea a cero.
  - `ON_REQUEST` — **sin precio**, siempre consulta por email.
  - `MADE_TO_ORDER` — reservado para fiesta/novia. Hoy **no se usa**: todo va con stock.
- **Avisos de reposición** (estilo Stradivarius): `StockNotification` (email + variante),
  notifica por Brevo al reponer.
- **Outlet** y **precio rebajado**: cada producto/colorway tiene `price` y `sale_price`
  opcional, más flag de outlet.

## Stock
- Unidades **exactas y fiables** por talla/color.
- **Se bloquea el checkout a cero.** Nunca se acepta pedido sin stock.
- **Reserva de 1 hora** mientras el cliente paga. Marca de caducidad y liberación en
  transacción; la liberación periódica la hace el comando `release_reservations` por cron.
  **No requiere Celery.** Redis sí se usa, pero solo como caché.

## Precios e impuestos
- Los precios se introducen **sin IVA** (PVP que facilita el cliente). El **21%** se añade
  en el cálculo. Moneda **EUR**.
- Territorio: **solo Península** por ahora.

## Pedidos y pago
- **100% del importe por Stripe** en el checkout. No hay pagos parciales ni señal del 30%
  (esto se corrigió expresamente respecto a la primera versión de las notas).
- **Compra como invitado** permitida.
- Sin cupones. Los descuentos son precio rebajado a nivel de artículo.

## Envíos
- **Tarifa plana única**, independiente del número de artículos.
- Existe un **importe mínimo de pedido**.
- **Sin recogida en atelier**: toda compra web se envía.
- **Sin integración de transportista ni tracking**: lo gestiona una empresa externa.

## Devoluciones
- Plazo **14 días**. El **retorno lo paga el cliente**.
- Totales y parciales desde el panel. Reembolso del **100%** del importe del artículo.
- El reembolso se ejecuta **a mano**, no automático desde el panel.

## Citas
- **Un calendario por atelier**.
- **Sin cancelación ni reprogramación online**: los cambios se piden por email. Esto elimina
  la necesidad de webhooks de cancelación de Calendly.

## Área privada del cliente
- Pedidos, favoritos y citas.
- **El estado del pedido NO se muestra al cliente**: del envío se encarga una empresa
  externa, así que se le remite a su correo o al teléfono de la tienda. El estado existe en
  el modelo y en el panel, pero la API pública no lo expone.

## Facturación
- **No se genera PDF fiscal.** Cuando el cliente la pide, se envía un **email legible** a
  administración con datos del cliente, líneas de pedido y total.
- La dirección destino es un **placeholder configurable por entorno** (`INVOICE_REQUEST_EMAIL`).

## Frontend, sesión y cookies
- **Autenticación: sesión + cookie** (`SessionAuthentication`). **Decidido**, no pendiente.
  La cookie es `HttpOnly`, así que no queda expuesta a XSS como un JWT en almacenamiento
  del navegador. Cambiar a JWT sería tocar solo la clase de autenticación de DRF: ninguna
  vista depende del mecanismo.
- **Frontend y API en el mismo dominio registrable**: `felycampo.com` para el frontend y
  `api.felycampo.com` para la API. En consecuencia **`COOKIE_SAMESITE=Lax`**, que es el
  valor por defecto y evita las restricciones de cookies de terceros de Safari/ITP.
  Requiere control del DNS del dominio al desplegar.
- **CORS**: `CORS_ALLOW_CREDENTIALS = True`, orígenes **explícitos en todos los entornos**
  (nunca comodín: con credenciales el navegador descarta las respuestas con `*`), y
  `x-cart-id` declarada en `CORS_ALLOW_HEADERS` para que funcione el preflight del carrito.
- **CSRF entre subdominios**: `CSRF_TRUSTED_ORIGINS` debe listar el origen del frontend, o
  Django responde 403 a todos los POST. Es obligatorio en producción (guarda de arranque).
  El token se entrega en el cuerpo de `GET /auth/csrf/`, así que **no hace falta tocar
  `CSRF_COOKIE_DOMAIN`** aunque el JavaScript no pueda leer la cookie de otro subdominio.

## Seguridad y operación (revisión posterior a Fase 1)
- **Consulta de pedido sin cuenta**: por **token opaco** enviado en el correo de
  confirmación, no por referencia + email. La referencia es correlativa y se podría
  enumerar el histórico entero.
- **Confirmación de pago**: se rechaza si el pedido está cancelado o si el importe/moneda
  no coinciden. El pedido queda con `needs_manual_refund` y hay que devolver a mano.
- **Verificación de correo**: se envía al registrarse y marca `email_verified`. **No
  bloquea el acceso** — que un correo sin verificar impida comprar o entrar es una decisión
  de producto **pendiente de confirmar con el cliente**.
- **Límites de ritmo** activos en toda la API, con cupos estrictos donde se envían correos.
  Quedan fuera el webhook de Stripe y las sondas de salud. Dependen de `NUM_PROXIES` y de
  `REDIS_URL`: **al desplegar hay que ajustar `NUM_PROXIES` al número real de proxies**
  (nginx/ALB = 1) o el límite se puede esquivar falseando `X-Forwarded-For`.
- **Redis** como caché compartida, obligatorio en producción. Sin Celery. **No es punto
  único de fallo**: los throttles degradan en abierto y la caché lleva timeouts de 0,5 s.
  Si Redis cae, la tienda vende sin límites de ritmo y se registra en ERROR.
- **Tareas por cron obligatorias**: `release_reservations`, `send_stock_notifications`,
  `purge_carts`.

## i18n
- La interfaz se traduce en el **frontend**. Idiomas ES/EN.
- **Salvedad**: nombres y descripciones de producto viven en la BD y el frontend no puede
  traducirlos. Se añaden campos `_en` opcionales en el catálogo.

---

# ✅ Decidido (panel de administración, 2026-08-12)

Contexto y diseño completo en [`ADMIN_API_PLAN.md`](ADMIN_API_PLAN.md).

## Alcance
- API de administración bajo `/api/v1/admin/`, autenticada con **sesión + `is_staff`**.
- **Un solo rol** por ahora: quien es staff lo ve todo. El sistema de roles y permisos
  por sección se implementará después; se concentra en `IsStaff` para no tener que
  rehacer las vistas.
- La API pública de Fase 1 **no cambia de forma**. Todos los cambios sobre modelos
  existentes son aditivos.

## Catálogo
- **Línea comercial**: campo nuevo `Product.line` (`pret_a_porter | atelier | archive`).
  No se reutilizan `kind` (prenda vs conjunto), `family` (segmento del SKU) ni `sale_mode`
  (cómo se compra), porque significan otras cosas.
- **Estados**: `Product.status` (`draft | active | archived`) es la fuente de verdad;
  `is_published` se deriva en `save()` para que el catálogo público siga funcionando sin
  tocarse. Migración de datos: `True → active`, `False → draft`.
- **Eliminar un producto = archivarlo.** Nunca se borra: hay pedidos históricos apuntando.
- **Colecciones**: modelo `Collection` (`fw27`, `ss26`), un producto pertenece a una.
- **Telas**: modelo `Fabric` reutilizable, M2M con `Product`. `Product.composition` (texto
  libre de la ficha) **se conserva** y convive con él; unificarlos rompería la ficha pública
  y se valorará aparte.
- «Sección web» del panel → `Category`, que ya existe.

## Stock por ubicación
- **La venta online sale únicamente del almacén.** Lo que hay en tienda son **muestras** y
  **no se vende nunca**.
- `Location.is_sellable` distingue ambos casos. **`Variant.stock` = suma de las ubicaciones
  vendibles**, no de todas: si sumara las muestras, la web ofrecería prendas que no se
  pueden servir.
- El ciclo de reserva del checkout **no se toca**. No se reserva por ubicación: con una sola
  ubicación vendible no aporta nada y añadiría interbloqueos al camino de pago.
- Se registra cada ajuste en `StockMovement` (quién, cuándo, cuánto, por qué).
- **Guarda**: marcar una segunda ubicación como vendible deja indefinido de dónde se
  descuenta. Se valida y se bloquea hasta decidirlo.

## Pedidos
- **Tracking**: se guardan transportista, código y enlace como **campos internos**. No es una
  integración —sigue sin haberla— y **no se exponen en la API pública**, coherente con que el
  estado del pedido no se muestra al cliente.
- **Notas internas**: modelo `OrderNote` (hilo con autor y fecha). `Order.staff_note` se
  mantiene intacto porque lo usa el flujo de devoluciones.
- Todo cambio de estado queda registrado en `OrderStatusChange`.

## Consultas y citas
- Se **persisten** (modelo `appointments.Enquiry`), además de seguir enviándose por email.
  `ProductEnquiryView` mantiene su contrato: misma petición, misma respuesta 202.
- Guarda *solicitudes*, no calendario: **no prejuzga** la decisión Calendly vs sistema nativo,
  que sigue pendiente.

## Reseñas
- Son **reseñas de producto**: `product` es obligatorio en el panel. Queda nulable en base de
  datos solo para que la importación de WooCommerce no falle con reseñas huérfanas.
- **No se traducen**: es texto escrito por el cliente.
- Estado `published | hidden` y flag `is_featured` para la home.

## Contenido y home
- El editor de la home usa **un modelo `HomeBlock` con `JSONField` validado por tipo**, no
  modelos polimórficos: ocho formas dispares sobre una maqueta que seguirá moviéndose, y
  ninguna consulta filtra por el contenido de los bloques.
- Los **CTA** salen de un **enum cerrado** de rutas internas. Nunca texto libre.
- Las referencias dentro del JSON (medias, productos, reseñas) se validan contra la base de
  datos en el serializer. Como no hay FK real, **borrar un `MediaAsset` en uso se rechaza**
  con 409 indicando dónde se usa.

## Biblioteca de medios
- Modelo `MediaAsset` reutilizable desde Diseño, Blog y Contenido.
- **Las imágenes se normalizan al subirlas**: reescalado a 2560 px de lado mayor, conversión a
  **WebP** (calidad 82), miniatura de 400 px para el panel, orientación EXIF aplicada y resto
  de metadatos **descartados** (un EXIF lleva GPS). El **original se conserva** para poder
  regenerar si cambian los tamaños.
- Síncrono, con Pillow. Sin Celery, coherente con el resto del proyecto.
- **Los vídeos no se comprimen** (haría falta ffmpeg): solo límite de tamaño.
- Límites configurables: 25 MB imagen, 100 MB vídeo.
- **Sigue haciendo falta S3/R2 antes de producción** (ver Infraestructura): con
  `FileSystemStorage` los archivos subidos se pierden en cada despliegue. El procesado es
  independiente del storage; migrar es cambiar `STORAGES`.

## Extras
- `core.FeatureFlag`: solo almacenamiento y lectura del flag. **El comportamiento que activan
  no se implementa** en estas fases.

---

# ⏳ Pendiente (bloquea o retrasa)

## Datos concretos que faltan
- **Importe de la tarifa plana de envío** y **importe mínimo de pedido** (cifras). Se
  implementa como configuración editable; arranca con valores placeholder.
- Aclarar si el importe mínimo **bloquea la compra** o es el **umbral de envío gratis**.
- **Ateliers**: cuántos, dónde, horarios, duración de cita y citas simultáneas.
- **Calendly vs sistema nativo**: pendiente de decidir. Sin cancelación online, un sistema
  nativo en Django evita coste y webhooks, y deja los datos en nuestra BD.
- **Email de administración** para las solicitudes de factura.
- **Dirección(es) destino** de las consultas de productos sin precio: ¿única o por atelier?

## Migración y SEO
- Acceso a WordPress, `sitemap.xml` actual y Search Console: **pendiente de recibir**.
- Inventario de URLs antiguas → nuevas para los 301.
- Qué se migra de WooCommerce: productos, imágenes, reseñas, ¿pedidos históricos? Las
  contraseñas no son migrables en ningún caso.

## Sin cerrar
- **Categorías**: se modeló una jerarquía genérica a petición del cliente; el árbol real
  (novia / fiesta / …) se ajustará más adelante.
- ~~**Reseñas**: falta modelo y moderación.~~ Modelo y moderación decididos (ver panel de
  administración). Sigue pendiente **qué se migra de WooCommerce** y con qué criterio.
- ~~**Contenido editable** (`content`): páginas, bloques, menús, blog.~~ Páginas, bloques,
  blog y home decididos. Los **menús** siguen sin decidir: hoy son fijos en el frontend.

## Seguridad pendiente
- **`django-axes`** para bloquear por IP/cuenta tras varios intentos fallidos en el login y
  en `/admin/`. El límite de ritmo actual frena la fuerza bruta, pero no bloquea al
  atacante ni deja registro de intentos.

## Infraestructura
- **Almacenamiento de media en producción (R2/S3): pendiente.** `production.py` usa
  `FileSystemStorage` marcado como **PLACEHOLDER no apto para producción**.
- **Celery: no** necesario (la reserva de stock se resuelve con transacciones y cron).
- **Redis: sí**, solo como caché de los contadores del límite de ritmo. Obligatorio en
  producción.
