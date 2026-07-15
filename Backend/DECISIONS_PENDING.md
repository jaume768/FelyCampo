# Decisiones pendientes (bloquean el modelado del dominio)

Fase 0 deja la infraestructura lista **sin** modelar ninguna regla de negocio. Cada punto
de aquí bloquea una o varias apps. No se implementará nada de esto hasta cerrarlo, porque
condiciona migraciones difíciles de revertir.

## Autenticación y cuentas (`accounts`)
- Estrategia de auth con el frontend: **sesión + cookie** vs **JWT**. Decide DRF auth classes,
  CSRF y CORS definitivos. → Se cierra con quien haga el frontend.
- ¿Registro público, verificación de email, recuperación de contraseña? Fuera de Fase 0.
- Perfil, direcciones (envío/facturación), roles de cliente vs staff.

## Catálogo (`catalog`)
- ¿Producto simple o con **variantes** (talla/formato/peso)? Define si `OrderLine` apunta a
  producto o a variante. **Bloqueante mayor.**
- ¿Gestión de **stock**? (sin stock / informativo / con reserva). Define locking en checkout.
- Categorías jerárquicas, atributos, imágenes, estados de publicación.
- Reseñas: se migran desde WooCommerce, pero falta su modelo y moderación.

## Pedidos y pago (`orders`, Stripe)
- **IVA**: ¿precio con o sin IVA incluido? ¿tipos (21/10/4)? Depende de qué se vende.
- Moneda: se asume **EUR** (Península). Confirmar.
- Estados exactos del pedido y quién los cambia.
- ¿Compra como **invitado** o solo con cuenta?
- Flujo de checkout, snapshot de líneas/precio, idempotencia, reembolsos, pagos fallidos.
- Cupones/descuentos, facturación, cancelaciones/devoluciones: sin decidir.

## Envíos
- Países (¿solo Península?), recogida, tarifas, umbral de envío gratis. No inventar.

## Citas (`appointments`, Calendly)
- Uso confirmado: **webhooks** de cancelación/reprogramación. Falta el modelo de cita,
  su vínculo (o no) con `User`, y la verificación de firma del webhook.

## Contenido (`content`)
- Páginas/bloques editables, menús, blog, categorías, etiquetas.
- **i18n ES/EN**: campos traducidos vs `modeltranslation` vs `parler`. Sin decidir.

## SEO / migración
- Mapa de URLs antiguas → nuevas (301) desde WordPress. Requiere acceso ya disponible a WP
  y Search Console. Falta inventariar URLs.
- Qué se migra de WooCommerce: productos, reseñas, imágenes (¿y usuarios? las contraseñas
  no son migrables).

## Infraestructura (fuera de Fase 0, no bloquea desarrollo)
- Almacenamiento de imágenes en producción (S3/R2), hosting, CI/CD, backups, observabilidad.
- Celery/Redis: **no** añadido; no hay necesidad técnica actual demostrable. Se propondrá
  cuando aparezca (p. ej. reserva de stock con expiración, o email asíncrono).
