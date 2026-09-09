'use client';

/**
 * Traduce lo que produce `FormularioProducto` a lo que acepta `/api/v1/admin/products/`
 * y lo guarda.
 *
 * El formulario mantiene su forma interna (mock-like) y este módulo hace de puente: así
 * no hay que reescribir sus 1600 líneas para que persista.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * AUDITORÍA — campos que el formulario edita y el modelo NO tiene
 * ────────────────────────────────────────────────────────────────────────────
 * Estos NO se mandan (no existen en `Product`), y por eso no se guardan. Están
 * enumerados aquí y en `docs/CONTRATO.md` en vez de desaparecer en silencio:
 *
 *   disenadoEn, fabricadoEn, tinturaEstampacion, origenTejido
 *       Los cuatro "orígenes" de la ficha. Hoy son texto fijo traducido en el
 *       frontend (`producto.origenDisenado` etc. en messages/*.json), no datos.
 *   cuidadoIds
 *       Iconos de cuidado. El modelo solo tiene `care`, texto libre.
 *   prendas
 *       Lista de prendas con SKU propio. Existe `BundleComponent`, pero es otra
 *       cosa (componentes de un conjunto) y tiene su propio endpoint.
 *   estampadoId
 *       No hay modelo de estampado; `Colorway` referencia un `Color`.
 *   lookVinculado
 *       No existe el modelo `Look` (docs/CONTRATO.md, C-3).
 *   resenas
 *       No existe el modelo `Review` (docs/CONTRATO.md, C-1).
 *   composicion.en / descripcion en varios idiomas más allá de ES/EN
 *       El modelo tiene `composition` (una sola), y `name_en`/`description_en`.
 *   tallas[].stock, colorIds
 *       SÍ existen, pero NO en `Product`: viven en `Colorway`/`Variant`, cada uno con su
 *       endpoint. El formulario los trata como campos planos del producto, que es otro
 *       modelo de datos.
 *
 * Las IMÁGENES sí se guardan, en dos pasos (ver `sincronizarImagenes`): el archivo va a la
 * biblioteca de medios y luego se crea el `ProductImage` que lo coloca en la ficha.
 *
 * `categoriaId` merece nota propia: las categorías del panel vienen de
 * `CategoriasProvider` (contexto local, ids tipo 'cat1'), no de `Category` del backend.
 * Solo se manda si el id parece un UUID.
 */

import {
  productos as apiProductos, imagenesProducto as apiImagenes, serializarProductoAdmin,
  asegurarCategoria, describirErrorApi,
} from '@/lib/api/adminCatalog';
import { slugify } from '@/lib/slugify';
import { ApiError } from '@/lib/api/errors';
import { subirMedia, motivoDeRechazo } from '@/lib/api/adminMedia';

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Campos del formulario que hoy no se guardan, y cómo se llaman de cara al usuario.
 *
 * `tallas` y `colorIds` son un caso aparte y por eso están aquí aunque el catálogo SÍ los
 * tenga: viven en `Colorway`/`Variant`, que el panel todavía no crea. Faltaban en esta
 * lista, así que se rellenaban las tallas y el stock y se perdían sin que nadie lo
 * dijera — y al reabrir la ficha aparecían vacías, como si el guardado hubiera fallado.
 */
export const ETIQUETA_CAMPO_SIN_MODELO = {
  disenadoEn: 'Diseñado en',
  fabricadoEn: 'Fabricado en',
  tinturaEstampacion: 'Tintura y estampación',
  origenTejido: 'Origen del tejido',
  cuidadoIds: 'Iconos de cuidado',
  prendas: 'Prendas y sus SKU',
  estampadoId: 'Estampado',
  lookVinculado: 'Look de pasarela',
  resenas: 'Reseñas',
  tallas: 'Tallas y stock',
  colorIds: 'Colores',
};

export const CAMPOS_SIN_MODELO = Object.keys(ETIQUETA_CAMPO_SIN_MODELO);

