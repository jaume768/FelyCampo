import { useState } from 'react';
import SelectorColor from './SelectorColor';

export default {
  title: 'UI/SelectorColor',
  component: SelectorColor,
};

const colores = [
  { hex: '#EED3E8', nombre: 'Rosa suave' },
  { hex: '#F7F7F7', nombre: 'Blanco' },
  { hex: '#101010', nombre: 'Negro' },
  { hex: '#F5F1EE', nombre: 'Crema' },
  { hex: '#AEAEAE', nombre: 'Gris piedra' },
  { hex: '#23324A', nombre: 'Azul marino' },
  { hex: '#6B705C', nombre: 'Verde oliva' },
  { hex: '#6E2635', nombre: 'Burdeos' },
  { hex: '#C19A6B', nombre: 'Camel' },
  { hex: '#C1653D', nombre: 'Terracota' },
];

export const Interactivo = {
  render: () => {
    const [seleccionado, setSeleccionado] = useState('Rosa suave');
    return (
      <SelectorColor colores={colores} seleccionado={seleccionado} onSelect={setSeleccionado} />
    );
  },
};
