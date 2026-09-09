/**
 * Pedidos y devoluciones del panel (`/api/v1/admin/orders/`, `/admin/returns/`).
 *
 * **Solo Client Components**: sesión de staff + CSRF.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * UN SOLO ESTADO, NO DOS
 * ────────────────────────────────────────────────────────────────────────────
 * El panel modelaba `estadoPago` (Pendiente/Pagado/Fallido) y `estadoEnvío`
 * (Procesando/Enviado/Entregado) como dos ejes independientes. El backend tiene **un
 * único `Order.status`** con ocho valores.
 *
 * **Decidido: se muestran los ocho reales.** Los dos ejes inventados no encajaban:
 * «pago fallido» no existe (un pago que no llega deja el pedido en `pending_payment`, y
 * si se abandona se `cancelled`), y `refunded`/`partially_refunded` no tenían sitio
 * ninguno en la interfaz anterior.
 */

import { get, post, patch } from './client';
import { formatearImporte } from '@/lib/precio';

/* ============================================================
   Los ocho estados reales de Order.status
   ============================================================ */

/**
 * Orden de avance natural del pedido. Se usa para pintar la línea de tiempo: los estados
 * de cierre (cancelado/reembolsado) NO están en esta secuencia porque no son un paso más,
 * son una salida.
 */
export const SECUENCIA_ESTADOS = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered'];

/** Estados que cierran el pedido fuera de la secuencia normal. */
export const ESTADOS_DE_CIERRE = ['cancelled', 'refunded', 'partially_refunded'];

/**
 * Los ÚNICOS estados que el panel puede fijar a mano
 * (`MANUALLY_SETTABLE_STATUSES` en apps/orders/services.py).
 *
 * El resto los deciden sus propios flujos y **no se pueden tocar desde aquí**:
 *   `paid`                        lo confirma el webhook de Stripe
 *   `pending_payment`             es el estado inicial
 *   `cancelled`                   tiene su propia acción
 *   `refunded`/`partially_refunded` salen del flujo de devoluciones
 *
 * Además el pedido tiene que estar **pagado** para poder tocarlo: sobre uno pendiente de
 * pago, cualquier cambio devuelve 409. Ofrecer botones que siempre fallan sería mentir.
 */
export const ESTADOS_MANUALES = ['processing', 'shipped', 'delivered'];

/**
 * ¿Se puede cambiar el estado de este pedido a mano?
 * @param {string} status Estado actual.
 */
export function admiteCambioManual(status) {
  return status === 'paid' || ESTADOS_MANUALES.includes(status);
}

/**
 * Etiqueta y tono de cada estado.
 *
 * `tono` decide el color del badge: `neutro` (esperando), `avance` (progresa), `exito`
 * (terminado bien), `alerta` (terminado mal o dinero devuelto).
 */
export const ESTADOS_PEDIDO = {
  pending_payment: { etiqueta: 'Pendiente de pago', tono: 'neutro' },
  paid: { etiqueta: 'Pagado', tono: 'avance' },
  processing: { etiqueta: 'En preparación', tono: 'avance' },
  shipped: { etiqueta: 'Enviado', tono: 'avance' },
  delivered: { etiqueta: 'Entregado', tono: 'exito' },
  cancelled: { etiqueta: 'Cancelado', tono: 'alerta' },
  refunded: { etiqueta: 'Reembolsado', tono: 'alerta' },
  partially_refunded: { etiqueta: 'Reembolsado parcialmente', tono: 'alerta' },
};

/** Opciones para un desplegable de filtro. */
export const OPCIONES_ESTADO_PEDIDO = [
  { valor: 'Todos', etiqueta: 'Todos' },
  ...Object.entries(ESTADOS_PEDIDO).map(([valor, cfg]) => ({ valor, etiqueta: cfg.etiqueta, tono: cfg.tono })),
];

/**
 * @param {string} status
 * @returns {{etiqueta: string, tono: string}}
 */
export function estadoPedido(status) {
  return ESTADOS_PEDIDO[status] ?? { etiqueta: status ?? '—', tono: 'neutro' };
}

/* ============================================================
   Pedidos
   ============================================================ */

/**
 * `GET /admin/orders/`
 * @param {object} [params] `page`, `page_size`, `search`, `status`, `is_paid`…
 * @returns {Promise<{count: number, results: object[]}>}
 */
