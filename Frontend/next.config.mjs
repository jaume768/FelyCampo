import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.js');

// Cabecera HTTP X-Robots-Tag (auditoría SEO, "Gestión interna"): a
// diferencia de Disallow en robots.txt, sí impide indexar, y vale para
// cualquier respuesta (HTML, JSON de la API, errores 4xx/5xx). Mismo
// criterio que SITIO_INDEXABLE en src/lib/seo.js.
const SITIO_INDEXABLE = process.env.SITIO_INDEXABLE === 'true';
const NOINDEX = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

// Fotos y vídeos del contenido editable: viven en el almacén de medios del
// backend y la web los pide por /media/… en su propio origen. En producción
// Caddy los sirve desde el volumen antes de llegar aquí; en desarrollo no hay
// Caddy, así que Next reenvía /media/* a Django (que los sirve con DEBUG=True).
const ES_DESARROLLO = process.env.NODE_ENV !== 'production';
const API_INTERNA = process.env.API_INTERNAL_URL || 'http://localhost:8001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `standalone` empaqueta en .next/standalone un servidor Node mínimo con solo las
  // dependencias que se usan de verdad. Es lo que copia el target `prod` del
  // Dockerfile: sin esto, esa imagen no arranca (no existe server.js).
  output: 'standalone',

  // La barra final la quita src/proxy.js, no Next: así una URL de la web
  // anterior (WordPress, siempre con barra) llega al mapa de 301 de una
  // vez, sin un 308 previo — ver el paso 2 en proxy.js.
  skipTrailingSlashRedirect: true,

  // Redirecciones de la web anterior: ver src/lib/redirecciones301.js y
  // src/proxy.js (son ~800, por eso viven allí y no aquí). Aquí solo las
  // que el proxy no ve: rutas con punto (excluidas de su matcher) y
  // rutas nuevas con locale.
  async headers() {
    return [
      // Fotos y vídeos fijos del código (public/img, public/video): una
      // semana en caché del navegador. Next los sirve sin Cache-Control (el
      // navegador volvía a preguntar en cada visita). No son «immutable»:
      // un despliegue puede cambiar un archivo con el mismo nombre.
      { source: '/img/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
      { source: '/video/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
      // Gestión interna: siempre noindex, también en producción. El
      // panel (/admin) y la API no son contenido público.
      { source: '/admin', headers: NOINDEX },
      { source: '/admin/:path*', headers: NOINDEX },
      { source: '/api/:path*', headers: NOINDEX },
      // Confirmaciones de cita (ya llevan <meta robots noindex>, ver
      // metadataPagina): también por cabecera.
      { source: '/:locale(es|en)/visita-fely-campo/cita/:confirmacion(confirmacion.*)', headers: NOINDEX },
      // Fuera del despliegue definitivo (staging, deploy previews, branch
      // deploys): noindex en absolutamente todo, archivos incluidos.
      ...(SITIO_INDEXABLE ? [] : [{ source: '/:path*', headers: NOINDEX }]),
      // Cualquier respuesta servida desde *.netlify.app (también imágenes
      // y vídeos, que no pasan por src/proxy.js): noindex, para que solo
      // se indexe felycampo.com aunque producción responda ahí.
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?<subdominio>.*)\\.netlify\\.app' }],
        headers: NOINDEX,
      },
    ];
  },

  async redirects() {
    return [
      // (La antigua redirección /blog → /podcast se quitó el 2026-11-04:
      // el blog vuelve a vivir en /blog y es /podcast el que redirige,
      // ver destinoEliminada en src/proxy.js.)
      // /about era un placeholder vacío que duplicaba /sobre-fely.
      {
        source: '/:locale(es|en)/about',
        destination: '/:locale/sobre-fely',
        statusCode: 301,
      },
      // Categorías de Atelier en camelCase (/categoria/corteA), de antes de
      // pasar a minúsculas con guiones. Las páginas de categoría se quitaron
      // el 2026-11-07: van directas a su sección (ver src/proxy.js).
      ...[['corteA', 'corte-a'], ['dosPiezas', 'dos-piezas'], ['alfombraRoja', 'alfombra-roja'], ['escoteEspalda', 'escote-espalda']]
        .map(([antes, ahora]) => ({
          source: `/:locale(es|en)/atelier/:seccion(novias|fiesta)/categoria/${antes}`,
          destination: '/:locale/atelier/:seccion',
          statusCode: 301,
        })),
      // Sitemaps de WordPress (los que conoce Google Search Console).
      // Una sola URL por colección (auditoría SEO M12): la carpeta real
      // es /runways/[coleccion], pero la pública es /runways-{slug} (la de
      // la web anterior, ver rewrites). Los redirects se evalúan sobre la
      // URL que pide el navegador, antes de los rewrites, así que esto no
      // choca con la reescritura de abajo.
      {
        source: '/:locale(es|en)/runways/:coleccion',
        destination: '/:locale/runways-:coleccion',
        statusCode: 301,
      },
      {
        source: '/:sitemap(wp-sitemap.*\\.xml|sitemap_index\\.xml)',
        destination: '/sitemap.xml',
        statusCode: 301,
      },
    ];
  },

  // Fichas de colección de Runway: la URL pública es /runways-{slug}
  // (ej. /runways-diafonia, sin barra) a petición directa del usuario,
  // pero Next.js no admite una carpeta de ruta dinámica con prefijo
  // literal pegado ("runways-[coleccion]" no es sintaxis válida — solo
  // "[param]" a secas). La página real vive en
  // src/app/[locale]/runways/[coleccion]/page.js (ruta normal, con
  // barra) y este rewrite traduce la URL pública a esa ruta interna
  // sin cambiar lo que ve el usuario en la barra de direcciones.
  async rewrites() {
    return [
      {
        source: '/:locale/runways-:coleccion',
        destination: '/:locale/runways/:coleccion',
      },
      ...(ES_DESARROLLO
        ? [{ source: '/media/:ruta*', destination: `${API_INTERNA}/media/:ruta*` }]
        : []),
    ];
  },
};

export default withNextIntl(nextConfig);
