/* Ruta DINÁMICA: ficha de un producto de Atelier — Novias.
   /atelier/novias/vestido-aurora... El parámetro llega en
   params.producto — el slug de "nombre" (ver src/lib/slugify.js), mismo
   algoritmo que usa TarjetaProducto para enlazar aquí (hrefBase=
   "atelier/novias", ver ../page.js). Plantilla compartida con
   atelier/fiesta/[producto]/page.js — ver FichaProductoAtelier.jsx: a
   propósito NO es la misma ficha que /pret-a-porter/[producto] (sin precio ni
   carrito).
   Vista previa del admin: con ?previa=novias-look se pinta el borrador
   del look que se está editando (PreviaFichaAtelier.jsx); sin indexar. */

import cargaDiferida from 'next/dynamic';
import { FichaProductoAtelier } from '@/components/ecommerce';
import { textosFichaAtelier } from '@/components/ecommerce/FichaProductoAtelier';
import { metadataProductoAtelier } from '@/lib/atelierProductoSeo';
import { ID_PREVIA_LOOK_NOVIAS, productosNovias } from '@/lib/catalogoNovias';
import { PARAMETRO_PREVIA } from '@/lib/previa';
import { setRequestLocale } from 'next-intl/server';
import { cargarContenido } from '@/lib/contenidoServidor';

// Dinámica a propósito: lee la URL (?previa= de la vista previa del admin,
// ?coleccion=…). Las páginas no se generan en el build (layout.js), así que
// Next ya no lo descubre solo y, sin esto, fallaba en producción con
// DYNAMIC_SERVER_USAGE. Sigue siendo rápida: el contenido sale de la caché
// de datos (cargarContenido), solo se renderiza en cada visita.
export const dynamic = 'force-dynamic';

// Solo se carga al abrir la vista previa (no pesa en las fichas normales).
const PreviaFichaAtelier = cargaDiferida(() => import('@/components/ecommerce/PreviaFichaAtelier'));

export async function generateMetadata({ params, searchParams }) {
  const { locale, producto: slug } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  if ((await searchParams)?.[PARAMETRO_PREVIA] === ID_PREVIA_LOOK_NOVIAS) {
    return { robots: { index: false, follow: false } };
  }
  return metadataProductoAtelier({ locale, slug, seccion: 'novias' });
}

export default async function Pagina({ params, searchParams }) {
  const { locale, producto: slug } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  if ((await searchParams)?.[PARAMETRO_PREVIA] === ID_PREVIA_LOOK_NOVIAS) {
    return <PreviaFichaAtelier seccion="novias" locale={locale} textos={await textosFichaAtelier(locale)} publicados={productosNovias()} />;
  }
  return <FichaProductoAtelier slug={slug} seccion="novias" locale={locale} />;
}
