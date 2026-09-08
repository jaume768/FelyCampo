/**
 * Stock del panel (`/api/v1/admin/stock/`).
 *
 * **Solo Client Components**: sesión de staff + CSRF.
 *
 * El stock vive en la **variante** (producto × color × talla), repartido por
 * **ubicaciones**. Una fila por variante; el total vendible es la suma de las ubicaciones
 * marcadas como vendibles.
 *
 * Todo ajuste **exige motivo**: el backend lo audita creando un `StockMovement`. No hay
 * forma de mover stock sin dejar rastro, y eso es a propósito.
 */

import { get, post } from './client';

/** Motivos de ajuste que ofrece el panel. El backend acepta texto libre. */
export const MOTIVOS_AJUSTE = [
  { valor: 'recepcion', etiqueta: 'Recepción de mercancía' },
  { valor: 'inventario', etiqueta: 'Recuento de inventario' },
  { valor: 'rotura', etiqueta: 'Rotura o daño' },
  { valor: 'perdida', etiqueta: 'Pérdida' },
  { valor: 'devolucion', etiqueta: 'Devolución a almacén' },
  { valor: 'correccion', etiqueta: 'Corrección de error' },
];

/**
 * `GET /admin/stock/variants/`
 * @param {object} [params] `page`, `page_size`, `search`, `product`, `in_stock`…
 */
export function listarVariantes(params = {}) {
  return get('/admin/stock/variants/', { params });
}

export function obtenerVariante(id) {
  return get(`/admin/stock/variants/${encodeURIComponent(id)}/`);
}

/**
 * `POST /admin/stock/variants/{id}/adjust/` — suma o resta unidades.
 *
 * Es lo que se usa al recibir mercancía o corregir un recuento: `delta` relativo, no
 * absoluto, para no pisar un cambio simultáneo de otra persona.
 *
 * @param {string} id UUID de la variante.
 * @param {object} datos
 * @param {string} datos.location UUID de la ubicación.
 * @param {number} datos.delta Positivo suma, negativo resta.
 * @param {string} datos.reason **Obligatorio**: queda en el `StockMovement`.
 */
export function ajustarStock(id, { location, delta, reason }) {
  return post(`/admin/stock/variants/${encodeURIComponent(id)}/adjust/`, { location, delta, reason });
}

/**
 * `POST /admin/stock/variants/{id}/set/` — fija la cantidad exacta.
 *
 * Para un recuento físico, donde lo que se sabe es el total, no la diferencia. El backend
 * calcula el movimiento equivalente y lo audita igual.
 *
 * @param {string} id
 * @param {object} datos
 * @param {string} datos.location
 * @param {number} datos.quantity Cantidad final.
 * @param {string} datos.reason **Obligatorio**.
 */
export function fijarStock(id, { location, quantity, reason }) {
  return post(`/admin/stock/variants/${encodeURIComponent(id)}/set/`, { location, quantity, reason });
}

/**
 * `GET /admin/stock/movements/` — historial auditado.
 * @param {object} [params] `variant` para el historial de una variante concreta.
 */
export function listarMovimientos(params = {}) {
  return get('/admin/stock/movements/', { params });
}

/** `GET /admin/stock/locations/` */
export function listarUbicaciones(params = {}) {
  return get('/admin/stock/locations/', { params: { page_size: 100, ...params } });
}

export function crearUbicacion(datos) {
  return post('/admin/stock/locations/', datos);
}

/* ============================================================
   Adaptadores
   ============================================================ */

/**
 * Variante de stock → fila del panel.
 *
 * Tres cantidades distintas, que conviene no confundir:
 *   `stock`      unidades físicas en almacén
 *   `reserved`   comprometidas por checkouts en curso
 *   `available`  = stock - reserved, lo que de verdad se puede vender
 *
 * El panel enseña `available` como cifra principal, porque es la que decide si una talla
 * sale agotada en la tienda.
 */
export function adaptarVarianteStock(v) {
  // `colorway_detail` viene aplanado a propósito (sku, color_name, product_id,
  // product_name): el listado de stock no necesita el colorway entero.
  const cw = v.colorway_detail || {};

  return {
    id: v.id,
    sku: cw.sku ?? '—',
    producto: cw.product_name ?? '—',
    productoId: cw.product_id ?? null,
    color: cw.color_name ?? '—',
    // El hex NO viene en este endpoint: el listado de stock no pinta muestras de color.
    colorHex: null,
    talla: v.size_detail?.code ?? '—',

    fisico: v.stock ?? 0,
    reservado: v.reserved ?? 0,
    disponible: v.available ?? 0,
    hayStock: v.in_stock === true,
    activa: v.is_active !== false,

    // Desglose por ubicación. Sin más de una ubicación creada, esto es una sola fila.
    ubicaciones: (v.levels || []).map((n) => ({
      // El nivel no tiene id propio en la respuesta: la ubicación lo identifica.
      id: n.location_id,
      ubicacionId: n.location_id,
      ubicacion: n.location_name ?? '—',
      tipo: n.location_kind,
      vendible: n.is_sellable === true,
      activa: n.is_active !== false,
      cantidad: n.quantity ?? 0,
    })),
  };
}

/** Nivel de stock para pintar el semáforo. Mismos cortes que usaba el panel. */
export function nivelStock(disponible) {
  if (disponible <= 0) return 'agotado';
  if (disponible <= 3) return 'bajo';
  return 'ok';
}

export function adaptarMovimiento(m) {
  return {
    id: m.id,
    fecha: m.created_at,
    delta: m.delta,
    motivo: m.reason,
    ubicacion: m.location_name ?? m.location_detail?.name ?? '—',
    // Sin usuario = lo movió el sistema (checkout, devolución), no una persona.
    quien: m.created_by_email ?? m.created_by ?? 'Sistema',
  };
}

export function adaptarUbicacion(l) {
  return {
    id: l.id,
    code: l.code,
    nombre: l.name,
    tipo: l.kind,
    vendible: l.is_sellable === true,
    activa: l.is_active !== false,
    posicion: l.position ?? 0,
  };
}
