// catalogoFiesta.js
//
// Funciones de Atelier Fiesta que comparten la web (/atelier/fiesta, sus
// fichas, el sitemap y los datos SEO) y el admin (/admin/colecciones/
// fiesta). Todas leen las colecciones de src/datos/atelierFiesta.js, o
// las que les pase el admin mientras se editan, así que la web y el
// admin no pueden desincronizarse.
//
// PARA EL PROGRAMADOR: al conectar la base de datos, este es el único
// sitio que hay que cambiar en la web: que obtenerColeccionesFiesta()
// lea de la base de datos. El resto de funciones son puras (reciben las
// colecciones y devuelven lo que pinta cada plantilla) y siguen valiendo.
// Ver docs/ADMIN.md.

import { derivado } from './contenido';
import { slugify } from './slugify';
import { sinNumeroColeccion } from './nombreColeccion';

export const RUTA_FICHA_FIESTA = '/atelier/fiesta';

// Vista previa de un look desde el admin: la ficha del look con
// ?previa=fiesta-look (ver atelier/fiesta/[producto]/PreviaFichaFiesta.jsx).
export const ID_PREVIA_LOOK_FIESTA = 'fiesta-look';

// Número de look sacado de su nombre ("Look 60 – A Walk" → 60). null si
// el nombre no lleva número (los de Prêt-à-porter).
export function numeroLook(nombre) {
  const encontrado = String(nombre || '').match(/\blook\s*(\d+)/i);
  return encontrado ? Number(encontrado[1]) : null;
}

// Los looks de una colección siempre van por número: Look 1, 2, 3…
// Los que no tienen número van al final, en el orden en que estaban.
export function ordenarLooks(looks = []) {
  return looks
    .map((look, indice) => ({ look, indice, numero: numeroLook(look.nombre) }))
    .sort((a, b) => (a.numero ?? Infinity) - (b.numero ?? Infinity) || a.indice - b.indice)
    .map(({ look }) => look);
}

// Los looks ordenados por número, recalculado solo cuando el documento
// cambia (se publica desde el panel).
const coleccionesOrdenadas = derivado('colecciones-fiesta', (colecciones) => colecciones.map((coleccion) => ({
  ...coleccion,
  looks: ordenarLooks(coleccion.looks),
})));

export function obtenerColeccionesFiesta() {
  return coleccionesOrdenadas();
}

// "26_Opaline" (con temporada) o "En Madrid" (sin temporada): el nombre
// interno que usan el filtro de colección y los enlaces ?coleccion=.
export function nombreInternoColeccion(coleccion) {
  const nombre = (coleccion.nombre || '').trim();
  const temporada = String(coleccion.temporada || '').trim();
  return temporada ? `${temporada}_${nombre}` : nombre;
}

// URL de un look: sale de su nombre ("Look 6 26_Opaline" → look-6-26-opaline).
export function slugLook(nombre) {
  return slugify(nombre || '');
}

// Nombre que se propone al crear un look nuevo (se puede retocar).
export function nombreSugeridoLook(coleccion, numero) {
  return numero ? `Look ${numero} ${nombreInternoColeccion(coleccion)}` : '';
}

// Texto que enseña la ficha cuando el look no tiene descripción propia.
// (Hasta el 2026-11-07 decía «(SKU …). Colores y tallas disponibles
// próximamente», de tienda online; la referencia ya sale aparte como «Ref.».)
export function descripcionAutomatica(look, coleccion) {
  return `Pieza de la colección ${sinNumeroColeccion(nombreInternoColeccion(coleccion))}, Fiesta. Hecha a medida en nuestro atelier: pide tu cita para probártela.`;
}

// La misma, en inglés (la web inglesa no enseña el texto en español).
export function descripcionAutomaticaEn(look, coleccion) {
  return `A piece from the ${sinNumeroColeccion(nombreInternoColeccion(coleccion))} evening collection. Made to measure in our atelier: book an appointment to try it on.`;
}

