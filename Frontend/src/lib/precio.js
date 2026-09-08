// precio.js
//
// Dos mundos conviven aquí mientras dure la migración a datos reales:
//
// 1. DATOS DE EJEMPLO (productosEjemplo.js): el precio es un string ya
//    formateado, "990 €"/"1.050 €" — punto como separador de miles, sin
//    decimales. Lo consume `parsearPrecio`, DEPRECADO.
//
// 2. API REAL: el backend guarda decimales SIN IVA y añade los campos
//    `*_gross` con el 21% ya aplicado (price_gross, sale_price_gross,
//    effective_price_gross, unit_price_gross, line_gross). Llegan como
//    string decimal: "181.50". Los consume `formatearImporte`.
//
// REGLA QUE NO SE TOCA: el frontend NUNCA recalcula el IVA. Se usa el
// `*_gross` que da la API. Multiplicar por 1.21 en el cliente es un bug,
// no un atajo — el tipo vive en VAT_RATE del backend y puede cambiar.

const LOCALE_MONEDA = 'es-ES';

/**
 * Formatea un importe de la API como precio.
 *
 * Acepta el string decimal tal cual llega ("181.50") o un número: no lo
 * conviertas antes con parseInt, que es justo lo que se está corrigiendo.
 *
 * @param {string|number|null|undefined} importe Decimal de la API.
 * @param {string} [currency='EUR'] El `currency` que devuelve la API (cart.totals.currency).
 * @param {object} [opciones]
 * @param {boolean} [opciones.conDecimales=true] `false` redondea a entero — para precios
 *   redondos de catálogo, donde "1.050 €" se lee mejor que "1.050,00 €".
 * @returns {string} `""` si no hay importe (piezas de atelier sin precio de catálogo).
 *
 * @example
 * formatearImporte('181.50')            // "181,50 €"
 * formatearImporte('1050.00', 'EUR', { conDecimales: false })  // "1.050 €"
 */
export function formatearImporte(importe, currency = 'EUR', { conDecimales = true } = {}) {
  if (importe === null || importe === undefined || importe === '') return '';

  const numero = typeof importe === 'number' ? importe : Number.parseFloat(importe);
  if (!Number.isFinite(numero)) return '';

  const decimales = conDecimales ? 2 : 0;
  return new Intl.NumberFormat(LOCALE_MONEDA, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(numero);
}

/**
 * Precio a enseñar de un producto de la API, ya con IVA.
 *
 * Prefiere `effective_price_gross` (el que se cobra: rebajado si lo está) y cae en
 * `price_gross`. Devuelve `""` para piezas sin precio de catálogo
 * (`sale_mode: "on_request"`), que no muestran precio sino vía de consulta.
 *
 * @param {{effective_price_gross?: string|null, price_gross?: string|null, sale_mode?: string}} producto
 * @param {string} [currency='EUR']
 * @returns {string}
 */
export function precioProducto(producto, currency = 'EUR') {
  if (!producto || producto.sale_mode === 'on_request') return '';
  return formatearImporte(producto.effective_price_gross ?? producto.price_gross, currency);
}

/**
 * Precio original tachado, solo cuando hay rebaja de verdad.
 *
 * Ojo con la semántica del backend: `is_on_sale` manda. No compares importes a mano.
 *
 * @param {{is_on_sale?: boolean, price_gross?: string|null}} producto
 * @param {string} [currency='EUR']
 * @returns {string} `""` si no está rebajado.
 */
export function precioAntesDeRebaja(producto, currency = 'EUR') {
  if (!producto?.is_on_sale) return '';
  return formatearImporte(producto.price_gross, currency);
}

/**
 * @deprecated Solo para los datos de ejemplo que quedan vivos (`productosEjemplo.js`).
 *
 * Parsea "1.050 €" → 1050 quitando todo lo que no sea dígito. **Con importes de la API
 * da un resultado erróneo y silencioso**: `parsearPrecio("181.50")` → `18150`, porque
 * trata el punto decimal como separador de miles. Un fallo de factor 100 que no lanza
 * ningún error.
 *
 * No lo uses con nada que venga de la API. Se borrará cuando no quede ninguna página con
 * datos de ejemplo.
 *
 * @param {string|number|null|undefined} precio
 * @returns {number}
 */
export function parsearPrecio(precio) {
  if (!precio) return 0;
  return parseInt(String(precio).replace(/[^\d]/g, ''), 10) || 0;
}

/**
 * @deprecated Compañero de `parsearPrecio`, mismo motivo. Redondea a entero y pierde los
 * céntimos. Para importes de la API usa `formatearImporte`.
 *
 * @param {number} numero
 * @returns {string}
 */
export function formatearPrecio(numero) {
  return `${Math.round(numero).toLocaleString(LOCALE_MONEDA)} €`;
}
