// catalogoNovias.js
//
// Funciones de Atelier Novias que comparten la web (fichas de
// /atelier/novias/<look>, sus páginas de categoría, el sitemap y los
// datos SEO) y el admin (/admin/colecciones/novia). Todas leen las
// colecciones de src/datos/atelierNovias.js, o las que les pase el admin
// mientras se editan. Mismo planteamiento que catalogoFiesta.js.
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerColeccionesNovias(). Ver docs/ADMIN.md.

import { derivado } from './contenido';
import { ordenarLooks, slugLook } from './catalogoFiesta';

export const RUTA_FICHA_NOVIAS = '/atelier/novias';

// Vista previa de un look desde el admin: su ficha con ?previa=novias-look.
export const ID_PREVIA_LOOK_NOVIAS = 'novias-look';

// Los looks ordenados por número, recalculado solo cuando el documento
// cambia (se publica desde el panel).
const coleccionesOrdenadas = derivado('colecciones-novias', (colecciones) => colecciones.map((coleccion) => ({
  ...coleccion,
  looks: ordenarLooks(coleccion.looks),
})));

export function obtenerColeccionesNovias() {
  return coleccionesOrdenadas();
}

// Nombre que se propone al crear un look: el mismo patrón que los demás
// looks de su colección ("Look 15 - ME Bridal"), o "Look 15 - <colección>".
export function nombreSugeridoLookNovia(coleccion, numero) {
  if (!numero) return '';
  const muestra = coleccion?.looks?.find((look) => /^Look \d+/.test(look.nombre))?.nombre;
  const resto = muestra ? muestra.replace(/^Look \d+/, '') : ` - ${coleccion?.nombre || ''}`;
  return `Look ${numero}${resto}`;
}

// Texto de la ficha cuando el look no tiene descripción propia. (Hasta el
// 2026-11-07 decía «(SKU …). Colores y tallas disponibles próximamente»,
// de tienda online; la referencia ya sale aparte como «Ref.».)
export function descripcionAutomaticaNovia(look, coleccion) {
  return `Pieza de la colección ${coleccion.nombre}, Novias. Hecha a medida en nuestro atelier: pide tu cita para probártela.`;
}

// La misma, en inglés (la web inglesa no enseña el texto en español).
export function descripcionAutomaticaNoviaEn(look, coleccion) {
  return `A piece from the ${coleccion.nombre} bridal collection. Made to measure in our atelier: book an appointment to try it on.`;
}

// Un look → el "producto" que pintan la ficha, la tarjeta, los datos SEO
// y el sitemap. Misma forma que tenía noviaProductos.js.
export function lookAProductoNovia(look, coleccion) {
  const imagenes = look.imagenes || [];
  const descripcionEs = (look.descripcion?.es || '').trim();
  const descripcionEn = (look.descripcion?.en || '').trim();
  return {
    id: look.id,
    nombre: look.nombre,
    sku: (look.sku || '').trim() || undefined,
    imagen: imagenes[0],
    imagenHover: imagenes[1] || imagenes[0],
    imagenes,
    descripcion: descripcionEs || descripcionAutomaticaNovia(look, coleccion),
    // Sin descripción propia: el texto automático, también en inglés. Con
    // la española pero sin la inglesa, en inglés se enseña la española.
    descripcionEn: descripcionEn || (descripcionEs ? undefined : descripcionAutomaticaNoviaEn(look, coleccion)),
    // Para Google: el texto automático no sirve de descripción (ver Fiesta).
    descripcionAutomatica: !descripcionEs,
    tags: look.tags || [coleccion.nombre],
    coleccion: coleccion.nombre,
    slugsAnteriores: look.slugsAnteriores || [],
  };
}

// Todos los looks publicados: fichas, sitemap y relacionados.
export function productosNovias(colecciones = obtenerColeccionesNovias()) {
  return colecciones.flatMap((coleccion) => (coleccion.looks || [])
    .filter((look) => look.publicado)
    .map((look) => lookAProductoNovia(look, coleccion)));
}

// Looks publicados de las colecciones visibles: las cuadrículas.
export function productosListadoNovias(colecciones = obtenerColeccionesNovias()) {
  return productosNovias(colecciones.filter((coleccion) => coleccion.visible));
}

// Busca un look que se vea en la web (publicado y de una colección
// publicada) por la URL; si es una URL antigua (se renombró), devuelve
// también "redirigirA". Si el look existe pero su colección está oculta,
// devuelve { oculto: true } (la ficha redirige de forma temporal: puede
// volver a enseñarse).
export function buscarProductoNovia(slug, colecciones = obtenerColeccionesNovias()) {
  const ocultoPorColeccion = !productosListadoNovias(colecciones).some((p) => slugLook(p.nombre) === slug || p.slugsAnteriores.includes(slug))
    && productosNovias(colecciones).some((p) => slugLook(p.nombre) === slug || p.slugsAnteriores.includes(slug));
  if (ocultoPorColeccion) return { oculto: true };
  const productos = productosListadoNovias(colecciones);
  const producto = productos.find((candidato) => slugLook(candidato.nombre) === slug);
  if (producto) return { producto };
  const renombrado = productos.find((candidato) => candidato.slugsAnteriores.includes(slug));
  if (renombrado) return { producto: renombrado, redirigirA: slugLook(renombrado.nombre) };
  return {};
}

// ---------- Validación (admin) ----------

export function validarColeccionNovia(coleccion, colecciones) {
  const errores = [];
  const nombre = (coleccion.nombre || '').trim();
  if (!nombre) errores.push('Escribe el nombre de la colección.');
  if (nombre && colecciones.some((otra) => otra.id !== coleccion.id && otra.nombre.trim().toLowerCase() === nombre.toLowerCase())) {
    errores.push(`Ya existe una colección «${nombre}».`);
  }
  return errores;
}

export function validarLookNovia(look, colecciones) {
  const errores = [];
  const nombre = (look.nombre || '').trim();
  if (!look.coleccionId) errores.push('Elige la colección.');
  if (!nombre) errores.push('Escribe el nombre del look.');
  if (!look.imagenes || look.imagenes.length === 0) errores.push('Sube al menos una foto.');
  const slug = slugLook(nombre);
  const repetido = colecciones.some((coleccion) => (coleccion.looks || []).some((otro) => otro.id !== look.id
    && (slugLook(otro.nombre) === slug || (otro.slugsAnteriores || []).includes(slug))));
  if (nombre && repetido) errores.push('Ya hay otro look con ese nombre (la URL sería la misma). Cambia el número o el nombre.');
  return errores;
}

// ---------- Admin: submenú "Colección Novias" del menú lateral ----------
// Misma forma que categoriasAdminFiesta (Categorias.jsx).
export function categoriasAdminNovias(colecciones) {
  return colecciones.map((coleccion, indice) => ({
    id: coleccion.id,
    nombre: coleccion.nombre,
    visible: coleccion.visible,
    orden: indice + 1,
    fija: true,
    numeroLooks: (coleccion.looks || []).length,
    looks: (coleccion.looks || []).map((look) => ({
      nombre: look.nombre,
      sku: look.sku,
      imagenes: look.imagenes,
      prendas: look.sku ? [{ nombre: '', sku: look.sku }] : [],
    })),
  }));
}
