/**
 * Pedido de la API → forma para la confirmación de compra y el histórico.
 *
 * Los importes llegan ya calculados por el backend (`total_gross` incluye IVA). El
 * frontend NO recalcula nada: solo formatea.
 */

import { formatearImporte } from '@/lib/precio';

/**
 * Una línea del pedido.
 * @param {object} linea
 * @param {string} [currency='EUR']
 */
export function adaptarLineaPedido(linea, currency = 'EUR') {
  return {
    id: linea.id,
    nombre: linea.product_name,
    sku: linea.sku,
    talla: linea.size_code,
    color: linea.color_name,
    imagen: linea.image,
    cantidad: linea.quantity,
    precio: formatearImporte(linea.unit_price_gross, currency),
    totalLinea: formatearImporte(linea.line_gross, currency),
  };
}

/**
 * Pedido completo.
 *
 * Ojo con `access_token`: es el secreto del comprador para consultar su pedido sin
 * cuenta. Se le enseña a él, pero **no se registra ni se comparte**.
 *
 * El pedido **no trae estado de envío**: la logística la lleva una empresa externa y al
 * cliente se le avisa por correo (ver `OrderSerializer`). Lo único que hay es `is_paid`.
 *
 * @param {object} pedido
 * @returns {object}
 */
export function adaptarPedido(pedido) {
  const moneda = pedido?.currency || 'EUR';

  return {
    id: pedido.id,
    referencia: pedido.reference,
    creadoEn: pedido.created_at,
    email: pedido.email,
    telefono: pedido.phone,

    envio: {
      destinatario: pedido.shipping_recipient,
      linea1: pedido.shipping_line1,
      linea2: pedido.shipping_line2,
      codigoPostal: pedido.shipping_postal_code,
      ciudad: pedido.shipping_city,
      provincia: pedido.shipping_province,
      pais: pedido.shipping_country,
    },

    totales: {
      subtotalNeto: formatearImporte(pedido.subtotal_net, moneda),
      envioNeto: formatearImporte(pedido.shipping_net, moneda),
      iva: formatearImporte(pedido.vat_total, moneda),
      total: formatearImporte(pedido.total_gross, moneda),
      crudos: {
        subtotal_net: pedido.subtotal_net,
        shipping_net: pedido.shipping_net,
        vat_total: pedido.vat_total,
        total_gross: pedido.total_gross,
      },
    },

    pagado: pedido.is_paid === true,
    pagadoEn: pedido.paid_at,
    sePuedeDevolver: pedido.can_be_returned === true,
    facturaSolicitada: pedido.invoice_requested === true,
    notaCliente: pedido.customer_note,

    // Secreto del comprador para el seguimiento sin cuenta.
    tokenAcceso: pedido.access_token,

    lineas: (pedido.lines || []).map((linea) => adaptarLineaPedido(linea, moneda)),
    moneda,
  };
}
