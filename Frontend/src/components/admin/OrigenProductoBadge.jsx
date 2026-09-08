/* ============================================================
   ORIGEN PRODUCTO BADGE — Fely Campo (admin)
   Mismo criterio que EstadoContactoBadge/EstadoPedidoBadge: fondo de
   color, solo tablas internas. Indica de qué apartado de Atelier viene
   el producto de una consulta de precio — Novias o Fiesta, las dos
   únicas ramas. No existe una etiqueta "Atelier" genérica: esta página
   ES atelier (spec sección 5, "Precio a consultar"), así que un tercer
   badge diciendo "Atelier" sería redundante — todo lo que aparece aquí
   ya es Atelier por definición.
   Uso: <OrigenProductoBadge producto="Vestido Elena" />
   ============================================================ */

import { productosMock } from './mockData';
import styles from './OrigenProductoBadge.module.css';

const CONFIG = {
  novias: { etiqueta: 'Novias', clase: 'novias' },
  fiesta: { etiqueta: 'Fiesta', clase: 'fiesta' },
};

function calcularOrigenProducto(nombreProducto) {
  const producto = productosMock.find((p) => p.nombre === nombreProducto);
  return producto?.categoriaId === 'cat4' ? 'fiesta' : 'novias';
}

function OrigenProductoBadge({ producto }) {
  const { etiqueta, clase } = CONFIG[calcularOrigenProducto(producto)];
  return <span className={`${styles.badge} ${styles[clase]}`}>{etiqueta}</span>;
}

export default OrigenProductoBadge;
export { calcularOrigenProducto, CONFIG as CONFIG_ORIGEN_PRODUCTO };
