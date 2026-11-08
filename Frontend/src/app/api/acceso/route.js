// /api/acceso — la cookie de equipo (ver src/lib/sesionEquipo.js).
//
// POST: el navegador acaba de iniciar sesión en Django
//       (POST /api/v1/auth/login/). Aquí se reenvía su cookie de sesión a
//       GET /api/v1/admin/me/ por la red interna: si Django dice que es
//       staff, se emite la cookie firmada que abre /admin y, durante el
//       prelanzamiento, la web. 403 si la cuenta existe pero no es del
//       equipo; 401 si no hay sesión.
// DELETE: cerrar sesión (la de Django la cierra el navegador aparte, con
//       POST /api/v1/auth/logout/).

import { NextResponse } from 'next/server';
import { COOKIE_EQUIPO, DURACION_SEGUNDOS, firmarSesion } from '@/lib/sesionEquipo';

const API_INTERNA = process.env.API_INTERNAL_URL || 'http://localhost:8001';

function opcionesCookie(request, maxAge) {
  // Secure cuando el visitante llegó por HTTPS (Caddy termina el TLS y lo
  // dice en X-Forwarded-Proto). En desarrollo es http://localhost.
  const https = request.headers.get('x-forwarded-proto') === 'https'
    || request.nextUrl.protocol === 'https:';
  return { httpOnly: true, sameSite: 'lax', secure: https, path: '/', maxAge };
}

export async function POST(request) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_INTERNA}/api/v1/admin/me/`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
        Accept: 'application/json',
        'X-Forwarded-Proto': 'https',
      },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'No se puede conectar con el servidor.' }, { status: 502 });
  }

  if (respuesta.status === 401 || respuesta.status === 403) {
    const sinSesion = respuesta.status === 401;
    return NextResponse.json(
      { ok: false, error: sinSesion ? 'No hay sesión iniciada.' : 'Esta cuenta no tiene acceso de equipo.' },
      { status: respuesta.status },
    );
  }
  if (!respuesta.ok) {
    return NextResponse.json({ ok: false, error: 'El servidor no ha podido comprobar la sesión.' }, { status: 502 });
  }

  const usuario = await respuesta.json();
  let token;
  try {
    token = await firmarSesion(usuario.email);
  } catch {
    return NextResponse.json({ ok: false, error: 'Falta configurar SESION_EQUIPO_SECRET.' }, { status: 500 });
  }
  const salida = NextResponse.json({ ok: true, email: usuario.email });
  salida.cookies.set(COOKIE_EQUIPO, token, opcionesCookie(request, DURACION_SEGUNDOS));
  return salida;
}

export async function DELETE(request) {
  const salida = NextResponse.json({ ok: true });
  salida.cookies.set(COOKIE_EQUIPO, '', opcionesCookie(request, 0));
  return salida;
}
