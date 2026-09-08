import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export default function middleware(request) {
  const response = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;

  // Expone el pathname a Server Components (layout.js) vía header, para
  // que puedan decidir cosas como el Navbar transparente en home sin
  // tener que renderizar <Navbar /> por separado en cada página.
  //
  // response.headers.set(...) por sí solo NO basta: eso solo añade el
  // header a la respuesta que ve el navegador, no al request que llega
  // al render. Hay que reenviarlo también como REQUEST header con el
  // protocolo x-middleware-request-*/x-middleware-override-headers (el
  // mismo que usa internamente NextResponse.next({request:{headers}}),
  // y que next-intl ya usa para pasar el locale resuelto) — si no, en
  // runtimes que separan el middleware del render en procesos distintos
  // (p.ej. Netlify: Edge Function -> función origin) el header nunca
  // llega y `headers().get('x-pathname')` sale null en producción,
  // aunque en `next dev` sí funcione.
  const existingOverrides = response.headers.get('x-middleware-override-headers');
  const overrides = existingOverrides ? existingOverrides.split(',') : [];

  response.headers.set('x-pathname', pathname);
  response.headers.set('x-middleware-request-x-pathname', pathname);
  response.headers.set(
    'x-middleware-override-headers',
    [...new Set([...overrides, 'x-pathname'])].join(',')
  );

  return response;
}

export const config = {
  // Corre en todo salvo assets estáticos, _next y api.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
