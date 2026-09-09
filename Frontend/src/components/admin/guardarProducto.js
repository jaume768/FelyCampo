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
 * Las IMÁGENES sí se guardan, en dos pasos (ver `subirImagenes`): el archivo va a la
 * biblioteca de medios y luego se crea el `ProductImage` que lo coloca en la ficha.
 *
 * `categoriaId` merece nota propia: las categorías del panel vienen de
 * `CategoriasProvider` (contexto local, ids tipo 'cat1'), no de `Category` del backend.
 * Solo se manda si el id parece un UUID.
 */

import {
  productos as apiProductos, imagenesProducto as apiImagenes, serializarProductoAdmin,
} from '@/lib/api/adminCatalog';
import { subirMedia, motivoDeRechazo } from '@/lib/api/adminMedia';

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Campos del formulario que hoy no tienen sitio en el modelo. */
export const CAMPOS_SIN_MODELO = [
  'disenadoEn',
  'fabricadoEn',
  'tinturaEstampacion',
  'origenTejido',
  'cuidadoIds',
  'prendas',
  'estampadoId',
  'lookVinculado',
  'resenas',
];

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
  });
}

/**
 * Formulario → cuerpo de la API.
 *
 * @param {object} f Objeto que emite `FormularioProducto` vía `onGuardado`.
 * @param {object} [extra]
 * @param {string} [extra.familiaId] UUID de `Family`. **Obligatorio al crear**.
 * @param {string} [extra.publicadoEn] ISO. Obligatorio si el estado es 'Programado'.
 * @returns {object}
 */
export function formularioAApi(f, { familiaId, publicadoEn } = {}) {
  const datos = {
    nombre: typeof f.nombre === 'object' ? f.nombre.es : f.nombre,
    nombreEn: typeof f.nombre === 'object' ? f.nombre.en : undefined,
    descripcion: typeof f.descripcionCorta === 'object' ? f.descripcionCorta.es : f.descripcionCorta,
    descripcionEn: typeof f.descripcionCorta === 'object' ? f.descripcionCorta.en : undefined,
    // El modelo tiene UNA composición, no una por idioma.
    composicion: typeof f.composicion === 'object' ? f.composicion.es : f.composicion,
    tipo: f.tipo,
    estado: f.estado,
    // Decimal o null: "" no es cero.
    precio: f.precio === undefined ? undefined : f.precio,
  };

  if (familiaId) datos.familiaId = familiaId;
  if (publicadoEn !== undefined) datos.publicadoEn = publicadoEn;

  // Categorías del backend solo si son UUID; las del panel son de un contexto local.
  if (f.categoriaId && ES_UUID.test(f.categoriaId)) datos.categoriaIds = [f.categoriaId];
  // Ídem con la colección: el mock usa códigos ('fw26'), el modelo un UUID.
  if (f.coleccion && ES_UUID.test(f.coleccion)) datos.coleccionId = f.coleccion;

  return serializarProductoAdmin(datos);
}

/**
 * Sube las fotos nuevas y las coloca en la ficha del producto.
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
 * @returns {Promise<{subidas: number, fallidas: string[]}>} Nunca lanza: una foto que
 *   falla no puede tirar abajo un producto que ya se ha guardado bien.
 */
async function subirImagenes(productoId, imagenes = [], archivosPorUrl = {}) {
  let subidas = 0;
  const fallidas = [];

  for (const [indice, url] of imagenes.entries()) {
    // Ya subida (viene del servidor): solo estaba en la galería, no hay nada que hacer.
    if (!url || !url.startsWith('blob:')) continue;

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

  return { subidas, fallidas };
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
 */
export async function guardarProducto(formulario, { id, familiaId, publicadoEn, familiaPorDefecto } = {}) {
  const cuerpo = formularioAApi(formulario, { familiaId, publicadoEn });
  const esBorrador = formulario.estado !== 'Activo';
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

  try {
    const producto = id
      ? await apiProductos.actualizar(id, cuerpo)
      : await apiProductos.crear(cuerpo);

    // Las fotos van después: necesitan el id del producto. Si alguna falla, el producto
    // ya está guardado — se informa de cuáles, no se deshace todo.
    const fotos = await subirImagenes(
      producto.id,
      formulario.imagenes,
      formulario.archivosPorUrl
    );

    return { ok: true, producto, perdidos: camposQueNoSeGuardan(formulario), rellenado, fotos };
  } catch (error) {
    // Los errores por campo del backend se devuelven tal cual para poder pintarlos donde
    // toca; `mensaje` es el resumen para un toast.
    return {
      ok: false,
      error,
      detalles: error?.details ?? {},
      mensaje: error?.firstDetail ?? error?.message ?? 'No se ha podido guardar.',
    };
  }
}
