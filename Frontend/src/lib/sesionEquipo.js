// sesionEquipo.js — quién es del equipo, sin preguntárselo a Django en
// cada visita.
//
// Quien autentica es Django (sesión por cookie, `is_staff`). Tras iniciar
// sesión, /api/acceso comprueba contra /api/v1/admin/me/ que la persona es
// staff y entonces emite esta cookie FIRMADA (HMAC-SHA256 con
// SESION_EQUIPO_SECRET). El proxy (src/proxy.js) solo la verifica: es
// barato y no depende de que el backend responda.
//
// Qué protege: VER el panel (/admin) y, durante el prelanzamiento, VER la
// web. Lo que se escribe sigue pasando por la sesión de Django y su
// permiso IsStaff: una cookie falsificada no podría publicar nada (y sin
// el secreto no se puede falsificar).
//
// Web Crypto (crypto.subtle) y no node:crypto: funciona igual en el
// proxy, en las rutas de la API y en cualquier runtime.

export const COOKIE_EQUIPO = 'fc_equipo';

// Lo mismo que la sesión de Django (SESSION_COOKIE_AGE, 2 semanas): no
// tiene sentido que la puerta siga abierta cuando el panel ya no puede
// guardar nada.
export const DURACION_SEGUNDOS = 14 * 24 * 60 * 60;

const codificador = new TextEncoder();

function base64url(bytes) {
  let binario = '';
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function desdeBase64url(texto) {
  const normal = texto.replace(/-/g, '+').replace(/_/g, '/');
  const binario = atob(normal + '='.repeat((4 - (normal.length % 4)) % 4));
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

function secreto() {
  return process.env.SESION_EQUIPO_SECRET || '';
}

async function clave() {
  return crypto.subtle.importKey(
    'raw', codificador.encode(secreto()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
  );
}

// Token: base64url(JSON {email, exp}) + "." + base64url(firma).
export async function firmarSesion(email) {
  if (!secreto()) throw new Error('Falta SESION_EQUIPO_SECRET');
  const datos = base64url(codificador.encode(JSON.stringify({
    email,
    exp: Date.now() + DURACION_SEGUNDOS * 1000,
  })));
  const firma = await crypto.subtle.sign('HMAC', await clave(), codificador.encode(datos));
  return `${datos}.${base64url(new Uint8Array(firma))}`;
}

// { email } si el token es auténtico y no ha caducado; null en cualquier
// otro caso (sin secreto configurado, nadie entra: falla cerrado).
export async function verificarSesion(token) {
  if (!token || !secreto()) return null;
  const [datos, firma] = token.split('.');
  if (!datos || !firma) return null;
  try {
    const valida = await crypto.subtle.verify(
      'HMAC', await clave(), desdeBase64url(firma), codificador.encode(datos),
    );
    if (!valida) return null;
    const { email, exp } = JSON.parse(new TextDecoder().decode(desdeBase64url(datos)));
    return typeof exp === 'number' && exp > Date.now() ? { email } : null;
  } catch {
    return null;
  }
}

// ---------- Prelanzamiento ----------
// PRELANZAMIENTO=true cierra la web pública HASTA la fecha de lanzamiento:
// quien no sea del equipo ve la pantalla «Muy pronto» con la cuenta atrás
// (src/app/acceso/proximamente.js) y un 503. Al llegar la hora la web se
// abre SOLA, sin reiniciar nada: se comprueba en cada petición.
// PRELANZAMIENTO=false la abre ya, antes de la fecha (se lee al arrancar:
// `up -d frontend`, sin --build).

const LANZAMIENTO_POR_DEFECTO = '2026-11-15T12:00:00+01:00';

export function enPrelanzamiento(ahora = Date.now()) {
  return process.env.PRELANZAMIENTO === 'true' && ahora < fechaLanzamiento().getTime();
}

// Momento de apertura. PRELANZAMIENTO_FECHA admite una fecha y hora ISO con
// zona («2026-11-15T12:00:00+01:00») o solo el día («2026-11-15»), que
// entonces abre a las 12:00 de Madrid (+01:00 en invierno).
export function fechaLanzamiento() {
  const valor = (process.env.PRELANZAMIENTO_FECHA || LANZAMIENTO_POR_DEFECTO).trim();
  const fecha = new Date(/^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T12:00:00+01:00` : valor);
  return Number.isNaN(fecha.getTime()) ? new Date(LANZAMIENTO_POR_DEFECTO) : fecha;
}

// Solo rutas internas: nunca a otro dominio («//evil.com», «https://…»).
export function destinoSeguro(valor, porDefecto = '/') {
  if (typeof valor !== 'string' || !valor.startsWith('/') || valor.startsWith('//') || valor.startsWith('/\\')) {
    return porDefecto;
  }
  return valor;
}
