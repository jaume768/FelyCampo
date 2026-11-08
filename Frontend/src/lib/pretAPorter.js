// pretAPorter.js
//
// Productos de Prêt-à-porter: lo comparten la web (/pret-a-porter, sus
// categorías, la ficha, el carrito, la wishlist y el sitemap, vía
// components/layout/tiendaProductos.js) y el admin
// (/admin/productos/pret-a-porter).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerProductosPretAPorter(). Ver docs/ADMIN.md.

import { TALLAS_DISPONIBLES } from '@/components/ecommerce/guiaTallasData';
import { contenido } from './contenido';
import { slugify } from './slugify';

export const EDITOR_PRET_A_PORTER = '/admin/productos/pret-a-porter';
export const ID_PREVIA_PRODUCTO = 'pret-a-porter-producto';

// Las 5 categorías, en el orden del menú de la web (su URL es /pret-a-porter/<id>).
export const CATEGORIAS_PRET_A_PORTER = [
  { id: 'tops-y-camisetas', nombre: 'Tops y camisas' },
  { id: 'chaquetas-y-abrigos', nombre: 'Chaquetas y abrigos' },
  { id: 'faldas', nombre: 'Faldas' },
  { id: 'pantalones', nombre: 'Pantalones' },
  { id: 'vestidos', nombre: 'Vestidos' },
];

export const nombreCategoria = (id) => CATEGORIAS_PRET_A_PORTER.find((c) => c.id === id)?.nombre || id;
export const slugProducto = (nombre) => slugify(nombre || '');

export function obtenerProductosPretAPorter() {
  return contenido('productos-pret-a-porter');
}

// Un producto → la forma que pintan la cuadrícula, la ficha, el carrito y
// la wishlist (la misma que tenía tiendaProductos.js).
export function productoParaWeb(producto) {
  const imagenes = producto.imagenes || [];
  return {
    id: producto.id,
    nombre: producto.nombre,
    categoria: producto.categoria,
    precio: producto.precio,
    descripcion: (producto.descripcion?.es || '').trim() || undefined,
    descripcionEn: (producto.descripcion?.en || '').trim() || undefined,
    colores: producto.colores || [],
    // Composición y origen propios ({ es, en }); vacíos = el texto general.
    composicion: producto.composicion,
    disenadoEn: producto.disenadoEn,
    fabricadoEn: producto.fabricadoEn,
    tallas: TALLAS_DISPONIBLES,
    tallasDisponibles: producto.tallasDisponibles || [],
    imagen: imagenes[0],
    imagenHover: imagenes[1],
    imagenes,
    sku: (producto.sku || '').trim() || undefined,
    // Solo la usa /pret-a-porter (no las categorías): ver su page.js.
    fotoPasarela: producto.fotoPasarela?.src ? producto.fotoPasarela : undefined,
    slugsAnteriores: producto.slugsAnteriores || [],
  };
}

// Los publicados, en su orden (el de la web: /pret-a-porter y cada
// categoría; se cambia arrastrando en el admin), con la forma de la web.
export function productosPretAPorter(productos = obtenerProductosPretAPorter()) {
  return productos.filter((producto) => producto.publicado).map(productoParaWeb);
}

// Busca un producto publicado por la URL; si es una URL antigua (se
// renombró), devuelve también "redirigirA".
export function buscarProductoPretAPorter(slug, productos = productosPretAPorter()) {
  const producto = productos.find((candidato) => slugProducto(candidato.nombre) === slug);
  if (producto) return { producto };
  const renombrado = productos.find((candidato) => candidato.slugsAnteriores.includes(slug));
  if (renombrado) return { producto: renombrado, redirigirA: slugProducto(renombrado.nombre) };
  return {};
}

export function nuevoProductoPretAPorter(categoria = CATEGORIAS_PRET_A_PORTER[0].id) {
  return {
    id: '',
    publicado: true,
    nombre: '',
    categoria,
    sku: '',
    descripcion: { es: '', en: '' },
    composicion: { es: '', en: '' },
    disenadoEn: { es: '', en: '' },
    fabricadoEn: { es: '', en: '' },
    colores: [],
    imagenes: [],
    precio: '',
    tallasDisponibles: [],
    fotoPasarela: { src: '', antes: false },
    slugsAnteriores: [],
  };
}

export function camposProductoPretAPorter(datos) {
  return [
    {
      bloque: 'datos', nombre: 'el nombre', tipo: 'medio', valor: (datos.nombre || '').trim(), requerido: true,
    },
    {
      bloque: 'fotos', nombre: 'las fotos', tipo: 'lista', valor: datos.imagenes, minimo: 1, mensaje: 'Añade al menos una foto.',
    },
    {
      bloque: 'colores', nombre: 'los colores', tipo: 'lista', valor: datos.colores, minimo: 1, mensaje: 'Elige al menos un color.',
    },
  ];
}

// El nombre da la URL: no puede repetirse (ni con URLs antiguas).
export function validarExtraProducto(datos, productos) {
  const slug = slugProducto(datos.nombre);
  const repetido = slug && productos.some((otro) => otro.id !== datos.id
    && (slugProducto(otro.nombre) === slug || (otro.slugsAnteriores || []).includes(slug)));
  return repetido ? ['Ya hay otro producto con ese nombre (la URL sería la misma). Cambia el nombre.'] : [];
}

// ---------- Admin: submenú "Prêt-à-porter" del menú lateral ----------
// Las 5 categorías, con su número de productos (ver categoriasAdminRunway).
export function categoriasAdminPretAPorter(productos = obtenerProductosPretAPorter()) {
  return CATEGORIAS_PRET_A_PORTER.map((categoria, indice) => ({
    id: categoria.id,
    nombre: categoria.nombre,
    visible: true,
    orden: indice + 1,
    fija: true,
    numeroLooks: productos.filter((p) => p.categoria === categoria.id).length,
  }));
}
