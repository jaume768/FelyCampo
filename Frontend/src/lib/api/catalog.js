/**
 * Catálogo — solo lectura y **público**: se puede llamar desde Server Components, que es
 * lo preferible (SEO y velocidad). Nada de aquí depende de `X-Cart-Id` ni de sesión.
 */

import { get, post } from './client';

/**
 * @typedef {object} FiltrosProductos
 * @property {string}  [family]      Slug de familia: `vestidos`, `faldas`, `tops`...
 * @property {string}  [category]    Slug de categoría: `fiesta`, `novia`, `outlet`...
 * @property {string}  [line]        `pret_a_porter` | `atelier` | `archive`
 * @property {string}  [kind]        `simple` | `bundle`
 * @property {string}  [sale_mode]   `in_stock` | `on_request`
 * @property {string|string[]} [color] Código o id de color. Repetible.
 * @property {string|string[]} [size]  Código de talla (`36`, `38`...). Repetible.
 * @property {boolean} [in_stock]     Solo con stock disponible.
 * @property {boolean} [is_outlet]
 * @property {number}  [price_min]    Sobre el precio NETO, como lo guarda el backend.
 * @property {number}  [price_max]
 * @property {string}  [search]
 * @property {string}  [ordering]     `price`, `-price`, `-created_at`...
 * @property {number}  [page]
 * @property {number}  [page_size]
 */

/**
 * @typedef {object} PaginaProductos
 * @property {number} count
 * @property {string|null} next
 * @property {string|null} previous
 * @property {object[]} results
 */

/**
 * `GET /catalog/products/`
 * @param {FiltrosProductos} [filtros]
 * @param {object} [opciones] Opciones de `apiFetch` (`next`, `cache`, `signal`).
 * @returns {Promise<PaginaProductos>}
 */
export function listarProductos(filtros = {}, opciones = {}) {
  return get('/catalog/products/', { params: filtros, ...opciones });
}

/**
 * `GET /catalog/products/{slug}/` — ficha completa (colorways, variants, imágenes).
 * Lanza `ApiError` con `status: 404` si el slug no existe: la página debe traducirlo a
 * `notFound()` de Next.
 * @param {string} slug
 * @param {object} [opciones]
 * @returns {Promise<object>}
 */
export function obtenerProducto(slug, opciones = {}) {
  return get(`/catalog/products/${encodeURIComponent(slug)}/`, opciones);
}

/**
 * `GET /catalog/families/` — familias de prenda (Chaquetas, Faldas, Tops, Vestidos).
 * Es el "tipo de prenda", el eje del menú de Tienda. Devuelve una lista, sin paginar.
 * @param {object} [opciones]
 * @returns {Promise<object[]>}
 */
export function listarFamilias(opciones = {}) {
  return get('/catalog/families/', opciones);
}

/**
 * `GET /catalog/categories/` — árbol de categorías (ocasión: Fiesta, Novia, Outlet...).
 * Lista plana de raíces, cada una con `children[]`. Sin paginar.
 * @param {object} [opciones]
 * @returns {Promise<object[]>}
 */
export function listarCategorias(opciones = {}) {
  return get('/catalog/categories/', opciones);
}

/**
 * `GET /catalog/sizes/` — tallas del sistema, ya ordenadas por `position`.
 * @param {object} [opciones]
 * @returns {Promise<object[]>}
 */
export function listarTallas(opciones = {}) {
  return get('/catalog/sizes/', opciones);
}

/**
 * `POST /catalog/enquiries/` — consulta sobre una pieza sin precio de catálogo
 * (`sale_mode: "on_request"`, atelier). **Solo envía un correo: no se persiste nada**,
 * así que no hay listado que consultar después.
 *
 * Escritura → necesita CSRF → Client Component.
 * Con límite de ritmo estricto (`enquiry`, 5/hora): trata el 429 como caso normal.
 *
 * @param {object} datos
 * @param {string} datos.product      **Slug** del producto, no su UUID: el backend usa
 *   `SlugRelatedField(slug_field="slug")`. Y solo acepta productos `sale_mode=on_request`.
 * @param {string} datos.name
 * @param {string} datos.email
 * @param {string} [datos.phone]
 * @param {string} [datos.message]
 * @returns {Promise<object>}
 */
export function enviarConsultaProducto(datos) {
  return post('/catalog/enquiries/', datos);
}

/**
 * `POST /catalog/stock-notifications/` — avisar cuando una variante vuelva a haber.
 * Escritura → CSRF → Client Component. Límite `stock_notification` (20/hora).
 * @param {object} datos
 * @param {string} datos.variant UUID de la variante.
 * @param {string} datos.email
 * @returns {Promise<object>}
 */
export function avisarmeDeStock(datos) {
  return post('/catalog/stock-notifications/', datos);
}
