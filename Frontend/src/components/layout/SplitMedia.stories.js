import { NextIntlClientProvider } from 'next-intl';
import SplitMedia from './SplitMedia';
import messages from '../../../messages/es.json';

export default {
  title: 'Layout/SplitMedia',
  component: SplitMedia,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const DosImagenes = {
  args: {
    items: [
      {
        src: '/img/styleguide/punto-venta.webp',
        tipo: 'imagen',
        labelKey: 'splitMedia.item1.label',
        ctaKey: 'splitMedia.item1.cta',
        href: '#',
      },
      {
        src: '/img/styleguide/prod-tarjeta-relacionado.webp',
        tipo: 'imagen',
        labelKey: 'splitMedia.item2.label',
        ctaKey: 'splitMedia.item2.cta',
        href: '#',
      },
    ],
  },
};

export const MixtoImagenVideo = {
  args: {
    items: [
      {
        src: '/img/styleguide/punto-venta.webp',
        tipo: 'imagen',
        labelKey: 'splitMedia.item1.label',
        ctaKey: 'splitMedia.item1.cta',
        href: '#',
      },
      {
        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        tipo: 'video',
        labelKey: 'splitMedia.item2.label',
        ctaKey: 'splitMedia.item2.cta',
        href: '#',
      },
    ],
  },
};

export const VarianteLanding = {
  args: {
    variante: 'landing',
    items: [
      {
        src: '/img/styleguide/punto-venta.webp',
        tipo: 'imagen',
        tituloKey: 'splitMedia.item1.titulo',
        ctaKey: 'splitMedia.item1.cta',
        href: '#',
      },
      {
        src: '/img/styleguide/prod-tarjeta-relacionado.webp',
        tipo: 'imagen',
        tituloKey: 'splitMedia.item2.titulo',
        ctaKey: 'splitMedia.item2.cta',
        href: '#',
      },
    ],
  },
};

export const VarianteImageTitle = {
  args: {
    variante: 'imageTitle',
    items: [
      {
        src: '/img/styleguide/punto-venta.webp',
        tipo: 'imagen',
        tituloKey: 'splitMedia.item1.titulo',
        ctaKey: 'splitMedia.item1.cta',
        href: '#',
      },
      {
        src: '/img/styleguide/prod-tarjeta-relacionado.webp',
        tipo: 'imagen',
        tituloKey: 'splitMedia.item2.titulo',
        ctaKey: 'splitMedia.item2.cta',
        href: '#',
      },
    ],
  },
};
