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
// PRELANZAMIENTO=true cierra la web pública: quien no sea del equipo ve la
// pantalla «La nueva web estará disponible el…» (src/app/acceso/route.js)
// con un 503. Se lee al arrancar el servidor, no en el build: para abrir la
// web basta cambiar la variable y reiniciar el contenedor del frontend.

export function enPrelanzamiento() {
  return process.env.PRELANZAMIENTO === 'true';
}

// Fecha de apertura, AAAA-MM-DD (por defecto, el 15 de noviembre de 2026).
export function fechaLanzamiento() {
  const valor = process.env.PRELANZAMIENTO_FECHA || '2026-11-15';
  const fecha = new Date(`${valor}T00:00:00+01:00`);
  return Number.isNaN(fecha.getTime()) ? new Date('2026-11-15T00:00:00+01:00') : fecha;
}

// Solo rutas internas: nunca a otro dominio («//evil.com», «https://…»).
export function destinoSeguro(valor, porDefecto = '/') {
  if (typeof valor !== 'string' || !valor.startsWith('/') || valor.startsWith('//') || valor.startsWith('/\\')) {
    return porDefecto;
  }
  return valor;
}
