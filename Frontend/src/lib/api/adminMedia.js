/**
 * Biblioteca de medios del panel (`/api/v1/admin/media/`).
 *
 * **Solo Client Components**: sesión de staff + CSRF.
 *
 * La subida es **multipart**, no JSON: `client.js` detecta el `FormData` y no le pone
 * `Content-Type` (el navegador tiene que poner el suyo con el `boundary`).
 *
 * El servidor normaliza las imágenes al recibirlas (`apps/media/processing`): las
 * redimensiona a 2560px máximo, las convierte a WebP, genera miniatura y limpia el EXIF.
 * Por eso **no hace falta comprimir en el navegador** antes de subir: el canvas reescala,
 * pero no limpia metadatos ni garantiza un peso razonable.
 *
 * `kind`, `content_type`, peso y dimensiones los deriva el backend del archivo real, no
 * de lo que declare el cliente: una extensión falsa no cuela un tipo distinto.
 */

import { get, post, patch, del } from './client';

/** Límites que aplica el backend (`MediaUploadSerializer`). */
export const MAX_IMAGEN_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const TIPOS_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Sube un archivo a la biblioteca.
 *
 * @param {File|Blob} archivo
 * @param {string} [altText]
 * @returns {Promise<object>} El `MediaAsset` ya procesado (con `id`, `file`, `thumbnail`).
 */
export function subirMedia(archivo, altText = '') {
  const datos = new FormData();
  datos.append('file', archivo);
  if (altText) datos.append('alt_text', altText);
  return post('/admin/media/', datos);
}

/**
 * @param {{page?: number, page_size?: number, kind?: 'image'|'video'}} [params]
 * @returns {Promise<{count: number, results: object[]}>}
 */
export function listarMedia(params = {}) {
  return get('/admin/media/', { params });
}

/**
 * Solo `alt_text` es editable. Sustituir el archivo es un alta nueva, no un PATCH:
 * cambiaría dimensiones, miniatura y tipo a la vez.
 * @param {string} id
 * @param {string} altText
 */
export function actualizarAltText(id, altText) {
  return patch(`/admin/media/${encodeURIComponent(id)}/`, { alt_text: altText });
}

/**
 * Borra un archivo de la biblioteca.
 *
 * Si está en uso devuelve **409** con `details.usages` (dónde se usa), en vez de un
 * IntegrityError opaco: `ProductImage.asset` es `on_delete=PROTECT`. Ese detalle es lo
 * que hay que enseñarle al usuario.
 * @param {string} id
 */
export function borrarMedia(id) {
  return del(`/admin/media/${encodeURIComponent(id)}/`);
}

/**
 * Comprueba el archivo ANTES de subirlo, para no gastar una subida entera en algo que el
 * backend va a rechazar igual.
 * @param {File} archivo
 * @returns {string|null} Motivo del rechazo, o null si vale.
 */
export function motivoDeRechazo(archivo) {
  if (!archivo) return 'No has elegido ningún archivo.';

  const tipo = archivo.type || '';
  const esImagen = TIPOS_IMAGEN.includes(tipo);
  const esVideo = TIPOS_VIDEO.includes(tipo);

  if (!esImagen && !esVideo) return 'Formato no admitido. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV.';

  const maximo = esImagen ? MAX_IMAGEN_BYTES : MAX_VIDEO_BYTES;
  if (archivo.size > maximo) {
    return `El archivo pesa demasiado (máximo ${Math.round(maximo / 1024 / 1024)} MB).`;
  }

  return null;
}
