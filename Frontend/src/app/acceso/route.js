// /acceso — pantalla «Muy pronto» del prelanzamiento y login del equipo.
//
// Dos usos:
//   1. Prelanzamiento (PRELANZAMIENTO=true y antes de PRELANZAMIENTO_FECHA,
//      ver lib/sesionEquipo.js): el proxy reescribe aquí TODA la web
//      pública para quien no sea del equipo. Se sirve «Muy pronto»
//      (./proximamente.js: cuenta atrás + newsletter) con 503 +
//      Retry-After + noindex: para Google es «cerrado por obras, vuelve
//      luego», no una web nueva de una sola página que indexar. El acceso
//      del equipo va plegado abajo. Al llegar la hora, la web se abre sola.
//   2. Siempre: es el login de /admin (el proxy manda aquí, con
//      ?destino=/admin/…, a quien entra al panel sin sesión).
//
// HTML propio y no una página de React a propósito: un Route Handler puede
// fijar el código de estado (una página de App Router siempre sale con 200)
// y así la pantalla pesa unos KB, sin el JavaScript de la web, el Navbar ni
// el aviso de cookies.
//
// El login: el navegador inicia sesión en Django (/api/v1/auth/login/) y
// luego pide a /api/acceso la cookie de equipo (ver lib/sesionEquipo.js).

import { cookies } from 'next/headers';
import { obtenerLanding } from '@/lib/landing';
import {
  COOKIE_EQUIPO, destinoSeguro, enPrelanzamiento, fechaLanzamiento, verificarSesion,
} from '@/lib/sesionEquipo';
import { cargarContenido } from '@/lib/contenidoServidor';
import { paginaProximamente } from './proximamente';

export const dynamic = 'force-dynamic';

const TEXTOS = {
  es: {
    otroIdioma: 'English',
    equipo: 'Acceso equipo',
    login: 'Acceso al panel',
    loginTexto: 'Entra con tu cuenta del equipo de Fely Campo.',
    email: 'Email',
    password: 'Contraseña',
    entrar: 'Entrar',
    entrando: 'Entrando…',
    errorCredenciales: 'Email o contraseña incorrectos.',
    errorEquipo: 'Esta cuenta no tiene acceso de equipo.',
    errorRitmo: 'Demasiados intentos. Espera un minuto y vuelve a probar.',
    errorRed: 'No se puede conectar con el servidor. Inténtalo de nuevo.',
    conSesion: (e) => `Has iniciado sesión como ${e}.`,
    verWeb: 'Ver la web',
    irPanel: 'Ir al panel',
    salir: 'Cerrar sesión',
  },
  en: {
    otroIdioma: 'Español',
    equipo: 'Team access',
    login: 'Panel access',
    loginTexto: 'Sign in with your Fely Campo team account.',
    email: 'Email',
    password: 'Password',
    entrar: 'Sign in',
    entrando: 'Signing in…',
    errorCredenciales: 'Wrong email or password.',
    errorEquipo: 'This account has no team access.',
    errorRitmo: 'Too many attempts. Wait a minute and try again.',
    errorRed: 'Cannot reach the server. Please try again.',
    conSesion: (e) => `You are signed in as ${e}.`,
    verWeb: 'View the website',
    irPanel: 'Go to the panel',
    salir: 'Sign out',
  },
};

const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

function idiomaDe(request, cookieLocale) {
  const pedido = request.nextUrl.searchParams.get('lang');
  if (pedido === 'en' || pedido === 'es') return pedido;
  // Idioma de la URL que el proxy ha reescrito aquí (/en/… → inglés).
  const deLaRuta = request.headers.get('x-fc-idioma');
  if (deLaRuta === 'en' || deLaRuta === 'es') return deLaRuta;
  if (cookieLocale === 'en' || cookieLocale === 'es') return cookieLocale;
  return /^en\b/i.test(request.headers.get('accept-language') || '') ? 'en' : 'es';
}

