/**
 * Catálogo del panel de administración (`/api/v1/admin/…`).
 *
 * **Solo Client Components**: todo exige sesión de staff (cookie) y las escrituras, CSRF.
 *
 * Todos los recursos son ViewSets de DRF con la misma forma, así que en vez de repetir
 * ocho módulos idénticos hay un `crud()` genérico. Lo que NO es genérico —el vocabulario
 * entre el modelo real y el que ya usan los componentes del panel— vive abajo, explícito.
 *
 * Sin sesión de staff: 401. Con sesión pero sin `is_staff`: 403 (ver `IsStaff`).
 */

import { get, post, patch, del } from './client';

/**
 * @typedef {object} Pagina
 * @property {number} count
 * @property {string|null} next
 * @property {string|null} previous
 * @property {object[]} results
 */

/**
 * CRUD genérico sobre un recurso admin.
 *
 * La paginación y el filtrado son **de servidor** (`DefaultPagination`: 20 por página,
 * máximo 100). No traigas el listado entero para recortarlo en el cliente.
 *
 * @param {string} recurso Segmento bajo `/admin/` (`"products"`, `"colors"`…).
 */
function crud(recurso) {
  const base = `/admin/${recurso}/`;
  const uno = (id) => `${base}${encodeURIComponent(id)}/`;

  return {
    /**
     * @param {Record<string, unknown>} [params] `page`, `page_size`, `search`, y los
     *   filtros propios del recurso.
     * @returns {Promise<Pagina>}
     */
    listar: (params = {}) => get(base, { params }),
    /** @param {string} id UUID. */
    obtener: (id) => get(uno(id)),
    /** @param {object} datos */
    crear: (datos) => post(base, datos),
    /** @param {string} id UUID. @param {object} datos Parcial: PATCH, no PUT. */
    actualizar: (id, datos) => patch(uno(id), datos),
    /** @param {string} id UUID. */
    borrar: (id) => del(uno(id)),
    /** Para acciones propias del recurso (`{id}/adjust/`…). */
    _base: base,
    _uno: uno,
  };
}

export const productos = crud('products');
export const colorways = crud('colorways');
export const variantes = crud('variants');
export const imagenesProducto = crud('product-images');
export const familias = crud('families');
export const categorias = crud('categories');
export const tallas = crud('sizes');
export const colores = crud('colors');
export const tejidos = crud('fabrics');
export const colecciones = crud('collections');

/* ============================================================
   VOCABULARIO: modelo real ↔ el que ya usan los componentes
   ============================================================ */

/**
 * `Product.status` ↔ el `estado` que espera `EstadoPublicacionBadge`.
 *
 * Los cuatro estados existen en el backend, incluido **`scheduled`** (publicación
 * programada): el producto no es público hasta su `published_at`, y el comando
 * `publish_scheduled` (cron) lo pasa a `active` cuando llega la hora.
 */
export const ESTADO_POR_STATUS = {
  draft: 'Borrador',
  scheduled: 'Programado',
  active: 'Activo',
  archived: 'Archivado',
};

/** El inverso. Lo que no reconozca cae a `draft`, que es el valor por defecto del modelo. */
export const STATUS_POR_ESTADO = {
  Borrador: 'draft',
  Programado: 'scheduled',
  Activo: 'active',
  Archivado: 'archived',
};

/**
 * `Product.line` ↔ el `tipo` del panel (`tiposProducto` en `mockData.js`).
 *
 * El panel maneja CINCO tipos y el modelo tiene TRES líneas. **Decidido**: `novia` y
 * `fiesta` no son líneas comerciales, son **colecciones editoriales dentro de
 * `line=archive`** — se distinguen por `Collection`, no por `line`. Por eso este mapa
 * solo cubre los tres que sí son líneas: los otros dos necesitan además la colección.
 */
export const LINEA_POR_TIPO = {
  'pret-a-porter': 'pret_a_porter',
  atelier: 'atelier',
  archivo: 'archive',
};

export const TIPO_POR_LINEA = {
  pret_a_porter: 'pret-a-porter',
  atelier: 'atelier',
  archive: 'archivo',
};

/**
 * Producto de la API admin → forma que ya consumen `GridProductos`, `TablaAdmin` y
 * `FormularioProducto`.
 *
 * **Los precios se dejan como decimales tipados**, no como strings formateados: el panel
 * formatea solo en la vista. Un `"890 €"` dentro del dato es justo lo que hacía que
 * `parsearPrecio` destrozara los céntimos.
 *
 * **Todo se relaciona por UUID**, nunca por nombre. El mock resolvía con
 * `.find(p => p.nombre === x)`; eso se acabó.
 *
 * @param {object} producto
 * @returns {object}
 */
