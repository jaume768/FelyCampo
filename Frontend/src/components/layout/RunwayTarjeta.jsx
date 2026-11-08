'use client';

/* ============================================================
   TARJETA DE RUNWAY — Fely Campo
   Uso:
     <RunwayTarjeta href="/archivo/colecciones/la-coleccion" nombre="La Colección"
        temporada="AW27" medios={[{ src: '/img/landing/FW27-Hero3.mp4', tipo: 'video' }]} />
     <RunwayTarjeta ... medios={[{ src: 'a.webp' }, { src: 'b.webp' }]} /> // "split" a dos columnas
   'use client' por useEnVista: la tarjeta entera aparece con scroll
   (ver .al-scroll/.en-vista en global.css), no de golpe con la
   cuadrícula completa.
   ============================================================ */

import styles from './RunwayTarjeta.module.css';
import useEnVista from '@/hooks/useEnVista';
import { atributosImagen } from '@/lib/imagenes';
import VideoDiferido from '@/components/ui/VideoDiferido';

/**
 * Una celda de la cuadrícula de /colecciones-fely-campo (ver page.js ahí): un
 * único medio (imagen o vídeo) a todo el ancho de la celda, o dos
 * lado a lado si "medios" trae 2 — todo el bloque enlaza a la
 * colección completa (/archivo/colecciones/[coleccion]).
 */
function RunwayTarjeta({ href, nombre, temporada, medios }) {
  const [ref, enVista] = useEnVista();

  return (
    <a ref={ref} href={href} className={`${styles.tarjeta} al-scroll ${enVista ? 'en-vista' : ''}`}>
      <div className={styles.marco}>
        {medios.map((medio) => (
          <div key={medio.src} className={styles.medio}>
            {medio.tipo === 'video' ? (
              <VideoDiferido src={medio.src} className={styles.media} />
            ) : (
              <img {...atributosImagen(medio.src, { sizes: '(max-width: 768px) 100vw, 33vw' })} alt="" className={styles.media} />
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