// El JS del login y del «Cerrar sesión», igual en las dos pantallas.
function scriptLogin(t, destino) {
  return `<script>
(() => {
  const API = ${JSON.stringify((process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, ''))} + '/api/v1';
  const T = ${JSON.stringify({ entrar: t.entrar, entrando: t.entrando, errorCredenciales: t.errorCredenciales, errorEquipo: t.errorEquipo, errorRitmo: t.errorRitmo, errorRed: t.errorRed })};
  // Si el proxy ha reescrito aquí otra URL (prelanzamiento), se vuelve a ella.
  const destino = location.pathname === '/acceso' ? ${JSON.stringify(destino)} : location.pathname + location.search;
  const csrf = () => fetch(API + '/auth/csrf/', { credentials: 'include' }).then((r) => r.json()).then((j) => j.csrf_token);

  const form = document.getElementById('login');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = form.querySelector('button');
    const error = form.querySelector('.error');
    const mostrar = (m) => { error.textContent = m; error.hidden = false; boton.disabled = false; boton.textContent = T.entrar; };
    error.hidden = true; boton.disabled = true; boton.textContent = T.entrando;
    try {
      const datos = new FormData(form);
      const r = await fetch(API + '/auth/login/', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': await csrf() },
        body: JSON.stringify({ email: datos.get('email'), password: datos.get('password') }),
      });
      if (r.status === 429) return mostrar(T.errorRitmo);
      if (!r.ok) return mostrar(T.errorCredenciales);
      const a = await fetch('/api/acceso', { method: 'POST', credentials: 'same-origin' });
      if (a.status === 403) return mostrar(T.errorEquipo);
      if (!a.ok) return mostrar(T.errorRed);
      location.replace(destino);
    } catch { mostrar(T.errorRed); }
  });

  const salir = document.getElementById('salir');
  if (salir) salir.addEventListener('click', async () => {
    try {
      await fetch(API + '/auth/logout/', { method: 'POST', credentials: 'include', headers: { 'X-CSRFToken': await csrf() } });
    } catch {}
    await fetch('/api/acceso', { method: 'DELETE', credentials: 'same-origin' });
    location.replace('/acceso');
  });
})();
</script>`;
}

