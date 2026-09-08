/**
 * Pedidos y devoluciones.
 *
 * **Client Components.** El listado exige sesión; la consulta de invitado
 * (`consultarPedidoInvitado`) es pública pero interactiva.
 */

import { get, post } from './client';

/**
 * `GET /orders/` — pedidos del usuario identificado.
 * @param {{page?: number, page_size?: number}} [params]
 * @returns {Promise<{count: number, results: object[]}>}
 */
export function listarPedidos(params = {}) {
  return get('/orders/', { params });
}

/**
 * `GET /orders/{id}/`
 * @param {string} id UUID.
 * @returns {Promise<object>}
 */
export function obtenerPedido(id) {
  return get(`/orders/${encodeURIComponent(id)}/`);
}

/**
 * `POST /orders/lookup/` — consulta de pedido sin cuenta, con número + correo.
 *
 * Devuelve datos personales, así que va muy limitado (`order_lookup`, 20/hora): un 429 es
 * un caso a contemplar en la interfaz, no un error de programación.
 *
 * @param {object} datos
 * @param {string} datos.number Número de pedido.
 * @param {string} datos.email
 * @returns {Promise<object>}
 */
export function consultarPedidoInvitado(datos) {
  return post('/orders/lookup/', datos);
}

/**
 * `POST /orders/{id}/cancel/` — cancelar. Solo mientras el pedido lo permita; si no, el
 * backend responde 400 con el motivo en `ApiError.message`.
 * @param {string} id UUID.
 * @returns {Promise<object>}
 */
export function cancelarPedido(id) {
  return post(`/orders/${encodeURIComponent(id)}/cancel/`);
}

/**
 * `POST /orders/{id}/request-invoice/` — pedir factura. Envía un correo a
 * `INVOICE_REQUEST_EMAIL`.
 * @param {string} id UUID.
 * @returns {Promise<object>}
 */
export function solicitarFactura(id) {
  return post(`/orders/${encodeURIComponent(id)}/request-invoice/`);
}

/**
 * `POST /orders/{id}/returns/` — solicitar devolución.
 *
 * Ventana de `RETURN_WINDOW_DAYS` (14 por defecto). El porte lo paga el cliente y el
 * reembolso lo ejecuta el personal a mano desde el panel.
 *
 * @param {string} id UUID del pedido.
 * @param {object} datos
 * @param {Array<{order_line: string, quantity: number}>} datos.lines Líneas a devolver.
 * @param {string} [datos.reason]
 * @returns {Promise<object>}
 */
export function solicitarDevolucion(id, datos) {
  return post(`/orders/${encodeURIComponent(id)}/returns/`, datos);
}
