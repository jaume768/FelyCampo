import { useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import PanelFiltros from './PanelFiltros';
import { TALLAS_DISPONIBLES } from '../ecommerce/guiaTallasData';
import messages from '../../../messages/es.json';

const FAMILIAS = [
  { id: 'neutrals', etiqueta: 'Neutros', muestras: ['#111111', '#FAFAF7'] },
  { id: 'browns', etiqueta: 'Marrones', muestras: ['#C19A6B', '#4B3621'] },
  { id: 'reds', etiqueta: 'Rojos y vinos', muestras: ['#B21F2D', '#6E1E2B'] },
  { id: 'blues', etiqueta: 'Azules', muestras: ['#1F2A44', '#A9CFE8'] },
];

export default {
  title: 'Layout/PanelFiltros',
  component: PanelFiltros,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

// Interactivo — mismo estado que le da CuadriculaProductos en las
// páginas de catálogo (Tienda/Atelier), aquí a mano para poder
// abrir/cerrar el panel y probar los filtros en Storybook.
export const Interactivo = {
  render: () => {
    function Demo() {
      const [abierto, setAbierto] = useState(true);
      const [orden, setOrden] = useState('recomendados');
      const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);
      const [familiasSeleccionadas, setFamiliasSeleccionadas] = useState([]);
      const [estiloSiluetaSeleccionados, setEstiloSiluetaSeleccionados] = useState([]);
      const [precioMax, setPrecioMax] = useState(1200);

      const alternar = (lista, valor) => (
        lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
      );

      return (
        <>
          <button type="button" onClick={() => setAbierto(true)} style={{ margin: 24 }}>
            Abrir filtros
          </button>
          <PanelFiltros
            abierto={abierto}
            onCerrar={() => setAbierto(false)}
            orden={orden}
            onCambiarOrden={setOrden}
            tallas={TALLAS_DISPONIBLES}
            tallasSeleccionadas={tallasSeleccionadas}
            onToggleTalla={(talla) => setTallasSeleccionadas((actual) => alternar(actual, talla))}
            familias={FAMILIAS}
            familiasSeleccionadas={familiasSeleccionadas}
            onToggleFamilia={(id) => setFamiliasSeleccionadas((actual) => alternar(actual, id))}
            estiloYSilueta
            esFiesta
            estiloSiluetaSeleccionados={estiloSiluetaSeleccionados}
            onToggleEstiloSilueta={(id) => setEstiloSiluetaSeleccionados((actual) => alternar(actual, id))}
            precioMax={precioMax}
            precioMaximo={1200}
            onCambiarPrecioMax={setPrecioMax}
            onLimpiar={() => {
              setTallasSeleccionadas([]);
              setFamiliasSeleccionadas([]);
              setEstiloSiluetaSeleccionados([]);
              setPrecioMax(1200);
            }}
          />
        </>
      );
    }

    return <Demo />;
  },
};
