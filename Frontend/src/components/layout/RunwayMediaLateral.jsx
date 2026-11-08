// RunwayMediaLateral.jsx

/* ============================================================
   MEDIA LATERAL DE RUNWAY — Fely Campo
   Pieza del hero de cada ficha de colección (ver
   /colecciones-fely-campo/[coleccion]/page.js): imagen o vídeo (según
   medio.tipo) a ancho completo, ocupando todo el alto disponible
   dentro del hero (flex:1 sobre un padre en columna marcado
   data-navbar-hero). Se repite igual en las 9 colecciones — solo
   cambia el medio (coleccion.medios[0], ver colecciones.js).
   Uso:
     <RunwayMediaLateral medio={coleccion.medios[0]} alt={coleccion.nombre} />
   ============================================================ */

import { atributosImagen } from '@/lib/imagenes';
import styles from './RunwayMediaLateral.module.css';

function RunwayMediaLateral({ medio, alt }) {
  if (!medio) return null;

  return (
    <div className={styles.medio}>
      {medio.tipo === 'video' && medio.srcMovil ? (
        // "srcMovil" (opcional): otro vídeo en mobile (<768px, mismo corte
        // que el CSS), p. ej. vertical en vez de horizontal. El navegador
        // elige el <source> al cargar y solo descarga ese.
        <video poster={medio.poster} className={styles.media} autoPlay muted loop playsInline>
          <source src={medio.srcMovil} type="video/mp4" media="(max-width: 767px)" />
          <source src={medio.src} type="video/mp4" />
        </video>
      ) : medio.tipo === 'video' ? (
        <video src={medio.src} poster={medio.poster} className={styles.media} autoPlay muted loop playsInline />
      ) : (
        // Siempre es el hero de arriba (HeroPagina, fichas de Runway): es la
        // imagen principal de la página (LCP), así que va con prioridad.
        <img {...atributosImagen(medio.src, { sizes: '100vw', prioridad: true })} alt={alt} className={styles.media} />
      )}
    </div>
  );
}

export default RunwayMediaLateral;
