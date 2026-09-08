import PanelLateral from './PanelLateral';

export default {
  title: 'UI/PanelLateral',
  component: PanelLateral,
  parameters: { layout: 'fullscreen' },
};

export const Abierto = {
  args: {
    abierto: true,
  },
  render: (args) => (
    <PanelLateral {...args}>
      <p>Contenido del panel — cualquier children.</p>
    </PanelLateral>
  ),
};

export const Cerrado = {
  args: {
    abierto: false,
  },
  render: (args) => (
    <PanelLateral {...args}>
      <p>Contenido del panel — cualquier children.</p>
    </PanelLateral>
  ),
};
