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

import { slugify } from '@/lib/slugify';

import { baseUrl, get, post, patch, del } from './client';

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

export const productos = {
  ...crud('products'),
  /**
   * Borrado de verdad desde el panel.
   *
   * El `DELETE` normal **archiva** (`Product.archive()`, decisión D8): el histórico de
   * pedidos referencia el producto. Con `?force=1` el backend borra la fila si nadie la
   * ha comprado nunca, y la archiva igualmente si sí — devolviendo cuál de las dos cosas
   * hizo, para poder decírselo al usuario en vez de mentirle con un «eliminado».
   *
   * @param {string} id
   * @returns {Promise<{deleted: boolean, archived: boolean, reason: string}>}
   */
  eliminar: (id) => del(`/admin/products/${encodeURIComponent(id)}/`, { params: { force: 1 } })
    .then((r) => r || { deleted: true, archived: false, reason: '' }),
};
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
 * Ruta de un archivo servido por el backend → URL utilizable en un `<img src>`.
 *
 * `MediaAssetSerializer` devuelve `file`/`thumbnail` **relativos a la raíz**
 * (`/media/library/image/….webp`), no absolutos. En producción da igual —Caddy sirve
 * `/media/*` en el mismo origen—, pero en desarrollo el frontend es `localhost:3000` y
 * los archivos los sirve Django en `localhost:8001`: una ruta relativa se pediría al
 * propio Next y daría 404. Se resuelve contra la base de la API, que es quien los sirve.
 *
 * @param {string|null|undefined} ruta
 * @returns {string|null}
 */
