/* ============================================================
   RUNWAY — Fely Campo. Ruta: /colecciones-fely-campo (antes
   /archivo/runway — renombrada). Cuadrícula editorial de las 9
   colecciones de pasarela (ver lib/runway.js y datos/runway.js, compartidos con
   la ficha de cada colección). Cada tarjeta enlaza a la ficha de su
   colección en /runways-[slug] (ver ../runways-[coleccion]/page.js —
   ruta hermana, no anidada bajo esta, a petición directa del usuario;
   ej. /runways-dreaming, /runways-diafonia).
   ============================================================ */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RunwayTarjeta } from '@/components/layout';
import { CabeceraPagina, HeroCabecera } from '@/components/layout/CabeceraPagina';
import { obtenerCabecera } from '@/lib/cabeceras';
import { coleccionParaWeb, coleccionesVisiblesRunway } from '@/lib/runway';
import styles from './page.module.css';
import { metadataPagina } from '@/lib/seo';
import { cargarContenido } from '@/lib/contenidoServidor';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/colecciones-fely-campo' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const t = await getTranslations();

  return (
    <>
    {/* Cabecera: lib/cabeceras.js (editable en el admin, Runway › Página
        de la web, con vista previa). El título es el H1 de la página
        (auditoría SEO M11); el menú sigue diciendo "Runway". */}
    <CabeceraPagina id="runway" publicado={obtenerCabecera('runway')}>
    <HeroCabecera alt={t('nav.submenus.colecciones.runway')} />
    <section className={`${styles.pagina} contenedor`}>
      <div className={styles.grid}>
        {coleccionesVisiblesRunway().map((datos) => coleccionParaWeb(datos, locale)).map((coleccion) => (
          <RunwayTarjeta
            key={coleccion.slug}
            href={`/${locale}/runways-${coleccion.slug}`}
            nombre={coleccion.nombre}
            temporada={coleccion.temporada}
            medios={coleccion.medios}
          />
        ))}
      </div>
    </section>
    </CabeceraPagina>
    </>
  );
}
