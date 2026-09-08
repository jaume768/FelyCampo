import { NextIntlClientProvider } from 'next-intl';
import Navbar from './Navbar';
import messages from '../../../../messages/es.json';

export default {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const Principal = {};

export const Transparente = {
  args: { transparent: true, crecerLogo: true },
  render: (args) => (
    <div style={{ background: 'linear-gradient(135deg, #E92174, #1a1a1a)', minHeight: '1600px' }}>
      <Navbar {...args} />
    </div>
  ),
};

// Variante de ProductHero (Tienda/Atelier): logo blanco pero a tamaño
// normal, sin crecer — a diferencia de "Transparente" (home) de
// arriba. Sin data-navbar-hero real en el DOM, el efecto de scroll
// cae al umbral fijo de siempre (ver Navbar.jsx).
export const TransparenteConProductHero = {
  args: { transparent: true, crecerLogo: false },
  render: (args) => (
    <div style={{ background: 'linear-gradient(135deg, #E92174, #1a1a1a)', minHeight: '1600px' }}>
      <Navbar {...args} />
    </div>
  ),
};
