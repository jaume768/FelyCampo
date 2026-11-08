// robots.txt — generado por Next.js (/robots.txt).
// Entorno de pruebas (SITIO_INDEXABLE distinto de "true", ver
// src/lib/seo.js): bloquea todo el rastreo. Definitivo: permite todo
// salvo el panel de administración y la API, y anuncia el sitemap.
// Carrito/wishlist/mi cuenta NO se bloquean aquí a propósito: llevan
// <meta robots noindex> (ver metadataPagina) y Google solo puede leerlo
// si puede rastrear la página — un Disallow haría que la URL pudiera
// acabar indexada sin contenido.

import { SITE_URL, SITIO_INDEXABLE } from '@/lib/seo';

export default function robots() {
  if (!SITIO_INDEXABLE) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
