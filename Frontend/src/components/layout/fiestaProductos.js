// fiestaProductos.js
//
// Catálogo de Atelier > Fiesta tal como lo usan la ficha de producto
// (FichaProductoAtelier.jsx), el sitemap y los datos SEO: todos los looks
// publicados, con la misma forma de objeto de siempre (nombre, titulo,
// subtitulo, sku, imagen, imagenHover, imagenes, descripcion, coleccion).
//
// Ya no se escribe aquí a mano: los datos viven en src/datos/atelierFiesta.js
// (los edita /admin/colecciones/fiesta) y se transforman en
// src/lib/catalogoFiesta.js. El listado de /atelier/fiesta usa
// productosListadoFiesta() (solo colecciones visibles).
// Hasta el 2026-11-04 este archivo contenía el catálogo tecleado a mano
// (ver el historial de git); se pasó tal cual a datos/atelierFiesta.js,
// comprobado look a look (199 looks, cero diferencias).

import { productosFiesta } from '@/lib/catalogoFiesta';

export const fiestaProductos = productosFiesta();
