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
 * Estos NO se mandan (no existen en el catálogo), y por eso no se guardan. Están
 * enumerados aquí y en `docs/CONTRATO.md` en vez de desaparecer en silencio:
 *
 *   estampadoId
 *       No hay modelo de estampado; `Colorway` referencia un `Color`.
 *   lookVinculado
 *       No existe el modelo `Look` (docs/CONTRATO.md, C-3).
 *   resenas
 *       No existe el modelo `Review` (docs/CONTRATO.md, C-1).
 *
 * Lo que SÍ se guarda ya, y antes no:
 *
 *   composicion, cuidados, disenadoEn, fabricadoEn, tinturaEstampacion, origenTejido
 *       Campos bilingües del propio `Product` desde la migración 0007. Los iconos de
 *       cuidado van por su código en `care_codes`, no por su texto.
 *   colorIds, tallas[].stock
 *       En `Colorway`/`Variant`, que es donde vive el catálogo de verdad — ver
 *       `sincronizarColorways`. El stock es de la `Variant`: color + talla.
 *   prendas
 *       En `ProductPiece` (migración 0008). NO es `BundleComponent`: ese apunta a una
 *       `Variant` real para descontar stock de un conjunto; esto es descriptivo.
 *   coleccion
 *       Se resuelve del código del panel ('FW27') a la `Collection` real, creándola si
 *       hace falta (`asegurarColeccion`). Antes solo se mandaba si «parecía un UUID»,
 *       cosa que no pasaba nunca.
 *
 * Las IMÁGENES sí se guardan, en dos pasos (ver `sincronizarImagenes`): el archivo va a la
 * biblioteca de medios y luego se crea el `ProductImage` que lo coloca en la ficha.
 *
 * `categoriaId` merece nota propia: las categorías del panel vienen de
 * `CategoriasProvider` (contexto local, ids tipo 'cat1'), no de `Category` del backend.
 * Solo se manda si el id parece un UUID.
 */

import {
  productos as apiProductos, imagenesProducto as apiImagenes,
  colorways as apiColorways, variantes as apiVariantes,
  serializarProductoAdmin, asegurarCategoria, asegurarColeccion, asegurarColor, asegurarTalla,
  describirErrorApi,
} from '@/lib/api/adminCatalog';
import { slugify } from '@/lib/slugify';
import { ApiError } from '@/lib/api/errors';
import { subirMedia, motivoDeRechazo } from '@/lib/api/adminMedia';

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `Size.code` de la API → el valor con el que el formulario compara.
 *
 * La escala del sitio son NÚMEROS (`TALLAS_DISPONIBLES` hace `Number(talla)`), y la API
 * devuelve el código como cadena. El formulario marca la talla con
 * `tallas.find((f) => f.talla === t)`, y `'36' === 36` es `false`: el stock se guardaba
 * bien pero al reabrir la ficha no aparecía ninguna talla seleccionada.
 *
 * Se convierte solo lo que es numérico, para no romper una escala de letras (S/M/L) el
 * día que exista.
 *
 * @param {string|number|null|undefined} codigo
 * @returns {string|number|null}
 */
export function codigoTallaDelFormulario(codigo) {
  if (codigo === null || codigo === undefined || codigo === '') return null;
  const texto = String(codigo).trim();
  return /^\d+$/.test(texto) ? Number(texto) : texto;
}

/**
 * Campos del formulario que hoy no se guardan, y cómo se llaman de cara al usuario.
 *
 * `tallas` y `colorIds` YA NO están aquí: se guardan de verdad, en `Colorway`/`Variant`
 * (ver `sincronizarColorways`). Tampoco los cuatro orígenes ni los iconos de cuidado, que
 * ahora son campos del propio `Product`.
 */
