'use client';

/* ============================================================
   BLOQUE DE SECCIÓN (imagen + texto) — Fely Campo
   Uso:
     <BloqueSeccion imagen="/img/atelier.jpg" titulo="Visita el atelier"
        texto="Costura a medida en Salamanca." enlace="Descubre más"
        href="/visita-fely-campo/cita" invertido={false} />
     <BloqueSeccion imagen="/img/atelier.mp4" tipo="video" ... />
   'use client' por useEnVista: el bloque entero (imagen + texto)
   aparece con scroll (ver .al-scroll/.en-vista en global.css).
   ============================================================ */

import styles from './BloqueSeccion.module.css';
import { Boton } from '../ui';
import useEnVista from '@/hooks/useEnVista';
import { atributosImagen } from '@/lib/imagenes';
import VideoDiferido from '@/components/ui/VideoDiferido';

/**
 * Bloque editorial imagen+texto, reutilizado en varias
 * páginas (About, Atelier, colecciones). 'invertido' cambia el lado de la imagen.
 * 'href' es opcional: sin él, "enlace" se muestra igual pero sin navegar
 * (Boton sin href renderiza un <span>). 'tipo' ('imagen' por defecto |
 * 'video') decide si "imagen" se renderiza como <img> o como
 * <video autoPlay muted loop playsInline>.
 */
function BloqueSeccion({ imagen, tipo = 'imagen', titulo, texto, enlace, href, invertido = false }) {
  const [ref, enVista] = useEnVista();

  return (
    <section ref={ref} className={`${styles.seccion} al-scroll ${enVista ? 'en-vista' : ''}`}>
      <div className={`${styles.marco} ${invertido ? styles.invertido : ''}`}>
        {imagen && (
          tipo === 'video' ? (
            <VideoDiferido src={imagen} className={styles.imagen} />
          ) : (
            <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt={titulo} className={styles.imagen} />
          )
        )}
      </div>

      <div className={`${styles.contenidoTexto} ${invertido ? styles.textoInvertido : ''}`}>
        <h3 className={styles.titulo}>{titulo}</h3>
        <p className={styles.texto}>{texto}</p>
        {enlace && <Boton variante="contorno" href={href} className={styles.enlace}>{enlace}</Boton>}
      </div>
    </section>
  );
}

export default BloqueSeccion;
