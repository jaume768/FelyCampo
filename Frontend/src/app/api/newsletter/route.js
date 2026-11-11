// POST /api/newsletter — suscripción desde el pie, la ventana de la home y
// la pantalla «Muy pronto» del prelanzamiento (lib/newsletter.js,
// app/acceso/proximamente.js).
//
// 1. Guarda el email en la base de datos (lista propia, /admin/newsletter,
//    exportable en CSV). Es lo que decide si la respuesta es «gracias».
// 2. Después, ya con la respuesta enviada (`after`), lo reenvía a Substack
//    si SUBSTACK_URL está definida (https://felycampo.substack.com). Es el
//    mismo endpoint que usa el formulario de suscripción de Substack: no
//    lleva credenciales, pero NO es oficial y puede cambiar sin aviso. Si
//    falla, solo queda en el log ([newsletter] Substack …): la suscripción
//    sigue guardada y se puede importar a Substack con el CSV del panel.

import { after } from 'next/server';
import { EMAIL_VALIDO, texto } from '@/lib/emailFormularios';
import { guardarEnBackend } from '@/lib/backendInterno';

const ORIGENES = new Set(['pie', 'ventana', 'proximamente']);

async function enviarASubstack(email) {
  const base = (process.env.SUBSTACK_URL || '').trim().replace(/\/+$/, '');
  if (!base) return;
  const web = (process.env.NEXT_PUBLIC_SITE_URL || 'https://felycampo.com').replace(/\/+$/, '');
  try {
    const respuesta = await fetch(`${base}/api/v1/free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email,
        first_url: web,
        first_referrer: '',
        current_url: web,
        current_referrer: '',
        referral_code: '',
        source: 'embed',
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!respuesta.ok) {
      const detalle = (await respuesta.text().catch(() => '')).slice(0, 300);
      console.error(`[newsletter] Substack respondió ${respuesta.status}: ${detalle}`);
    }
  } catch (error) {
    console.error('[newsletter] Substack no responde:', error.message);
  }
}

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

  after(() => enviarASubstack(email));
  return Response.json({ ok: true });
}
