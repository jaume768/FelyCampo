/* ============================================================
   RUNWAY — Fely Campo. Datos compartidos por la cuadrícula
   (page.js) y la plantilla de cada colección ([coleccion]/page.js).
   Las 9 colecciones de pasarela, de la más reciente (La Colección,
   AW27 — el mismo vídeo del Hero de la home) a la primera (Diafonía,
   AW23).

   "slug" es el nombre en kebab-case; la URL real de cada colección
   añade la temporada en minúsculas al final (ver slugCompleto más
   abajo) — /archivo/runway/dreaming-ss26, /archivo/runway/la-coleccion-aw27...
   Nota: estos slugs son propios de /archivo/runway y NO coinciden con
   los que ya usa el "Destino del CTA" del admin bajo
   /archivo/colecciones/[coleccion] (ver paginasInternas en
   mockData.js) — son dos rutas/esquemas de URL distintos.

   RunwayTarjeta admite "medios" con 1 o 2 elementos (imagen o vídeo,
   ver RunwayTarjeta.jsx): la mayoría solo tiene una imagen de portada
   propia (más el vídeo de La Colección), pero Self World y Zigurat
   llevan 2 a modo de EJEMPLO del "split" a dos columnas — reutilizan
   fotos sueltas de fw27-lacoleccion (no hay todavía una segunda foto
   propia de esas colecciones), solo para enseñar cómo se ve esa
   variante; sustituir por sus propias fotos en cuanto existan.

   "looks" (ver RunwayGaleria.jsx en la ficha de colección): la
   cuadrícula de fotos individuales de la colección. Solo La Colección
   (AW27) tiene un reportaje real completo — las 34 fotos de
   fw27-lacoleccion, mismo criterio que looksLaColeccion en
   src/components/admin/mockData.js (Sección Colecciones del admin) —
   el resto de colecciones no tiene fotos propias por look todavía, así
   que su "cuadrícula" es solo su portada (mismo medios[0] de arriba).
   "productos" (opcional, por look): productos de productosEjemplo.js
   vinculados a ese look concreto — mismo campo `productosVinculados`
   que ya usa FormularioLook.jsx en el admin, aquí en plano porque el
   sitio público no comparte estado con el admin (sin backend real,
   cada uno con su propio mock). De momento solo 3 looks de La
   Colección llevan producto vinculado, a modo de EJEMPLO de cómo se ve
   el lightbox con 1, 2 y 3 prendas (looks 3, 12 y 20) — el resto no
   tiene ninguno todavía.
   "descripcion" (opcional, por look — no confundir con la descripcion
   de la colección más abajo): texto editorial corto del look, se
   muestra bajo "Look X" en el panel del lightbox (ver
   RunwayGaleria.jsx). Mismos 3 looks de EJEMPLO que "productos" —
   el resto no tiene todavía.

   "descripcion" (ver RunwayDescripcion.jsx en la ficha de colección):
   texto editorial a 50% de ancho debajo del hero. Solo La Colección
   (AW27) lleva su texto real — el resto usa lorem ipsum de relleno
   hasta tener la redacción definitiva de cada una.
   "video" (opcional, ver RunwayVideoCierre.jsx): el vídeo de cierre al
   final de la ficha. Solo La Colección tiene vídeo propio (reutiliza
   el mismo FW27-Hero3.mp4 del hero) — el resto no lleva este campo
   todavía y esa sección simplemente no se pinta (ver `if (!src)` en
   RunwayVideoCierre.jsx).
   "backstage" (opcional, ver RunwayBackstage.jsx en la ficha de
   colección): fotos de backstage, entre la descripción y la cuadrícula
   de looks — cuadrícula editorial de 10 columnas, no se pinta si el
   array está vacío. Solo La Colección tiene reportaje de backstage
   real (carpeta .../fw27-lacoleccion/backstage) — el resto no lleva
   este campo todavía.
   ============================================================ */

import { productosEjemplo } from '@/components/layout/productosEjemplo';

// Texto de relleno para "descripcion" de las colecciones que todavía
// no tienen su redacción definitiva (ver nota de "descripcion" arriba).
const LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

const looksLaColeccion = Array.from({ length: 34 }, (_, indice) => {
  const numero = indice + 1;
  const productos = numero === 3 ? [productosEjemplo[0]]
    : numero === 12 ? [productosEjemplo[1], productosEjemplo[2]]
      : numero === 20 ? [productosEjemplo[3], productosEjemplo[4], productosEjemplo[5]]
        : [];
  const descripcion = numero === 3
    ? 'Satén y tweed en diálogo: la chaqueta estructurada suaviza su caída sobre una falda de movimiento fluido.'
    : numero === 12
      ? 'Brocado y paillettes para la noche, con accesorios que permiten transformar el look del día a la noche.'
      : numero === 20
        ? 'Tres piezas que se combinan entre sí: prueba de cómo se ve el panel con un trío de productos vinculados.'
        : undefined;
  return {
    imagen: `/img/collections/runway/fw27-lacoleccion/FelyCampo_${String(numero).padStart(2, '0')}.webp`,
    productos,
    descripcion,
  };
});