/**
 * ¿Qué campos rellenados se van a perder al guardar? Para poder decirlo, no callarlo.
 * @param {object} formulario
 * @returns {string[]}
 */
export function camposQueNoSeGuardan(formulario) {
  return CAMPOS_SIN_MODELO.filter((campo) => {
    const valor = formulario?.[campo];
    if (Array.isArray(valor)) return valor.length > 0;
    if (valor && typeof valor === 'object') {
      return Object.values(valor).some((v) => String(v ?? '').trim());
    }
    return Boolean(valor);
  }).map((campo) => ETIQUETA_CAMPO_SIN_MODELO[campo] || campo);
}

/**
 * API → formulario. El camino de vuelta de `formularioAApi`, que no existía: el modal de
 * edición recibía el producto adaptado tal cual y leía claves que ese objeto no tiene.
 *
 * Los nombres NO coinciden, y por eso al editar salía casi todo en blanco aunque el dato
 * estuviera guardado (comprobado contra el servidor: `description`, `composition`,
 * `family` y `categories` venían rellenos):
 *
 *   el formulario lee   │ el producto adaptado trae
 *   ────────────────────┼──────────────────────────────────────────────
 *   descripcionCorta    │ descripcion / descripcionEn
 *   composicion.es      │ composicion (una cadena, no un {es, en})
 *   categoriaId         │ categoriaIds (UUID) — y el <select> usa ids
 *                       │ del panel ('cat7'), así que hay que traducir
 *   coleccion (código)  │ coleccion (un objeto {id, nombre, code})
 *   nombre.en           │ nombreEn — se perdía al guardar: el formulario
 *                       │ mandaba '' y machacaba el `name_en` guardado
 *
 * `tallas` y `colorIds` no se rellenan porque no son de `Product`: viven en
 * `Colorway`/`Variant`, que el panel todavía no crea (ver la auditoría de arriba).
 *
 * @param {object} producto Salida de `adaptarProductoAdmin`.
 * @param {object[]} [categoriasPanel] Las de `CategoriasProvider` para este tipo, para
 *   poder preseleccionar la que corresponde en el desplegable.
 * @returns {object} La «semilla» que espera `FormularioProducto`.
 */
export function productoAFormulario(producto, categoriasPanel = []) {
  if (!producto) return producto;

  // El puente entre la `Category` real y la del panel es el slug, igual que al guardar
  // (`asegurarCategoria`). Comparar por nombre fallaba con «Faldas» vs «faldas ».
  const slugsGuardados = new Set((producto.categorias || []).map((c) => c.slug));
  const delPanel = categoriasPanel.find((c) => slugsGuardados.has(slugify(c.nombre || '')));

  return {
    ...producto,
    nombre: { es: producto.nombre || '', en: producto.nombreEn || '' },
    descripcionCorta: { es: producto.descripcion || '', en: producto.descripcionEn || '' },
    composicion: { es: producto.composicion || '', en: '' },
    categoriaId: delPanel?.id || '',
    coleccion: producto.coleccion?.code || '',
    // `precio` llega como decimal en cadena ("100.00"); el input lo quiere tal cual.
    precio: producto.precio ?? '',
  };
}

/**
 * Formulario → cuerpo de la API.
 *
 * @param {object} f Objeto que emite `FormularioProducto` vía `onGuardado`.
 * @param {object} [extra]
 * @param {string} [extra.familiaId] UUID de `Family`. **Obligatorio al crear**.
 * @param {string} [extra.publicadoEn] ISO. Obligatorio si el estado es 'Programado'.
 * @param {string} [extra.categoriaId] UUID de `Category` ya resuelto (ver
 *   `asegurarCategoria`): las categorías del panel son ids locales tipo 'cat7'.
 * @returns {object}
 */
