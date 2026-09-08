import ImageTitle from './ImageTitle';

export default {
  title: 'UI/ImageTitle',
  component: ImageTitle,
  argTypes: {
    variante: {
      control: 'select',
      options: ['oscuro', 'blanco'],
      description: 'Oscuro (--color-tinta) = default. Blanco (--color-crema) = para fondos oscuros/imágenes, ej. HeroCarousel.',
    },
  },
};

export const Oscuro = {
  args: {
    titulo: 'FW27 New Arrivals',
    ctaTexto: 'Descubre la colección',
    href: '#',
  },
};

export const Blanco = {
  args: {
    titulo: 'FW27 New Arrivals',
    ctaTexto: 'Descubre la colección',
    href: '#',
    variante: 'blanco',
  },
  render: (args) => (
    <div style={{ background: '#1a1a1a', padding: '48px', display: 'inline-block' }}>
      <ImageTitle {...args} />
    </div>
  ),
};
