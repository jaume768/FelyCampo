/**
 * Carrito y checkout.
 *
 * **Solo desde Client Components.** El carrito de invitado se identifica con `X-Cart-Id`,
 * que vive en localStorage: en el servidor no existe, y llamar desde un Server Component
 * devolvería siempre el carrito vacío de otra persona.
 *
 * Todas las funciones pasan `conCarrito: true` para que el cliente adjunte la cabecera y
 * persista el `id` que llegue en la respuesta.
 */

import { get, post, patch, del } from './client';

const CON_CARRITO = { conCarrito: true };

/**
 * @typedef {object} TotalesCarrito
 * @property {string} subtotal_net  Suma de líneas SIN IVA.
 * @property {string} shipping_net  Envío SIN IVA.
 * @property {string} vat_rate      Tipo aplicado, p.ej. `"0.21"`.
 * @property {string} vat_total     Importe del IVA.
 * @property {string} total_gross   Total CON IVA. **Es el que se enseña.**
 * @property {string} currency      `"EUR"`.
 */

/**
 * @typedef {object} Carrito
 * @property {string|null} id  `null` mientras no se haya añadido nada (el GET no crea).
 * @property {object[]} items
 * @property {TotalesCarrito} totals
 * @property {boolean} has_stock_issues  Alguna línea perdió stock desde que se añadió.
 */

/**
 * `GET /cart/` — carrito actual.
 *
 * **No crea nada**: sin carrito devuelve `{ id: null, items: [], totals: {...} }`, a
 * propósito, para que los crawlers no llenen la tabla. El id nace en el primer
 * `añadirAlCarrito`.
 *
 * @returns {Promise<Carrito>}
 */
export function obtenerCarrito() {
  return get('/cart/', CON_CARRITO);
}

/**
 * `POST /cart/` — añade una variante.
 *
 * La unidad es la **variante** (producto × color × talla), no el producto: hay que
 * resolverla antes desde `colorways[].variants[]` de la ficha. Si ya existe esa variante
 * en el carrito, el backend suma cantidades (constraint `cart + variant` única).
 *
 * Errores esperables, todos `ApiError` con `status: 400`: sin stock, cantidad por encima
 * de lo disponible, variante inexistente o inactiva. Preséntalos, no los silencies.
 *
 * @param {string} variantId UUID de la variante.
 * @param {number} [cantidad=1]
 * @returns {Promise<Carrito>} El carrito entero ya recalculado.
 */
export function anadirAlCarrito(variantId, cantidad = 1) {
  return post('/cart/', { variant: variantId, quantity: cantidad }, CON_CARRITO);
}

/**
 * `PATCH /cart/items/{id}/` — cambia la cantidad de una línea.
 *
 * Cambiar de talla NO es esto: es otra variante. Hay que borrar la línea y añadir la
 * nueva.
 *
 * @param {string} itemId UUID del `CartItem` (`item.id`), no de la variante.
 * @param {number} cantidad Mínimo 1. Para quitar, usa `quitarDelCarrito`.
 * @returns {Promise<Carrito>}
 */
export function actualizarCantidad(itemId, cantidad) {
  return patch(`/cart/items/${encodeURIComponent(itemId)}/`, { quantity: cantidad }, CON_CARRITO);
}

/**
 * `DELETE /cart/items/{id}/` — quita una línea.
 * @param {string} itemId UUID del `CartItem`.
 * @returns {Promise<Carrito|null>}
 */
export function quitarDelCarrito(itemId) {
  return del(`/cart/items/${encodeURIComponent(itemId)}/`, CON_CARRITO);
}

/**
 * `POST /checkout/` — convierte el carrito en pedido y arranca el pago.
 *
 * @param {object} datos
 * @param {string} datos.email
 * @param {string} datos.shipping_recipient
 * @param {string} datos.shipping_line1
 * @param {string} [datos.shipping_line2]
 * @param {string} datos.shipping_postal_code
 * @param {string} datos.shipping_city
 * @param {string} datos.shipping_province
 * @param {string} [datos.phone]
 * @param {boolean} [datos.invoice_requested] Si true, `billing_tax_id` es obligatorio.
 * @param {string} [datos.billing_name]
 * @param {string} [datos.billing_tax_id]
 * @param {string} [datos.billing_address]
 * @param {string} [datos.customer_note]
 * @returns {Promise<{order: object, payment: {client_secret: string}|null}>}
 *
 * **`payment` es `null` cuando Stripe no está configurado** (hoy, en desarrollo:
 * `STRIPE_SECRET_KEY` vacía). El pedido se crea igualmente y el stock queda reservado
 * una hora — el fallo de la pasarela no hace perder el pedido (`CheckoutView._start_payment`).
 * Eso es justo lo que permite simular la compra de punta a punta sin pasarela.
 *
 * El pedido nace en `pending_payment`: **no se da por pagado aquí**, eso lo confirma el
 * webhook de Stripe. Con `payment: null` el pedido se queda esperando pago para siempre,
 * que es lo correcto hasta que haya pasarela.
 */
export function iniciarCheckout(datos) {
  return post('/checkout/', datos, CON_CARRITO);
}