export function formularioAApi(f, { familiaId, publicadoEn, categoriaId } = {}) {
  const datos = {
    nombre: typeof f.nombre === 'object' ? f.nombre.es : f.nombre,
    nombreEn: typeof f.nombre === 'object' ? f.nombre.en : undefined,
    descripcion: typeof f.descripcionCorta === 'object' ? f.descripcionCorta.es : f.descripcionCorta,
    descripcionEn: typeof f.descripcionCorta === 'object' ? f.descripcionCorta.en : undefined,
    // El modelo tiene UNA composición, no una por idioma.
    composicion: typeof f.composicion === 'object' ? f.composicion.es : f.composicion,
    tipo: f.tipo,
    estado: f.estado,
    // `design_code` es OBLIGATORIO en el modelo (no admite vacío) y el formulario ya lo
    // genera. No mandarlo era la causa del 400 al publicar.
    sku: f.sku,
    // Decimal o null: "" no es cero.
    precio: f.precio === undefined ? undefined : f.precio,
    // `sale_mode` NO viajaba, y sin él el backend asume `in_stock`: publicar una pieza de
    // atelier o de archivo («a consultar», sin precio) devolvía 400 pidiendo el precio,
    // justo el caso en el que no lo hay. El formulario ya sabe cuál es; solo faltaba
    // mandarlo.
    modoVenta: f.modoVenta,
  };

  if (familiaId) datos.familiaId = familiaId;
  if (publicadoEn !== undefined) datos.publicadoEn = publicadoEn;

  // Categoría: o bien ya viene resuelta a UUID desde `asegurarCategoria`, o bien el
  // propio formulario traía un UUID. Los ids del panel ('cat7') no se mandan nunca.
  const uuidCategoria = categoriaId
    || (f.categoriaId && ES_UUID.test(f.categoriaId) ? f.categoriaId : null);
  if (uuidCategoria) datos.categoriaIds = [uuidCategoria];
  // Ídem con la colección: el mock usa códigos ('fw26'), el modelo un UUID.
  if (f.coleccion && ES_UUID.test(f.coleccion)) datos.coleccionId = f.coleccion;

  return serializarProductoAdmin(datos);
}

/**
 * Deja la galería del producto como la dejó el formulario: sube las nuevas y quita las
 * que ya no están.
 *
 * Dos pasos, porque son dos cosas distintas:
 *   1. El ARCHIVO va a la biblioteca de medios (`POST /admin/media/`, multipart). Ahí el
 *      servidor lo normaliza: 2560px máximo, WebP, miniatura y EXIF limpio.
 *   2. El `ProductImage` (`POST /admin/product-images/`) dice en qué ficha va, en qué
 *      posición y de qué color. La imagen es reutilizable; su sitio en la ficha, no.
 *
 * Se hace DESPUÉS de guardar el producto porque hace falta su id.
 *
 * Las que ya son `http(s)` se saltan: son fotos ya subidas que solo se están reordenando.
 *
 * @param {string} productoId
 * @param {string[]} imagenes URLs en el orden de la galería (blob: las nuevas).
 * @param {Record<string, File>} archivosPorUrl
 * @param {{id: string, url: string}[]} [previas] Las que la ficha YA tenía, para poder
 *   borrar del servidor las que se hayan quitado en el formulario.
 * @returns {Promise<{subidas: number, borradas: number, fallidas: string[]}>} Nunca
 *   lanza: una foto que falla no puede tirar abajo un producto ya guardado.
 */
