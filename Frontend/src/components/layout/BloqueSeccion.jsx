/* ============================================================
   BLOQUE DE SECCIÓN (imagen + texto) — Fely Campo
   Uso:
     <BloqueSeccion imagen="/img/atelier.jpg" titulo="Visita el atelier"
        texto="Costura a medida en Salamanca." enlace="Descubre más"
        href="/visita-fely-campo/cita" invertido={false} />
     <BloqueSeccion imagen="/img/atelier.mp4" tipo="video" ... />
   ============================================================ */

import styles from './BloqueSeccion.module.css';
import { Boton } from '../ui';

/**
 * Bloque editorial imagen+texto, reutilizado en varias
 * páginas (About, Atelier, colecciones). 'invertido' cambia el lado de la imagen.
 * 'href' es opcional: sin él, "enlace" se muestra igual pero sin navegar
 * (Boton sin href renderiza un <span>). 'tipo' ('imagen' por defecto |
 * 'video') decide si "imagen" se renderiza como <img> o como
 * <video autoPlay muted loop playsInline>.
 */
function BloqueSeccion({ imagen, tipo = 'imagen', titulo, texto, enlace, href, invertido = false }) {
  return (
    <section className={styles.seccion}>
      <div className={`${styles.marco} ${invertido ? styles.invertido : ''}`}>
        {imagen && (
          tipo === 'video' ? (
            <video src={imagen} className={styles.imagen} autoPlay muted loop playsInline />
          ) : (
            <img src={imagen} alt={titulo} className={styles.imagen} />
          )
        )}
      </div>

      <div className={`${styles.contenidoTexto} ${invertido ? styles.textoInvertido : ''}`}>
        <h2 className={styles.titulo}>{titulo}</h2>
        <p className={styles.texto}>{texto}</p>
        {enlace && <Boton variante="texto" href={href} className={styles.enlace}>{enlace}</Boton>}
      </div>
    </section>
  );
}

export default BloqueSeccion;
