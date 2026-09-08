// RunwayBackstage.jsx

/* ============================================================
   BACKSTAGE DE COLECCIÓN — Fely Campo
   Cuadrícula editorial de fotos de backstage, entre la descripción y
   la cuadrícula de looks de cada ficha de colección (ver
   /archivo/runway/[coleccion]/page.js) — opcional, solo se pinta si la
   colección trae "backstage" (ver colecciones.js; de momento solo La
   Colección tiene reportaje de backstage real).
   .envoltorio ocupa el 100% (para que el fondo/padding de quien la use
   no tenga que saber del 80%) y dentro, .grid se acota al 80% y se
   centra — ver RunwayBackstage.module.css para el patrón de cascada
   (se repite cada 4 fotos: una sola a todo el ancho, dos en la misma
   fila, una sola a la izquierda) y los gaps generosos entre fotos.
   Cada imagen conserva su proporción natural (sin recorte forzado).
   Uso:
     <RunwayBackstage imagenes={coleccion.backstage} alt={coleccion.nombre} />
   ============================================================ */

import styles from './RunwayBackstage.module.css';

function RunwayBackstage({ imagenes = [], alt }) {
  if (imagenes.length === 0) return null;

  return (
    <div className={styles.envoltorio}>
      <div className={styles.grid}>
        {imagenes.map((src) => (
          <img key={src} src={src} alt={alt} className={styles.imagen} />
        ))}
      </div>
    </div>
  );
}

export default RunwayBackstage;
