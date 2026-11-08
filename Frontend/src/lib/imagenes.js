// imagenes.js — atributos de <img> para que cada dispositivo descargue el
// tamaño que necesita.
//
// Las fotos del contenido viven en el almacén de medios (/media/…) y el
// backend guarda junto a cada una sus versiones de 480, 960 y 1600 px con
// nombre fijo: foto.webp → foto.w480.webp, foto.w960.webp, foto.w1600.webp
// (backend/apps/media/variants.py). Aquí solo se construye el srcset: no
// hay que preguntar nada al servidor.
//
// Antes, una tarjeta de 300 px en un móvil descargaba la foto de 2560 px:
// las páginas con cuadrícula pesaban entre 6 y 18 MB.
//
// Uso:
//   <img {...atributosImagen(src, { sizes: '(max-width: 768px) 50vw, 25vw' })} alt="…" />
//   <img {...atributosImagen(src, { sizes: '100vw', prioridad: true })} alt="…" />  ← la foto principal
//
// - sizes: lo que ocupa la imagen en pantalla (si no se sabe, 100vw, que
//   nunca se queda corto).
// - prioridad: la imagen grande de arriba (LCP). Carga inmediata y con
//   prioridad alta; todas las demás, en diferido (loading="lazy").
//
// Lo que no está en /media (fotos fijas del código en /img/, blob: de la
// vista previa del admin, SVG…) sale tal cual, solo con la carga diferida.

export const ANCHOS = [480, 960, 1600];

const REDUCIBLE = /^\/media\/.+\.(webp|jpe?g|png)$/i;

export function srcSetDe(src) {
  if (typeof src !== 'string' || !REDUCIBLE.test(src)) return undefined;
  const base = src.replace(/\.(webp|jpe?g|png)$/i, '');
  // La original como el tamaño mayor (las fotos de la web son de ≤2560 px).
  return [...ANCHOS.map((ancho) => `${base}.w${ancho}.webp ${ancho}w`), `${src} 2560w`].join(', ');
}

export function atributosImagen(src, { sizes = '100vw', prioridad = false } = {}) {
  const srcSet = srcSetDe(src);
  return {
    src,
    ...(srcSet ? { srcSet, sizes } : {}),
    loading: prioridad ? 'eager' : 'lazy',
    decoding: 'async',
    ...(prioridad ? { fetchPriority: 'high' } : {}),
  };
}
