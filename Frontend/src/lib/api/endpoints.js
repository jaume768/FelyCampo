/**
 * Punto de entrada único de la capa de API.
 *
 * Reexporta los cinco módulos de dominio agrupados por espacio de nombres, para que en un
 * componente se lea de dónde sale cada dato:
 *
 *   import { catalog } from '@/lib/api/endpoints';
 *   const productos = await catalog.listarProductos({ family: 'vestidos' });
 *
 * Si prefieres importar la función suelta, importa del módulo concreto
 * (`@/lib/api/catalog`) en vez de aplanar todo aquí: los nombres se repiten entre dominios
 * (`actualizarCantidad` de carrito, por ejemplo) y aplanarlos los haría colisionar.
 */

import * as catalog from './catalog';
import * as cart from './cart';
import * as orders from './orders';
import * as account from './account';
import * as auth from './auth';

export { catalog, cart, orders, account, auth };

export { ApiError, CODIGOS_ERROR } from './errors';
export { apiFetch, baseUrl, conValorPorDefecto } from './client';
export { pickLocalized, pickLocalizedFields } from './pickLocalized';
export { leerCartId, guardarCartId, borrarCartId, CLAVE_CART_ID } from './cartId';
