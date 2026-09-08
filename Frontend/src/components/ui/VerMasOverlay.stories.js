import { NextIntlClientProvider } from 'next-intl';
import VerMasOverlay from './VerMasOverlay';
import TarjetaProducto from '../ecommerce/TarjetaProducto';
import messages from '../../../messages/es.json';

const IMG = '/img/styleguide/prod-tarjeta.webp';
const IMG_HOVER = '/img/styleguide/prod-tarjeta-hover.webp';

// El botón nace con opacity:0 (solo se revela con ".cuadricula:hover"
// en CuadriculaProductos, ver su module.css) — aquí no hay esa
// cuadrícula alrededor, así que lo forzamos visible para poder verlo
// en Storybook sin depender de ese hover.
const forzarVisible = <style>{'.vermas-overlay { opacity: 1 !important; }'}</style>;

export default {
  title: 'UI/VerMasOverlay',
  component: VerMasOverlay,
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const Solo = {
  render: (args) => (
    <div style={{ position: 'relative', width: 260, height: 340, background: '#ccc' }}>
      {forzarVisible}
      <VerMasOverlay {...args} />
    </div>
  ),
  args: {
    href: '#',
  },
};

export const SobreUltimaTarjeta = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 160px)', gap: '16px' }}>
      {forzarVisible}
      <TarjetaProducto imagen={IMG} imagenHover={IMG_HOVER} nombre="Falda Vera" precio="420 €" />
      <TarjetaProducto imagen={IMG} imagenHover={IMG_HOVER} nombre="Vestido Aurora" precio="890 €" />
      <TarjetaProducto imagen={IMG} imagenHover={IMG_HOVER} nombre="Vestido Sol" precio="760 €" />
      <div style={{ position: 'relative' }}>
        <TarjetaProducto imagen={IMG} imagenHover={IMG_HOVER} nombre="Falda Mora" precio="480 €" />
        <VerMasOverlay {...args} />
      </div>
    </div>
  ),
  args: {
    href: '#',
  },
};