async function sincronizarImagenes(productoId, imagenes = [], archivosPorUrl = {}, previas = []) {
  let subidas = 0;
  let borradas = 0;
  const fallidas = [];

  // El formulario trabaja con URLs sueltas. Cualquier otra cosa (un `ProductImage`
  // entero, que es lo que llegaba antes de adaptarlo) se ignora en vez de reventar: un
  // `url.startsWith` sobre un objeto lanzaba un TypeError que el `catch` de abajo
  // convertía en «No se ha guardado» — con el producto YA guardado en el servidor.
  const enGaleria = imagenes.filter((url) => typeof url === 'string' && url);

  for (const [indice, url] of enGaleria.entries()) {
    // Ya subida (viene del servidor): solo estaba en la galería, no hay nada que hacer.
    if (!url.startsWith('blob:')) continue;

    const archivo = archivosPorUrl[url];
    if (!archivo) {
      fallidas.push('una foto se perdió al recargar la página');
      continue;
    }

    const motivo = motivoDeRechazo(archivo);
    if (motivo) {
      fallidas.push(`${archivo.name}: ${motivo}`);
      continue;
    }

    try {
      const asset = await subirMedia(archivo, archivo.name);
      await apiImagenes.crear({ product: productoId, asset: asset.id, position: indice });
      subidas += 1;
    } catch (error) {
      fallidas.push(`${archivo.name}: ${error?.firstDetail ?? error?.message ?? 'error al subir'}`);
    }
  }

  // Las que se han quitado en el formulario. Se borra el `ProductImage` (la colocación en
  // la ficha), NO el archivo de la biblioteca: la foto puede estar en uso en otro sitio y
  // `MediaAsset` está protegido contra el borrado en cascada.
  const quedan = new Set(enGaleria);
  for (const previa of previas) {
    if (!previa?.id || !previa.url || quedan.has(previa.url)) continue;
    try {
      await apiImagenes.borrar(previa.id);
      borradas += 1;
    } catch (error) {
      fallidas.push(`no se pudo quitar una foto: ${error?.firstDetail ?? error?.message ?? 'error'}`);
    }
  }

  return { subidas, borradas, fallidas };
}

/**
 * Crea o actualiza. Devuelve `{ok, producto|mensaje}` en vez de lanzar, para que la
 * pantalla decida qué enseñar.
 *
 * @param {object} formulario
 * @param {object} opciones
 * @param {string} [opciones.id] Si viene, es edición (PATCH); si no, alta (POST).
 * @param {string} [opciones.familiaId]
 * @param {string} [opciones.publicadoEn]
 * @param {{id: string, url: string}[]} [opciones.imagenesPrevias] Las fotos que la ficha
 *   ya tenía (`producto.imagenesDetalle`), para borrar las que se hayan quitado.
 */
