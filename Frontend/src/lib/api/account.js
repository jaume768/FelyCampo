/**
 * Cuenta del cliente: perfil, direcciones y favoritos.
 *
 * **Solo desde Client Components**: todo exige sesión iniciada, y la sesión es una cookie
 * del navegador.
 *
 * Sobre la wishlist: `Favorite` requiere estar identificado. **Decidido** que el invitado
 * guarda sus favoritos en localStorage y se fusionan al iniciar sesión — esa lógica de
 * merge vive en el frontend, el backend no la hace (a diferencia del carrito, que sí).
 * Ver `docs/CONTRATO.md`, desajuste D-3.
 */

import { get, post, patch, del } from './client';

/**
 * `GET /account/me/` — perfil.
 * Lanza `ApiError` con `status: 403` si no hay sesión: úsalo para saber si hay sesión.
 * @returns {Promise<object>}
 */
export function obtenerPerfil() {
  return get('/account/me/');
}

/**
 * `PATCH /account/me/` — actualizar perfil.
 * @param {object} datos
 * @param {string} [datos.first_name]
 * @param {string} [datos.last_name]
 * @param {string} [datos.phone]
 * @param {boolean} [datos.accepts_marketing]
 * @returns {Promise<object>}
 */
export function actualizarPerfil(datos) {
  return patch('/account/me/', datos);
}

/**
 * `GET /account/addresses/`
 * @returns {Promise<{count: number, results: object[]}>}
 */
export function listarDirecciones() {
  return get('/account/addresses/');
}

/**
 * `POST /account/addresses/`
 * @param {object} direccion
 * @returns {Promise<object>}
 */
export function crearDireccion(direccion) {
  return post('/account/addresses/', direccion);
}

/**
 * `PATCH /account/addresses/{id}/`
 * @param {string} id UUID.
 * @param {object} datos
 * @returns {Promise<object>}
 */
export function actualizarDireccion(id, datos) {
  return patch(`/account/addresses/${encodeURIComponent(id)}/`, datos);
}

/**
 * `DELETE /account/addresses/{id}/`
 * @param {string} id UUID.
 * @returns {Promise<null>}
 */
export function borrarDireccion(id) {
  return del(`/account/addresses/${encodeURIComponent(id)}/`);
}

/**
 * `GET /account/favorites/` — wishlist del usuario identificado.
 * @returns {Promise<{count: number, results: object[]}>}
 */
export function listarFavoritos() {
  return get('/account/favorites/');
}

/**
 * `POST /account/favorites/`
 * @param {string} productId UUID del producto.
 * @returns {Promise<object>}
 */
export function anadirFavorito(productId) {
  return post('/account/favorites/', { product: productId });
}

/**
 * `DELETE /account/favorites/{id}/`
 * @param {string} favoritoId UUID del **favorito**, no del producto.
 * @returns {Promise<null>}
 */
export function quitarFavorito(favoritoId) {
  return del(`/account/favorites/${encodeURIComponent(favoritoId)}/`);
}
