// ateliers.js
//
// Los 3 ateliers propios: su página (/atelier-fiesta/<id>) y su contacto.
// Lo comparten la web (atelier-fiesta/AtelierContenido.jsx,
// visita-fely-campo/ListadoUbicaciones.jsx, AteliersCita.jsx…) y el admin
// (/admin/ateliers/<id>).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerSede() / obtenerSedes(). Ver docs/ADMIN.md.

import { contenido } from './contenido';

export const IDS_SEDES = ['salamanca', 'madrid', 'oviedo'];

// Id de página (Paginas.jsx) y de vista previa (?previa=<id>).
export const idPaginaSede = (id) => `sede-${id}`;
export const editorSede = (id) => `/admin/ateliers/${id}`;
export const rutaWebSede = (id) => `/atelier-fiesta/${id}`;

export function obtenerSede(id) {
  return contenido('sedes')[id];
}

export function obtenerSedes() {
  return IDS_SEDES.map((id) => contenido('sedes')[id]);
}

// Límites para que el diseño no se rompa: las fotos del final van en una
// fila (hasta 5) o en filas de 3 a 5 (ver .imagenes en
// atelier-fiesta/page.module.css), y las de la tarjeta de Visítanos pasan
// solas una tras otra.
export const MAXIMO_FOTOS_FINAL = 10;
export const MAXIMO_FOTOS_TARJETA = 6;

// Una sección nueva, vacía (el id no cambia al moverla).
export function nuevaSeccion() {
  return {
    id: `seccion-${Date.now().toString(36)}`, titulo: { es: '', en: '' }, imagen: '', texto: { es: [], en: [] },
  };
}

export const esVideoSede = (src) => /\.(mp4|webm|mov)(\?|#|$)/i.test(src || '') || /#video$/.test(src || '');

// Un medio (portada o foto grande) tal como lo espera la web: sin los
// datos vacíos (un vídeo sin versión para móvil no lleva "srcMovil").
export function medioParaWeb(medio) {
  return Object.fromEntries(Object.entries(medio).filter(([, valor]) => valor !== '' && valor !== false));
}

const vacio = (texto) => !String(texto || '').trim();

// El contacto de una sede con la forma de siempre (la de Visítanos):
// sin el segundo teléfono si está vacío, y horario null = «con cita previa».
export function ubicacionDe(sede) {
  const { contacto } = sede;
  return {
    id: sede.id,
    ciudad: sede.ciudad,
    nombre: contacto.nombre,
    direccion: contacto.direccion.filter((linea) => !vacio(linea)),
    telefonos: contacto.telefonos.filter((telefono) => !vacio(telefono)),
    whatsapp: contacto.whatsapp,
    horario: vacio(contacto.horario?.es) && vacio(contacto.horario?.en) ? null : contacto.horario,
    descripcion: contacto.descripcion,
    fotos: contacto.fotos,
  };
}

export function obtenerUbicaciones() {
  return obtenerSedes().map(ubicacionDe);
}

// Enlace a Google Maps de cada sede: búsqueda oficial por dirección
// (https://developers.google.com/maps/documentation/urls).
export function enlaceMapa(ubicacion) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion.direccion.join(', '))}`;
}

// Lo que puede quedar vacío a propósito (para la vista previa).
export const OPCIONALES_SEDE = [
  'heroMedio.srcMovil', 'heroMedio.poster', 'heroMedio.encuadre',
  'contacto.horario.es', 'contacto.horario.en',
];

// Campos de la página (ver lib/camposPagina.js). Bloques del editor:
// portada, descripcion, medio, cada sección (por su id), galeria, contacto.
export function camposSede(datos) {
  const campos = [
    {
      bloque: 'portada', nombre: 'el nombre de la ciudad', tipo: 'texto', valor: datos.nombreCiudad, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'lo que va antes de la ciudad («Atelier»)', tipo: 'texto', valor: datos.etiqueta, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'la frase de la portada', tipo: 'texto', valor: datos.subtitulo, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'la foto o el vídeo de portada', tipo: 'medio', valor: datos.heroMedio.src, requerido: true,
    },
    {
      bloque: 'descripcion', nombre: 'el texto de presentación', tipo: 'texto', valor: datos.descripcion, requerido: true,
    },
    {
      bloque: 'medio', nombre: 'la foto o el vídeo grande', tipo: 'medio', valor: datos.medioSuperior.src, requerido: true,
    },
  ];
  datos.secciones.forEach((seccion, indice) => {
    const de = `de la sección ${indice + 1}`;
    campos.push(
      {
        bloque: seccion.id, nombre: `la foto ${de}`, tipo: 'medio', valor: seccion.imagen, requerido: true,
      },
      {
        bloque: seccion.id, nombre: `el título ${de}`, tipo: 'texto', valor: seccion.titulo, requerido: true,
      },
      {
        bloque: seccion.id, nombre: `el texto ${de}`, tipo: 'texto', valor: seccion.texto, requerido: true,
      },
    );
  });
  const { contacto } = datos;
  campos.push(
    {
      bloque: 'galeria', nombre: 'las fotos del final', tipo: 'lista', valor: datos.imagenesTira, minimo: 1, maximo: MAXIMO_FOTOS_FINAL, mensaje: 'Añade al menos una foto (o vídeo) al final de la página.',
    },
    {
      bloque: 'contacto', nombre: 'el nombre', tipo: 'linea', valor: contacto.nombre, requerido: true,
    },
    {
      bloque: 'contacto', nombre: 'la dirección (calle)', tipo: 'linea', valor: contacto.direccion[0], requerido: true,
    },
    {
      bloque: 'contacto', nombre: 'la dirección (código postal y ciudad)', tipo: 'linea', valor: contacto.direccion[1], requerido: true,
    },
    {
      bloque: 'contacto', nombre: 'el teléfono', tipo: 'linea', valor: contacto.telefonos[0], requerido: true,
    },
    {
      bloque: 'contacto', nombre: 'el WhatsApp', tipo: 'linea', valor: contacto.whatsapp, requerido: true,
    },
    {
      bloque: 'contacto', nombre: 'el horario', tipo: 'texto', valor: contacto.horario, requerido: false,
    },
    {
      bloque: 'contacto', nombre: 'el texto de la tarjeta de Visítanos', tipo: 'texto', valor: contacto.descripcion, requerido: true,
    },
    {
      bloque: 'contacto', nombre: 'las fotos de la tarjeta de Visítanos', tipo: 'lista', valor: contacto.fotos, minimo: 1, maximo: MAXIMO_FOTOS_TARJETA,
    },
  );
  return campos;
}
