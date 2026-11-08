import { Check } from 'lucide-react';
import styles from './EstadoTimeline.module.css';

/**
 * Timeline horizontal de estados (pedidos: recibido → confirmado →
 * enviado → entregado; consultas: historial de cambio de estado).
 * "activo" es el índice del paso actual — todo lo anterior se marca
 * como completado.
 */
function EstadoTimeline({ pasos, activo }) {
  return (
    <div>
      <div className={styles.timeline}>
        {pasos.map((paso, indice) => (
          <div key={paso} className={styles.paso}>
            <span className={`${styles.punto} ${indice <= activo ? styles.completado : ''}`}>
              {indice <= activo ? <Check size={14} /> : indice + 1}
            </span>
            {indice < pasos.length - 1 && (
              <span className={`${styles.linea} ${indice < activo ? styles.completada : ''}`} />
            )}
          </div>
        ))}
      </div>
      <div className={styles.etiquetas}>
        {pasos.map((paso) => (
          <span key={paso} className={styles.etiqueta}>{paso}</span>
        ))}
      </div>
    </div>
  );
}

export default EstadoTimeline;
