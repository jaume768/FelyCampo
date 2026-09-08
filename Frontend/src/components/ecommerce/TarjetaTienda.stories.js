import TarjetaTienda from './TarjetaTienda';

const IMG = '/img/styleguide/punto-venta.webp';

export default {
  title: 'Ecommerce/TarjetaTienda',
  component: TarjetaTienda,
};

export const Tiendas = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 220px)', gap: '24px' }}>
      <TarjetaTienda
        imagen={IMG}
        ciudad="Madrid"
        direccion={'C/ Claudio Coello, 88\n28006, Madrid, España'}
        enlace="Cómo llegar"
      />
      <TarjetaTienda
        imagen={IMG}
        ciudad="Salamanca"
        direccion={'C/ Valencia, 264\n08007, Salamanca, España'}
        enlace="Cómo llegar"
      />
      <TarjetaTienda
        imagen={IMG}
        ciudad="Oviedo"
        direccion={'Carrer de Jorge Juan, 32\n46004, Oviedo, España'}
        enlace="Cómo llegar"
      />
    </div>
  ),
};
