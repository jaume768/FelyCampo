/* ============================================================
   TARJETA DE RUNWAY — Fely Campo
   Uso:
     <RunwayTarjeta href="/archivo/colecciones/la-coleccion" nombre="La Colección"
        temporada="AW27" medios={[{ src: '/img/FW27-Hero3.mp4', tipo: 'video' }]} />
     <RunwayTarjeta ... medios={[{ src: 'a.webp' }, { src: 'b.webp' }]} /> // "split" a dos columnas
   ============================================================ */

import styles from './RunwayTarjeta.module.css';

/**
 * Una celda de la cuadrícula de /archivo/runway (ver page.js ahí): un
 * único medio (imagen o vídeo) a todo el ancho de la celda, o dos
 * lado a lado si "medios" trae 2 — todo el bloque enlaza a la
 * colección completa (/archivo/colecciones/[coleccion]).
 */
function RunwayTarjeta({ href, nombre, temporada, medios }) {
  return (
    <a href={href} className={styles.tarjeta}>
      <div className={styles.marco}>
        {medios.map((medio) => (
          <div key={medio.src} className={styles.medio}>
            {medio.tipo === 'video' ? (
              <video src={medio.src} className={styles.media} autoPlay muted loop playsInline />
            ) : (
              <img src={medio.src} alt="" className={styles.media} />
            )}
          </div>
        ))}
      </div>
      <div className={styles.etiqueta}>
        <p className={styles.nombre}>{nombre}</p>
        <p className={styles.temporada}>{temporada}</p>
      </div>
    </a>
  );
}

export default RunwayTarjeta;
