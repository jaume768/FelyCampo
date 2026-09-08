/**
 * Cliente base de la API. **Única puerta** por la que el frontend habla con Django:
 * ningún componente hace `fetch` directo.
 *
 * Ver `./README.md` para cuándo llamar desde Server Component y cuándo desde Client
 * Component.
 */

import { ApiError, CODIGOS_ERROR } from './errors';
import { leerCartId, recordarCartIdDeRespuesta } from './cartId';

/** Milisegundos antes de abandonar una petición. El backend caído no puede colgar la web. */
const TIMEOUT_MS = 10_000;

const METODOS_ESCRITURA = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Base de la API según DÓNDE se ejecuta esto.
 *
 * - Servidor (Server Components, Route Handlers): `API_INTERNAL_URL`. Dentro de Docker es
 *   `http://backend:8000` — el nombre del servicio en la red interna. Ojo: `localhost`
 *   desde el contenedor del frontend apunta AL PROPIO FRONTEND, no al backend.
 * - Navegador: `NEXT_PUBLIC_API_URL` (`http://localhost:8001`), el puerto publicado del
 *   host. La red interna de Docker no la resuelve ningún navegador.
 *
 * No las intercambies: cada una solo funciona en su lado.
 * @returns {string}
 */
export function baseUrl() {
  const enServidor = typeof window === 'undefined';
  const url = enServidor
    ? process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL;
  return (url || 'http://localhost:8001').replace(/\/$/, '');
}

const PREFIJO = '/api/v1';

/**
 * Token CSRF en memoria del módulo (no en cookie legible).
 *
 * Django exige `X-CSRFToken` en toda escritura. La cookie viaja sola con
 * `credentials: "include"`; **no se lee con `document.cookie`** porque en producción el
 * panel vive en otro subdominio y la cookie no es legible desde ahí. El valor sale del
 * cuerpo JSON de `GET /auth/csrf/`.
 */
let tokenCsrf = null;
let peticionCsrfEnCurso = null;

/** Solo para tests: olvida el token cacheado. */
export function _resetCsrf() {
  tokenCsrf = null;
  peticionCsrfEnCurso = null;
}

/**
 * Pide el token CSRF una sola vez y lo cachea. Las llamadas concurrentes comparten la
 * misma promesa: diez escrituras a la vez no disparan diez `GET /auth/csrf/`.
 * @returns {Promise<string|null>}
 */
async function obtenerTokenCsrf() {
  if (tokenCsrf) return tokenCsrf;
  if (peticionCsrfEnCurso) return peticionCsrfEnCurso;

  peticionCsrfEnCurso = (async () => {
    try {
      const respuesta = await fetch(`${baseUrl()}${PREFIJO}/auth/csrf/`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!respuesta.ok) return null;
      const cuerpo = await respuesta.json();
      tokenCsrf = cuerpo?.csrf_token || null;
      return tokenCsrf;
    } catch {
      // Sin token, la escritura fallará con 403 y se normalizará como cualquier otro
      // error. No se revienta aquí: el mensaje útil lo da la petición real.
      return null;
    } finally {
      peticionCsrfEnCurso = null;
    }
  })();

  return peticionCsrfEnCurso;
}

/**
 * Convierte un objeto en query string, saltando null/undefined/''. Los arrays se repiten
 * (`?size=36&size=38`), que es lo que espera django-filter.
 * @param {Record<string, unknown>} [params]
 * @returns {string}
 */
export function construirQuery(params) {
  if (!params) return '';
  const busqueda = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (valor === null || valor === undefined || valor === '') continue;
    if (Array.isArray(valor)) {
      valor.filter((v) => v !== null && v !== undefined && v !== '').forEach((v) => busqueda.append(clave, String(v)));
    } else {
      busqueda.append(clave, String(valor));
    }
  }
  const cadena = busqueda.toString();
  return cadena ? `?${cadena}` : '';
}

/**
 * Normaliza cualquier fallo al shape `{"error": {code, message, details}}` del backend.
 * @param {Response} respuesta
 * @returns {Promise<ApiError>}
 */
async function construirApiError(respuesta) {
  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    // Respuesta sin JSON (502 de un proxy, HTML de error, cuerpo vacío).
    return new ApiError({
      code: CODIGOS_ERROR.PARSE,
      message: `El servidor respondió ${respuesta.status} sin un cuerpo válido.`,
      status: respuesta.status,
    });
  }

  const error = cuerpo?.error;
  if (error && typeof error === 'object') {
    return new ApiError({
      code: error.code || 'error',
      message: error.message || 'Error inesperado.',
      details: error.details || {},
      status: respuesta.status,
    });
  }

  // Alguien devolvió otro shape. No se adivina: se reporta tal cual con el status.
  return new ApiError({
    code: 'error',
    message: typeof cuerpo?.detail === 'string' ? cuerpo.detail : `Error ${respuesta.status}.`,
    details: typeof cuerpo === 'object' && cuerpo !== null ? cuerpo : {},
    status: respuesta.status,
  });
}

