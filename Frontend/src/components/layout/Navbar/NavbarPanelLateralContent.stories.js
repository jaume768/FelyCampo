import { NextIntlClientProvider } from 'next-intl';
import NavbarPanelLateralContent from './NavbarPanelLateralContent';
import messages from '../../../../messages/es.json';

const submenuAtelier = {
  items: [
    { key: 'novias', href: '/atelier/novias' },
    { key: 'fiesta', href: '/atelier/fiesta' },
  ],
  image: '/img/styleguide/punto-venta.webp',
};

export default {
  title: 'Layout/Navbar/NavbarPanelLateralContent',
  component: NavbarPanelLateralContent,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <div style={{ width: '420px', height: '600px' }}>
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export const Atelier = {
  args: {
    submenuKey: 'atelier',
    submenu: submenuAtelier,
  },
};
