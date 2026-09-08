/**
 * Id del carrito de invitado.
 *
 * El backend identifica el carrito anónimo con la cabecera `X-Cart-Id` (declarada en
 * `CORS_ALLOW_HEADERS`). El id **no viaja en una cabecera de respuesta**: llega en el
 * cuerpo JSON (`cart.id`), y nace en el primer POST — el `GET /cart/` devuelve
 * `{ id: null }` a propósito, para que un crawler no cree una fila por visita
 * (`apps/orders/views.py`, `CartView.get`).
 *
 * Vive en localStorage, no en cookie: por eso todo lo que dependa de él es Client
 * Component. Con sesión iniciada el backend ignora la cabecera y usa el carrito del
 * usuario, así que dejarla puesta no molesta.
 */

export const CLAVE_CART_ID = 'fely-campo-cart-id';

/** ¿Estamos en el navegador? En el servidor no hay localStorage y no debe haber carrito. */
function hayLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * @returns {string|null} El id guardado, o null si no hay o localStorage está bloqueado
 *   (modo privado, cookies de terceros desactivadas...).
 */
export function leerCartId() {
  if (!hayLocalStorage()) return null;
  try {
    return window.localStorage.getItem(CLAVE_CART_ID) || null;
  } catch {
    // localStorage puede lanzar, no solo devolver null (Safari en privado, políticas de
    // empresa). Sin id, el carrito funciona igual dentro de la petición actual.
    return null;
  }
}

/** @param {string|null|undefined} id */
export function guardarCartId(id) {
  if (!hayLocalStorage() || !id) return;
  try {
    window.localStorage.setItem(CLAVE_CART_ID, id);
  } catch {
    /* ver leerCartId */
  }
}

export function borrarCartId() {
  if (!hayLocalStorage()) return;
  try {
    window.localStorage.removeItem(CLAVE_CART_ID);
  } catch {
    /* ver leerCartId */
  }
}

/**
 * Persiste el `id` que venga en el cuerpo de una respuesta de carrito. Se llama tras cada
 * escritura: es la única vía por la que el frontend se entera de su id.
 * @param {{id?: string|null}|null|undefined} carrito
 */
export function recordarCartIdDeRespuesta(carrito) {
  if (carrito && carrito.id) guardarCartId(carrito.id);
}
