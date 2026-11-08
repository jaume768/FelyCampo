/* ============================================================
   ESTADO PEDIDO BADGE — Fely Campo (admin)
   Mismo criterio que EstadoPublicacionBadge (fondo de color, solo
   para tablas internas): re-etiqueta estadoEnvio del pedido en algo
   más claro para el equipo — "Procesando" → "En proceso" (azul),
   "Enviado" se queda igual (amarillo), "Entregado" → "Completado"
   (verde, mismo verde que "Publicado" en productos).
   El dato real (`estadoEnvio`) no cambia — esto es solo la etiqueta
   visual; `clase` la reutiliza TabsFiltro para las pestañas.
   Uso: <EstadoPedidoBadge estado={pedido.estadoEnvio} />
   ============================================================ */

import styles from './EstadoPedidoBadge.module.css';

const CONFIG = {
  Procesando: { etiqueta: 'En proceso', clase: 'enProceso' },
  Enviado: { etiqueta: 'Enviado', clase: 'enviado' },
  Entregado: { etiqueta: 'Completado', clase: 'completado' },
};

const SIGUIENTE_ESTADO = {
  Procesando: 'Enviado',
  Enviado: 'Entregado',
  Entregado: null,
};

function EstadoPedidoBadge({ estado }) {
  const { etiqueta, clase } = CONFIG[estado] || CONFIG.Procesando;
  return <span className={`${styles.badge} ${styles[clase]}`}>{etiqueta}</span>;
}

export default EstadoPedidoBadge;
export { CONFIG as CONFIG_ESTADO_PEDIDO, SIGUIENTE_ESTADO };
