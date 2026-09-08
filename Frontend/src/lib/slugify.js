// slugify.js
//
// Convierte el nombre de un producto (o cualquier texto) en el slug
// que usan las URLs del sitio — /tienda/[producto] en particular
// (ver src/app/[locale]/tienda/[producto]/page.js): "Vestido Aurora"
// -> "vestido-aurora". Vive en src/lib porque lo usan tanto
// TarjetaProducto (para construir el href) como la propia página de
// ficha (para encontrar el producto a partir de params.producto) —
// las dos partes tienen que estar de acuerdo en el mismo algoritmo.
//
// normalize('NFD') separa cada letra acentuada en letra base + marca
// diacrítica combinante (ej. "á" -> "a" + U+0301); el rango
// ̀-ͯ cubre esas marcas y las quita, dejando solo la letra base.
const DIACRITICOS = /[̀-ͯ]/g;

export function slugify(texto) {
  return texto
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
