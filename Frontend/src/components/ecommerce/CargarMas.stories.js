import CargarMas from './CargarMas';

export default {
  title: 'Ecommerce/CargarMas',
  component: CargarMas,
};

export const Interactivo = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <CargarMas total={95} />
    </div>
  ),
};