export async function guardarProducto(formulario, {
  id, familiaId, publicadoEn, familiaPorDefecto, categoriaPanel, imagenesPrevias = [],
} = {}) {
  const esBorrador = formulario.estado !== 'Activo';

  // PUBLICAR: se comprueba ANTES de salir a la red, para poder decir TODO lo que falta de
  // una vez y con el nombre que tiene el campo en el formulario. El backend valida lo
  // mismo, pero de uno en uno y con nombres de modelo ('design_code'), que dentro de un
  // toast no le dicen nada a nadie.
  if (!esBorrador) {
    const faltan = [];
    const nombre = typeof formulario.nombre === 'object' ? formulario.nombre?.es : formulario.nombre;
    if (!String(nombre ?? '').trim()) faltan.push('Nombre');
    if (!familiaId) faltan.push('Familia de producto');
    if (!formulario.sku) faltan.push('Número de diseño (SKU)');
    // El precio solo se exige si la pieza se vende; las de «solo consulta»
    // (`on_request`: atelier, archivo) se publican sin él, igual que el CheckConstraint
    // `catalog_product_price_required_when_active` de la base de datos.
    const aConsultar = formulario.modoVenta === 'on_request';
    if (!aConsultar
      && (formulario.precio === undefined || formulario.precio === null || formulario.precio === '')) {
      faltan.push('Precio');
    }
    if (faltan.length) {
      return {
        ok: false,
        campos: faltan,
        mensaje: `Para publicar falta${faltan.length === 1 ? '' : 'n'}: ${faltan.join(', ')}. `
          + 'Puedes guardarlo como borrador y completarlo luego.',
      };
    }
  }

  // La categoría del panel ('cat7') no existe en la base de datos: se resuelve —creándola
  // si hace falta— a una `Category` real ANTES de guardar. Sin esto el producto se
  // guardaba sin categoría y luego no aparecía en el listado de esa categoría, que filtra
  // por slug (`?category=…`). Es el bug de «lo guardo y no sale en ninguna parte».
  let categoriaId;
  let categoriaFallida = false;
  const panel = categoriaPanel || (formulario.categoriaNombre
    ? { id: formulario.categoriaId, nombre: formulario.categoriaNombre }
    : null);
  if (panel?.nombre) {
    const resuelta = await asegurarCategoria(panel);
    if (resuelta) categoriaId = resuelta.id;
    else categoriaFallida = true;
  }

  const cuerpo = formularioAApi(formulario, { familiaId, publicadoEn, categoriaId });
  const rellenado = [];

  // UN BORRADOR SE GUARDA SIEMPRE. Tres campos son obligatorios en la base de datos
  // (`family` es FK not-null, `name` y `design_code` no admiten vacío), así que en vez de
  // bloquear el guardado se rellenan con un mínimo razonable y se AVISA de cuáles.
  // Perder el trabajo por no haber decidido todavía el nombre no ayuda a nadie; inventar
  // datos a escondidas, tampoco.
  if (esBorrador && !id) {
    if (!cuerpo.name) {
      cuerpo.name = 'Borrador sin título';
      rellenado.push('nombre');
    }
    if (!cuerpo.family && familiaPorDefecto) {
      cuerpo.family = familiaPorDefecto;
      rellenado.push('familia');
    }
    if (!cuerpo.design_code) {
      // Único dentro de la familia. El sufijo temporal evita chocar con otro borrador.
      cuerpo.design_code = `B${String(Date.now()).slice(-6)}`;
      rellenado.push('código de diseño');
    }
    // El precio ya NO hace falta: el backend solo lo exige al publicar.
  }

  // Al publicar sí se exige familia: es FK obligatoria y no se puede adivinar.
  if (!id && !cuerpo.family) {
    return {
      ok: false,
      mensaje: 'Elige una familia de producto: es obligatoria. Si aún no la sabes, guarda como borrador.',
    };
  }

  // El guardado del producto y el de sus fotos son DOS operaciones, y se tratan como
  // tales: solo la primera decide si el producto se ha guardado. Antes iban en el mismo
  // `try`, así que cualquier fallo subiendo una foto —incluido un TypeError del propio
  // panel— se contaba como «No se ha guardado», con el producto ya creado en el servidor
  // y el listado sin recargar. Era exactamente el bug de «le doy a guardar y no pasa
  // nada»: sí pasaba, pero nadie lo decía.
  let producto;
  try {
    producto = id
      ? await apiProductos.actualizar(id, cuerpo)
      : await apiProductos.crear(cuerpo);
  } catch (error) {
    // Los errores por campo del backend se devuelven tal cual para poder pintarlos donde
    // toca; `mensaje` es el resumen para un toast.
    if (!(error instanceof ApiError)) throw error;
    return {
      ok: false,
      error,
      detalles: error?.details ?? {},
      // Con el nombre del campo delante: «Este campo es requerido.» a secas no decía
      // cuál, que era exactamente la queja.
      mensaje: describirErrorApi(error),
    };
  }

  // Las fotos van después: necesitan el id del producto. Si alguna falla, el producto ya
  // está guardado — se informa de cuáles, no se deshace todo ni se da el guardado por
  // fallido.
  let fotos = { subidas: 0, borradas: 0, fallidas: [] };
  try {
    fotos = await sincronizarImagenes(
      producto.id,
      formulario.imagenes,
      formulario.archivosPorUrl,
      imagenesPrevias
    );
  } catch (error) {
    fotos = { subidas: 0, borradas: 0, fallidas: [error?.message ?? 'error inesperado con las fotos'] };
  }

  return {
    ok: true,
    producto,
    perdidos: camposQueNoSeGuardan(formulario),
    rellenado,
    fotos,
    categoriaFallida,
  };
}