export async function GET(request) {
  const almacen = await cookies();
  const sesion = await verificarSesion(almacen.get(COOKIE_EQUIPO)?.value);
  const idioma = idiomaDe(request, almacen.get('NEXT_LOCALE')?.value);
  const t = TEXTOS[idioma];
  const prelanzamiento = enPrelanzamiento();
  // Sin prelanzamiento, /acceso solo es el login del panel.
  const destinoPorDefecto = prelanzamiento ? `/${idioma}` : '/admin';
  const destino = destinoSeguro(request.nextUrl.searchParams.get('destino'), destinoPorDefecto);
  const otroIdioma = idioma === 'es' ? 'en' : 'es';

  const bloqueSesion = (titulo) => (sesion
    ? `<div class="sesion">
        <p>${escapar(t.conSesion(sesion.email))}</p>
        <div class="acciones">
          <a class="boton" href="/${idioma}">${t.verWeb}</a>
          <a class="boton boton-claro" href="/admin">${t.irPanel}</a>
          <button type="button" class="enlace" id="salir">${t.salir}</button>
        </div>
      </div>`
    : `<form id="login" novalidate>
        ${titulo ? `<h1 class="titulo-login">${t.login}</h1><p class="texto">${t.loginTexto}</p>` : ''}
        <label>${t.email}<input type="email" name="email" autocomplete="username" required></label>
        <label>${t.password}<input type="password" name="password" autocomplete="current-password" required></label>
        <p class="error" role="alert" hidden></p>
        <button type="submit" class="boton">${t.entrar}</button>
      </form>`);

  let html;
  if (prelanzamiento) {
    html = paginaProximamente({
      idioma,
      restanteMs: fechaLanzamiento().getTime() - Date.now(),
      textoEquipo: t.equipo,
      bloqueSesion: bloqueSesion(false),
      abrirEquipo: Boolean(sesion) || request.nextUrl.searchParams.has('destino'),
      otroIdioma: t.otroIdioma,
      scriptLogin: scriptLogin(t, destino),
    });
  } else {
    // Login del panel. Si la API no responde, sigue funcionando (sin foto).
    let foto = '';
    try {
      await cargarContenido();
      const landing = obtenerLanding();
      // La foto vertical de la portada (la de móvil) también en escritorio.
      foto = landing?.hero?.imagen?.movil || landing?.hero?.imagen?.escritorio || '';
    } catch (error) {
      console.error('[acceso] Sin contenido de la API:', error.message);
    }
    const urlOtroIdioma = `/acceso?lang=${otroIdioma}${request.nextUrl.searchParams.get('destino') ? `&destino=${encodeURIComponent(destino)}` : ''}`;

    html = `<!doctype html>
<html lang="${idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapar(`${t.login} · Fely Campo`)}</title>
<link rel="icon" href="/img/logo/FelyCampo-logo-favicon-blanco.png" type="image/png">
${foto ? `<link rel="preload" as="image" href="${escapar(foto)}" fetchpriority="high">` : ''}
<style>
  :root { color-scheme: light; --tinta:#202020; --gris:#5B5B5B; --hairline:#EFEFEF; --rosa:#E92174; --rosa-oscuro:#C2185F; --fondo:#FFFFFF; }
  * { box-sizing: border-box; margin: 0; }
  html, body { height: 100%; }
  body { background: var(--fondo); color: var(--tinta); font: 15px/1.6 "Helvetica Neue", Helvetica, Inter, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  ::selection { background: #FCE4EE; }
  .pagina { min-height: 100%; display: grid; grid-template-rows: 30vh auto; }
  .foto { background: #f6f6f7 center 30% / cover no-repeat; background-image: url("${escapar(foto)}"); }
  .panel { display: flex; flex-direction: column; justify-content: center; gap: 32px; padding: 40px 24px 32px; max-width: 560px; width: 100%; margin: 0 auto; }
  .logo { width: 150px; height: auto; display: block; }
  .texto { color: var(--gris); margin-top: 12px; }
  a { color: inherit; text-underline-offset: 3px; }
  a:hover { color: var(--rosa-oscuro); }
  .pie { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 13px; color: var(--gris); border-top: 1px solid var(--hairline); padding-top: 16px; }
  form { display: grid; gap: 16px; }
  .titulo-login { font-weight: 400; font-size: 26px; line-height: 1.2; }
  label { display: grid; gap: 6px; font-size: 13px; color: var(--gris); }
  input { font: inherit; color: var(--tinta); padding: 12px 14px; border: 1px solid #D9D9D9; border-radius: 0; background: #fff; }
  input:focus { outline: none; border-color: var(--tinta); }
  .boton { display: inline-flex; justify-content: center; align-items: center; min-height: 46px; padding: 0 24px; background: var(--tinta); color: #fff; border: 1px solid var(--tinta); border-radius: 0; font: inherit; text-decoration: none; cursor: pointer; }
  .boton:hover { background: #000; color: #fff; }
  .boton[disabled] { opacity: .6; cursor: wait; }
  .boton-claro { background: #fff; color: var(--tinta); }
  .boton-claro:hover { background: #f6f6f7; color: var(--tinta); }
  .enlace { background: none; border: 0; padding: 0; font: inherit; color: var(--gris); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
  .acciones { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; margin-top: 16px; }
  .error { color: #B00020; font-size: 14px; }
  .sesion p { color: var(--gris); }
  @media (min-width: 900px) {
    .pagina { grid-template-rows: none; grid-template-columns: minmax(0, 1.1fr) minmax(420px, 1fr); }
    .foto { background-position: center 20%; }
    .panel { padding: 64px 56px; }
  }
</style>
</head>
<body>
<div class="pagina">
  <div class="foto" role="img" aria-label="Fely Campo"></div>
  <main class="panel">
    <img class="logo" src="/img/logo/fely-campo-logo.webp" alt="Fely Campo" width="150" height="40">
    ${bloqueSesion(true)}
    <div class="pie">
      <span>© Fely Campo</span>
      <a href="${escapar(urlOtroIdioma)}" hreflang="${otroIdioma}" lang="${otroIdioma}">${t.otroIdioma}</a>
    </div>
  </main>
</div>
${scriptLogin(t, destino)}
</body>
</html>`;
  }

  // 503 solo cuando el proxy ha reescrito aquí una URL pública durante el
  // prelanzamiento (cabecera x-fc-prelanzamiento). Abrir /acceso a
  // propósito para entrar, o ya con sesión, es una página normal.
  const cerrado = prelanzamiento && !sesion && request.headers.get('x-fc-prelanzamiento') === '1';
  const segundosHastaApertura = Math.max(60, Math.round((fechaLanzamiento().getTime() - Date.now()) / 1000));
  return new Response(html, {
    status: cerrado ? 503 : 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...(cerrado ? { 'Retry-After': String(segundosHastaApertura) } : {}),
    },
  });
}
