/* ============================================================
   PUNTOS DE VENTA — Fely Campo. Ruta: /puntos-de-venta-fely-campo
   (destino del submenú "Puntos de venta" de Visítanos, ver Navbar.jsx
   — antes apuntaba a /visita-fely-campo por duplicado con el enlace
   padre). Server Component mínimo: ProductHero (misma cabecera visual
   que Tienda/Atelier — por eso esta ruta está en RUTAS_CON_PRODUCT_HERO
   en layout.js, así el Navbar nace transparente/claro igual que ahí) +
   MapaPuntosVenta, que ya traía pensada esta ruta como segundo
   consumidor (ver comentario en ese componente) y trae su propia
   CabeceraSeccion — sin otra encima aquí, sería redundante.

   Debajo del mapa, a petición: cabecera "Fely Campo y Guffanti:
   presencia internacional" (CabeceraSeccion, solo título — ver
   "puntosVenta.internacionalTitulo" en messages/{locale}.json) + una
   tarjeta editorial para el Showroom Milán (nombre y texto en
   "puntosVenta.showroomNombre/showroomTexto"), mismo diseño de
   .tarjeta que las sedes de visita-fely-campo/ListadoUbicaciones.jsx
   (foto 50% + info 50%, con EnVista para el fundido al entrar en
   scroll).
   margin-bottom en la propia sección (ver .seccionMilan) para separar
   del Footer, que si no quedaba pegado justo debajo. */

import { MapaPuntosVenta } from '@/components/layout';
import { CabeceraPagina, HeroCabecera } from '@/components/layout/CabeceraPagina';
import { obtenerCabecera } from '@/lib/cabeceras';
import PresenciaInternacional from './PresenciaInternacional';
import { metadataPagina } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';
import { cargarContenido } from '@/lib/contenidoServidor';
import ContenidoCliente from '@/components/layout/ContenidoCliente';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/puntos-de-venta-fely-campo' });
}

export default async function Pagina() {
  return (
    <CabeceraPagina id="puntos-de-venta" publicado={obtenerCabecera('puntos-de-venta')}>
      {/* Cabecera, textos del mapa y «presencia internacional»:
          lib/cabeceras.js (editables en el admin, Puntos de venta › Página
          de la web, con vista previa). */}
      <section className="seccion">
        <HeroCabecera producto />
      </section>

      <section className="seccion" id="mapa-puntos-venta">
        <div className="contenedor">
          <ContenidoCliente claves={['puntos-venta']}>
            <MapaPuntosVenta />
          </ContenidoCliente>
        </div>
      </section>

      <PresenciaInternacional />
    </CabeceraPagina>
  );
}
