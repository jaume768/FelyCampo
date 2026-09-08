import Etiqueta from './Etiqueta';

export default {
  title: 'UI/Etiqueta',
  component: Etiqueta,
};

export const Variantes = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Etiqueta variante="rosa">Nueva colección</Etiqueta>
      <Etiqueta variante="rosa">-20%</Etiqueta>
      <Etiqueta variante="velo">Novia</Etiqueta>
      <Etiqueta variante="velo">Edición limitada</Etiqueta>
      <Etiqueta variante="agotado">Agotado</Etiqueta>
    </div>
  ),
};
