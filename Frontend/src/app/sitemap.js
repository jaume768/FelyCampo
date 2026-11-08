// sitemap.xml — generado por Next.js (/sitemap.xml).
// Todas las páginas públicas indexables, en los dos idiomas, cada una con
// sus alternates hreflang (es/en/x-default). Fuera: confirmaciones de
// cita y /admin.
// Las rutas fijas salen de seoTextos.js (la misma lista que define sus
// títulos), así que una página nueva con title/description propios entra
// sola; las dinámicas, de sus propios archivos de datos.

import { locales, defaultLocale } from '@/i18n';
import { SITE_URL, rutaConLocale } from '@/lib/seo';
import { obtenerSeoTextos } from '@/lib/seoTextos';
import { slugify } from '@/lib/slugify';
import { tiendaProductos } from '@/components/layout/tiendaProductos';
import { noviaProductos } from '@/components/layout/noviaProductos';
import { fiestaProductos } from '@/components/layout/fiestaProductos';
import { coleccionesVisiblesRunway } from '@/lib/runway';
import { articulosVisibles } from '@/lib/blog';

// Prioridad orientativa: home y páginas de conversión (ateliers, cita)
// arriba; legales abajo.
function prioridad(ruta) {
  if (ruta === '/') return 1;
  if (ruta.startsWith('/atelier') || ruta === '/visita-fely-campo/cita' || ruta === '/visita-fely-campo') return 0.9;
  if (ruta.startsWith('/legal')) return 0.2;
  return 0.7;
}

// Fotos de cada página para Google Imágenes (<image:image>): en una web de
// moda es una de las entradas principales de búsqueda. Solo fotos (los
// vídeos de las galerías llevan "#video" o son .mp4), en URL absoluta y
// hasta 20 por página (Google admite 1.000; más no aporta).
const MAX_FOTOS = 20;
function fotos(lista) {
  return [...new Set((lista || [])
    .filter((src) => typeof src === 'string' && src.startsWith('/') && !src.includes('#') && !/\.(mp4|webm|mov)$/i.test(src)))]
    .slice(0, MAX_FOTOS)
    .map((src) => `${SITE_URL}${encodeURI(src)}`);
}

// "fecha" (opcional): última modificación conocida (la de un artículo
// del blog), para que Google sepa qué volver a rastrear.
function entrada(ruta, prioridadRuta = prioridad(ruta), fecha = undefined, imagenes = []) {
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}${rutaConLocale(l, ruta)}`]));
  languages['x-default'] = `${SITE_URL}${rutaConLocale(defaultLocale, ruta)}`;

  // Una <url> por idioma, todas con el mismo bloque de alternates.
  return locales.map((locale) => ({
    url: `${SITE_URL}${rutaConLocale(locale, ruta)}`,
    changeFrequency: 'monthly',
    priority: prioridadRuta,
    ...(fecha ? { lastModified: fecha } : {}),
    ...(imagenes.length ? { images: imagenes } : {}),
    alternates: { languages },
  }));
}

export default function sitemap() {
  const fijas = Object.keys(obtenerSeoTextos())
    .filter((ruta) => !ruta.includes('/cita/confirmacion'));

  const dinamicas = [
    ...tiendaProductos.map((p) => [`/pret-a-porter/${slugify(p.nombre)}`, 0.6, undefined, fotos(p.imagenes || [p.imagen])]),
    ...noviaProductos.map((p) => [`/atelier/novias/${slugify(p.nombre)}`, 0.5, undefined, fotos(p.imagenes || [p.imagen])]),
    ...fiestaProductos.map((p) => [`/atelier/fiesta/${slugify(p.nombre)}`, 0.5, undefined, fotos(p.imagenes || [p.imagen])]),
    ...coleccionesVisiblesRunway().map((c) => [`/runways-${c.slug}`, 0.6, undefined, fotos([c.portada, ...(c.looks || []).map((l) => l.src)])]),
    // Episodios de podcast: sin ficha propia (enlazan a YouTube).
    // Artículos del blog publicados (los ocultos no), con su fecha.
    ...articulosVisibles().map((articulo) => [`/blog/${articulo.slug}`, 0.6, articulo.fecha, fotos([articulo.imagenCubierta])]),
  ];

  // Sin duplicados (dos productos con el mismo nombre darían la misma URL).
  const vistas = new Set();
  return [...fijas.map((ruta) => [ruta]), ...dinamicas]
    .filter(([ruta]) => !vistas.has(ruta) && vistas.add(ruta))
    .flatMap(([ruta, p, fecha, imagenes]) => entrada(ruta, p, fecha, imagenes));
}
