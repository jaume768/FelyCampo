/**
 * Carrito de la API → props de `LineaCarrito` y `TarjetaCarrito`.
 *
 * Contrato verificado leyendo los componentes:
 *   LineaCarrito  → { imagen, nombre, talla, color, colorHex, precio, cantidad,
 *                     onCantidad, onQuitar }
 *   TarjetaCarrito → mismas props (versión del panel lateral)
 *
 * La línea de la API ya viene desnormalizada (`product_name`, `color_name`, `size_code`,
 * `image`), así que no hace falta cruzar con el catálogo para pintar el carrito.
 */

import { formatearImporte } from '@/lib/precio';

/**
 * Una línea de `cart.items[]`.
 *
 * Ojo con `id`: es el UUID del **CartItem**, no el de la variante. Es el que hay que
 * mandar a `PATCH/DELETE /cart/items/{id}/`. `variantId` se conserva aparte porque hace
 * falta para reañadir tras cambiar de talla (cambiar de talla = otra variante = borrar y
 * añadir, no editar).
 *
 * @param {object} item
 * @param {string} [currency='EUR']
 * @returns {object}
 */
export function adaptarLineaCarrito(item, currency = 'EUR') {
  return {
    id: item.id,
    variantId: item.variant,

    imagen: item.image,
    nombre: item.product_name,
    slug: item.product_slug,
    talla: item.size_code,
    color: item.color_name,

    // La API no devuelve el hex del color en la línea de carrito (sí el nombre). Los
    // componentes ya tratan `colorHex` como opcional: sin él pintan el nombre sin punto.
    colorHex: undefined,

    // Precio unitario CON IVA, ya formateado. `line_gross` (el total de la línea) va
    // aparte: los componentes enseñan el unitario junto al selector de cantidad.
    precio: formatearImporte(item.unit_price_gross, currency),
    totalLinea: formatearImporte(item.line_gross, currency),
    cantidad: item.quantity,

    // Para los avisos de stock: `has_stock` es false cuando la línea ya no se puede
    // servir, y `available` es el tope al que se puede subir la cantidad.
    hayStock: item.has_stock,
    disponibles: item.available,
    sku: item.sku,
  };
}

/**
 * Carrito completo.
 *
 * Los totales llegan **ya calculados** por el backend. No los sumes aquí ni apliques el
 * IVA: `total_gross` es el número que se cobra, y `vat_total` el desglose informativo.
 *
 * @param {object|null} carrito Respuesta de `GET/POST /cart/`.
 * @returns {{id: string|null, lineas: object[], cantidadTotal: number, totales: object,
 *   hayProblemasDeStock: boolean, moneda: string, vacio: boolean}}
 */
export function adaptarCarrito(carrito) {
  const moneda = carrito?.totals?.currency || 'EUR';
  const lineas = (carrito?.items || []).map((item) => adaptarLineaCarrito(item, moneda));

  return {
    id: carrito?.id ?? null,
    lineas,
    cantidadTotal: lineas.reduce((total, linea) => total + linea.cantidad, 0),

    totales: {
      subtotalNeto: formatearImporte(carrito?.totals?.subtotal_net, moneda),
      envioNeto: formatearImporte(carrito?.totals?.shipping_net, moneda),
      iva: formatearImporte(carrito?.totals?.vat_total, moneda),
      total: formatearImporte(carrito?.totals?.total_gross, moneda),
      // Crudos por si alguna pantalla necesita comparar importes (nunca para recalcular).
      crudos: carrito?.totals || null,
    },

    hayProblemasDeStock: carrito?.has_stock_issues === true,
    moneda,
    vacio: lineas.length === 0,
  };
}

/** Carrito vacío con la misma forma, para el primer render antes de que llegue el GET. */
export function carritoVacio() {
  return adaptarCarrito(null);
}
