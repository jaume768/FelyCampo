/* ============================================================
   RUNWAY — Fely Campo. Ruta: /archivo/runway
   Cuadrícula editorial de las 9 colecciones de pasarela (ver
   colecciones.js, datos compartidos con [coleccion]/page.js). Cada
   tarjeta enlaza a /archivo/runway/[slug]-[temporada] en minúsculas,
   ej. /archivo/runway/dreaming-ss26 (ver slugCompleto en colecciones.js).
   ============================================================ */

import { RunwayTarjeta } from '@/components/layout';
import { COLECCIONES, slugCompleto } from './colecciones';
import styles from './page.module.css';

export default async function Pagina({ params }) {
  const { locale } = await params;

  return (
    <section className={`${styles.pagina} contenedor`}>
      <div className={styles.grid}>
        {COLECCIONES.map((coleccion) => (
          <RunwayTarjeta
            key={coleccion.slug}
            href={`/${locale}/archivo/runway/${slugCompleto(coleccion)}`}
            nombre={coleccion.nombre}
            temporada={coleccion.temporada}
            medios={coleccion.medios}
          />
        ))}
      </div>
    </section>
  );
}
