// MediaLink.jsx

import styles from './MediaLink.module.css';

/**
 * Enlace grande imagen + texto: toda la tarjeta es clicable. Genérico,
 * sin lógica de navegación (no sabe de locales, menús ni rutas) — quien
 * lo use decide el href y controla su tamaño desde fuera (por defecto
 * se reparte a partes iguales dentro de cualquier contenedor flex).
 * variante="ancho": para cuando va solo en la fila (ej. submenú de
 * Navbar con un único MediaLink) — mismo alto que dos tarjetas 3/4
 * lado a lado, no una vertical estirada a todo el ancho.
 */
function MediaLink({ href, image, label, variante }) {
  const claseCard = variante === 'ancho' ? `${styles.card} ${styles.ancho}` : styles.card;

  return (
    <a href={href} className={claseCard}>
      <img src={image} alt="" className={styles.image} />
      <p className={styles.label}>{label}</p>
    </a>
  );
}

export default MediaLink;