export const ETIQUETA_CAMPO_SIN_MODELO = {
  estampadoId: 'Estampado',
  lookVinculado: 'Look de pasarela',
  resenas: 'Reseñas',
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
 *   colorIds / tallas   │ colorways[].color_detail / .variants[]
 *   nombre.en           │ nombreEn — se perdía al guardar: el formulario
 *                       │ mandaba '' y machacaba el `name_en` guardado
 *
 * `tallas` y `colorIds` se reconstruyen desde los colorways, que es donde viven de
 * verdad. El stock que se enseña es el del primer color: la rejilla del formulario es
 * una sola por pestaña.
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

  // Colores y tallas viven en los colorways, no en el producto. El formulario los quiere
  // planos: los códigos de color de la lista del panel y una fila por talla con su stock.
  const colorways = (producto.colorways || []).filter((cw) => cw.is_active !== false);
  const colorIds = colorways.map((cw) => cw.color_detail?.code).filter(Boolean);
  // El stock es por colorway. El formulario solo tiene una rejilla de tallas por pestaña,
  // así que se enseña la del primer color; editar el resto es cosa de /admin/stock.
  const tallas = (colorways[0]?.variants || [])
    .filter((v) => v.is_active !== false)
    .map((v) => ({ talla: codigoTallaDelFormulario(v.size_detail?.code), stock: v.stock ?? 0 }))
    .filter((t) => t.talla !== null && t.talla !== undefined && t.talla !== '');

  return {
    ...producto,
    nombre: { es: producto.nombre || '', en: producto.nombreEn || '' },
    descripcionCorta: { es: producto.descripcion || '', en: producto.descripcionEn || '' },
    composicion: { es: producto.composicion || '', en: producto.composicionEn || '' },
    cuidados: { es: producto.cuidados || '', en: producto.cuidadosEn || '' },
    // `cuidadoIds`, `disenadoEn`, `fabricadoEn`, `tinturaEstampacion` y `origenTejido`
    // ya vienen con la forma correcta desde `adaptarProductoAdmin`, así que los hereda
    // el spread de arriba.
    categoriaId: delPanel?.id || '',
    coleccion: producto.coleccion?.code || '',
    colorIds,
    tallas,
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
 * @param {string} [extra.coleccionId] UUID de `Collection` ya resuelto (ver
 *   `asegurarColeccion`): el desplegable del panel maneja códigos ('FW27').
 * @returns {object}
 */
export function formularioAApi(f, { familiaId, publicadoEn, categoriaId, coleccionId } = {}) {
  const datos = {
    nombre: typeof f.nombre === 'object' ? f.nombre.es : f.nombre,
    nombreEn: typeof f.nombre === 'object' ? f.nombre.en : undefined,
    descripcion: typeof f.descripcionCorta === 'object' ? f.descripcionCorta.es : f.descripcionCorta,
    descripcionEn: typeof f.descripcionCorta === 'object' ? f.descripcionCorta.en : undefined,
    // La composición ya es bilingüe en el modelo (`composition` / `composition_en`).
    composicion: typeof f.composicion === 'object' ? f.composicion.es : f.composicion,
    composicionEn: typeof f.composicion === 'object' ? f.composicion.en : undefined,
    // Iconos de cuidado: se mandan sus CÓDIGOS ('wash_40'), y el texto libre aparte.
    cuidadoIds: f.cuidadoIds,
    cuidados: typeof f.cuidados === 'object' ? f.cuidados?.es : f.cuidados,
    cuidadosEn: typeof f.cuidados === 'object' ? f.cuidados?.en : undefined,
    // Prendas del producto, cada una con su código.
    prendas: f.prendas,
    // Los cuatro «orígenes», tal cual ({es, en}); `serializarProductoAdmin` los reparte.
    disenadoEn: f.disenadoEn,
    fabricadoEn: f.fabricadoEn,
    tinturaEstampacion: f.tinturaEstampacion,
    origenTejido: f.origenTejido,
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
  // Ídem con la colección: el panel usa códigos ('FW27'), el modelo un UUID. Antes solo
  // se mandaba si el valor «parecía un UUID» —que no pasaba nunca—, así que la colección
  // no se guardaba jamás. Ahora llega ya resuelta desde `asegurarColeccion`.
  const uuidColeccion = coleccionId
    || (f.coleccion && ES_UUID.test(f.coleccion) ? f.coleccion : null);
  if (uuidColeccion) datos.coleccionId = uuidColeccion;

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
 * Deja los colores, tallas y stock del producto como los dejó el formulario.
 *
 * Es el tercer paso del guardado, y el que faltaba entero: el formulario editaba colores,
 * tallas y stock y no se guardaba nada, porque en el catálogo **no son campos de
 * `Product`**. Cuelgan de dos modelos más:
 *
 *     Product → Colorway (un color, dueño del SKU) → Variant (una talla, dueña del stock)
 *
 * Además, la tabla `Color` estaba vacía, así que cada color de la lista del panel se crea
 * la primera vez que se usa (`asegurarColor`).
 *
 * Un colorway cuyo color ya no está seleccionado se DESACTIVA (`is_active: false`) en vez
 * de borrarse: su SKU puede estar en pedidos antiguos, igual que archivar en vez de
 * borrar un producto.
 *
 * @param {string} productoId
 * @param {{colores?: object[], colorIds?: string[], tallas?: {talla: string, stock: number}[]}[]} pestanas
 *   Una por pestaña de «variante de color» del formulario.
 * @param {object[]} [previos] `producto.colorways` tal como los devolvió la API.
 * @returns {Promise<{colores: number, variantes: number, desactivados: number, avisos: string[]}>}
 *   Nunca lanza: el producto ya está guardado cuando se llama a esto.
 */
async function sincronizarColorways(productoId, pestanas = [], previos = []) {
  const resumen = { colores: 0, variantes: 0, desactivados: 0, avisos: [] };

  const porColorId = new Map(previos.map((cw) => [cw.color, cw]));
  const vigentes = new Set();
  let posicion = 0;

  for (const pestana of pestanas) {
    const seleccionados = pestana?.colores?.length
      ? pestana.colores
      : (pestana?.colorIds || []).map((id) => ({ id }));
    const tallasDePestana = (pestana?.tallas || []).filter((t) => t?.talla);

    if (!seleccionados.length) {
      if (tallasDePestana.length) {
        resumen.avisos.push('las tallas necesitan un color: el stock no se ha guardado en esa pestaña');
      }
      continue;
    }

    for (const [indice, colorPanel] of seleccionados.entries()) {
      const color = await asegurarColor(colorPanel);
      if (!color) {
        resumen.avisos.push(`no se pudo crear el color «${colorPanel?.id}»`);
        continue;
      }

      let colorway = porColorId.get(color.id);
      try {
        if (colorway) {
          if (!colorway.is_active) await apiColorways.actualizar(colorway.id, { is_active: true });
        } else {
          colorway = await apiColorways.crear({
            product: productoId, color: color.id, position: posicion, is_active: true,
          });
          resumen.colores += 1;
        }
      } catch (error) {
        resumen.avisos.push(`color «${colorPanel?.id}»: ${error?.firstDetail ?? error?.message ?? 'no se pudo guardar'}`);
        continue;
      }
      vigentes.add(colorway.id);
      posicion += 1;

      // El stock es de UN color concreto. Si la pestaña tiene varios, repartir la misma
      // cifra entre todos inventaría inventario que no existe: se aplica al primero y los
      // demás se crean a cero, dicho en voz alta.
      const soloPrimero = indice > 0;
      if (soloPrimero && tallasDePestana.some((t) => Number(t.stock) > 0)) {
        resumen.avisos.push(
          `«${colorPanel?.id}» se ha creado con las mismas tallas pero a 0: el stock que escribiste es de un solo color`
        );
      }

      const previasDelColorway = new Map(
        (colorway.variants || []).map((v) => [v.size_detail?.code ?? v.size, v])
      );

      for (const [orden, fila] of tallasDePestana.entries()) {
        const talla = await asegurarTalla(fila.talla, orden);
        if (!talla) {
          resumen.avisos.push(`no se pudo crear la talla «${fila.talla}»`);
          continue;
        }
        const stock = soloPrimero ? 0 : Math.max(0, Number(fila.stock) || 0);
        const previa = previasDelColorway.get(fila.talla);
        try {
          if (previa) {
            await apiVariantes.actualizar(previa.id, { stock, is_active: true });
          } else {
            await apiVariantes.crear({ colorway: colorway.id, size: talla.id, stock, is_active: true });
          }
          resumen.variantes += 1;
        } catch (error) {
          resumen.avisos.push(`talla ${fila.talla}: ${error?.firstDetail ?? error?.message ?? 'no se pudo guardar'}`);
        }
      }

      // Tallas que ya no están en el formulario: se desactivan, no se borran (pueden
      // aparecer en pedidos antiguos).
      const tallasVigentes = new Set(tallasDePestana.map((t) => t.talla));
      for (const [codigo, variante] of previasDelColorway) {
        if (tallasVigentes.has(codigo) || !variante.is_active) continue;
        try {
          await apiVariantes.actualizar(variante.id, { is_active: false });
        } catch {
          // Que no se pueda desactivar una talla no invalida el resto del guardado.
        }
      }
    }
  }

  for (const colorway of previos) {
    if (vigentes.has(colorway.id) || !colorway.is_active) continue;
    try {
      await apiColorways.actualizar(colorway.id, { is_active: false });
      resumen.desactivados += 1;
    } catch {
      // Ídem: informativo, no bloqueante.
    }
  }

  return resumen;
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
 * @param {object[]} [opciones.pestanasColor] Todas las pestañas de «variante de color»
 *   del formulario. Por defecto, solo la del propio `formulario`.
 * @param {object[]} [opciones.colorwaysPrevios] `producto.colorways` de la API, para no
 *   duplicar los que ya existen.
 */
export async function guardarProducto(formulario, {
  id, familiaId, publicadoEn, familiaPorDefecto, categoriaPanel, imagenesPrevias = [],
  pestanasColor, colorwaysPrevios = [],
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

  // La colección del panel es un código ('FW27'), no un UUID: se resuelve —creándola si
  // hace falta— antes de guardar, igual que la categoría.
  let coleccionId;
  let coleccionFallida = false;
  if (formulario.coleccion) {
    const resuelta = await asegurarColeccion({
      codigo: formulario.coleccion,
      nombre: formulario.coleccionNombre || formulario.coleccion,
    });
    if (resuelta) coleccionId = resuelta.id;
    else coleccionFallida = true;
  }

  const cuerpo = formularioAApi(formulario, {
    familiaId, publicadoEn, categoriaId, coleccionId,
  });
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

  // Colores, tallas y stock: viven en `Colorway`/`Variant`, no en `Product`, así que son
  // su propia tanda de peticiones. Como las fotos, un fallo aquí no invalida un producto
  // que ya está guardado.
  let inventario = { colores: 0, variantes: 0, desactivados: 0, avisos: [] };
  try {
    inventario = await sincronizarColorways(
      producto.id,
      pestanasColor || [formulario],
      colorwaysPrevios
    );
  } catch (error) {
    inventario = {
      colores: 0, variantes: 0, desactivados: 0,
      avisos: [error?.message ?? 'error inesperado con los colores y tallas'],
    };
  }

  return {
    ok: true,
    producto,
    perdidos: camposQueNoSeGuardan(formulario),
    rellenado,
    fotos,
    inventario,
    categoriaFallida,
    coleccionFallida,
  };
}
