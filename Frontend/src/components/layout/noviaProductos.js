// noviaProductos.js
//
// Catálogo de Atelier > Novias con la forma de "producto" que esperan la
// ficha (FichaProductoAtelier.jsx), las cuadrículas, el sitemap y los datos
// SEO: los looks que se ven en la web, colección a colección y por su número.
//
// Los datos ya no viven aquí: están en src/datos/atelierNovias.js
// (editables desde /admin/colecciones/novia) y se leen con
// lib/catalogoNovias.js. Este archivo se mantiene para quien ya lo importa.

import { productosListadoNovias } from '@/lib/catalogoNovias';
import { derivado } from '@/lib/contenido';

// Solo los que se ven en la web: looks publicados de colecciones publicadas
// (hoy ninguna: ver datos/atelierNovias.js). Así no salen en el sitemap,
// ni en relacionados, ni en los datos SEO.
// Función y no constante: el contenido viene de la base de datos y no está
// cargado al importar el módulo (ver src/lib/contenido.js). Memorizada: el
// mismo array mientras el documento no cambie.
export const noviaProductos = derivado('colecciones-novias', () => productosListadoNovias());
