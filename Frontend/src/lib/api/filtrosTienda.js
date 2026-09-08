/**
 * Traducción entre los filtros de la URL del frontend y los query params de la API.
 *
 * Los filtros van SIEMPRE en la URL, no solo en estado de React: compartir el enlace
 * tiene que reproducir el mismo listado. Y el filtrado y la paginación ocurren en el
 * SERVIDOR — no se trae el catálogo entero para recortarlo en el cliente.
 */

/**
 * Slug de la ruta del frontend → slug de `Family` en el backend.
 *
 * **Decidido**: el eje del menú de Tienda es `Family` (tipo de prenda), no `Category`
 * (ocasión: fiesta/novia/outlet). Solo `vestidos` y `faldas` coinciden literalmente; las
 * otras dos necesitan traducción, y `zapatos`/`accesorios` **no tienen `Family` todavía**
 * en el backend: sus rutas existen y devuelven vacío hasta que se creen. Ver
 * `docs/CONTRATO.md`.
 */
export const FAMILIA_POR_RUTA = {
  vestidos: 'vestidos',
  faldas: 'faldas',
  'tops-y-camisetas': 'tops',
  'chaquetas-y-abrigos': 'chaquetas',
  // Sin Family en el backend: el listado saldrá vacío, no roto.
  zapatos: null,
  accesorios: null,
};

/** Rutas de categoría cuya `Family` aún no existe — para poder avisar en la interfaz. */
export const RUTAS_SIN_FAMILIA = Object.entries(FAMILIA_POR_RUTA)
  .filter(([, familia]) => familia === null)
  .map(([ruta]) => ruta);

/**
 * `Category` (eje editorial) de cada sección de atelier.
 * **Decidido**: `/atelier/novias` y `/atelier/fiesta` filtran por `line=atelier` +
 * `category`. Ambas categorías ya existen en el backend.
 */
export const CATEGORIA_POR_SECCION_ATELIER = {
  novias: 'novia',
  fiesta: 'fiesta',
};

/** Orden del selector del panel → valor de `ordering` de la API. */
const ORDENACIONES = {
  recomendados: '-created_at',
  novedades: '-created_at',
  precioAsc: 'price',
  precioDesc: '-price',
  nombre: 'name',
};

/** Cuántos productos por página en los listados en cuadrícula. */
export const TAMANO_PAGINA = 24;

/**
 * Query params de la URL → filtros de la API.
 *
 * Solo deja pasar lo conocido: un param inventado no llega al backend. Los importes van
 * en **neto**, que es como el backend los guarda y los filtra.
 *
 * @param {Record<string, string|string[]|undefined>} searchParams El objeto ya resuelto
 *   de `searchParams` de la página.
 * @param {object} [base] Filtros fijos de la ruta (`{ family: 'vestidos' }`).
 * @returns {object} Filtros listos para `catalog.listarProductos`.
 */
export function filtrosDesdeUrl(searchParams = {}, base = {}) {
  const leer = (clave) => {
    const valor = searchParams[clave];
    return Array.isArray(valor) ? valor[0] : valor;
  };
  const leerLista = (clave) => {
    const valor = searchParams[clave];
    if (!valor) return undefined;
    return Array.isArray(valor) ? valor : String(valor).split(',').filter(Boolean);
  };

  const pagina = Number.parseInt(leer('page') ?? '1', 10);
  const orden = leer('orden');

  const filtros = {
    ...base,
    page: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
    page_size: TAMANO_PAGINA,
    ordering: ORDENACIONES[orden] || ORDENACIONES.recomendados,
  };

  const talla = leerLista('talla');
  if (talla?.length) filtros.size = talla;

  const color = leerLista('color');
  if (color?.length) filtros.color = color;

  const precioMax = leer('precioMax');
  if (precioMax) filtros.price_max = precioMax;

  const precioMin = leer('precioMin');
  if (precioMin) filtros.price_min = precioMin;

  if (leer('rebajas') === '1') filtros.is_outlet = true;
  if (leer('disponibles') === '1') filtros.in_stock = true;

  const busqueda = leer('q');
  if (busqueda) filtros.search = busqueda;

  return filtros;
}

/**
 * Estado de los filtros tal como lo necesita la interfaz (para marcar lo activo), sin
 * la traducción a nombres de la API.
 * @param {Record<string, string|string[]|undefined>} searchParams
 * @returns {{tallas: string[], colores: string[], precioMax: string|null, orden: string,
 *   pagina: number, soloRebajas: boolean, soloDisponibles: boolean}}
 */
export function estadoFiltrosDesdeUrl(searchParams = {}) {
  const leer = (clave) => {
    const valor = searchParams[clave];
    return Array.isArray(valor) ? valor[0] : valor;
  };
  const leerLista = (clave) => {
    const valor = searchParams[clave];
    if (!valor) return [];
    return Array.isArray(valor) ? valor : String(valor).split(',').filter(Boolean);
  };

  const pagina = Number.parseInt(leer('page') ?? '1', 10);

  return {
    tallas: leerLista('talla'),
    colores: leerLista('color'),
    precioMax: leer('precioMax') || null,
    orden: leer('orden') || 'recomendados',
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
    soloRebajas: leer('rebajas') === '1',
    soloDisponibles: leer('disponibles') === '1',
  };
}

/**
 * Estado de filtros → query string para navegar.
 *
 * Quita `page` cuando cambia cualquier otro filtro: seguir en la página 4 tras estrechar
 * el filtro deja al usuario mirando una página que ya no existe.
 *
 * @param {object} estado Salida de `estadoFiltrosDesdeUrl`, ya modificada.
 * @param {boolean} [conservarPagina=false]
 * @returns {string} Con `?` inicial, o `''`.
 */
export function urlDesdeEstadoFiltros(estado, conservarPagina = false) {
  const params = new URLSearchParams();

  estado.tallas?.forEach((talla) => params.append('talla', talla));
  estado.colores?.forEach((color) => params.append('color', color));
  if (estado.precioMax) params.set('precioMax', String(estado.precioMax));
  if (estado.orden && estado.orden !== 'recomendados') params.set('orden', estado.orden);
  if (estado.soloRebajas) params.set('rebajas', '1');
  if (estado.soloDisponibles) params.set('disponibles', '1');
  if (conservarPagina && estado.pagina > 1) params.set('page', String(estado.pagina));

  const cadena = params.toString();
  return cadena ? `?${cadena}` : '';
}