export function urlMedia(ruta) {
  if (!ruta) return null;
  if (/^(https?:|blob:|data:)/i.test(ruta)) return ruta;
  return `${baseUrl()}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}

/**
 * `ProductImage` de la API → lo que el panel necesita para pintarla y para saber a qué
 * fila corresponde si hay que borrarla.
 *
 * El campo con la foto es `asset_detail.file`; **no existe ningún `image`**. Leerlo de
 * `producto.images[i].image` devolvía `undefined`, y pasar el objeto entero a `<img src>`
 * pintaba literalmente `src="[object Object]"` — de ahí las fotos en blanco.
 *
 * @param {object} imagen
 */
export function adaptarImagenProducto(imagen) {
  return {
    id: imagen.id,
    assetId: imagen.asset,
    colorwayId: imagen.colorway,
    url: urlMedia(imagen.asset_detail?.file),
    miniatura: urlMedia(imagen.asset_detail?.thumbnail) || urlMedia(imagen.asset_detail?.file),
    alt: imagen.alt_text || imagen.asset_detail?.alt_text || '',
    posicion: imagen.position ?? 0,
  };
}

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
    composicionEn: producto.composition_en,
    cuidados: producto.care,
    cuidadosEn: producto.care_en,
    // Códigos de los iconos de cuidado ('wash_40'), no su texto.
    cuidadoIds: producto.care_codes || [],
    disenadoEn: { es: producto.designed_in || '', en: producto.designed_in_en || '' },
    fabricadoEn: { es: producto.made_in || '', en: producto.made_in_en || '' },
    tinturaEstampacion: { es: producto.dyeing_printing || '', en: producto.dyeing_printing_en || '' },
    origenTejido: { es: producto.fabric_origin || '', en: producto.fabric_origin_en || '' },

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
    // DOS formas de lo mismo, a propósito: `imagenes` son URLs sueltas —es lo que
    // `FormularioProducto` sabe manejar (las arrastra, las quita, mezcla blob: nuevas)— y
    // `imagenesDetalle` conserva el id de cada `ProductImage`, que es lo único que
    // permite BORRAR del servidor la que se quite en el formulario.
    imagenesDetalle: (producto.images || []).map(adaptarImagenProducto),
    imagenes: (producto.images || []).map((i) => urlMedia(i.asset_detail?.file)).filter(Boolean),
    // Portada: la primera imagen por `position`, que es como la ordena el backend.
    imagen: urlMedia(producto.images?.[0]?.asset_detail?.thumbnail
      || producto.images?.[0]?.asset_detail?.file),

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
  poner('composition_en', datos.composicionEn);
  poner('care', datos.cuidados);
  poner('care_en', datos.cuidadosEn);
  poner('care_codes', datos.cuidadoIds);
  // Los cuatro «orígenes», bilingües. Llegan como {es, en} desde el formulario.
  const origen = (clave, valor) => {
    if (valor === undefined) return;
    cuerpo[clave] = typeof valor === 'object' && valor !== null ? (valor.es || '') : (valor || '');
    cuerpo[`${clave}_en`] = typeof valor === 'object' && valor !== null ? (valor.en || '') : '';
  };
  origen('designed_in', datos.disenadoEn);
  origen('made_in', datos.fabricadoEn);
  origen('dyeing_printing', datos.tinturaEstampacion);
  origen('fabric_origin', datos.origenTejido);
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

/* ============================================================
   CATEGORÍAS DEL PANEL ↔ `Category` DEL BACKEND
   ============================================================ */

/**
 * Las categorías del panel viven en `CategoriasProvider` (contexto local, ids `cat7`…),
 * no en la base de datos. Eso hacía que:
 *
 *   - al guardar, la categoría no se mandara nunca (`cat7` no es un UUID), y
 *   - al listar, `?category=cat7` filtrara por un slug que no existe → cero productos.
 *
 * El puente entre ambos mundos es el **slug**: `slugify(nombre)`. Esta función lo
 * resuelve contra `/admin/categories/` y **crea la fila si no está**, para que el panel
 * pueda seguir dando de alta categorías en local sin dejar de persistir los productos.
 *
 * @param {{id?: string, nombre: string}} categoriaPanel
 * @returns {Promise<{id: string, slug: string}|null>} `null` si no se pudo resolver: una
 *   categoría no puede impedir que se guarde el producto.
 */
export async function asegurarCategoria(categoriaPanel) {
  const nombre = categoriaPanel?.nombre?.trim();
  if (!nombre) return null;

  const slug = slugify(nombre);
  if (!slug) return null;

  try {
    // `search` es por `name`, así que se compara el slug de lo que vuelva: dos nombres
    // distintos («Faldas» y «faldas ») comparten slug y deben ser la misma categoría.
    const pagina = await categorias.listar({ search: nombre, page_size: 100 });
    const lista = Array.isArray(pagina) ? pagina : pagina.results || [];
    const existente = lista.find((c) => c.slug === slug);
    if (existente) return { id: existente.id, slug: existente.slug };

    const creada = await categorias.crear({ name: nombre, slug, is_active: true });
    return { id: creada.id, slug: creada.slug };
  } catch {
    // Carrera con otra pestaña que la acaba de crear, o permisos: se reintenta la
    // lectura una vez y, si tampoco, se guarda el producto sin categoría.
    try {
      const pagina = await categorias.listar({ search: nombre, page_size: 100 });
      const lista = Array.isArray(pagina) ? pagina : pagina.results || [];
      const existente = lista.find((c) => c.slug === slug);
      return existente ? { id: existente.id, slug: existente.slug } : null;
    } catch {
      return null;
    }
  }
}

/* ============================================================
   COLORES Y TALLAS DEL PANEL ↔ `Color` / `Size` DEL BACKEND
   ============================================================ */

/**
 * Resuelve un color de la lista curada del panel a una fila real de `Color`.
 *
 * Los colores del panel (`coloresMock`) son un catálogo estático con código legible
 * (`'optic-white'`), nombre bilingüe y hex. `Colorway.color` es una FK a `Color`, y esa
 * tabla estaba **vacía**: por eso las variantes de color no se podían guardar de ninguna
 * manera. Se crea la fila la primera vez que se usa el color, igual que
 * `asegurarCategoria` con las categorías.
 *
 * @param {{id: string, nombre: {es: string, en: string}|string, hex?: string}} colorPanel
 * @returns {Promise<{id: string, code: string}|null>} `null` si no se pudo resolver.
 */
export async function asegurarColor(colorPanel) {
  const code = String(colorPanel?.id || '').trim().toLowerCase();
  if (!code) return null;

  const nombre = typeof colorPanel.nombre === 'object' ? colorPanel.nombre?.es : colorPanel.nombre;
  const nombreEn = typeof colorPanel.nombre === 'object' ? colorPanel.nombre?.en : '';

  const buscar = async () => {
    const pagina = await colores.listar({ search: code, page_size: 100 });
    const lista = Array.isArray(pagina) ? pagina : pagina.results || [];
    return lista.find((c) => c.code?.toLowerCase() === code) || null;
  };

  try {
    const existente = await buscar();
    if (existente) return { id: existente.id, code: existente.code };
    const creado = await colores.crear({
      code,
      name: nombre || code,
      name_en: nombreEn || '',
      hex_value: colorPanel.hex || '',
    });
    return { id: creado.id, code: creado.code };
  } catch {
    // Carrera con otra pestaña que acaba de crearlo, o permisos: se reintenta la lectura.
    try {
      const existente = await buscar();
      return existente ? { id: existente.id, code: existente.code } : null;
    } catch {
      return null;
    }
  }
}

/**
 * Resuelve una talla ('38', 'M'…) a una fila real de `Size`.
 *
 * A diferencia de los colores, `Size` sí viene sembrada, así que casi siempre es una
 * lectura. Se crea igualmente si falta, para que una talla fuera del rango estándar no
 * bloquee el guardado.
 *
 * @param {string} codigo
 * @param {number} [posicion] Orden dentro del listado, solo al crearla.
 * @returns {Promise<{id: string, code: string}|null>}
 */
export async function asegurarTalla(codigo, posicion = 0) {
  const code = String(codigo || '').trim();
  if (!code) return null;

  const buscar = async () => {
    const pagina = await tallas.listar({ search: code, page_size: 100 });
    const lista = Array.isArray(pagina) ? pagina : pagina.results || [];
    return lista.find((t) => t.code === code) || null;
  };

  try {
    const existente = await buscar();
    if (existente) return { id: existente.id, code: existente.code };
    const creada = await tallas.crear({ code, position: posicion, is_active: true });
    return { id: creada.id, code: creada.code };
  } catch {
    try {
      const existente = await buscar();
      return existente ? { id: existente.id, code: existente.code } : null;
    } catch {
      return null;
    }
  }
}

/** Slug con el que el listado filtra: el mismo que usa `asegurarCategoria`. */
export function slugCategoriaPanel(categoriaPanel) {
  const nombre = categoriaPanel?.nombre?.trim();
  return nombre ? slugify(nombre) : undefined;
}

/* ============================================================
   ERRORES DEL BACKEND, DICHOS POR SU NOMBRE
   ============================================================ */

/**
 * Nombre del campo del modelo → como se llama en el formulario del panel.
 *
 * Sin esto, `ApiError.firstDetail` devolvía «Este campo es requerido.» a secas y el toast
 * no decía **cuál**: era imposible saber qué faltaba (fue justo lo que pasó con
 * `design_code`, que el formulario ni siquiera mandaba).
 */
export const ETIQUETA_CAMPO_PRODUCTO = {
  name: 'Nombre',
  name_en: 'Nombre (EN)',
  design_code: 'Número de diseño (SKU)',
  slug: 'Slug',
  family: 'Familia de producto',
  line: 'Tipo',
  categories: 'Categoría',
  collection: 'Colección',
  fabrics: 'Tejidos',
  description: 'Descripción',
  composition: 'Composición',
  care: 'Cuidados',
  kind: 'Clase de producto',
  sale_mode: 'Modo de venta',
  price: 'Precio',
  sale_price: 'Precio rebajado',
  status: 'Estado',
  published_at: 'Fecha de publicación',
  is_featured: 'Destacado',
  featured_position: 'Posición de destacado',
  non_field_errors: 'Producto',
  detail: 'Error',
};

/**
 * Convierte los `details` del backend en un mensaje que NOMBRA los campos.
 *
 * @param {import('./errors').ApiError} error
 * @param {Record<string, string>} [etiquetas]
 * @returns {string}
 */
export function describirErrorApi(error, etiquetas = ETIQUETA_CAMPO_PRODUCTO) {
  const detalles = error?.details || {};
  const partes = Object.entries(detalles).map(([campo, motivo]) => {
    const texto = Array.isArray(motivo) ? motivo.join(' ') : String(motivo);
    const etiqueta = etiquetas[campo] || campo;
    return campo === 'non_field_errors' || campo === 'detail' ? texto : `${etiqueta}: ${texto}`;
  });

  if (partes.length) return partes.join(' · ');
  return error?.message || 'No se ha podido guardar.';
}
