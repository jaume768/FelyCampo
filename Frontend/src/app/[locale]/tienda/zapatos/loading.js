/* Estado de carga del segmento. Next lo muestra mientras el Server Component espera la
   respuesta de la API. Esqueleto con la misma proporción que las tarjetas: sin salto de
   layout al llegar los datos. */

import { ListadoCargando } from '@/components/layout';

export default function Cargando() {
  return (
    <section className="seccion contenedor">
      <ListadoCargando />
    </section>
  );
}
