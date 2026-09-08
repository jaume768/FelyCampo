import BloqueSeccion from './BloqueSeccion';

export default {
  title: 'Layout/BloqueSeccion',
  component: BloqueSeccion,
  argTypes: {
    imagen: {
      control: 'text',
      description: 'URL de la imagen del bloque.',
    },
    titulo: {
      control: 'text',
      description: 'Título editorial del bloque (h2).',
    },
    texto: {
      control: 'text',
      description: 'Párrafo de apoyo debajo del título.',
    },
    enlace: {
      control: 'text',
      description: 'Texto del enlace de tipo "texto" al final del bloque. Sin enlace = no se muestra.',
    },
    invertido: {
      control: 'boolean',
      description: 'Cambia el lado de la imagen: por defecto va primero, invertido la manda al otro lado en desktop.',
    },
  },
};

export const Normal = {
  args: {
    titulo: 'Visita el atelier',
    texto: 'Costura a medida en el corazón de Salamanca. Pide cita y descubre el proceso artesanal detrás de cada pieza.',
    enlace: 'Pedir cita',
  },
};

export const Invertido = {
  args: {
    ...Normal.args,
    invertido: true,
  },
};
