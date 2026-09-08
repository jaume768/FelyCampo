/**
 * Sesión y contraseña.
 *
 * **Solo desde Client Components.** La sesión va por cookie: es el navegador quien la
 * guarda y la manda. Un Server Component no tiene la cookie del visitante en este
 * montaje.
 */

import { get, post } from './client';

/**
 * `GET /auth/csrf/` — token CSRF.
 *
 * Normalmente **no hace falta llamarla a mano**: `client.js` la pide sola antes de la
 * primera escritura y cachea el token en memoria. Está expuesta por si alguna pantalla
 * quiere calentar el token antes de que el usuario pulse.
 * @returns {Promise<{csrf_token: string}>}
 */
export function obtenerTokenCsrf() {
  return get('/auth/csrf/');
}

/**
 * `POST /auth/login/`.
 *
 * Manda también el `cart_id` del invitado: el backend **fusiona** ese carrito con el del
 * usuario al identificarse (`_adopt_guest_cart` → `merge_carts` en
 * `apps/orders/services.py`). Suma cantidades sin pasarse del stock y descarta lo que se
 * haya agotado mientras tanto. Sin este dato, lo que el visitante metió antes de entrar
 * se perdería.
 *
 * Límite de ritmo `login` (10/min): un 429 aquí es esperable, no un fallo del código.
 *
 * @param {object} credenciales
 * @param {string} credenciales.email
 * @param {string} credenciales.password
 * @param {string|null} [cartId] Id del carrito de invitado, de `leerCartId()`.
 * @returns {Promise<object>} El usuario identificado.
 */
export function iniciarSesion({ email, password }, cartId = null) {
  return post('/auth/login/', { email, password, ...(cartId ? { cart_id: cartId } : {}) }, { conCarrito: true });
}

/**
 * `POST /auth/logout/`. Tras esto conviene olvidar el `X-Cart-Id` guardado
 * (`borrarCartId()`): el carrito que quedaba era el del usuario, no el de invitado.
 * @returns {Promise<null>}
 */
export function cerrarSesion() {
  return post('/auth/logout/');
}

/**
 * `POST /auth/register/`. Límite `register` (5/hora).
 * @param {object} datos
 * @param {string} datos.email
 * @param {string} datos.password
 * @param {string} [datos.first_name]
 * @param {string} [datos.last_name]
 * @param {boolean} [datos.accepts_marketing]
 * @returns {Promise<object>}
 */
export function registrarse(datos) {
  return post('/auth/register/', datos);
}

/**
 * `POST /auth/password/` — cambiar la contraseña estando dentro.
 * @param {object} datos
 * @param {string} datos.current_password
 * @param {string} datos.new_password
 * @returns {Promise<null>}
 */
export function cambiarContrasena(datos) {
  return post('/auth/password/', datos);
}

/**
 * `POST /auth/password/reset/` — pedir el correo de restablecimiento.
 *
 * Responde igual exista o no la cuenta (no filtra qué correos están registrados): no
 * interpretes el 200 como "la cuenta existe". Límite `password_reset` (5/hora).
 * @param {string} email
 * @returns {Promise<null>}
 */
export function pedirRestablecerContrasena(email) {
  return post('/auth/password/reset/', { email });
}

/**
 * `POST /auth/password/reset/confirm/` — fijar la nueva contraseña con el token del
 * correo. Los enlaces caducan a las 24 h (`PASSWORD_RESET_TIMEOUT`).
 * @param {object} datos
 * @param {string} datos.uid
 * @param {string} datos.token
 * @param {string} datos.new_password
 * @returns {Promise<null>}
 */
export function confirmarRestablecerContrasena(datos) {
  return post('/auth/password/reset/confirm/', datos);
}

/**
 * `POST /auth/email/verify/` — confirmar el correo con el token recibido.
 * @param {object} datos
 * @param {string} datos.uid
 * @param {string} datos.token
 * @returns {Promise<null>}
 */
export function verificarEmail(datos) {
  return post('/auth/email/verify/', datos);
}
