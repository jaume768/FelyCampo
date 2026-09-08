import { NextIntlClientProvider } from 'next-intl';
import CuadriculaProductos from './CuadriculaProductos';
import { TALLAS_DISPONIBLES } from '../ecommerce/guiaTallasData';
import messages from '../../../messages/es.json';

const IMG = '/img/styleguide/prod-tarjeta.webp';
const IMG_HOVER = '/img/styleguide/prod-tarjeta-hover.webp';

const NOMBRES = [
  'Falda Vera', 'Vestido Aurora', 'Vestido Sol', 'Falda Mora',
  'Vestido Nube', 'Falda Iris', 'Vestido Alba', 'Falda Bruma',
];

const coloresPorProducto = [
  [{ hex: '#EED3E8', nombre: 'Rosa suave' }, { hex: '#F7F7F7', nombre: 'Blanco' }],
  [{ hex: '#6E2635', nombre: 'Burdeos' }, { hex: '#23324A', nombre: 'Azul marino' }],
  [{ hex: '#6B705C', nombre: 'Verde oliva' }, { hex: '#C19A6B', nombre: 'Camel' }],
  [{ hex: '#202020', nombre: 'Tinta' }, { hex: '#F5F1EE', nombre: 'Crema' }],
];

const productosBase = NOMBRES.map((nombre, index) => ({
  imagen: IMG,
  imagenHover: IMG_HOVER,
  nombre,
  precio: `${420 + index * 60} €`,
  colores: coloresPorProducto[index % coloresPorProducto.length],
}));

// Catálogo más grande, con tallas — solo para la story "Grid": el
// toggle de densidad, la barra de filtros (talla/color/precio +
// ordenar por) y la paginación por scroll necesitan más de 8
// productos y variedad real para poder probarse. Mismo rango completo
// (36 a 64) en todos los productos — todas las tablas/selectores de
// talla del sitio enseñan siempre las mismas opciones.
const productosGrid = Array.from({ length: 20 }, (_, index) => ({
  imagen: IMG,
  imagenHover: IMG_HOVER,
  nombre: `${NOMBRES[index % NOMBRES.length]} ${String(Math.floor(index / NOMBRES.length) + 1).padStart(2, '0')}`,
  precio: `${380 + (index % 6) * 90} €`,
  colores: coloresPorProducto[index % coloresPorProducto.length],
  tallas: TALLAS_DISPONIBLES,
}));

export default {
  title: 'Layout/CuadriculaProductos',
  component: CuadriculaProductos,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="es" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const Principal = {
  args: {
    productos: productosBase,
    tituloKey: 'cuadriculaProductos.novedades',
    verMasHref: '#',
  },
};

export const SinCabecera = {
  args: {
    productos: productosBase,
  },
};

// Páginas de catálogo (Tienda/Atelier): cuadrícula de 4 columnas con
// el toggle de densidad en la accion, la barra de filtros (talla/
// color/precio + ordenar por, en PanelFiltros) y paginación por
// scroll — un lote inicial de 8, el resto carga al acercarse al final.
export const Grid = {
  args: {
    productos: productosGrid,
    disposicion: 'grid',
    tituloKey: 'catalogo.subtituloTienda',
    coleccionKey: 'nav.submenus.tienda.faldas',
    descriptionKey: 'cuadriculaProductos.novedadesDescripcion',
  },
};