export function adaptarProductoAdmin(producto) {
  return {
    id: producto.id,
    slug: producto.slug,
    nombre: producto.name,
    nombreEn: producto.name_en,
    descripcion: producto.description,
    descripcionEn: producto.description_en,
    composicion: producto.composition,
    cuidados: producto.care,

    sku: producto.design_code,
    tipo: TIPO_POR_LINEA[producto.line] ?? producto.line,
    linea: producto.line,
    estado: ESTADO_POR_STATUS[producto.status] ?? 'Borrador',
    status: producto.status,
    publicado: producto.is_published,
    // Con `status: scheduled` es la fecha DESDE la que se publicará (futura). Con
    // `active`, la fecha en que se publicó. El mismo campo, dos lecturas.
    publicadoEn: producto.published_at,
    programadoPendiente: producto.status === 'scheduled' && producto.is_published === false,

    kind: producto.kind,
    modoVenta: producto.sale_mode,
    // Decimales, sin formatear. `null` en las piezas de solo consulta.
    precio: producto.price,
    precioRebajado: producto.sale_price,
    esOutlet: producto.is_outlet,
    destacado: producto.is_featured,
    posicionDestacado: producto.featured_position,

    // Relaciones: el id para escribir, el detalle para pintar.
    familiaId: producto.family,
    familia: producto.family_detail
      ? { id: producto.family_detail.id, nombre: producto.family_detail.name, slug: producto.family_detail.slug, code: producto.family_detail.code }
      : null,
    coleccionId: producto.collection,
    coleccion: producto.collection_detail
      ? { id: producto.collection_detail.id, nombre: producto.collection_detail.name, code: producto.collection_detail.code }
      : null,
    categoriaIds: producto.categories || [],
    categorias: (producto.categories_detail || []).map((c) => ({ id: c.id, nombre: c.name, slug: c.slug })),
    telaIds: producto.fabrics || [],
    telas: (producto.fabrics_detail || []).map((f) => ({ id: f.id, nombre: f.name })),

    colorways: producto.colorways || [],
    imagenes: producto.images || [],
    // Portada: la primera imagen por `position`, que es como la ordena el backend.
    imagen: producto.images?.[0]?.image ?? null,

    creadoEn: producto.created_at,
    actualizadoEn: producto.updated_at,
  };
}

/**
 * Lo inverso, para guardar. Solo manda lo que el modelo tiene: un campo que el formulario
 * enseñe y el modelo no tenga NO se inventa aquí (se quita del formulario).
 *
 * @param {object} datos Estado del formulario.
 * @returns {object} Cuerpo para POST/PATCH.
 */
export function serializarProductoAdmin(datos) {
  const cuerpo = {};
  const poner = (clave, valor) => {
    if (valor !== undefined) cuerpo[clave] = valor;
  };

  poner('name', datos.nombre);
  poner('name_en', datos.nombreEn);
  poner('description', datos.descripcion);
  poner('description_en', datos.descripcionEn);
  poner('composition', datos.composicion);
  poner('care', datos.cuidados);
  poner('design_code', datos.sku);
  poner('kind', datos.kind);
  poner('sale_mode', datos.modoVenta);
  poner('is_outlet', datos.esOutlet);
  poner('is_featured', datos.destacado);
  poner('featured_position', datos.posicionDestacado);
  poner('family', datos.familiaId);
  // `?? null` aquí sería un bug: haría que `poner` mandara SIEMPRE `collection`, y un
  // guardado parcial de cualquier otro campo dejaría el producto sin colección. Solo se
  // manda si la clave viene de verdad; un `null` explícito sí desasigna.
  if ('coleccionId' in datos) cuerpo.collection = datos.coleccionId || null;
  poner('categories', datos.categoriaIds);
  poner('fabrics', datos.telaIds);

  // `line` desde el tipo del panel; `novia`/`fiesta` van a `archive` y se distinguen por
  // colección (ver LINEA_POR_TIPO).
  if (datos.tipo !== undefined) {
    cuerpo.line = LINEA_POR_TIPO[datos.tipo] ?? datos.linea ?? 'pret_a_porter';
  } else {
    poner('line', datos.linea);
  }

  // `status` es la fuente de verdad; `is_published` se deriva en Product.save() y no se
  // manda nunca a mano.
  if (datos.estado !== undefined) {
    cuerpo.status = STATUS_POR_ESTADO[datos.estado] ?? 'draft';
  } else {
    poner('status', datos.status);
  }

  // Fecha de publicación programada. El backend la exige (y futura) cuando el estado es
  // `scheduled`, y la ignora en el resto: solo se manda si viene.
  if ('publicadoEn' in datos) {
    cuerpo.published_at = datos.publicadoEn || null;
  }

  // Precios: decimales o null. Una cadena vacía no es cero.
  if (datos.precio !== undefined) cuerpo.price = datos.precio === '' ? null : datos.precio;
  if (datos.precioRebajado !== undefined) {
    cuerpo.sale_price = datos.precioRebajado === '' ? null : datos.precioRebajado;
  }

  return cuerpo;
}

/**
 * Filtros del listado de productos, en servidor.
 * @param {object} [estado]
 * @param {string} [estado.busqueda]
 * @param {string} [estado.tipo] Tipo del panel; se traduce a `line`.
 * @param {string} [estado.estado] Estado del panel; se traduce a `status`.
 * @param {string} [estado.coleccionId]
 * @param {string} [estado.categoriaSlug]
 * @param {number} [estado.pagina]
 * @param {number} [estado.porPagina]
 * @returns {Record<string, unknown>}
 */
export function filtrosProductosAdmin({
  busqueda,
  tipo,
  estado,
  coleccionId,
  categoriaSlug,
  pagina = 1,
  porPagina = 20,
} = {}) {
  const params = { page: pagina, page_size: porPagina };
  if (busqueda) params.search = busqueda;
  if (tipo && LINEA_POR_TIPO[tipo]) params.line = LINEA_POR_TIPO[tipo];
  if (estado && STATUS_POR_ESTADO[estado]) params.status = STATUS_POR_ESTADO[estado];
  if (coleccionId) params.collection = coleccionId;
  if (categoriaSlug) params.category = categoriaSlug;
  return params;
}

/** Sesión de staff. 401 sin sesión, 403 con sesión pero sin `is_staff`. */
export function obtenerAdmin() {
  return get('/admin/me/');
}
