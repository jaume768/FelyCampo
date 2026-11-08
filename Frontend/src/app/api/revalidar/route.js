// POST /api/revalidar — el backend avisa de que se ha publicado contenido.
//
// Django (backend/apps/content/revalidation.py) llama aquí por la red
// interna tras guardar un documento desde el panel, con
// { tags: ['contenido:<clave>'] } y la cabecera X-Revalidate-Secret. La web
// lee cada documento con fetch(..., { next: { tags } }), así que invalidar
// la etiqueta hace que lo publicado salga en la siguiente visita.
//
// `expire: 0` y no el perfil 'max': con 'max' Next sirve una vez más la
// versión vieja mientras regenera, y quien acaba de publicar vería su
// cambio sin aplicar al abrir la página.

import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';

const PREFIJO = 'contenido:';

function secretoValido(recibido) {
  const esperado = process.env.REVALIDATE_SECRET;
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  if (!secretoValido(request.headers.get('x-revalidate-secret'))) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'JSON no válido' }, { status: 400 });
  }

  const etiquetas = Array.isArray(cuerpo?.tags)
    ? cuerpo.tags.filter((t) => typeof t === 'string' && (t === 'contenido' || t.startsWith(PREFIJO)))
    : [];
  if (!etiquetas.length) {
    return Response.json({ ok: false, error: 'Sin etiquetas de contenido' }, { status: 400 });
  }

  for (const etiqueta of etiquetas) revalidateTag(etiqueta, { expire: 0 });
  return Response.json({ ok: true, revalidadas: etiquetas });
}