// Un look → el objeto "producto" que pintan TarjetaProducto, la ficha
// (FichaProductoAtelier), los datos SEO y el sitemap. Misma forma que
// tenía fiestaProductos.js.
export function lookAProducto(look, coleccion) {
  const imagenes = look.imagenes || [];
  const nombreColeccion = nombreInternoColeccion(coleccion);
  // En la tarjeta: "Look N" arriba y la colección debajo, más pequeña.
  // Sin "Look N" en el nombre (prendas de Prêt-à-porter) no se parte.
  const numeroLook = (look.nombre || '').match(/^Look \d+/);
  const descripcionEs = (look.descripcion?.es || '').trim();
  const descripcionEn = (look.descripcion?.en || '').trim();
  return {
    id: look.id,
    nombre: look.nombre,
    titulo: numeroLook ? numeroLook[0] : undefined,
    subtitulo: numeroLook ? sinNumeroColeccion(nombreColeccion) : undefined,
    sku: (look.sku || '').trim() || undefined,
    imagen: imagenes[0],
    imagenHover: imagenes[1] || imagenes[0],
    imagenes,
    descripcion: descripcionEs || descripcionAutomatica(look, coleccion),
    // Sin descripción propia: el texto automático, también en inglés. Con
    // la española pero sin la inglesa, en inglés se enseña la española.
    descripcionEn: descripcionEn || (descripcionEs ? undefined : descripcionAutomaticaEn(look, coleccion)),
    // Para Google: el texto automático no sirve de descripción (sería igual
    // en todos los looks de la colección); se usa el nombre del look.
    descripcionAutomatica: !descripcionEs,
    coleccion: nombreColeccion,
    slugsAnteriores: look.slugsAnteriores || [],
  };
}

// Todos los looks publicados, de cualquier colección: fichas, sitemap y
// "relacionados". Las colecciones ocultas siguen teniendo fichas (ej.
// Prêt-à-porter); un look en borrador no sale en ningún sitio.
export function productosFiesta(colecciones = obtenerColeccionesFiesta()) {
  return colecciones.flatMap((coleccion) => (coleccion.looks || [])
    .filter((look) => look.publicado)
    .map((look) => lookAProducto(look, coleccion)));
}

// Nombres internos de las colecciones visibles, en orden: el filtro de
// colección de /atelier/fiesta.
export function coleccionesVisiblesFiesta(colecciones = obtenerColeccionesFiesta()) {
  return colecciones.filter((coleccion) => coleccion.visible).map(nombreInternoColeccion);
}

// Looks publicados de las colecciones visibles: la cuadrícula de /atelier/fiesta.
export function productosListadoFiesta(colecciones = obtenerColeccionesFiesta()) {
  return productosFiesta(colecciones.filter((coleccion) => coleccion.visible));
}

// Busca un look publicado por la URL. Si la URL es antigua (el look se
// renombró), devuelve también "redirigirA" con la URL actual.
export function buscarProductoFiesta(slug, colecciones = obtenerColeccionesFiesta()) {
  const productos = productosFiesta(colecciones);
  const producto = productos.find((candidato) => slugLook(candidato.nombre) === slug);
  if (producto) return { producto };
  const renombrado = productos.find((candidato) => candidato.slugsAnteriores.includes(slug));
  if (renombrado) return { producto: renombrado, redirigirA: slugLook(renombrado.nombre) };
  return {};
}

// ---------- Validación (admin) ----------
// Devuelven una lista de errores en lenguaje llano; vacía = se puede guardar.

export function validarColeccionFiesta(coleccion, colecciones) {
  const errores = [];
  const nombre = (coleccion.nombre || '').trim();
  const temporada = String(coleccion.temporada || '').trim();
  if (!nombre) errores.push('Escribe el nombre de la colección.');
  if (temporada && !/^\d{2}$/.test(temporada)) errores.push('La temporada son dos cifras, p. ej. 26 (o déjala vacía).');
  const interno = nombreInternoColeccion(coleccion);
  if (nombre && colecciones.some((otra) => otra.id !== coleccion.id && nombreInternoColeccion(otra) === interno)) {
    errores.push(`Ya existe una colección «${sinNumeroColeccion(interno)}» con esa temporada.`);
  }
  return errores;
}

export function validarLookFiesta(look, colecciones) {
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

// ---------- Admin: submenú "Fiesta" del menú lateral ----------
// Las colecciones con la forma que espera Categorias.jsx (id, nombre,
// visible, orden, numeroLooks, looks) — también la usa la búsqueda de
// looks de FormularioProducto.jsx ("Vincular a Runway/Novia/Fiesta").
export function categoriasAdminFiesta(colecciones) {
  return colecciones.map((coleccion, indice) => ({
    id: coleccion.id,
    nombre: nombreInternoColeccion(coleccion),
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
