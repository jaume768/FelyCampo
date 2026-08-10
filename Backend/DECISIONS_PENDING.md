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
- **Reserva de 1 hora** mientras el cliente paga. Se implementa con marca de caducidad y
  liberación perezosa en transacción — **no requiere Celery/Redis**.

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

## i18n
- La interfaz se traduce en el **frontend**. Idiomas ES/EN.
- **Salvedad**: nombres y descripciones de producto viven en la BD y el frontend no puede
  traducirlos. Se añaden campos `_en` opcionales en el catálogo.

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
- **Auth con el frontend**: implementado con **sesión + cookie** (`SessionAuthentication`),
  que era lo ya configurado. Ninguna vista depende del mecanismo, así que pasar a JWT es
  cambiar la clase de autenticación. Falta confirmarlo con quien haga el frontend.
- **Categorías**: se modeló una jerarquía genérica a petición del cliente; el árbol real
  (novia / fiesta / …) se ajustará más adelante.
- **Cron para los avisos de reposición**: el comando `send_stock_notifications` hay que
  programarlo (cron del servidor cada pocos minutos). La reposición se hace a mano desde el
  admin y no emite ninguna señal.
- **Reseñas**: se migran desde WooCommerce, pero falta modelo y moderación.
- **Categorías**: existe `Family` como eje principal. La navegación por categorías
  (novia / fiesta / outlet…) está modelada de forma jerárquica genérica; falta validar el
  árbol real con el cliente.
- **Contenido editable** (`content`): páginas, bloques, menús, blog. Sin decidir.

## Infraestructura
- **Almacenamiento de media en producción (R2/S3): pendiente.** `production.py` usa
  `FileSystemStorage` marcado como **PLACEHOLDER no apto para producción**.
- Celery/Redis: **no** necesarios con las decisiones actuales (la reserva de stock se
  resuelve sin cola). Se propondrá si aparece una necesidad real.
