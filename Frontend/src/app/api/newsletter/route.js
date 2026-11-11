// POST /api/newsletter — suscripción desde el pie, la ventana de la home y
// la pantalla «Muy pronto» del prelanzamiento (lib/newsletter.js,
// app/acceso/proximamente.js).
//
// Guarda el email en la base de datos (lista propia, /admin/newsletter,
// exportable en CSV). Es lo que decide si la respuesta es «gracias».
//
// Substack: lo da de alta EL NAVEGADOR de quien se suscribe, no este
// servidor. Substack bloquea con 403 todo lo que sale de la IP del servidor
// (probado el 2026-11-12, también con un navegador automático), y no tiene
// API oficial para añadir suscriptores. Por eso aquí solo se devuelve la
// URL de la publicación (`substack`, de SUBSTACK_URL) y el navegador hace
// el alta (lib/newsletter.js → enviarASubstack). Si eso fallara, la
// suscripción sigue en el panel y se puede importar a Substack con el CSV.

import { EMAIL_VALIDO, texto } from '@/lib/emailFormularios';
import { guardarEnBackend } from '@/lib/backendInterno';

const ORIGENES = new Set(['pie', 'ventana', 'proximamente']);

export async function POST(request) {
  let datos;
  try {
    datos = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'json' }, { status: 400 });
  }

  // Campo trampa para bots (igual que los otros formularios).
  if (texto(datos.web)) return Response.json({ ok: true });

  const email = texto(datos.email, 160).toLowerCase();
  if (!EMAIL_VALIDO.test(email)) return Response.json({ ok: false, error: 'datos' }, { status: 422 });

  const guardado = await guardarEnBackend('newsletter', {
    email,
    idioma: datos.locale === 'en' ? 'en' : 'es',
    origen: ORIGENES.has(datos.origen) ? datos.origen : '',
  }, request);

  if (guardado.status === 429) return Response.json({ ok: false, error: 'ritmo' }, { status: 429 });
  if (!guardado.ok) return Response.json({ ok: false, error: 'guardar' }, { status: 502 });

  const substack = (process.env.SUBSTACK_URL || '').trim().replace(/\/+$/, '');
  return Response.json({ ok: true, substack: /^https:\/\//.test(substack) ? substack : null });
}
