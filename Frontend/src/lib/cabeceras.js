// cabeceras.js
//
// Cabecera y textos de entrada de Blog & Podcast, Vosotras, Runway,
// Visítanos y Puntos de venta: los lee la web (components/layout/
// CabeceraPagina.jsx, con vista previa) y los edita el admin (pestaña
// «Página de la web» de cada sección, AdminCabecera.jsx).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerCabecera(). Ver docs/ADMIN.md.

import { CABECERAS } from '@/datos/cabeceras';

// Id de página (Paginas.jsx) y de vista previa (?previa=<id>).
export const idPaginaCabecera = (id) => `cabecera-${id}`;

export function obtenerCabecera(id) {
  return CABECERAS[id];
}

export function obtenerCabeceras() {
  return CABECERAS;
}

// Cómo se edita cada una: sus bloques y, en cada bloque, sus campos.
//   medio  una foto (ruta), con "proporcion"
//   texto  un texto { es, en }; "multilinea" para un párrafo largo
// "ruta" es dónde está el dato ("showroom.imagen").
const PORTADA = (descripcion) => ({
  id: 'portada',
  nombre: 'Cabecera',
  resumen: 'Foto, título y subtítulo',
  descripcion,
  campos: [
    { ruta: 'imagen', tipo: 'medio', etiqueta: 'Foto', detalle: 'Horizontal', proporcion: '16 / 9' },
    { ruta: 'titulo', tipo: 'texto', etiqueta: 'Título', largo: 40 },
    { ruta: 'subtitulo', tipo: 'texto', etiqueta: 'Subtítulo', largo: 60 },
  ],
});

export const PAGINAS_CABECERA = {
  blog: {
    titulo: 'Página de Blog & Podcast',
    rutaWeb: '/blog',
    editor: '/admin/blog',
    bloques: [
      PORTADA('La foto a todo el ancho con la que se abre la página, con el título y el subtítulo encima.'),
      {
        id: 'introduccion',
        nombre: 'Introducción',
        resumen: 'Título y texto',
        descripcion: 'El título y el texto que presentan el blog y el podcast, encima de los filtros y de las entradas.',
        campos: [
          { ruta: 'introTitulo', tipo: 'texto', etiqueta: 'Título', largo: 40 },
          { ruta: 'introTexto', tipo: 'texto', etiqueta: 'Texto', multilinea: true, filas: 6 },
        ],
      },
    ],
  },
  vosotras: {
    titulo: 'Página de Vosotras',
    rutaWeb: '/atelier/vosotras',
    editor: '/admin/vosotras',
    bloques: [
      {
        id: 'introduccion',
        nombre: 'Introducción',
        resumen: 'Título y texto',
        descripcion: 'El título y la frase con los que se abre la página, encima de las fotos de las clientas.',
        campos: [
          { ruta: 'titulo', tipo: 'texto', etiqueta: 'Título', largo: 30 },
          { ruta: 'texto', tipo: 'texto', etiqueta: 'Texto', multilinea: true, filas: 3, largo: 160 },
        ],
      },
    ],
  },
  runway: {
    titulo: 'Página de Runway',
    rutaWeb: '/colecciones-fely-campo',
    editor: '/admin/colecciones/runway',
    bloques: [PORTADA('La foto a todo el ancho con la que se abre el listado de colecciones de pasarela.')],
  },
  visitanos: {
    titulo: 'Página Visítanos',
    rutaWeb: '/visita-fely-campo',
    editor: '/admin/paginas/visitanos',
    bloques: [
      PORTADA('La foto a todo el ancho con la que se abre la página.'),
      {
        id: 'introduccion',
        nombre: 'Introducción',
        resumen: 'Título y texto',
        descripcion: 'El título y el texto encima de las tarjetas de los ateliers. (Las tarjetas se editan en la página de cada atelier; el mapa del final, en Puntos de venta.)',
        campos: [
          { ruta: 'introTitulo', tipo: 'texto', etiqueta: 'Título', largo: 40 },
          { ruta: 'introTexto', tipo: 'texto', etiqueta: 'Texto', multilinea: true, filas: 4 },
        ],
      },
    ],
  },
  'puntos-de-venta': {
    titulo: 'Página de Puntos de venta',
    rutaWeb: '/puntos-de-venta-fely-campo',
    editor: '/admin/puntos-de-venta',
    bloques: [
      PORTADA('La foto a todo el ancho con la que se abre la página.'),
      {
        id: 'mapa',
        nombre: 'Encima del mapa',
        resumen: 'Título y texto',
        descripcion: 'El título y el texto encima del buscador y del mapa. Salen también al final de la página Visítanos, donde está el mismo mapa.',
        campos: [
          { ruta: 'mapaTitulo', tipo: 'texto', etiqueta: 'Título', largo: 40 },
          { ruta: 'mapaTexto', tipo: 'texto', etiqueta: 'Texto', multilinea: true, filas: 4 },
        ],
      },
      {
        id: 'internacional',
        nombre: 'Presencia internacional',
        resumen: 'Título y tarjeta',
        descripcion: 'El título y la tarjeta (foto, nombre y texto) que van debajo del mapa.',
        campos: [
          { ruta: 'internacionalTitulo', tipo: 'texto', etiqueta: 'Título', largo: 60 },
          { ruta: 'showroom.imagen', tipo: 'medio', etiqueta: 'Foto de la tarjeta', detalle: 'Horizontal', proporcion: '4 / 3' },
          { ruta: 'showroom.nombre', tipo: 'texto', etiqueta: 'Nombre', largo: 40 },
          { ruta: 'showroom.texto', tipo: 'texto', etiqueta: 'Texto', multilinea: true, filas: 5 },
        ],
      },
    ],
  },
};

const leer = (datos, ruta) => ruta.split('.').reduce((nodo, clave) => nodo?.[clave], datos);

// Campos de la página (ver lib/camposPagina.js): todos obligatorios.
export function camposCabecera(id) {
  return (datos) => PAGINAS_CABECERA[id].bloques.flatMap((bloque) => bloque.campos.map((campo) => ({
    bloque: bloque.id,
    nombre: `${campo.etiqueta.toLowerCase()} (${bloque.nombre.toLowerCase()})`,
    tipo: campo.tipo,
    valor: leer(datos, campo.ruta),
    requerido: true,
  })));
}
