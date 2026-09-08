import Input from './Input';

export default {
  title: 'UI/Input',
  component: Input,
  argTypes: {
    etiqueta: {
      control: 'text',
      description: 'Texto de la etiqueta encima del campo. Si se omite, el campo no muestra etiqueta.',
    },
    tipo: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'number'],
      description: 'Tipo nativo del input HTML.',
    },
    placeholder: {
      control: 'text',
      description: 'Texto de ejemplo dentro del campo vacío.',
    },
    valor: {
      control: 'text',
      description: 'Valor controlado del campo.',
    },
    nombre: {
      control: 'text',
      description: 'Atributo name del input (para formularios).',
    },
    onChange: {
      description: 'Evento que se dispara al escribir en el campo.',
    },
  },
};

export const ConEtiqueta = {
  args: { etiqueta: 'Email', tipo: 'email', placeholder: 'nombre@email.com' },
};

export const SinEtiqueta = {
  args: { placeholder: 'Escribe aquí' },
};
