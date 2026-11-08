// api.js — llamadas al backend (Django, /api/v1/…), desde el navegador y
// desde el servidor de Next.
//
// - Navegador: NEXT_PUBLIC_API_URL (en producción, el mismo dominio; en
//   desarrollo http://localhost:8001). Siempre con la cookie de sesión
//   (credentials: 'include') y, en escrituras, con X-CSRFToken.
// - Servidor (Server Components, rutas de /api): API_INTERNAL_URL (en
//   Docker http://backend:8000), con X-Forwarded-Proto: https. Sin esa
//   cabecera, SECURE_SSL_REDIRECT responde 301 a https://backend:8000 y la
//   llamada se queda colgada (docs/DESPLIEGUE.md, «La home tardaba 20 s»).
//
// Errores: el backend responde siempre {error: {code, message, details}}
// (apps/core/exceptions.py); se lanzan como ErrorApi con esos campos.

const PREFIJO = '/api/v1';
const METODOS_ESCRITURA = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const enServidor = () => typeof window === 'undefined';

export class ErrorApi extends Error {
  constructor(status, { code = 'error', message = 'Error de conexión', details = {} } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function urlApi(ruta) {
  const base = enServidor()
    ? process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    : process.env.NEXT_PUBLIC_API_URL || '';
  return `${base.replace(/\/$/, '')}${PREFIJO}${ruta}`;
}

let csrfPendiente = null;

// El token CSRF se pide una vez por carga de página (y otra si Django lo
// rota al iniciar sesión: ver olvidarCsrf).
async function tokenCsrf() {
  if (!csrfPendiente) {
    csrfPendiente = fetch(urlApi('/auth/csrf/'), { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => j.csrf_token)
      .catch((error) => {
        csrfPendiente = null;
        throw error;
      });
  }
  return csrfPendiente;
}

// Django rota el token CSRF al iniciar o cerrar sesión.
export function olvidarCsrf() {
  csrfPendiente = null;
}

export async function apiFetch(ruta, { method = 'GET', body, headers = {}, ...resto } = {}) {
  const metodo = method.toUpperCase();
  const cabeceras = { Accept: 'application/json', ...headers };
  const esFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !esFormData) cabeceras['Content-Type'] = 'application/json';
  if (enServidor()) {
    cabeceras['X-Forwarded-Proto'] = 'https';
  } else if (METODOS_ESCRITURA.has(metodo)) {
    cabeceras['X-CSRFToken'] = await tokenCsrf();
  }

  let respuesta;
  try {
    respuesta = await fetch(urlApi(ruta), {
      method: metodo,
      credentials: 'include',
      headers: cabeceras,
      body: body === undefined || esFormData ? body : JSON.stringify(body),
      ...resto,
    });
  } catch {
    throw new ErrorApi(0, { code: 'network', message: 'No se puede conectar con el servidor.' });
  }

  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, datos?.error);
  return datos;
}
