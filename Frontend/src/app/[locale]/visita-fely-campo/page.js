/* ============================================================
   VISÍTENOS — Fely Campo. Ruta: /visita-fely-campo (namespace de
   traducciones "visitenos", sin cambiar — solo la URL es distinta).
   Server Component: ProductHero (misma cabecera visual que
   Tienda/Atelier/Puntos de venta — por eso esta ruta está en
   RUTAS_CON_PRODUCT_HERO en layout.js, así el Navbar nace
   transparente/claro igual que ahí) + ListadoUbicaciones.jsx (Client
   Component — cabecera + chips de ciudad + listado filtrado, ver ese
   archivo y src/datos/ateliers.js) + MapaPuntosVenta al final.
   ============================================================ */

import { MapaPuntosVenta } from '@/components/layout';
import { CabeceraPagina, HeroCabecera } from '@/components/layout/CabeceraPagina';
import { obtenerCabecera } from '@/lib/cabeceras';
import ListadoUbicaciones from './ListadoUbicaciones';
import styles from './page.module.css';
import { metadataPagina } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return metadataPagina({ locale, ruta: '/visita-fely-campo' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Cabecera e introducción: lib/cabeceras.js (editables en el admin,
          Página Visítanos, con vista previa). */}
      <CabeceraPagina id="visitanos" publicado={obtenerCabecera('visitanos')}>
      <section className="seccion">
        <HeroCabecera producto className={styles.heroEncuadre} />
      </section>

      {/* .seccionUbicaciones (ver page.module.css): en mobile el hero de
          arriba es position:fixed (ProductHero.module.css) — esta es la
          sección que le sigue en el flujo, necesita fondo opaco +
          posicionada + z-index por encima para taparlo al hacer scroll
          (mismo mecanismo que .seccionGrid en Tienda). */}
      <section className={`seccion ${styles.seccionUbicaciones}`}>
        <div className="contenedor">
          <ListadoUbicaciones locale={locale} />
        </div>
      </section>

      <section className="seccion" id="mapa-puntos-venta">
        <div className="contenedor">
          <MapaPuntosVenta />
        </div>
      </section>
      </CabeceraPagina>
    </>
  );
}
