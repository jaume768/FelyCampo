import { useState } from 'react';
import SelectorTalla from './SelectorTalla';
import { TALLAS_DISPONIBLES } from '../ecommerce/guiaTallasData';

export default {
  title: 'UI/SelectorTalla',
  component: SelectorTalla,
  argTypes: {
    tallas: {
      description: 'Array con todas las tallas disponibles a mostrar, ej. [36,38,40,42,44] (escala Fely Campo, 36 a 64).',
    },
    agotadas: {
      description: 'Array con las tallas sin stock — se muestran tachadas y deshabilitadas.',
    },
    seleccionada: {
      control: 'text',
      description: 'Talla actualmente seleccionada (controla qué botón se marca como activo).',
    },
    onSelect: {
      description: 'Evento que se dispara al elegir una talla no agotada.',
    },
    colapsarEnUnaFila: {
      description: 'Con más tallas de las que caben en una fila, colapsa a la primera + un chip "+" para desplegar el resto (por defecto true).',
    },
  },
};

export const Interactivo = {
  render: () => {
    const [talla, setTalla] = useState(38);
    return (
      <SelectorTalla
        tallas={[36, 38, 40, 42, 44]}
        agotadas={[44]}
        seleccionada={talla}
        onSelect={setTalla}
      />
    );
  },
};

// Rango completo (36 a 64, ver TALLAS_DISPONIBLES en guiaTallasData.js)
// — más tallas de las que caben en una fila, así se ve el colapso a la
// primera fila + chip "+" (clicarlo despliega el resto).
export const RangoCompleto = {
  render: () => {
    const [talla, setTalla] = useState(null);
    return (
      <SelectorTalla
        tallas={TALLAS_DISPONIBLES}
        seleccionada={talla}
        onSelect={setTalla}
      />
    );
  },
};
