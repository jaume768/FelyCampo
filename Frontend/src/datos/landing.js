// landing.js — fotos, vídeo, textos y enlaces de la home (/), editables
// desde /admin/landing.
//
// SUSTITUTO PROVISIONAL DE LA BASE DE DATOS (igual que
// datos/atelierFiesta.js): la web lee estos valores a través de
// lib/landing.js, y el admin parte de ellos. Ver docs/ADMIN.md.
//
// Campos (los textos van siempre en { es, en }; los enlaces son rutas de
// la web SIN idioma, "/sobre-fely", y la web les pone /es o /en delante;
// solo se pueden elegir las de PAGINAS_ENLACE de lib/landing.js):
//
//   hero.imagen.escritorio  1.ª diapositiva del carrusel de portada (foto
//                           horizontal). Obligatoria.
//   hero.imagen.movil       La misma foto con recorte vertical para móvil.
//                           Opcional: si está vacía, el móvil usa la de
//                           escritorio.
//   hero.video              2.ª diapositiva (MP4, sin sonido; el carrusel
//                           pasa a la siguiente cuando termina).
//   hero.videoMovil         Versión vertical del vídeo para móvil. Opcional:
//                           si está vacía, el móvil usa hero.video.
//   hero.texto              Frase sobre las dos diapositivas.
//   hero.boton / enlace     Botón debajo de la frase y a dónde lleva.
//
//   atelier.novias / .fiesta  Las dos mitades del bloque Atelier, debajo
//                           de la portada: imagen, titulo, boton, enlace.
//
//   descubre                Bloque "Descubre a Fely": imagen, titulo,
//                           cita (lo que va entre *asteriscos* sale en
//                           cursiva), boton, enlace.

export const LANDING = {
  hero: {
    imagen: {
      escritorio: '/media/web/img/landing/fely-campo-portada-hero-landing.webp',
      movil: '/media/web/img/landing/fely-campo-portada-hero-landing-mobile.webp',
    },
    video: '/media/web/img/hero-main-felycampo.mp4',
    videoMovil: '',
    texto: { es: 'El universo de Fely Campo', en: 'The world of Fely Campo' },
    boton: { es: 'Descubre más', en: 'Discover more' },
    enlace: '/atelier/fiesta',
  },
  atelier: {
    novias: {
      imagen: '/media/web/img/fely-campo-web-splitimage-novias.webp',
      titulo: { es: 'Vestidos de Novia a Medida', en: 'Bridal Atelier' },
      boton: { es: 'Ver todo', en: 'View all' },
      enlace: '/atelier/novias',
    },
    fiesta: {
      imagen: '/media/web/img/landing/fely-campo-portada-hero-landing-3-mobile-atelier-3.webp',
      titulo: { es: 'Vestidos de Fiesta a Medida', en: 'Evening Wear Atelier' },
      boton: { es: 'Ver todo', en: 'View all' },
      enlace: '/atelier/fiesta',
    },
  },
  descubre: {
    imagen: '/media/web/img/about-felycampo/fely-campo-sobre-fely-campo-elegir-27.webp',
    titulo: { es: 'Descubre a Fely', en: 'Discover Fely' },
    cita: {
      es: 'Lo que quiero transmitir con mis vestidos es *un sentimiento y una pasión* por lo que es mi oficio y mi profesión, *la moda*.',
      en: 'What I want to convey through my dresses is *a feeling, a passion* for my craft and my profession, *fashion*.',
    },
    boton: { es: 'Conoce a la diseñadora', en: 'Meet the designer' },
    enlace: '/sobre-fely',
  },
};