/**
 * Petición a la API.
 *
 * @param {string} ruta Ruta bajo `/api/v1` — con barra inicial: `/catalog/products/`.
 * @param {object} [opciones]
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [opciones.method='GET']
 * @param {unknown} [opciones.body] Se serializa a JSON. Un `FormData` se manda tal cual.
 * @param {Record<string, unknown>} [opciones.params] Query params.
 * @param {Record<string, string>} [opciones.headers]
 * @param {boolean} [opciones.conCarrito=false] Manda `X-Cart-Id` (solo navegador).
 * @param {number} [opciones.timeoutMs]
 * @param {RequestCache} [opciones.cache] Cache de Next para lecturas de servidor.
 * @param {{revalidate?: number|false, tags?: string[]}} [opciones.next]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<any>} El JSON ya parseado, o `null` en un 204.
 * @throws {ApiError} Siempre `ApiError`, nunca un `TypeError` de fetch suelto.
 */
export async function apiFetch(ruta, opciones = {}) {
  const {
    method = 'GET',
    body,
    params,
    headers = {},
    conCarrito = false,
    timeoutMs = TIMEOUT_MS,
    cache,
    next,
    signal,
  } = opciones;

  const metodo = method.toUpperCase();
  const url = `${baseUrl()}${PREFIJO}${ruta}${construirQuery(params)}`;
  const esFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const enServidor = typeof window === 'undefined';

  /** @type {Record<string, string>} */
  const cabeceras = { Accept: 'application/json', ...headers };

  // Llamadas internas (Server Component -> backend por la red de Docker): van por HTTP
  // plano, y en producción Django tiene SECURE_SSL_REDIRECT, así que responde 301 a
  // `https://backend:8000` — un host que no habla TLS. La petición se quedaba colgada
  // hasta agotar el timeout: la home tardaba 20 s en pintar (dos llamadas × 10 s).
  //
  // La cabecera dice la verdad: el visitante SÍ llegó por HTTPS, Caddy es quien terminó
  // el TLS. Es la misma que Django ya mira vía SECURE_PROXY_SSL_HEADER, solo que en las
  // llamadas internas no la pone nadie por el camino.
  if (enServidor) cabeceras['X-Forwarded-Proto'] = 'https';
  if (body !== undefined && !esFormData) cabeceras['Content-Type'] = 'application/json';

  // CSRF solo en escrituras, y solo desde el navegador: en servidor no hay sesión de
  // usuario ni cookie que proteger.
  if (METODOS_ESCRITURA.has(metodo) && !enServidor) {
    const token = await obtenerTokenCsrf();
    if (token) cabeceras['X-CSRFToken'] = token;
  }

  if (conCarrito) {
    const cartId = leerCartId();
    if (cartId) cabeceras['X-Cart-Id'] = cartId;
  }

  // Timeout propio: sin esto un backend que acepta la conexión pero no responde deja la
  // promesa colgada para siempre y con ella la pantalla.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => controlador.abort(), { once: true });

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers: cabeceras,
      // Sesión por cookie, no por token: SIEMPRE.
      credentials: 'include',
      body: body === undefined ? undefined : esFormData ? body : JSON.stringify(body),
      signal: controlador.signal,
      ...(cache ? { cache } : {}),
      ...(next ? { next } : {}),
    });
  } catch (error) {
    clearTimeout(temporizador);
    const abortada = error?.name === 'AbortError';
    throw new ApiError({
      code: abortada ? CODIGOS_ERROR.TIMEOUT : CODIGOS_ERROR.NETWORK,
      message: abortada
        ? 'El servidor ha tardado demasiado en responder.'
        : 'No se ha podido conectar con el servidor.',
      status: 0,
      cause: error,
    });
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) throw await construirApiError(respuesta);

  if (respuesta.status === 204) return null;

  let datos;
  try {
    datos = await respuesta.json();
  } catch {
    return null;
  }

  // El id del carrito llega en el cuerpo, no en una cabecera: se persiste en cuanto
  // aparece, para que la siguiente petición ya lo mande en X-Cart-Id.
  if (conCarrito) recordarCartIdDeRespuesta(datos);

  return datos;
}

/** @type {(ruta: string, opciones?: object) => Promise<any>} */
export const get = (ruta, opciones = {}) => apiFetch(ruta, { ...opciones, method: 'GET' });
export const post = (ruta, body, opciones = {}) => apiFetch(ruta, { ...opciones, method: 'POST', body });
export const patch = (ruta, body, opciones = {}) => apiFetch(ruta, { ...opciones, method: 'PATCH', body });
export const put = (ruta, body, opciones = {}) => apiFetch(ruta, { ...opciones, method: 'PUT', body });
export const del = (ruta, opciones = {}) => apiFetch(ruta, { ...opciones, method: 'DELETE' });

/**
 * Envuelve una lectura para que un backend caído devuelva un valor por defecto en vez de
 * tumbar el render. Solo para lecturas prescindibles (escaparates, bloques secundarios):
 * en una ficha de producto es preferible propagar el error y enseñar la página de error.
 *
 * @template T
 * @param {Promise<T>} promesa
 * @param {T} porDefecto
 * @returns {Promise<T>}
 */
export async function conValorPorDefecto(promesa, porDefecto) {
  try {
    return await promesa;
  } catch (error) {
    if (error instanceof ApiError) return porDefecto;
    throw error;
  }
}

export { ApiError, CODIGOS_ERROR };