export const COLECCIONES = [
  {
    slug: 'la-coleccion',
    nombre: 'La Colección',
    temporada: 'AW27',
    medios: [{ src: '/img/collections/runway/fw27-lacoleccion/backstage/HERO-2.jpg' }],
    looks: looksLaColeccion,
    descripcion: 'Esta colección celebra la riqueza de los tejidos y la elegancia de sus combinaciones. Desde la suavidad y el brillo del satén hasta la textura envolvente del tweed y los brocados, cada material aporta carácter y sofisticación. Los paillettes y la paleta que va del beige al negro, con delicados toques de rosa viejo, añaden un juego de luces y matices que atraen la mirada y enriquecen cada prenda. Los abrigos se presentan con formas envolventes y el prêt-à-porter se caracteriza por su versatilidad, capaz de transformarse del día a la noche con pequeños cambios en los accesorios. Todos los tejidos han sido seleccionados por su calidad y sostenibilidad, asegurando que las prendas puedan disfrutarse temporada tras temporada, de un armario a otro, con elegancia y conciencia.',
    video: '/img/FW27-Hero3.mp4',
    backstage: [
      '/img/collections/runway/fw27-lacoleccion/backstage/FelyCampo_AW2026_KristenWicce_ALTA-30.jpg',
      '/img/collections/runway/fw27-lacoleccion/backstage/FelyCampo_AW2026_KristenWicce_ALTA-183.jpg',
      '/img/collections/runway/fw27-lacoleccion/backstage/FelyCampo_AW2026_KristenWicce_ALTA-48.jpg',
      '/img/collections/runway/fw27-lacoleccion/backstage/FelyCampo_AW2026_KristenWicce_ALTA-58.jpg',
      '/img/collections/runway/fw27-lacoleccion/backstage/FelyCampo_AW2026_KristenWicce_ALTA-79.jpg',
      '/img/collections/runway/fw27-lacoleccion/backstage/FRAMAE_STUDIO_FELY_CAMPO_036.jpg',
    ],
  },
  {
    slug: 'dreaming',
    nombre: 'Dreaming',
    temporada: 'SS26',
    medios: [{ src: '/img/collections/runway/SS26_dreaming-cover.webp' }],
    looks: [{ imagen: '/img/collections/runway/SS26_dreaming-cover.webp', productos: [] }],
    descripcion: LOREM_IPSUM,
  },
  {
    slug: 'self-world',
    nombre: 'Self World',
    temporada: 'AW26',
    // Ejemplo del "split" a dos columnas (ver medios.length en
    // RunwayTarjeta.jsx) — de momento reutiliza dos fotos sueltas de
    // fw27-lacoleccion (no hay todavía una segunda foto propia de esta
    // colección), solo para enseñar cómo se ve la variante de 2 medios.
    medios: [
      { src: '/img/collections/runway/fw27-lacoleccion/FelyCampo_05.webp' },
      { src: '/img/collections/runway/fw27-lacoleccion/FelyCampo_06.webp' },
    ],
    looks: [{ imagen: '/img/collections/runway/FW26_selfworld-cover.webp', productos: [] }],
    descripcion: LOREM_IPSUM,
  },
  {
    slug: 'lei-zu',
    nombre: 'Lei Zu',
    temporada: 'SS25',
    medios: [{ src: '/img/collections/runway/SS25_leizu-cover.webp' }],
    looks: [{ imagen: '/img/collections/runway/SS25_leizu-cover.webp', productos: [] }],
    descripcion: LOREM_IPSUM,
  },
  {
    slug: 'the-way-here',
    nombre: 'The Way Here',
    temporada: 'AW25',
    medios: [{ src: '/img/collections/runway/FW25_thewayhere-cover.webp' }],
    looks: [{ imagen: '/img/collections/runway/FW25_thewayhere-cover.webp', productos: [] }],
    descripcion: LOREM_IPSUM,
  },
  {
    slug: 'zigurat',
    nombre: 'Zigurat',
    temporada: 'SS24',
    // Segundo ejemplo del "split" — mismo criterio que Self World arriba.
    medios: [
      { src: '/img/collections/runway/fw27-lacoleccion/FelyCampo_10.webp' },
      { src: '/img/collections/runway/fw27-lacoleccion/FelyCampo_11.webp' },
    ],
    looks: [{ imagen: '/img/collections/runway/SS24_zigurat-cover.webp', productos: [] }],
    descripcion: LOREM_IPSUM,
  },
  {
    slug: 'tempore',
    nombre: 'Tempore',
    temporada: 'AW24',
    medios: [{ src: '/img/collections/runway/FW24_tempore-cover.webp' }],
    looks: [{ imagen: '/img/collections/runway/FW24_tempore-cover.webp', productos: [] }],
    descripcion: LOREM_IPSUM,
  },
  {
    slug: 'nagare',
    nombre: 'Nagare',
    temporada: 'SS23',
    medios: [{ src: '/img/collections/runway/SS23_nagare-cover.webp' }],
    looks: [{ imagen: '/img/collections/runway/SS23_nagare-cover.webp', productos: [] }],
    descripcion: LOREM_IPSUM,
  },
  {
    slug: 'diafonia',
    nombre: 'Diafonía',
    temporada: 'AW23',
    medios: [{ src: '/img/collections/runway/FW23_diafonia-cover.webp' }],
    looks: [{ imagen: '/img/collections/runway/FW23_diafonia-cover.webp', productos: [] }],
    descripcion: LOREM_IPSUM,
  },
];

// /archivo/runway/dreaming-ss26, /archivo/runway/la-coleccion-aw27...
export function slugCompleto(coleccion) {
  return `${coleccion.slug}-${coleccion.temporada.toLowerCase()}`;
}
