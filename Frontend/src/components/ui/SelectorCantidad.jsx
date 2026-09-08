'use client';

/* ============================================================
   SELECTOR DE CANTIDAD — Fely Campo
   Uso:
     const [cant, setCant] = useState(1);
     <SelectorCantidad valor={cant} onChange={setCant} />
   ============================================================ */

import styles from './SelectorCantidad.module.css';

/**
 * Control +/- para cantidad en carrito. 'min' evita
 * bajar de 1 por defecto.
 */
function SelectorCantidad({ valor = 1, onChange, min = 1, className }) {
  const bajar = () => onChange(Math.max(min, valor - 1));
  const subir = () => onChange(valor + 1);

  return (
    <div className={`${styles.control} ${className || ''}`}>
      <button type="button" onClick={bajar} className={styles.boton} aria-label="Disminuir cantidad">−</button>
      <span className={styles.valor}>{valor}</span>
      <button type="button" onClick={subir} className={styles.boton} aria-label="Aumentar cantidad">+</button>
    </div>
  );
}

export default SelectorCantidad;
