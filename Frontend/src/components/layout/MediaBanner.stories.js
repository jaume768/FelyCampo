import { NextIntlClientProvider } from 'next-intl';
import MediaBanner from './MediaBanner';
import messages from '../../../messages/es.json';

export default {
  title: 'Layout/MediaBanner',
  component: MediaBanner,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const ConImagen = {
  args: {
    src: '/img/FW27-Hero2.jpg',
    tipo: 'imagen',
    labelKey: 'mediaBanner.label',
    ctaKey: 'mediaBanner.cta',
    href: '#',
  },
};

export const ConVideo = {
  args: {
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    tipo: 'video',
    labelKey: 'mediaBanner.label',
    ctaKey: 'mediaBanner.cta',
    href: '#',
  },
};

export const VarianteImageTitle = {
  args: {
    src: '/img/FW27-Hero2.jpg',
    tipo: 'imagen',
    tituloKey: 'mediaBanner.titulo',
    ctaKey: 'mediaBanner.cta',
    href: '#',
    variante: 'imageTitle',
  },
};
