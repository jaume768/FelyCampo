// seo.js
//
// Base común de SEO para todas las páginas públicas: dominio, canonical,
// hreflang (es/en/x-default), Open Graph y la decisión de indexar o no.
//
// Variables de entorno (ver .env.example):
//   NEXT_PUBLIC_SITE_URL  dominio definitivo, sin barra final. Por
//                         defecto https://felycampo.com — canonical,
//                         sitemap y Open Graph siempre apuntan ahí,
//                         también desde el entorno de pruebas (así una
//                         copia de staging nunca compite con la web real).
//   SITIO_INDEXABLE       "true" SOLO en el despliegue definitivo. Sin
//                         ella (staging, previews, local) todo sale con
//                         <meta name="robots" content="noindex,nofollow">
//                         y robots.txt bloquea el rastreo entero.
//
// Uso en una página (Server Component):
//   export async function generateMetadata({ params }) {
//     const { locale } = await params;
//     return metadataPagina({ locale, ruta: '/sobre-fely' });
//   }
// Los textos de title/description salen de datos/seoTextos.js por "ruta"; para
// páginas dinámicas (producto, runway, blog) se pasan "titulo"/"descripcion"
// ya resueltos en vez de buscarlos ahí.

import { locales, defaultLocale } from '@/i18n';
import { obtenerSeoTextos } from './seoTextos';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://felycampo.com').replace(/\/$/, '');
export const SITIO_INDEXABLE = process.env.SITIO_INDEXABLE === 'true';
export const NOMBRE_MARCA = 'Fely Campo';

const IMAGEN_OG_POR_DEFECTO = '/img/about-felycampo/fely-campo-sobre-fely-campo-conoce-a-disenadora.jpg';

// "/es" + "/" → "/es" (sin barra final), "/es" + "/atelier" → "/es/atelier".
export function rutaConLocale(locale, ruta) {
  return ruta === '/' ? `/${locale}` : `/${locale}${ruta}`;
}

export function urlAbsoluta(ruta) {
  return `${SITE_URL}${ruta}`;
}

// hreflang: una entrada por idioma + x-default al idioma por defecto.
function alternativas(ruta) {
  const languages = Object.fromEntries(locales.map((l) => [l, urlAbsoluta(rutaConLocale(l, ruta))]));
  languages['x-default'] = urlAbsoluta(rutaConLocale(defaultLocale, ruta));
  return languages;
}

// Para descripciones sacadas de textos largos (runways, blog): corta en
// la última palabra entera antes de "max" caracteres y añade "…".
export function recortar(texto, max = 155) {
  const limpio = String(texto || '').replace(/\s+/g, ' ').trim();
  if (limpio.length <= max) return limpio;
  return `${limpio.slice(0, limpio.lastIndexOf(' ', max - 1))}…`;
}

// { title, description, h1 } de una página fija en un idioma (datos en
// src/datos/seoTextos.js, editables en el admin: «Textos de Google»).
export function textosSeo(ruta, locale) {
  const entrada = obtenerSeoTextos()[ruta];
  if (!entrada) return null;
  return Object.fromEntries(Object.entries(entrada).map(([campo, valor]) => [campo, valor[locale] || valor[defaultLocale]]));
}

/**
 * metadata de Next.js para una página pública.
 * - ruta: ruta SIN locale ("/", "/atelier/novias"...).
 * - titulo/descripcion: opcionales, ganan a seoTextos.js.
 * - imagen: opcional, para Open Graph (ruta pública o URL absoluta).
 * - indexar: false para páginas privadas/transaccionales
 *   (confirmaciones de cita) — noindex siempre,
 *   también en el despliegue definitivo, y fuera del sitemap.
 */
export function metadataPagina({ locale, ruta, titulo, descripcion, imagen, indexar = true, tipo = 'website' }) {
  const textos = textosSeo(ruta, locale) || {};
  const title = titulo || textos.title;
  const description = descripcion || textos.description;
  const url = urlAbsoluta(rutaConLocale(locale, ruta));

  return {
    // "absolute": los títulos de seoTextos.js ya llevan la marca donde
    // toca — sin esto la plantilla del layout la añadiría dos veces.
    title: title ? { absolute: title } : undefined,
    description,
    alternates: {
      canonical: url,
      languages: indexar ? alternativas(ruta) : undefined,
    },
    openGraph: {
      type: tipo,
      siteName: NOMBRE_MARCA,
      locale: locale === 'es' ? 'es_ES' : 'en_GB',
      url,
      title,
      description,
      images: [{ url: imagen || IMAGEN_OG_POR_DEFECTO }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    ...(indexar ? {} : { robots: { index: false, follow: false } }),
  };
}
