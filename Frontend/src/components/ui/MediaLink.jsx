// MediaLink.jsx

import styles from './MediaLink.module.css';
import { atributosImagen } from '@/lib/imagenes';

/**
 * Enlace grande imagen + texto: toda la tarjeta es clicable. Genérico,
 * sin lógica de navegación (no sabe de locales, menús ni rutas) — quien
 * lo use decide el href y controla su tamaño desde fuera (por defecto
 * se reparte a partes iguales dentro de cualquier contenedor flex).
 * variante="ancho": para cuando va solo en la fila (ej. submenú de
 * Navbar con un único MediaLink) — mismo alto que dos tarjetas 3/4
 * lado a lado, no una vertical estirada a todo el ancho.
 * variante="horizontal": dos tarjetas lado a lado pero en 4/3 en vez
 * de 3/4 — para fotos que piden un encuadre más ancho (ver Sobre Fely
 * en Navbar.jsx).
 */
function MediaLink({ href, image, label, variante }) {
  const claseVariante = variante && styles[variante];
  const claseCard = claseVariante ? `${styles.card} ${claseVariante}` : styles.card;

  return (
    <a href={href} className={claseCard}>
      <img {...atributosImagen(image, { sizes: '(max-width: 768px) 50vw, 25vw' })} alt="" className={styles.image} />
      <p className={styles.label}>{label}</p>
    </a>
  );
}

export default MediaLink;
