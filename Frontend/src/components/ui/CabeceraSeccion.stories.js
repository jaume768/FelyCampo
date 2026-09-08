import { NextIntlClientProvider } from 'next-intl';
import CabeceraSeccion from './CabeceraSeccion';
import Boton from './Boton';
import messages from '../../../messages/es.json';

export default {
  title: 'UI/CabeceraSeccion',
  component: CabeceraSeccion,
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

// Con children — un botón suelto debajo del grupo título. Mismo uso
// que la cabecera de CuadriculaProductos.
export const ConBoton = {
  args: {
    subtitleKey: 'cuadriculaProductos.novedades',
    titleKey: 'cuadriculaProductos.coleccion',
    descriptionKey: 'cuadriculaProductos.novedadesDescripcion',
  },
  render: (args) => (
    <CabeceraSeccion {...args}>
      <Boton variante="flecha" href="#">Ver colección</Boton>
    </CabeceraSeccion>
  ),
};

// Sin children — solo el grupo título.
export const SoloTitulo = {
  args: {
    subtitleKey: 'cuadriculaProductos.novedades',
    titleKey: 'cuadriculaProductos.coleccion',
  },
};