export function listarPedidos(params = {}) {
  return get('/admin/orders/', { params });
}

/** `GET /admin/orders/{id}/` */
export function obtenerPedido(id) {
  return get(`/admin/orders/${encodeURIComponent(id)}/`);
}

/**
 * `POST /admin/orders/{id}/status/` — cambia el estado.
 *
 * **Nunca se cambia en estado local**: el backend valida qué transiciones son legales,
 * ajusta el stock comprometido y deja rastro en el historial.
 *
 * @param {string} id
 * @param {string} status Uno de los ocho de `ESTADOS_PEDIDO`.
 * @param {string} [nota] Motivo, que queda en el historial.
 */
export function cambiarEstadoPedido(id, status, nota = '') {
  return post(`/admin/orders/${encodeURIComponent(id)}/status/`, {
    status,
    ...(nota ? { staff_note: nota } : {}),
  });
}

/** `GET /admin/orders/{id}/history/` — cambios de estado, con quién y cuándo. */
export function historialPedido(id) {
  return get(`/admin/orders/${encodeURIComponent(id)}/history/`);
}

/** `GET /admin/orders/{id}/notes/` */
export function notasPedido(id) {
  return get(`/admin/orders/${encodeURIComponent(id)}/notes/`);
}

/** `POST /admin/orders/{id}/notes/` */
export function anadirNotaPedido(id, texto) {
  return post(`/admin/orders/${encodeURIComponent(id)}/notes/`, { body: texto });
}

/* ============================================================
   Devoluciones
   ============================================================ */

export function listarDevoluciones(params = {}) {
  return get('/admin/returns/', { params });
}

export function obtenerDevolucion(id) {
  return get(`/admin/returns/${encodeURIComponent(id)}/`);
}

/** `POST /admin/returns/{id}/accept/` */
export function aceptarDevolucion(id, nota = '') {
  return post(`/admin/returns/${encodeURIComponent(id)}/accept/`, nota ? { staff_note: nota } : {});
}

/** `POST /admin/returns/{id}/reject/` — el motivo es obligatorio. */
export function rechazarDevolucion(id, nota) {
  return post(`/admin/returns/${encodeURIComponent(id)}/reject/`, { staff_note: nota });
}

/**
 * `POST /admin/returns/{id}/mark-refunded/`
 *
 * El reembolso se ejecuta **a mano** fuera del sistema (ver DECISIONS_PENDING): esto solo
 * deja constancia de que ya se hizo.
 */
export function marcarDevolucionReembolsada(id, nota = '') {
  return post(`/admin/returns/${encodeURIComponent(id)}/mark-refunded/`, nota ? { staff_note: nota } : {});
}

/* ============================================================
   Adaptadores
   ============================================================ */

/**
 * Pedido de la API → forma del panel.
 *
 * Importes ya calculados por el backend: aquí solo se formatean.
 */
export function adaptarPedidoAdmin(pedido) {
  const moneda = pedido.currency || 'EUR';
  const { etiqueta, tono } = estadoPedido(pedido.status);

  return {
    id: pedido.id,
    numero: pedido.number,
    referencia: pedido.reference,
    creadoEn: pedido.created_at,

    status: pedido.status,
    estadoEtiqueta: etiqueta,
    estadoTono: tono,
    esDeCierre: ESTADOS_DE_CIERRE.includes(pedido.status),

    cliente: pedido.shipping_recipient || pedido.user_email || pedido.email,
    email: pedido.email,
    telefono: pedido.phone,
    // `user` null = compra de invitado, que es un caso normal, no un dato que falte.
    esInvitado: !pedido.user,

    pagado: pedido.is_paid,
    pagadoEn: pedido.paid_at,
    enviadoEn: pedido.shipped_at,
    entregadoEn: pedido.delivered_at,
    canceladoEn: pedido.cancelled_at,
    // El backend lo calcula: lleva demasiado en el estado actual.
    conRetraso: pedido.is_delayed === true,
    // Stock ya descontado del almacén (no solo reservado).
    stockComprometido: pedido.stock_committed === true,
    reservadoHasta: pedido.reserved_until,

    seguimiento: pedido.tracking_code
      ? { codigo: pedido.tracking_code, transportista: pedido.tracking_carrier, url: pedido.tracking_url }
      : null,

    totales: {
      subtotalNeto: formatearImporte(pedido.subtotal_net, moneda),
      envioNeto: formatearImporte(pedido.shipping_net, moneda),
      iva: formatearImporte(pedido.vat_total, moneda),
      total: formatearImporte(pedido.total_gross, moneda),
    },

    lineas: (pedido.lines || []).map((l) => ({
      id: l.id,
      nombre: l.product_name,
      sku: l.sku,
      talla: l.size_code,
      color: l.color_name,
      cantidad: l.quantity,
      precio: formatearImporte(l.unit_price_gross, moneda),
      total: formatearImporte(l.line_gross, moneda),
    })),

    devoluciones: pedido.returns || [],
    notaCliente: pedido.customer_note,
    notaInterna: pedido.staff_note,
    facturaSolicitada: pedido.invoice_requested,
    envio: {
      destinatario: pedido.shipping_recipient,
      linea1: pedido.shipping_line1,
      linea2: pedido.shipping_line2,
      codigoPostal: pedido.shipping_postal_code,
      ciudad: pedido.shipping_city,
      provincia: pedido.shipping_province,
      pais: pedido.shipping_country,
    },
    moneda,
  };
}

