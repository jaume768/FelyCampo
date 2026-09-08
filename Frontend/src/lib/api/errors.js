/**
 * Error normalizado de la API.
 *
 * El backend responde SIEMPRE con el mismo shape (apps/core/exceptions.py):
 *
 *   { "error": { "code": "not_found", "message": "...", "details": {} } }
 *
 * Aquí se traduce a una excepción única para que ningún componente tenga que mirar
 * `response.status` ni destripar el JSON a mano. No inventes otra forma de error.
 */
export class ApiError extends Error {
  /**
   * @param {object} params
   * @param {string} params.code     Código estable del backend ("not_found", "invalid"...).
   * @param {string} params.message  Mensaje legible.
   * @param {object} [params.details] Errores por campo: `{ campo: ["motivo", ...] }`.
   * @param {number} [params.status]  Código HTTP. 0 cuando ni siquiera hubo respuesta.
   * @param {Error}  [params.cause]
   */
  constructor({ code, message, details = {}, status = 0, cause }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
    if (cause) this.cause = cause;
  }

  /** El backend no contestó: caído, DNS, CORS, timeout. La web debe seguir en pie. */
  get isNetworkError() {
    return this.status === 0;
  }

  get isNotFound() {
    return this.status === 404;
  }

  /** 401/403: hace falta iniciar sesión o no hay permiso. */
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  /** 400/409/422: el backend rechazó los datos o una regla de negocio. */
  get isValidationError() {
    return this.status === 400 || this.status === 409 || this.status === 422;
  }

  /**
   * Primer mensaje de `details` — para pintar el motivo real junto al campo en un
   * formulario, en vez del genérico "Request failed.".
   * @returns {string|null}
   */
  get firstDetail() {
    for (const valor of Object.values(this.details || {})) {
      if (Array.isArray(valor) && valor.length) return String(valor[0]);
      if (typeof valor === 'string' && valor) return valor;
    }
    return null;
  }
}

/** Códigos de `ApiError.code` que el frontend distingue explícitamente. */
export const CODIGOS_ERROR = {
  NOT_FOUND: 'not_found',
  INVALID: 'invalid',
  NETWORK: 'network_error',
  TIMEOUT: 'timeout',
  PARSE: 'parse_error',
};
