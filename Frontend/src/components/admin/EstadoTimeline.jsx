import { Check, X } from 'lucide-react';
import styles from './EstadoTimeline.module.css';

/**
 * Línea de tiempo horizontal de estados.
 *
 * "activo" es el índice del paso actual — todo lo anterior se marca como completado.
 *
 * "interrumpido": los pedidos cancelados o reembolsados NO son un paso más de la
 * secuencia, son una SALIDA de ella. Pintarlos como un sexto paso daría a entender que un
 * pedido cancelado ha avanzado, que es justo lo contrario. Con esta prop la línea se corta
 * donde se quedó y se marca aparte el motivo del cierre.
 *
 * @param {{pasos: string[], activo: number, interrumpido?: string}} props
 */
function EstadoTimeline({ pasos, activo, interrumpido }) {
  return (
    <div>
      <div className={styles.timeline}>
        {pasos.map((paso, indice) => (
          <div key={paso} className={styles.paso}>
            <span
              className={`${styles.punto} ${indice <= activo && !interrumpido ? styles.completado : ''} ${
                interrumpido && indice <= activo ? styles.detenido : ''
              }`}
            >
              {interrumpido && indice === activo ? (
                <X size={14} />
              ) : indice <= activo && !interrumpido ? (
                <Check size={14} />
              ) : (
                indice + 1
              )}
            </span>
            {indice < pasos.length - 1 && (
              <span className={`${styles.linea} ${indice < activo && !interrumpido ? styles.completada : ''}`} />
            )}
          </div>
        ))}
      </div>
      <div className={styles.etiquetas}>
        {pasos.map((paso) => (
          <span key={paso} className={styles.etiqueta}>{paso}</span>
        ))}
      </div>
      {interrumpido && (
        <p className={styles.interrumpido} role="status">{interrumpido}</p>
      )}
    </div>
  );
}

export default EstadoTimeline;
