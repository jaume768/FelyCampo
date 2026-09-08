'use client';

/* ============================================================
   SELECTOR DE COLOR — Fely Campo
   Uso:
     <SelectorColor colores={[{ hex: '#EED3E8', nombre: 'Rosa suave' }]}
       seleccionado="Rosa suave" onSelect={setColor} />
   ============================================================ */

import styles from './SelectorColor.module.css';

function SelectorColor({ colores = [], seleccionado, onSelect, tabIndex }) {
  return (
    <div className={styles.selector}>
      <div className={styles.swatches}>
        {colores.map(({ hex, nombre }) => (
          <button
            key={nombre}
            type="button"
            title={nombre}
            aria-label={nombre}
            aria-pressed={seleccionado === nombre}
            onClick={() => onSelect(nombre)}
            className={`${styles.swatch} ${seleccionado === nombre ? styles.activo : ''}`}
            tabIndex={tabIndex}
          >
            <span className={styles.punto} style={{ background: hex }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectorColor;
