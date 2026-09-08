import MediaLink from './MediaLink';

export default {
  title: 'UI/MediaLink',
  component: MediaLink,
};

export const Principal = {
  args: {
    href: '#',
    image: '/img/styleguide/punto-venta.webp',
    label: 'Novias',
  },
  render: (args) => (
    <div style={{ display: 'flex', height: '320px', width: '420px' }}>
      <MediaLink {...args} />
    </div>
  ),
};

export const Pareja = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', height: '320px', width: '420px' }}>
      <MediaLink href="#" image="/img/styleguide/punto-venta.webp" label="Novias" />
      <MediaLink href="#" image="/img/styleguide/punto-venta.webp" label="Fiesta" />
    </div>
  ),
};
