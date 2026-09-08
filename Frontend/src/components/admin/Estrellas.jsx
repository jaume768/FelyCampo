'use client';

import { Star } from 'lucide-react';
import styles from './Estrellas.module.css';

/**
 * Valoración 1-5 estrellas — de solo lectura (listados) o editable
 * (formulario de reseña) según se pase onChange.
 */
function Estrellas({ valor, onChange }) {
  const editable = Boolean(onChange);
  return (
    <span className={styles.fila}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!editable}
          className={`${styles.boton} ${n <= valor ? styles.activa : ''}`}
          onClick={() => onChange?.(n)}
          aria-label={`${n} estrellas`}
        >
          <Star size={14} fill={n <= valor ? 'currentColor' : 'none'} />
        </button>
      ))}
    </span>
  );
}

export default Estrellas;
