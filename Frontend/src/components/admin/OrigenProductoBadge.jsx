/* ============================================================
   ORIGEN PRODUCTO BADGE — Fely Campo (admin)
   Mismo criterio que EstadoContactoBadge/EstadoPedidoBadge: fondo de
   color, solo tablas internas. Indica de qué apartado de Atelier viene
   el vestido de una consulta — Novias o Fiesta, las dos únicas ramas.
   "tipo" es el que guarda la propia consulta (lo saca el modal de la URL
   de la ficha, ver ModalSolicitudAtelier.jsx); antes se deducía del
   nombre del producto buscándolo en productosMock (catálogo de ejemplo
   de la tienda, que no tiene los looks reales).
   Uso: <OrigenProductoBadge tipo="fiesta" />
   ============================================================ */

import styles from './OrigenProductoBadge.module.css';

const CONFIG = {
  novias: { etiqueta: 'Novias', clase: 'novias' },
  fiesta: { etiqueta: 'Fiesta', clase: 'fiesta' },
};

function OrigenProductoBadge({ tipo }) {
  const config = CONFIG[tipo];
  if (!config) return null;
  return <span className={`${styles.badge} ${styles[config.clase]}`}>{config.etiqueta}</span>;
}

export default OrigenProductoBadge;
export { CONFIG as CONFIG_ORIGEN_PRODUCTO };
