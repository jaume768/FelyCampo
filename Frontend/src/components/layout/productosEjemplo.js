// productosEjemplo.js
//
// Catálogo de ejemplo compartido por TODAS las páginas "pendientes de
// maquetar" del Navbar (submenús Tienda y Atelier) — pensado para
// previsualizar la cuadrícula de producto (CuadriculaProductos,
// disposicion="grid"): su paginación por scroll y el panel de filtros
// (talla/color/precio + ordenar por) necesitan más de 12 productos y
// variedad real de datos para poder probarse, así que "tallas"/
// "colores"/"precio" no son solo decorativos aquí, PanelFiltros los
// usa de verdad. Es también la fuente de datos de la ficha de
// producto (/tienda/[producto]/page.js, que busca por el slug del
// nombre — ver src/lib/slugify.js) — TarjetaProducto enlaza a esa
// ficha con el mismo slug, así que los dos lados tienen que leer de
// aquí, no de copias sueltas por página (antes /tienda/chaquetas-y-
// abrigos tenía su propio array separado; ya no).

import { TALLAS_DISPONIBLES } from '@/components/ecommerce/guiaTallasData';

// Cada producto de ejemplo usa el reportaje fotográfico COMPLETO de un
// único color/variante (4 fotos seguidas de la misma pieza) en vez de
// una imagen suelta por producto — así la galería de la ficha
// (GaleriaProducto) nunca mezcla fotos de reportajes distintos, y la
// PRIMERA foto de cada grupo es siempre la que hace de portada
// (tarjeta de la cuadrícula + primera imagen de la ficha): FC-0,
// FC-0_NEW, FC-4 y FC-8 respectivamente — ninguna otra imagen actúa
// nunca como portada.
const GRUPOS_PRODUCTO = [
  {
    fotos: ['/img/ecommerce/FC-0.webp', '/img/ecommerce/FC-1.webp', '/img/ecommerce/FC-2.webp', '/img/ecommerce/FC-3.webp'],
    colores: [{ hex: '#202020', nombre: 'Tinta' }, { hex: '#F5F1EE', nombre: 'Crema' }],
  },
  {
    fotos: ['/img/ecommerce/FC-0_NEW.webp', '/img/ecommerce/FC-1_NEW.webp', '/img/ecommerce/FC-2_NEW.webp', '/img/ecommerce/FC-3_NEW.webp'],
    colores: [{ hex: '#6E2635', nombre: 'Burdeos' }, { hex: '#C19A6B', nombre: 'Camel' }],
  },
  {
    fotos: ['/img/ecommerce/FC-4.webp', '/img/ecommerce/FC-5.webp', '/img/ecommerce/FC-6.webp', '/img/ecommerce/FC-7.webp'],
    colores: [{ hex: '#6B7A8F', nombre: 'Azul piedra' }, { hex: '#F5F1EE', nombre: 'Crema' }],
  },
  {
    fotos: ['/img/ecommerce/FC-8.webp', '/img/ecommerce/FC-9.webp', '/img/ecommerce/FC-10.webp', '/img/ecommerce/FC-11.webp'],
    colores: [{ hex: '#6B705C', nombre: 'Verde oliva' }, { hex: '#F7F7F7', nombre: 'Blanco' }],
  },
];

const PRECIOS = ['990 €', '1.050 €', '1.120 €', '980 €', '850 €', '1.250 €'];

const DESCRIPCION = 'Pieza confeccionada con los mismos acabados artesanales de siempre, pensada para acompañar cada ocasión con la calidad y el cuidado que caracterizan a Fely Campo.';

export const productosEjemplo = Array.from({ length: 24 }, (_, indice) => {
  // Un grupo entero (las 4 fotos de un mismo reportaje) por producto,
  // repitiendo el ciclo de 4 grupos las veces que haga falta — "uno,
  // luego el otro, luego el otro, y se repite" en vez de una portada
  // distinta por producto mezclada con fotos de otros reportajes.
  const grupo = GRUPOS_PRODUCTO[indice % GRUPOS_PRODUCTO.length];
  return {
    imagen: grupo.fotos[0],
    colores: grupo.colores,
    imagenes: grupo.fotos,
    // Segunda foto del propio grupo, reutilizada como hover de
    // TarjetaProducto en la cuadrícula (ver .imagenHover en
    // TarjetaProducto.module.css) — así la tarjeta de listado y la
    // ficha muestran una foto consistente entre sí, sin datos sueltos.
    imagenHover: grupo.fotos[1],
    nombre: `Producto de ejemplo ${String(indice + 1).padStart(2, '0')}`,
    precio: PRECIOS[indice % PRECIOS.length],
    // Mismo rango completo (36 a 64) en todos los productos — todas las
    // tablas/selectores de talla del sitio enseñan siempre las mismas
    // opciones, ver TALLAS_DISPONIBLES en guiaTallasData.js.
    tallas: TALLAS_DISPONIBLES,
    descripcion: DESCRIPCION,
  };
});
