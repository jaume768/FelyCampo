/* Ruta DINÁMICA: ficha de un producto de Atelier — Fiesta.
   /atelier/fiesta/vestido-aurora... El parámetro llega en
   params.producto — el slug de "nombre" (ver src/lib/slugify.js), mismo
   algoritmo que usa TarjetaProducto para enlazar aquí (hrefBase=
   "atelier/fiesta", ver ../page.js). Plantilla compartida con
   atelier/novias/[producto]/page.js — ver FichaProductoAtelier.jsx: a
   propósito NO es la misma ficha que /pret-a-porter/[producto] (sin precio ni
   carrito).
   Vista previa del admin: con ?previa=fiesta-look se pinta el borrador
   del look que se está editando (PreviaFichaAtelier.jsx), exista o no
   todavía; sin indexar. */

import cargaDiferida from 'next/dynamic';
import { FichaProductoAtelier } from '@/components/ecommerce';
import { textosFichaAtelier } from '@/components/ecommerce/FichaProductoAtelier';
import { metadataProductoAtelier } from '@/lib/atelierProductoSeo';
import { ID_PREVIA_LOOK_FIESTA, productosFiesta } from '@/lib/catalogoFiesta';
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
  if ((await searchParams)?.[PARAMETRO_PREVIA] === ID_PREVIA_LOOK_FIESTA) {
    return { robots: { index: false, follow: false } };
  }
  return metadataProductoAtelier({ locale, slug, seccion: 'fiesta' });
}

export default async function Pagina({ params, searchParams }) {
  const { locale, producto: slug } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  if ((await searchParams)?.[PARAMETRO_PREVIA] === ID_PREVIA_LOOK_FIESTA) {
    return <PreviaFichaAtelier seccion="fiesta" locale={locale} textos={await textosFichaAtelier(locale)} publicados={productosFiesta()} />;
  }
  return <FichaProductoAtelier slug={slug} seccion="fiesta" locale={locale} />;
}
