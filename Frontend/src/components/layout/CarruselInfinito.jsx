// CarruselInfinito.jsx

/* ============================================================
   CARRUSEL INFINITO — Fely Campo
   Fila de imágenes que se desplaza sola hacia la izquierda, sin fin y
   sin salto visible. Pensado para recortes de look en PNG con fondo
   transparente (ver /pret-a-porter, hero): cada imagen ocupa el alto
   entero de la fila y su ancho sale de su propia proporción.

   Cómo se consigue el bucle sin costura: la lista se pinta DOS veces
   seguidas dentro de la misma pista (.pista) y la animación la mueve
   exactamente -50% (= el ancho de una copia). Al terminar, la segunda
   copia está justo donde empezó la primera, así que reiniciar la
   animación no se nota. Por eso el hueco entre imágenes va como
   padding de cada .item y no como "gap" de la pista: con gap, el
   último hueco de la primera copia faltaría y el salto se vería.

   Uso:
     <CarruselInfinito imagenes={['/img/a.png', '/img/b.png']} alt="Prêt-à-porter" />
   "segundosPorImagen" (opcional): velocidad — la duración total de una
   vuelta es segundosPorImagen × nº de imágenes, así que la velocidad
   aparente es la misma tenga la lista 5 imágenes o 20.
   ============================================================ */

import styles from './CarruselInfinito.module.css';
import { atributosImagen } from '@/lib/imagenes';

function CarruselInfinito({ imagenes = [], alt = '', segundosPorImagen = 4 }) {
  if (imagenes.length === 0) return null;

  const duracion = `${imagenes.length * segundosPorImagen}s`;

  return (
    <div className={styles.carrusel}>
      <div className={styles.pista} style={{ '--duracion': duracion }}>
        {[0, 1].map((copia) => (
          // La segunda copia es solo relleno visual del bucle: fuera del
          // árbol de accesibilidad para que un lector de pantalla no
          // anuncie cada imagen dos veces.
          <div key={copia} className={styles.copia} aria-hidden={copia === 1 || undefined}>
            {imagenes.map((src, indice) => (
              <div key={src} className={styles.item}>
                {/* loading="eager": es una cinta en movimiento con imágenes de
                    ancho automático; en diferido, cada una que llega cambia
                    de ancho y desplaza toda la cinta (CLS 0,11 en Lighthouse).
                    Las 3 primeras, con prioridad alta: en /pret-a-porter la
                    cinta es lo primero que se ve (LCP) y competía con las
                    otras 20 fotos. */}
                <img
                  {...atributosImagen(src, { sizes: '(max-width: 768px) 70vw, 30vw', prioridad: copia === 0 && indice < 3 })}
                  loading="eager"
                  alt={copia === 0 ? alt : ''}
                  className={styles.imagen}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CarruselInfinito;
