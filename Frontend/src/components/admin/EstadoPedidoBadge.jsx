/* ============================================================
   ESTADO PEDIDO BADGE — Fely Campo (admin)

   Los OCHO estados reales de `Order.status`, no los dos ejes
   inventados de antes (`estadoPago` + `estadoEnvío`).

   Por qué se rehízo: el panel modelaba pago y envío como ejes
   independientes, y el backend tiene un único `status`. Ese modelo no
   encajaba en dos puntos concretos:
     · «pago fallido» no existe — un pago que no llega deja el pedido en
       `pending_payment`, y si se abandona pasa a `cancelled`;
     · `refunded` y `partially_refunded` no tenían sitio en ninguno de
       los dos ejes, así que un pedido reembolsado no se podía ver.

   El vocabulario vive en `@/lib/api/adminOrders` (`ESTADOS_PEDIDO`),
   para que la tabla, el filtro y la línea de tiempo lean lo mismo.
   Aquí solo se pinta.

   Uso: <EstadoPedidoBadge status={pedido.status} />
   ============================================================ */

import { estadoPedido } from '@/lib/api/adminOrders';
import styles from './EstadoPedidoBadge.module.css';

/**
 * @param {{status?: string, estado?: string}} props `status` es el valor del backend.
 *   `estado` se acepta como alias para no romper llamadas antiguas.
 */
function EstadoPedidoBadge({ status, estado }) {
  const { etiqueta, tono } = estadoPedido(status ?? estado);
  return <span className={`${styles.badge} ${styles[tono]}`}>{etiqueta}</span>;
}

export default EstadoPedidoBadge;

/**
 * Compatibilidad para las pantallas que todavía leen `mockData` (`/admin/clientes`), que
 * usan las etiquetas viejas del eje de envío. Se irá cuando esas pantallas se migren.
 * Las pantallas ya migradas usan `ESTADOS_PEDIDO` de `@/lib/api/adminOrders`.
 */
export const CONFIG_ESTADO_PEDIDO = {
  Procesando: { etiqueta: 'En preparación', clase: 'avance' },
  Enviado: { etiqueta: 'Enviado', clase: 'avance' },
  Entregado: { etiqueta: 'Entregado', clase: 'exito' },
};
