/* /admin/productos/atelier — ya no existe (quitada del menú a petición,
   2026-11-06): enseñaba vestidos de ejemplo que no están en la web. Los
   vestidos reales de Atelier son los looks de Fiesta y Novias, que se
   editan en /admin/colecciones/fiesta y /admin/colecciones/novia. Quien
   llegue con la dirección antigua va a Colección Fiesta. */

import { redirect } from 'next/navigation';

export default function ProductosAtelierPage() {
  redirect('/admin/colecciones/fiesta');
}
