import { Trash2 } from 'lucide-react';
import { Boton } from '@/components/ui';
import styles from './FiltroBar.module.css';

/**
 * Fila de filtros/búsqueda encima de una TablaAdmin. Es solo un
 * contenedor con estilo — cada página decide qué controles mete
 * (Input de búsqueda + <Selector> de filtro) y su propio estado.
 * `onLimpiar` es opcional: si se pasa, aparece un botón "Limpiar filtros"
 * al final de la barra. La página decide cuándo pasarlo (p.ej. solo si
 * algún filtro no está en su valor por defecto) — FiltroBar no sabe qué
 * cuenta como "filtro activo".
 */
function FiltroBar({ children, onLimpiar }) {
  return (
    <div className={styles.barra}>
      {children}
      {onLimpiar && (
        <Boton variante="contorno-rosa" tamano="s" onClick={onLimpiar} className={styles.limpiar}>
          <Trash2 size={14} aria-hidden="true" />
          Limpiar filtros
        </Boton>
      )}
    </div>
  );
}

function Selector({
  etiqueta, valor, onChange, opciones, compacta, activo,
}) {
  const seleccionada = opciones.find((opcion) => opcion.valor === valor);
  return (
    <label className={styles.select}>
      {etiqueta && <span className={styles.selectEtiqueta}>{etiqueta}</span>}
      <select
        className={`${styles.selectInput} ${compacta ? styles.selectInputCompacta : ''} ${activo ? styles.selectInputActiva : ''}`}
        value={valor}
        onChange={onChange}
        style={seleccionada?.estilo}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor} style={opcion.estilo}>{opcion.etiqueta}</option>
        ))}
      </select>
    </label>
  );
}

export { Selector };
export default FiltroBar;
