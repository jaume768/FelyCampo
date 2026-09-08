import HeroCarousel from './HeroCarousel';

const slidesEjemplo = [
  {
    src: '/img/styleguide/prod-tarjeta.webp',
    tipo: 'imagen',
    titulo: 'FW27 New Arrivals',
    ctaTexto: 'Descubre la colección',
    ctaHref: '/archivo/colecciones',
  },
  {
    src: '/img/styleguide/prod-tarjeta-hover.webp',
    tipo: 'imagen',
    titulo: 'Atelier Novias',
    ctaTexto: 'Ver colección',
    ctaHref: '/atelier/novias',
  },
  {
    src: '/img/styleguide/punto-venta.webp',
    tipo: 'imagen',
    titulo: 'Prêt-à-porter',
    ctaTexto: 'Explorar',
    ctaHref: '/tienda',
  },
];

export default {
  title: 'Layout/HeroCarousel',
  component: HeroCarousel,
  parameters: { layout: 'fullscreen' },
};

export const Principal = {
  args: {
    slides: slidesEjemplo,
  },
};

export const UnSoloSlide = {
  args: {
    slides: [slidesEjemplo[0]],
  },
};
