/* Placeholder — pendiente de maquetar. Ruta: /atelier/vosotras
   A diferencia de /atelier/novias y /atelier/fiesta (catálogo de
   producto vía CuadriculaProductos), esta sección enseña a la
   comunidad: fotos de clientas + sus reseñas, no productos en venta —
   ver GaleriaVosotras.jsx. Misma cabecera que Novias/Fiesta para que
   las tres secciones de Atelier compartan estructura, pero sin
   CuadriculaProductos/PanelFiltros (no hay talla/color/precio que
   filtrar aquí, ni CabeceraSeccion "enCuadricula" — no hay botón de
   filtros ni toggle de densidad que alojar en su fila). Sin ProductHero
   tampoco (a diferencia de Novias/Fiesta) — esta página no necesita ni
   su envoltorio ni el Navbar transparente que trae consigo (no está en
   RUTAS_CON_PRODUCT_HERO, ver layout.js), así que el Navbar se queda
   con su aspecto normal (logo oscuro) desde el principio.

   PRIMER PASO nada más, a petición: solo la cuadrícula de fotos
   placeholder todavía (ver GaleriaVosotras.jsx) — ni clicables ni con
   reseña debajo. Al clicar una foto se abrirá más adelante algo
   parecido a GaleriaProductoLightbox.jsx, pero ese comportamiento se
   implementa en un paso aparte, pendiente de describir. */

import { GaleriaVosotras } from '@/components/layout';
import { CabeceraSeccion } from '@/components/ui';

export default function Pagina() {
  return (
    <section className="seccion">
      <CabeceraSeccion
        subtitleKey="nav.links.atelier"
        titleKey="nav.submenus.atelier.vosotras"
        descriptionKey="vosotras.descripcion"
        margenSuperiorAmplio
      />
      <GaleriaVosotras />
    </section>
  );
}
