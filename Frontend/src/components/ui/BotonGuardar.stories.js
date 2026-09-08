import { NextIntlClientProvider } from 'next-intl';
import BotonGuardar from './BotonGuardar';
import messages from '../../../messages/es.json';

export default {
  title: 'UI/BotonGuardar',
  component: BotonGuardar,
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
  argTypes: {
    variante: {
      control: 'select',
      options: ['icono', 'solido', 'compacto'],
      description: 'Icono = caja fija de 20px, sin fondo (badge de wishlist sobre foto de producto, ej. TarjetaProducto). Solido = cuadrado en tinta, tan alto como su hermano en la fila (ej. FichaProductoAcciones). Compacto = mismo icono de 18px sin fondo pero sin caja fija — el hueco de clic lo da el padding, no un ancho/alto impuesto (ej. esquina de un panel suelto).',
    },
  },
};

export const Interactivo = {
  render: () => (
    <div style={{ padding: '24px' }}>
      <BotonGuardar />
    </div>
  ),
};

export const Compacto = {
  args: { variante: 'compacto' },
  render: (args) => (
    <div style={{ padding: '24px' }}>
      <BotonGuardar {...args} />
    </div>
  ),
};
