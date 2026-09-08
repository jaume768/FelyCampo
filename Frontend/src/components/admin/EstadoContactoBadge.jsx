/* ============================================================
   ESTADO CONTACTO BADGE — Fely Campo (admin)
   Mismo criterio que EstadoPublicacionBadge/EstadoPedidoBadge (fondo
   de color, solo tablas internas): simplifica el estado de una
   consulta de precio a una señal binaria — ya se contactó o no.
   "Cerrado" cuenta como contactado (ya hubo contacto antes de cerrarla).
   `clase` la reutiliza TabsFiltro para pintar sus pestañas igual.
   Uso: <EstadoContactoBadge estado={consulta.estado} />
   ============================================================ */

import styles from './EstadoContactoBadge.module.css';

const CONFIG = {
  pendiente: { etiqueta: 'Pendiente de contactar', clase: 'pendiente' },
  contactado: { etiqueta: 'Contactado', clase: 'contactado' },
};

function calcularEstadoContacto(estado) {
  return estado === 'Pendiente' ? 'pendiente' : 'contactado';
}

function EstadoContactoBadge({ estado }) {
  const { etiqueta, clase } = CONFIG[calcularEstadoContacto(estado)];
  return <span className={`${styles.badge} ${styles[clase]}`}>{etiqueta}</span>;
}

export default EstadoContactoBadge;
export { calcularEstadoContacto, CONFIG as CONFIG_ESTADO_CONTACTO };
