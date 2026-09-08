/* Ruta DINÁMICA: ficha de un producto de Atelier — Novias.
   /atelier/novias/vestido-aurora... El parámetro llega en
   params.producto — el slug de "nombre" (ver src/lib/slugify.js), mismo
   algoritmo que usa TarjetaProducto para enlazar aquí (hrefBase=
   "atelier/novias", ver ../page.js). Plantilla compartida con
   atelier/fiesta/[producto]/page.js — ver FichaProductoAtelier.jsx: a
   propósito NO es la misma ficha que /tienda/[producto] (sin precio ni
   carrito). */

import { FichaProductoAtelier } from '@/components/ecommerce';

export default async function Pagina({ params }) {
  const { locale, producto: slug } = await params;
  return <FichaProductoAtelier slug={slug} seccion="novias" locale={locale} />;
}
