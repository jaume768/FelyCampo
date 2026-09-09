/**
 * Invalidación bajo demanda del caché del catálogo.
 *
 * Las páginas de tienda se sirven con ISR (`next: { revalidate }`), así que publicar o
 * despublicar un producto tardaba entre uno y cinco minutos en verse — y con el caché de
 * router del navegador encima, parecía que hacía falta recargar sin caché a mano.
 *
 * En vez de bajar el `revalidate` a cero (que sería pagar el coste en CADA visita para
 * resolver un problema que ocurre cuando alguien publica), el panel avisa aquí cuando
 * cambia algo y se tira el caché de golpe. Es la misma idea que un webhook, pero sin
 * secreto compartido que gestionar: quien llama ya es una sesión de staff.
 *
 * AUTORIZACIÓN: se reenvía la cookie de sesión a Django y se pregunta por
 * `/admin/me/`. No se confía en nada del cuerpo de la petición ni en una cabecera
 * inventada aquí — la única fuente de verdad sobre quién es staff es el backend. Sin
 * esto, cualquiera podría tirar el caché desde fuera y convertirlo en una forma barata
 * de castigar al servidor.
 */

import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/** Etiquetas que puede invalidar el panel. Una lista cerrada: no se acepta texto libre. */
const ETIQUETAS = new Set(['catalogo']);

function baseInterna() {
  const url = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  return url.replace(/\/$/, '');
}

async function esStaff(request) {
  const cookie = request.headers.get('cookie');
  if (!cookie) return false;
  try {
    const respuesta = await fetch(`${baseInterna()}/api/v1/admin/me/`, {
      headers: {
        cookie,
        Accept: 'application/json',
        // Django tiene SECURE_SSL_REDIRECT en producción y esta llamada interna va por
        // HTTP plano: sin esto responde un 301 a https://backend:8000, que no habla TLS.
        'X-Forwarded-Proto': 'https',
      },
      cache: 'no-store',
    });
    return respuesta.ok;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!(await esStaff(request))) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Solo el personal puede refrescar el caché.', details: {} } },
      { status: 403 }
    );
  }

  let etiqueta = 'catalogo';
  try {
    const cuerpo = await request.json();
    if (cuerpo?.tag) etiqueta = String(cuerpo.tag);
  } catch {
    // Sin cuerpo: se refresca el catálogo, que es el único caso de uso hoy.
  }

  if (!ETIQUETAS.has(etiqueta)) {
    return NextResponse.json(
      { error: { code: 'invalid', message: `Etiqueta desconocida: ${etiqueta}.`, details: {} } },
      { status: 400 }
    );
  }

  revalidateTag(etiqueta);
  return NextResponse.json({ revalidated: true, tag: etiqueta });
}
