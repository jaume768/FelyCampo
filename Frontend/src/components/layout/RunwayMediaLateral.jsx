// RunwayMediaLateral.jsx

/* ============================================================
   MEDIA LATERAL DE RUNWAY — Fely Campo
   Pieza del hero de cada ficha de colección (ver
   /archivo/runway/[coleccion]/page.js): imagen o vídeo (según
   medio.tipo) a ancho completo, ocupando todo el alto disponible
   dentro del hero (flex:1 sobre un padre en columna marcado
   data-navbar-hero). Se repite igual en las 9 colecciones — solo
   cambia el medio (coleccion.medios[0], ver colecciones.js).
   Uso:
     <RunwayMediaLateral medio={coleccion.medios[0]} alt={coleccion.nombre} />
   ============================================================ */

import styles from './RunwayMediaLateral.module.css';

function RunwayMediaLateral({ medio, alt }) {
  if (!medio) return null;

  return (
    <div className={styles.medio}>
      {medio.tipo === 'video' ? (
        <video src={medio.src} className={styles.media} autoPlay muted loop playsInline />
      ) : (
        <img src={medio.src} alt={alt} className={styles.media} />
      )}
    </div>
  );
}

export default RunwayMediaLateral;
