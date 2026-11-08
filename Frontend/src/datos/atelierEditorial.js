// atelierEditorial.js — la parte editorial (fotos y textos) de
// /atelier/novias, /atelier/fiesta y /pret-a-porter, editable desde la
// pestaña «Página de la web» de Colección Novias, Colección Fiesta y
// Prêt-à-porter en el admin.
//
// SUSTITUTO PROVISIONAL DE LA BASE DE DATOS: la web lo lee a través de
// lib/atelierEditorial.js. Migrado tal cual desde los antiguos
// atelier/novias/noviaEditorial.js, atelier/fiesta/fiestaEditorial.js y la
// frase de la portada de messages/*.json (heroPagina.atelierNovias /
// atelierFiesta). Ver docs/ADMIN.md.
//
//   hero          imagen y subtitulo { es, en } de la portada (el título,
//                 «Atelier Novias» / «Atelier Fiesta», es fijo).
//   descripcion   { es: [párrafos], en: [párrafos] } la introducción.
//   pestanas      (solo Fiesta) los nombres de sus dos pestañas.
//   bloques       [{ id, tipo: 'imagen' | 'video', src, titulo, texto }]:
//                 foto (o vídeo) + texto, en zigzag.
//   backstage     galería final, en orden: rutas de fotos o vídeos (un
//                 vídeo se reconoce por su extensión, .mp4).

export const EDITORIAL_NOVIAS = {
  "hero": {
    "imagen": "/media/web/img/landing/fely-campo-portada-hero-atelier-novia.webp",
    "subtitulo": {
      "es": "Vestidos de novia hechos a medida en nuestro atelier.",
      "en": "Made-to-measure bridal gowns, crafted in our atelier."
    }
  },
  "descripcion": {
    "es": [
      "Cada novia llega con una historia distinta y una manera propia de imaginar el día de su boda. Escucharla es el primer paso para crear su vestido de novia a medida.",
      "De esa historia nace el vestido de novia: primero escuchamos a quien lo llevará; después elegimos los tejidos, trabajamos el patrón y damos forma a cada detalle."
    ],
    "en": [
      "Every bride arrives with a different story, with her own way of understanding that day.",
      "The dress is born from it, never the other way around: first we listen to her, only then do we cut the fabric."
    ]
  },
  "bloques": [
    {
      "id": "novias-bloque-1",
      "tipo": "imagen",
      "src": "/media/web/img/Clientes/fely-campo-invitadas-reales-novias-atelier.webp",
      "titulo": {
        "es": "Una historia, un vestido",
        "en": "One story, one dress"
      },
      "texto": {
        "es": "En nuestro atelier de novias, el punto de partida nunca es el patrón: es la mujer que llevará el vestido. Escuchamos quién es, cómo se mueve y qué quiere sentir el día de su boda. A partir de ahí, trabajamos el diseño, los tejidos y cada detalle para crear un vestido de novia a medida.",
        "en": "In the atelier the starting point is never the pattern: it is the bride. We listen to who she is, how she moves, what she wants to feel on her wedding day, and from there we build every piece, by hand and to her measure."
      }
    },
    {
      "id": "novias-bloque-2",
      "tipo": "imagen",
      "src": "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-02.webp",
      "titulo": {
        "es": "Hecho a mano, para ella",
        "en": "Handmade, for her"
      },
      "texto": {
        "es": "Esa misma forma de trabajar define nuestras colecciones de novia: siluetas depuradas, tejidos nobles y cuidado artesanal en cada costura. Diseños pensados para acompañar a cada mujer con naturalidad, sin imponerse sobre ella.",
        "en": "That same way of working shapes every collection: pared-back silhouettes, noble fabrics and artisanal care in every seam, made to accompany the bride, never to overshadow her."
      }
    }
  ],
  "backstage": [
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-05.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-06.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-07.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-08.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-09.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-10.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-11.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-12.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-01.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-03.webp",
    "/media/web/img/collections/novia/novias-page/fely-campo-atelier-novias-vestido-novia-04.webp"
  ],
};

