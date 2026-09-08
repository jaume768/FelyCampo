import { useState } from 'react';
import LineaCarrito from './LineaCarrito';

export default {
  title: 'Ecommerce/LineaCarrito',
  component: LineaCarrito,
  argTypes: {
    imagen: {
      control: 'text',
      description: 'URL de la miniatura del producto.',
    },
    nombre: {
      control: 'text',
      description: 'Nombre del producto.',
    },
    talla: {
      control: 'text',
      description: 'Talla elegida — si se omite, no se muestra la línea "Talla: ...".',
    },
    precio: {
      control: 'text',
      description: 'Precio de la línea.',
    },
    cantidad: {
      control: 'number',
      description: 'Cantidad actual, se pasa directamente al SelectorCantidad interno.',
    },
    onCantidad: {
      description: 'Evento que se dispara con la nueva cantidad al usar el selector +/-.',
    },
    onQuitar: {
      description: 'Evento que se dispara al pulsar "Quitar".',
    },
  },
};

export const Interactivo = {
  render: () => {
    const [cantidad, setCantidad] = useState(1);
    return (
      <div style={{ maxWidth: '360px' }}>
        <LineaCarrito
          nombre="Vestido Aurora"
          talla="M"
          precio="890 €"
          cantidad={cantidad}
          onCantidad={setCantidad}
          onQuitar={() => alert('Quitar del carrito (demo)')}
        />
      </div>
    );
  },
};
