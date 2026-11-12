// backendInterno.js — guardar en Django lo que llega de los formularios
// (cita, consulta de vestido, newsletter) y enviar sus emails, desde las
// rutas de /api de Next.
//
// Va por la red interna (API_INTERNAL_URL) con el secreto compartido
// (REVALIDATE_SECRET, el mismo que usa Django para avisar al frontend; ver
// backend/apps/appointments/internal.py) y la IP de la visitante, para que
// el límite de ritmo sea por persona y no por el contenedor del frontend.

const API_INTERNA = () => process.env.API_INTERNAL_URL || 'http://localhost:8001';

// IP de la visitante: la primera de X-Forwarded-For (la pone Caddy).
export function ipVisitante(request) {
  const reenviada = request.headers.get('x-forwarded-for') || '';
  return reenviada.split(',')[0].trim() || request.headers.get('x-real-ip') || '';
}

// POST a /api/v1/formularios/<ruta>/ con el secreto. Devuelve la Response
// (lanza solo si no hay red). `request`, si se pasa, aporta la IP de la
// visitante para el límite de ritmo.
export function llamarBackendInterno(ruta, cuerpo, request) {
  return fetch(`${API_INTERNA()}/api/v1/formularios/${ruta}/`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Forwarded-Proto': 'https',
      'X-Interno-Secreto': process.env.REVALIDATE_SECRET || '',
      ...(request ? { 'X-Cliente-IP': ipVisitante(request) } : {}),
    },
    body: JSON.stringify(cuerpo),
  });
}

// Devuelve { ok, status, datos }. Nunca lanza: quien llama decide qué hacer
// si no se ha podido guardar (el email sigue siendo el canal principal).
export async function guardarEnBackend(ruta, cuerpo, request) {
  try {
    const respuesta = await llamarBackendInterno(ruta, cuerpo, request);
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      console.error(`[formularios/${ruta}] El backend respondió ${respuesta.status}:`, JSON.stringify(datos));
    }
    return { ok: respuesta.ok, status: respuesta.status, datos };
  } catch (error) {
    console.error(`[formularios/${ruta}] No se pudo guardar en el backend:`, error.message);
    return { ok: false, status: 0, datos: null };
  }
}