/**
 * Filtros del listado, en servidor.
 * @param {object} [estado]
 */
export function filtrosPedidosAdmin({ busqueda, status, pagina = 1, porPagina = 20 } = {}) {
  const params = { page: pagina, page_size: porPagina };
  if (busqueda) params.search = busqueda;
  if (status && status !== 'Todos') params.status = status;
  return params;
}

/* ============================================================
   Clientes (`/api/v1/admin/customers/`)
   ============================================================ */

/**
 * Clientes REGISTRADOS, con su historial de compra resumido.
 *
 * Ojo con lo que NO incluye: **una compra de invitado no crea usuario**. El checkout
 * acepta pedidos sin cuenta (`Order.user = NULL`), y esa gente no sale aquí. Para verla,
 * `listarInvitados()`.
 */
export function listarClientes(params = {}) {
  return get('/admin/customers/', { params });
}

export function obtenerCliente(id) {
  return get(`/admin/customers/${encodeURIComponent(id)}/`);
}

/**
 * Bloquear o reactivar una cuenta. Es lo único editable: un cliente nace registrándose, y
 * borrarlo rompería el histórico de pedidos que lo referencia.
 */
export function bloquearCliente(id, activo) {
  return patch(`/admin/customers/${encodeURIComponent(id)}/`, { is_active: activo });
}

/** Pedidos SIN cuenta, agrupados por correo. La otra mitad de los compradores. */
export function listarInvitados() {
  return get('/admin/customers/guests/');
}

/** Cliente registrado → fila del panel. */
export function adaptarCliente(c) {
  return {
    id: c.id,
    email: c.email,
    nombre: c.full_name || [c.first_name, c.last_name].filter(Boolean).join(' ') || '—',
    telefono: c.phone || '—',
    alta: c.date_joined,
    activo: c.is_active !== false,
    emailVerificado: c.email_verified === true,
    aceptaMarketing: c.accepts_marketing === true,
    pedidos: c.orders_count ?? 0,
    pedidosPagados: c.paid_orders_count ?? 0,
    // `null` cuando no ha gastado nada: no es lo mismo que 0,00 €.
    gasto: c.total_spent ? formatearImporte(c.total_spent) : '—',
    ultimoPedido: c.last_order_at,
    esInvitado: false,
    // Solo aparece en el listado porque ha comprado: no es una clienta más. Se marca en
    // la tabla para que no confunda con el volumen real de clientela.
    esDelEquipo: c.is_staff === true,
  };
}

/** Comprador sin cuenta → misma forma, para poder pintarlo en la misma tabla. */
export function adaptarInvitado(g) {
  return {
    id: `invitado:${g.email}`,
    email: g.email,
    nombre: '—',
    telefono: '—',
    alta: null,
    activo: true,
    emailVerificado: false,
    aceptaMarketing: false,
    pedidos: g.orders_count ?? 0,
    pedidosPagados: g.paid_orders_count ?? 0,
    gasto: g.total_spent ? formatearImporte(g.total_spent) : '—',
    ultimoPedido: g.last_order_at,
    esInvitado: true,
  };
}
