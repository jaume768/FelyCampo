/* ============================================================
   ESTADOS DE LISTADO — carga, error y vacío
   Sistema de diseño (docs/design.md): CERO radio en todo, rosa
   #E92174 solo como acento (nunca superficie grande), tipografía
   del sistema sin letter-spacing.
   ============================================================ */

import styles from './EstadoListado.module.css';

/**
 * Esqueleto de cuadrícula mientras llega la respuesta del servidor.
 * Sin spinner: bloques con la misma proporción 3/4 que TarjetaProducto, para que el
 * salto de layout al llegar los datos sea nulo.
 *
 * @param {{cantidad?: number}} props
 */
export function ListadoCargando({ cantidad = 8 }) {
  return (
    <div className={styles.rejilla} aria-busy="true" aria-live="polite">
      {Array.from({ length: cantidad }, (_, indice) => (
        <div key={indice} className={styles.esqueleto}>
          <div className={styles.esqueletoImagen} />
          <div className={styles.esqueletoLinea} />
          <div className={`${styles.esqueletoLinea} ${styles.corta}`} />
        </div>
      ))}
    </div>
  );
}

/**
 * El backend no ha respondido. La web no se queda en blanco: se explica y se ofrece
 * reintentar.
 *
 * @param {{titulo: string, mensaje: string, textoReintentar?: string, onReintentar?: () => void}} props
 */
export function ListadoError({ titulo, mensaje, textoReintentar, onReintentar }) {
  return (
    <div className={styles.estado} role="alert">
      <p className={styles.estadoTitulo}>{titulo}</p>
      <p className={styles.estadoTexto}>{mensaje}</p>
      {onReintentar && (
        <button type="button" className={styles.boton} onClick={onReintentar}>
          {textoReintentar}
        </button>
      )}
    </div>
  );
}

/**
 * Sin resultados. Distingue "no hay nada en esta sección" de "tus filtros no dejan pasar
 * nada", que piden acciones distintas.
 *
 * @param {{titulo: string, mensaje: string, accion?: React.ReactNode}} props
 */
export function ListadoVacio({ titulo, mensaje, accion }) {
  return (
    <div className={styles.estado}>
      <p className={styles.estadoTitulo}>{titulo}</p>
      <p className={styles.estadoTexto}>{mensaje}</p>
      {accion}
    </div>
  );
}
