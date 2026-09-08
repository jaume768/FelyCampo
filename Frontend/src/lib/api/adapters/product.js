/**
 * Traducción de la forma de la API a la que YA esperan los componentes.
 *
 * Los componentes no se tocan en esta sesión: el adapter se pliega a ellos, no al revés.
 * Contratos verificados leyendo cada componente:
 *
 * - `TarjetaProducto`  → { imagen, imagenHover, nombre, precio, precioRebajado, badge,
 *                          colores: [{hex, nombre, imagen?, imagenHover?}], agotado,
 *                          ocultarPrecio, hrefBase }
 * - `CuadriculaProductos` → productos con { nombre, precio, imagen, imagenHover,
 *                          tallas: string[], colores: [{hex, nombre}] }
 * - `GaleriaProducto`  → { imagenes: string[], alt, nombre, precio, colores, tallas }
 * - `SelectorColor`    → colores: [{hex, nombre}], selecciona por `nombre` (string)
 * - `SelectorTalla`    → tallas: string[], agotadas: string[], selecciona por string
 */

import { pickLocalized } from '../pickLocalized';
import { precioProducto, precioAntesDeRebaja } from '@/lib/precio';

/**
 * Color de la API → punto de color de los componentes.
 * `SelectorColor` y `TarjetaProducto` seleccionan por `nombre`, así que el nombre debe
 * ser estable dentro de un producto.
 * @param {object} color
 * @param {string} locale
 * @returns {{hex: string, nombre: string, id: string, code: string}}
 */
function adaptarColor(color, locale) {
  return {
    id: color.id,
    code: color.code,
    hex: color.hex_value,
    nombre: pickLocalized(color, 'name', locale),
  };
}

/**
 * Producto del LISTADO (`GET /catalog/products/`) → props de `TarjetaProducto` y de
 * `CuadriculaProductos`.
 *
 * El listado no trae `colorways`, así que **no hay tallas ni imagen de hover**: solo
 * `primary_image` y `colors[]`. `imagenHover` queda a `undefined` a propósito — la
 * tarjeta ya lo contempla y no pinta hover.
 *
 * @param {object} producto Item de `results[]`.
 * @param {string} [locale='es']
 * @param {string} [currency='EUR']
 * @returns {object}
 */
export function adaptarProductoListado(producto, locale = 'es', currency = 'EUR') {
  const esBajoPeticion = producto.sale_mode === 'on_request';

  return {
    id: producto.id,
    slug: producto.slug,
    nombre: pickLocalized(producto, 'name', locale),

    // Ya con IVA, tal como lo da la API. El frontend NO recalcula el 21%.
    precio: precioProducto(producto, currency),
    precioRebajado: producto.is_on_sale ? precioProducto(producto, currency) : undefined,

    imagen: producto.primary_image?.image,
    alt: producto.primary_image?.alt_text || pickLocalized(producto, 'name', locale),
    colores: (producto.colors || []).map((color) => adaptarColor(color, locale)),

    // `in_stock` del backend ya tiene en cuenta las reservas activas.
    agotado: producto.in_stock === false,

    // Atelier: sin precio de catálogo, va por consulta. La tarjeta lo respeta con
    // `ocultarPrecio` y la ficha enseña `ModalSolicitudAtelier` en vez del botón.
    ocultarPrecio: esBajoPeticion,
    bajoPeticion: esBajoPeticion,

    // Metadatos que los componentes no pintan pero las páginas sí necesitan para filtrar
    // y para construir enlaces.
    line: producto.line,
    kind: producto.kind,
    familia: producto.family
      ? { slug: producto.family.slug, code: producto.family.code, nombre: pickLocalized(producto.family, 'name', locale) }
      : null,
    esOutlet: producto.is_outlet,
  };
}

/**
 * Ficha completa (`GET /catalog/products/{slug}/`) → props de `GaleriaProducto`,
 * `FichaProductoAcciones` y `FichaProductoAtelier`.
 *
 * Aplana `colorways[].variants[].size.code` en las listas planas que esperan
 * `SelectorTalla` (`tallas: string[]`, `agotadas: string[]`) sin perder el mapa que hace
 * falta para resolver la variante concreta al añadir al carrito (`variantePorColorYTalla`).
 *
 * @param {object} producto
 * @param {string} [locale='es']
 * @param {string} [currency='EUR']
 * @returns {object}
 */
