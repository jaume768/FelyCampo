// tiendaProductos.js
//
// Catálogo de Prêt-à-porter con la forma que esperan /pret-a-porter, sus
// 5 categorías, la ficha de producto, el carrito, la wishlist y el
// sitemap: todos los productos publicados, en su orden.
//
// Los datos ya no viven aquí: están en src/datos/pretAPorter.js
// (editables desde /admin/productos/pret-a-porter) y se leen con
// lib/pretAPorter.js. Este archivo se mantiene para quien ya lo importa.
// Precio y tallas siguen en los datos (los usa el carrito) pero la web
// ya no los enseña (a petición).

import { productosPretAPorter } from '@/lib/pretAPorter';

export const tiendaProductos = productosPretAPorter();
