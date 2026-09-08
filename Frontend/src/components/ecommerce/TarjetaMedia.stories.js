import TarjetaMedia from './TarjetaMedia';

const GIF = '/img/styleguide/prod-tarjeta.webp';
const VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export default {
  title: 'Ecommerce/TarjetaMedia',
  component: TarjetaMedia,
  argTypes: {
    src: {
      control: 'text',
      description: 'URL de la imagen, gif o vídeo.',
    },
    tipo: {
      control: 'select',
      options: ['imagen', 'video'],
      description: '"imagen" (default, admite gif) o "video" — renderiza <video autoPlay muted loop playsInline>.',
    },
  },
};

export const Base = {
  args: { src: GIF },
  decorators: [(Story) => <div style={{ width: 220, height: 293 }}><Story /></div>],
};

export const Video = {
  args: { src: VIDEO, tipo: 'video' },
  decorators: [(Story) => <div style={{ width: 220, height: 293 }}><Story /></div>],
};

export const EnFila = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, height: 293 }}>
      <div style={{ flex: 1 }}><TarjetaMedia src={GIF} /></div>
      <div style={{ flex: 1 }}><TarjetaMedia src={VIDEO} tipo="video" /></div>
      <div style={{ flex: 1 }}><TarjetaMedia src={GIF} /></div>
    </div>
  ),
};
