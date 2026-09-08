import Acordeon, { FilaAcordeon } from './Acordeon';

export default {
  title: 'UI/Acordeon',
  component: Acordeon,
};

export const Producto = {
  render: () => (
    <div style={{ maxWidth: '520px' }}>
      <Acordeon>
        <FilaAcordeon titulo="Details">
          <p>Corte relajado, cintura fruncida y tejido jacquard con flor en relieve.</p>
          <p>Fabricado en Salamanca, colección Novias.</p>
        </FilaAcordeon>
        <FilaAcordeon titulo="Materials and care">
          <p>100% algodón.</p>
          <p>Lavado a mano, no usar secadora.</p>
        </FilaAcordeon>
        <FilaAcordeon titulo="Size and fit">
          <p>El modelo mide 1.78m y lleva la talla S.</p>
          <p>Corte regular, ajuste real a la talla.</p>
        </FilaAcordeon>
        <FilaAcordeon titulo="Shipping and returns">
          <p>Envíos en 24-48h. Devoluciones gratuitas en 30 días.</p>
        </FilaAcordeon>
        <FilaAcordeon titulo="Need assistance">
          <p>Escríbenos a atencioncliente@felycampo.com.</p>
        </FilaAcordeon>
      </Acordeon>
    </div>
  ),
};
