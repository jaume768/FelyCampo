import { useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import GuiaTallas from './GuiaTallas';
import messages from '../../../messages/es.json';

export default {
  title: 'Ecommerce/GuiaTallas',
  component: GuiaTallas,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

// Interactivo — abre/cierra el panel para poder probar los chips de
// talla, Escape y el atrapado de foco.
export const Interactivo = {
  render: () => {
    function Demo() {
      const [abierto, setAbierto] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setAbierto(true)} style={{ margin: 24 }}>
            Abrir guía de tallas
          </button>
          <GuiaTallas abierto={abierto} onCerrar={() => setAbierto(false)} />
        </>
      );
    }
    return <Demo />;
  },
};
