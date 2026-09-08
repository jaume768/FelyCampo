import { useState } from 'react';
import SelectorCantidad from './SelectorCantidad';

export default {
  title: 'UI/SelectorCantidad',
  component: SelectorCantidad,
  argTypes: {
    valor: {
      control: 'number',
      description: 'Cantidad actual mostrada entre los botones +/-.',
    },
    min: {
      control: 'number',
      description: 'Cantidad mínima permitida — por defecto 1, el botón "-" no baja de aquí.',
    },
    onChange: {
      description: 'Evento que se dispara con la nueva cantidad al pulsar + o -.',
    },
  },
};

export const Interactivo = {
  render: () => {
    const [cantidad, setCantidad] = useState(1);
    return <SelectorCantidad valor={cantidad} onChange={setCantidad} />;
  },
};
