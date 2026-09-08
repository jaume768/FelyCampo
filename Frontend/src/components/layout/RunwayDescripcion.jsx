// RunwayDescripcion.jsx

/* ============================================================
   DESCRIPCIÓN DE COLECCIÓN — Fely Campo
   Texto editorial, debajo del hero de cada ficha de colección (ver
   /archivo/runway/[coleccion]/page.js) — vive junto a .textoRow dentro
   de un contenedor común a 70% de ancho (.textoDescripcion en
   page.module.css), sin ancho propio. Mismo criterio de repetición
   que RunwayMediaLateral: solo cambia el texto (coleccion.descripcion,
   ver colecciones.js).
   Uso:
     <RunwayDescripcion texto={coleccion.descripcion} />
   ============================================================ */

import styles from './RunwayDescripcion.module.css';

function RunwayDescripcion({ texto }) {
  if (!texto) return null;

  return (
    <div className={styles.descripcion}>
      <p className={styles.texto}>{texto}</p>
    </div>
  );
}

export default RunwayDescripcion;
