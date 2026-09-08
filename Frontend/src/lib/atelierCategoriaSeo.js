// atelierCategoriaSeo.js
//
// Compartido por las páginas de categoría de Atelier
// (/atelier/{novias,fiesta}/categoria/[categoria]/page.js): las dos
// necesitan lo mismo (slugs válidos para generateStaticParams, título/
// descripción por categoría para generateMetadata, BreadcrumbList
// JSON-LD) parametrizado solo por sección (novias/fiesta) — vive aquí
// en vez de duplicarse, a diferencia de novias/page.js y fiesta/
// page.js (ahí la duplicación es solo la lista de COLECCIONES_*, poca
// cosa; aquí es lógica de verdad: traducciones + estructura de datos).
//
// URLs del JSON-LD: relativas ("/es/atelier/novias"), no absolutas —
// el sitio todavía no define un dominio/metadataBase (ver
// src/app/[locale]/layout.js), así que no hay con qué construir una
// absoluta sin inventárnosla. Anteponer el dominio aquí en cuanto se
// fije uno (Google prefiere itemListElement.item absoluto).
import { getTranslations } from 'next-intl/server';
import { GRUPOS_ESTILO_SILUETA } from '@/components/layout/estiloSiluetaGrupos';

// generateStaticParams: todas las opciones válidas para la sección —
// "ocasion" (soloFiesta) solo entra si esFiesta.
export function parametrosCategoria(esFiesta) {
  return GRUPOS_ESTILO_SILUETA
    .filter((grupo) => !grupo.soloFiesta || esFiesta)
    .flatMap((grupo) => grupo.opciones.map((opcion) => ({ categoria: opcion })));
}

// generateMetadata: título/descripción únicos por categoría+sección
// (claves "atelierCategoriaSeo.*" en messages/{locale}.json). Devuelve
// {} si "categoriaActiva" es null (slug inválido) — la página hace
// notFound() aparte, esto solo evita un <title> con {categoria} sin
// interpolar mientras tanto.
export async function metadataCategoria({ locale, categoriaActiva, seccionKey }) {
  if (!categoriaActiva) return {};

  const t = await getTranslations({ locale });
  const categoria = t(`filtros.estiloYSilueta.grupos.${categoriaActiva.grupo}.opciones.${categoriaActiva.opcion}`);
  const seccion = t(seccionKey);

  return {
    title: t('atelierCategoriaSeo.titulo', { categoria, seccion }),
    description: t('atelierCategoriaSeo.descripcion', { categoria, seccion }),
  };
}

// BreadcrumbList (schema.org) — mismos tres tramos que la miga de pan
// visible en CabeceraSeccion.jsx (Atelier / <sección>) más la
// categoría actual como último tramo (sin "item": es la página en la
// que ya está el usuario, Google no lo exige ahí).
export async function breadcrumbJsonLd({ locale, seccionKey, seccionHref, categoriaActiva }) {
  const t = await getTranslations({ locale });
  const categoria = t(`filtros.estiloYSilueta.grupos.${categoriaActiva.grupo}.opciones.${categoriaActiva.opcion}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav.links.atelier'), item: `/${locale}/atelier` },
      { '@type': 'ListItem', position: 2, name: t(seccionKey), item: `/${locale}/${seccionHref}` },
      { '@type': 'ListItem', position: 3, name: categoria },
    ],
  };
}