export const EDITORIAL_FIESTA = {
  "hero": {
    "imagen": "/media/web/img/landing/fely-campo-portada-hero-landing-3-mobile-atelier-3.webp",
    "subtitulo": {
      "es": "Vestidos de fiesta e invitada, hechos a medida.",
      "en": "Made-to-measure evening and guest dresses."
    }
  },
  "descripcion": {
    "es": [
      "Cada ocasión merece su propio vestido de fiesta: una boda, una celebración o una noche que permanece en la memoria. Diseñamos para que cada mujer encuentre su forma de estar y sentirse.",
      "En el atelier, cada vestido de fiesta se trabaja pieza a pieza, a partir de la ocasión, tus preferencias y el asesoramiento de nuestro equipo."
    ],
    "en": [
      "Every occasion calls for its own dress, its own way of shining.",
      "In the atelier we work on that one version, piece by piece, until we find it."
    ]
  },
  "pestanas": {
    "atelier": {
      "es": "Así trabajamos",
      "en": "How we work"
    },
    "colecciones": {
      "es": "Colección fiesta",
      "en": "Evening wear collection"
    }
  },
  "bloques": [
    {
      "id": "fiesta-bloque-1",
      "tipo": "imagen",
      "src": "/media/web/img/collections/fiesta/introduccion/fely-campo-atelier-fiesta-foto-03.webp",
      "titulo": {
        "es": "Un vestido, una noche",
        "en": "One dress, one night"
      },
      "texto": {
        "es": "Cada vestido de fiesta nace de una ocasión concreta: una boda, una gala o una celebración especial. Escuchamos qué momento vas a vivir y trabajamos el diseño a partir de tus preferencias, cuidando la silueta, los tejidos y los detalles.",
        "en": "Every evening piece is born from a specific occasion: a wedding, a gala, a dinner worth remembering. We listen to the moment each client is about to live and build the dress around it."
      }
    },
    {
      "id": "fiesta-bloque-2",
      "tipo": "video",
      "src": "/media/web/img/collections/fiesta/introduccion/felycampo-fiesta-media (1).mp4",
      "titulo": {
        "es": "El detalle que se nota",
        "en": "The detail that shows"
      },
      "texto": {
        "es": "Tejidos nobles, siluetas cuidadas y acabados artesanales definen nuestros vestidos de fiesta. Cada costura refleja una manera de trabajar que pone el oficio y la atención al detalle en el centro.",
        "en": "Noble fabrics, hand-worked silhouettes and an artisanal finish in every seam: the same way of working behind every evening piece."
      }
    }
  ],
  "backstage": [
    "/media/web/img/collections/fiesta/introduccion/fely-campo-atelier-fiesta-video-vestido-rojo-espalda.mp4",
    "/media/web/img/collections/fiesta/introduccion/felycampo-fiesta-media (2).mp4",
    "/media/web/img/collections/fiesta/introduccion/fely-campo-atelier-fiesta-aw2026-162.webp",
    "/media/web/img/collections/fiesta/introduccion/felycampo-fiesta-media (3).mp4",
    "/media/web/img/collections/fiesta/introduccion/fely-campo-atelier-fiesta-aw2026-164.webp"
  ],
};

// /pret-a-porter: el carrusel de la portada (fotos de pasarela recortadas,
// sin fondo, en este orden; se mueve solo) y la descripción bajo el título.
// Migrado del antiguo pret-a-porter/pretAPorterEditorial.js y del carrusel
// fijo de pret-a-porter/page.js. (Los dos bloques de foto + texto que había
// en ese archivo estaban desactivados a petición y no se migran.)
export const EDITORIAL_PRET_A_PORTER = {
  "portada": [
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-02-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-04-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-05-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-08-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-13-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-15-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-16-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-17-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-20-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-22-recorte.webp",
    "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-27-recorte.webp"
  ],
  "descripcion": {
    "es": [
      "La misma firma, para el día a día.",
      "El mismo cuidado, ahora listo para llevar."
    ],
    "en": [
      "The same house, for everyday life.",
      "The same care, now ready to wear."
    ]
  },
};
