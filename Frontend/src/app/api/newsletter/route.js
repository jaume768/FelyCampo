// POST /api/newsletter — suscripción desde el pie y la ventana de la home
// (lib/newsletter.js). Guarda el email en la base de datos (lista propia,
// /admin/newsletter, exportable en CSV).
//
// Substack (docs/ADMIN.md §5) se conectará aquí mismo más adelante: tras
// guardar, reenviar a `${SUBSTACK_URL}/api/v1/free` desde el servidor. La
// copia propia se queda igual: ese endpoint de Substack no es oficial.

import { EMAIL_VALIDO, texto } from '@/lib/emailFormularios';
import { guardarEnBackend } from '@/lib/backendInterno';

const ORIGENES = new Set(['pie', 'ventana']);

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
  return Response.json({ ok: true });
}
