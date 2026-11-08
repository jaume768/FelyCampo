// precio.js
//
// Los precios del catálogo se escriben "990 €"/"1.050 €" (punto como
// separador de miles, sin decimales) — mismo criterio que la copia
// local "parsearPrecio" de CuadriculaProductos.jsx (pensada solo para
// su propio filtro de precio). Esta versión compartida vive aquí para
// el carrito (subtotal/envío/total en CarritoContext y /carrito).

export function parsearPrecio(precio) {
  if (!precio) return 0;
  return parseInt(String(precio).replace(/[^\d]/g, ''), 10) || 0;
}

export function formatearPrecio(numero) {
  return `${Math.round(numero).toLocaleString('es-ES')} €`;
}