export function adaptarProductoFicha(producto, locale = 'es', currency = 'EUR') {
  const base = adaptarProductoListado(producto, locale, currency);
  const colorways = producto.colorways || [];

  // Imágenes de la galería: las del producto, y si un colorway trae las suyas, las suma.
  // `GaleriaProducto` espera un array plano de URLs.
  const imagenesProducto = (producto.images || []).map((imagen) => imagen.image);
  const imagenesColorways = colorways.flatMap((cw) => (cw.images || []).map((imagen) => imagen.image));
  const imagenes = [...new Set([...imagenesProducto, ...imagenesColorways].filter(Boolean))];
  if (imagenes.length === 0 && base.imagen) imagenes.push(base.imagen);

  // Todas las tallas del producto, en el orden de `size.position` que ya trae la API.
  const tallasVistas = new Map();
  colorways.forEach((cw) => {
    (cw.variants || []).forEach((variante) => {
      const codigo = variante.size?.code;
      if (!codigo) return;
      const previa = tallasVistas.get(codigo);
      // Una talla está disponible si lo está en ALGÚN color. `SelectorTalla` recibe listas
      // planas; el cruce fino color × talla lo hace la ficha al elegir color.
      tallasVistas.set(codigo, {
        code: codigo,
        position: variante.size.position ?? 0,
        disponible: (previa?.disponible ?? false) || variante.in_stock === true,
      });
    });
  });

  const tallasOrdenadas = [...tallasVistas.values()].sort((a, b) => a.position - b.position);

  return {
    ...base,
    descripcion: pickLocalized(producto, 'description', locale),
    composicion: producto.composition || '',
    cuidados: producto.care || '',
    imagenes,

    tallas: tallasOrdenadas.map((talla) => talla.code),
    tallasAgotadas: tallasOrdenadas.filter((talla) => !talla.disponible).map((talla) => talla.code),

    categorias: (producto.categories || []).map((categoria) => ({
      slug: categoria.slug,
      nombre: pickLocalized(categoria, 'name', locale),
    })),

    // Estructura cruda que necesita el carrito para resolver la variante. No la pinta
    // ningún componente: la consume `variantePorColorYTalla`.
    colorways: colorways.map((cw) => ({
      id: cw.id,
      sku: cw.sku,
      color: adaptarColor(cw.color, locale),
      imagenes: (cw.images || []).map((imagen) => imagen.image),
      variantes: (cw.variants || []).map((variante) => ({
        id: variante.id,
        talla: variante.size?.code,
        posicionTalla: variante.size?.position ?? 0,
        disponibles: variante.available,
        hayStock: variante.in_stock,
      })),
    })),

    // `enquiry_only` del backend: ni precio ni carrito, solo vía de consulta.
    soloConsulta: producto.enquiry_only === true || base.bajoPeticion,
  };
}

/**
 * Resuelve la VARIANTE (UUID) a partir del color y la talla que el usuario ha elegido en
 * la ficha.
 *
 * Es la pieza que hace posible el carrito de servidor: `POST /cart/` no acepta
 * nombre+talla+color, quiere el UUID de la variante. Los selectores trabajan con strings
 * (`SelectorColor` por `nombre`, `SelectorTalla` por código), así que la búsqueda se hace
 * por esos mismos valores.
 *
 * @param {object} fichaAdaptada Salida de `adaptarProductoFicha`.
 * @param {string|null} nombreColor Nombre del color, tal como lo pasa `SelectorColor`.
 * @param {string|null} codigoTalla Código de talla, tal como lo pasa `SelectorTalla`.
 * @returns {{id: string, disponibles: number, hayStock: boolean}|null} `null` si esa
 *   combinación no existe (no es lo mismo que existir sin stock: eso devuelve la variante
 *   con `hayStock: false`).
 */
export function variantePorColorYTalla(fichaAdaptada, nombreColor, codigoTalla) {
  if (!fichaAdaptada?.colorways?.length || !codigoTalla) return null;

  const colorway = nombreColor
    ? fichaAdaptada.colorways.find((cw) => cw.color.nombre === nombreColor)
    : fichaAdaptada.colorways[0];
  if (!colorway) return null;

  const variante = colorway.variantes.find((v) => v.talla === codigoTalla);
  return variante || null;
}

/**
 * Tallas realmente disponibles para UN color concreto — para que al cambiar de color el
 * selector marque agotadas las que no existen en ese colorway.
 *
 * @param {object} fichaAdaptada
 * @param {string|null} nombreColor
 * @returns {{tallas: string[], agotadas: string[]}}
 */
export function tallasDeColor(fichaAdaptada, nombreColor) {
  const colorway = nombreColor
    ? fichaAdaptada?.colorways?.find((cw) => cw.color.nombre === nombreColor)
    : fichaAdaptada?.colorways?.[0];

  if (!colorway) return { tallas: fichaAdaptada?.tallas || [], agotadas: fichaAdaptada?.tallasAgotadas || [] };

  const ordenadas = [...colorway.variantes].sort((a, b) => a.posicionTalla - b.posicionTalla);
  return {
    tallas: ordenadas.map((v) => v.talla),
    agotadas: ordenadas.filter((v) => !v.hayStock).map((v) => v.talla),
  };
}

/**
 * Página de resultados → lo que necesita un listado con paginación de servidor.
 * @param {{count: number, next: string|null, previous: string|null, results: object[]}} pagina
 * @param {string} [locale='es']
 * @param {string} [currency='EUR']
 * @returns {{productos: object[], total: number, hayMas: boolean}}
 */
export function adaptarPaginaProductos(pagina, locale = 'es', currency = 'EUR') {
  return {
    productos: (pagina?.results || []).map((producto) => adaptarProductoListado(producto, locale, currency)),
    total: pagina?.count ?? 0,
    hayMas: Boolean(pagina?.next),
  };
}

export { precioProducto, precioAntesDeRebaja };
