import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';
import { REDIRECCIONES_301 } from './lib/redirecciones301';
import { COOKIE_EQUIPO, enPrelanzamiento, verificarSesion } from './lib/sesionEquipo';

// URLs antiguas (WordPress) que no estaban en el sitemap — productos o
// categorías que ya se habían despublicado, feeds, archivos del blog... —
// por prefijo, después del mapa exacto de redirecciones301.js. Mejor un
// 301 a la sección más cercana que un 404.
const REGLAS_PREFIJO = [
  [/^\/producto\//, '/es/atelier'],
  [/^\/categoria-producto\/(novias|tendencias-novia|estilos-novia|siluetas-novia)(\/|$)/, '/es/atelier/novias'],
  [/^\/categoria-producto\/(fiesta|tendencias-fiesta|estilos-fiesta|siluetas-fiesta)(\/|$)/, '/es/atelier/fiesta'],
  [/^\/categoria-producto\//, '/es/atelier'],
  [/^\/(category|tag|author)\//, '/es/blog'],
  [/^\/(feed|comments\/feed)$/, '/es/blog'],
  [/^\/(tienda|shop|carrito|cart|mi-cuenta|my-account|finalizar-compra|checkout)$/, '/es/pret-a-porter'],
  // URLs antiguas fuera del sitemap que daban cadenas de redirección
  // (308 → 307 → 308) hasta la home (auditoría SEO M13): ahora un solo
  // 301 a su equivalente. Las de cuenta, al mismo destino que /mi-cuenta.
  [/^\/terminos-y-condiciones$/, '/es/legal/terminos'],
  [/^\/contacto$/, '/es/visita-fely-campo'],
  [/^\/(lista-de-deseos|lost-password|mi-cuenta\/lost-password)$/, '/es/pret-a-porter'],
];

// Páginas de esta web que se han quitado → su sustituta, en cualquier
// idioma (la web es de atelier: sin "Contacto" ni "Devoluciones" de
// tienda online, eliminadas el 2026-11-04; sin "Envíos" ni "Atención al
// cliente", que hablaban de la tienda online, ni el manifiesto
// "Responsabilidad", que no enlazaba nadie, ni carrito, wishlist y Mi
// cuenta, de la tienda online que no existe, eliminadas el 2026-11-07).
// Ruta sin locale.
const RUTAS_ELIMINADAS = {
  '/ayuda/contacto': '/visita-fely-campo',
  // No es una página quitada: la URL que alguien teclearía buscando
  // contacto ("Contacto" del footer ya apunta a los ateliers).
  '/contacto': '/visita-fely-campo',
  '/contact': '/visita-fely-campo',
  '/ayuda/devoluciones': '/visita-fely-campo',
  '/ayuda/envios': '/visita-fely-campo',
  '/ayuda/atencion-cliente': '/visita-fely-campo',
  '/responsabilidad': '/sobre-fely',
  '/carrito': '/pret-a-porter',
  '/wishlist': '/pret-a-porter',
  '/mi-cuenta': '/pret-a-porter',
  '/mi-cuenta/panel': '/pret-a-porter',
  '/pret-a-porter/vestidos': '/pret-a-porter',
  '/pret-a-porter/faldas': '/pret-a-porter',
  '/pret-a-porter/pantalones': '/pret-a-porter',
  '/pret-a-porter/tops-y-camisetas': '/pret-a-porter',
  '/pret-a-porter/chaquetas-y-abrigos': '/pret-a-porter',
};

function destinoEliminada(pathname) {
  const [, locale, ...resto] = (pathname.replace(/\/+$/, '') || '/').toLowerCase().split('/');
  if (!locales.includes(locale)) return null;
  // /podcast y sus entradas pasaron a /blog (2026-11-04): mismo slug.
  if (resto[0] === 'podcast') return `/${locale}/blog${resto.length > 1 ? `/${resto.slice(1).join('/')}` : ''}`;
  // Páginas de categoría de Atelier (quitadas el 2026-11-07, ver
  // docs/PUBLICAR.md): a su sección.
  if (resto[0] === 'atelier' && ['fiesta', 'novias'].includes(resto[1]) && resto[2] === 'categoria') return `/${locale}/atelier/${resto[1]}`;
  const destino = RUTAS_ELIMINADAS[`/${resto.join('/')}`];
  return destino ? `/${locale}${destino}` : null;
}

// 301 de la web anterior: null si "pathname" no es una URL antigua. Las
// rutas nuevas siempre empiezan por un locale (/es, /en), así que nunca
// chocan con las antiguas, que no lo llevaban.
// La raíz "/" queda fuera aunque esté en el mapa: es la misma URL en la
// web nueva y next-intl la resuelve al idioma del navegador (un 301 fijo
// a /es mandaría a todo el mundo al español para siempre).
function destinoAntiguo(pathname) {
  const ruta = (pathname.replace(/\/+$/, '') || '/').toLowerCase();
  if (ruta === '/') return null;
  if (REDIRECCIONES_301[ruta]) return REDIRECCIONES_301[ruta];
  if (locales.some((locale) => ruta === `/${locale}` || ruta.startsWith(`/${locale}/`))) return null;
  const regla = REGLAS_PREFIJO.find(([patron]) => patron.test(ruta));
  return regla ? regla[1] : null;
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export default async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // 0) Acceso del equipo (ver src/lib/sesionEquipo.js y src/app/acceso/route.js).
  //    /acceso es el login y el anuncio: siempre abierto.
  // La cabecera x-fc-prelanzamiento solo la pone este proxy: se borra la
  // que pudiera traer la petición.
  if (pathname === '/acceso') {
    const cabeceras = new Headers(request.headers);
    cabeceras.delete('x-fc-prelanzamiento');
    cabeceras.delete('x-fc-idioma');
    return NextResponse.next({ request: { headers: cabeceras } });
  }

  const esPanel = pathname === '/admin' || pathname.startsWith('/admin/');
  const cerrada = enPrelanzamiento();
  if (esPanel || cerrada) {
    const sesion = await verificarSesion(request.cookies.get(COOKIE_EQUIPO)?.value);
    if (esPanel) {
      // El panel no pasa por next-intl (no lleva idioma en la URL).
      if (sesion) return NextResponse.next();
      const login = new URL('/acceso', request.url);
      login.searchParams.set('destino', pathname + request.nextUrl.search);
      return NextResponse.redirect(login, 307);
    }
    // Prelanzamiento (hasta la fecha y hora de PRELANZAMIENTO_FECHA; luego
    // la web se abre sola): el público ve «Muy pronto» (503) en CUALQUIER URL,
    // también en las antiguas de WordPress — antes de sus 301, para que
    // Google no dé por buenas las redirecciones a una web que aún no
    // enseña nada. La URL del navegador no cambia: tras iniciar sesión,
    // el equipo vuelve justo a donde iba.
    // La cabecera interna le dice a /acceso que viene de una URL pública
    // (→ 503); quien abre /acceso a propósito para entrar recibe un 200.
    if (!sesion) {
      const cabeceras = new Headers(request.headers);
      cabeceras.set('x-fc-prelanzamiento', '1');
      // El idioma de la URL (/en/… → la pantalla en inglés).
      const idioma = /^\/(es|en)(\/|$)/.exec(pathname)?.[1];
      if (idioma) cabeceras.set('x-fc-idioma', idioma);
      else cabeceras.delete('x-fc-idioma');
      // Con su ?query: el «English / Español» de la pantalla es «?lang=…».
      const anuncio = new URL('/acceso', request.url);
      anuncio.search = request.nextUrl.search;
      return NextResponse.rewrite(anuncio, { request: { headers: cabeceras } });
    }
  }

  // 1) Web anterior → 301 directo a la nueva, en un solo salto (sin pasar
  //    antes por la redirección de idioma de next-intl ni por la de barra
  //    final). Los parámetros de WordPress (?p=, ?add-to-cart=...) no
  //    significan nada aquí, así que no se arrastran.
  //    Lo mismo para las páginas quitadas de esta web (RUTAS_ELIMINADAS).
  const destino = destinoAntiguo(pathname) || destinoEliminada(pathname);
  if (destino) {
    return NextResponse.redirect(new URL(destino, request.url), 301);
  }

  // 2) Barra final: las URLs de WordPress la llevaban siempre; las nuevas
  //    no. Con skipTrailingSlashRedirect (next.config.mjs) Next ya no la
  //    quita por su cuenta — se hace aquí, DESPUÉS del paso 1, para que
  //    una URL antigua con barra no dé dos saltos (308 + 301).
  if (pathname.length > 1 && pathname.endsWith('/')) {
    // new URL(request.url), no request.nextUrl.clone(): NextURL vuelve a
    // añadir la barra al serializar si la petición la traía (bucle).
    const url = new URL(request.url);
    url.pathname = pathname.replace(/\/+$/, '');
    return NextResponse.redirect(url, 308);
  }

  const response = intlMiddleware(request);

  // El despliegue de producción también responde en felycampo.netlify.app
  // (y cada deploy en su propio *.netlify.app): ahí, noindex siempre, para
  // que solo se indexe felycampo.com (auditoría SEO, "Gestión interna").
  // Los archivos y /admin, /api ya llevan la cabecera desde next.config.
  if (/\.netlify\.app$/i.test(request.headers.get('host') || '')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // (Aquí se exponía antes el pathname a layout.js con la cabecera
  // x-pathname; ya no hace falta: lo decide components/layout/MarcoRuta.jsx
  // con usePathname, y leer cabeceras en el layout hacía dinámicas todas
  // las páginas.)

  return response;
}

export const config = {
  // Corre en todo salvo assets estáticos, _next y api. /admin SÍ pasa por
  // aquí (para exigir la sesión de equipo), pero sale antes de next-intl.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
