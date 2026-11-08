// sobreFely.js
//
// Contenido de /sobre-fely: lo comparten la web
// (app/[locale]/sobre-fely → SobreFelyContenido.jsx) y el admin
// (/admin/paginas/sobre-fely).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerSobreFely() para que lea de ella. Ver docs/ADMIN.md.

import { contenido } from './contenido';
import { validarCampos } from './camposPagina';

export const ID_PAGINA_SOBRE_FELY = 'sobre-fely';
export const EDITOR_SOBRE_FELY = '/admin/paginas/sobre-fely';

// Máximo de fotos de un capítulo (la principal y las que van en filas de
// dos), a petición, para que el capítulo no se alargue sin fin.
export const MAXIMO_FOTOS_CAPITULO = 6;

// Un capítulo nuevo, vacío (el id no cambia al moverlo; es también el
// ancla de la web: /sobre-fely#<id>).
export function nuevoCapitulo() {
  return {
    id: `capitulo-${Date.now().toString(36)}`, etiqueta: { es: '', en: '' }, titulo: { es: '', en: '' }, parrafos: { es: [], en: [] }, imagenes: [],
  };
}

export function obtenerSobreFely() {
  return contenido('sobre-fely');
}

// Campos opcionales que pueden quedar vacíos a propósito (para que la
// vista previa no los rellene con lo publicado). Hoy ninguno: los pies
// de foto van dentro de las listas de fotos, que la vista previa respeta
// tal cual. Se mantiene para que las tres páginas se usen igual.
export function opcionalesSobreFely() {
  return [];
}

// Nombre corto de un capítulo para los avisos: «El comienzo».
const nombreCapitulo = (capitulo, indice) => `«${capitulo.etiqueta?.es || `Capítulo ${indice + 1}`}»`;

// Campos de la página (ver lib/camposPagina.js).
export function camposSobreFely(datos) {
  const campos = [
    {
      bloque: 'portada', nombre: 'la foto de portada', tipo: 'medio', valor: datos.hero.imagen, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'el título de portada', tipo: 'texto', valor: datos.hero.titulo, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'el subtítulo de portada', tipo: 'texto', valor: datos.hero.subtitulo, requerido: true,
    },
  ];

  datos.capitulos.forEach((capitulo, indice) => {
    const bloque = capitulo.id;
    const de = nombreCapitulo(capitulo, indice);
    campos.push(
      {
        bloque, nombre: `el título del capítulo ${de}`, tipo: 'texto', valor: capitulo.etiqueta, requerido: true,
      },
      {
        bloque, nombre: `el subtítulo del capítulo ${de}`, tipo: 'texto', valor: capitulo.titulo, requerido: true,
      },
      {
        bloque, nombre: `el texto del capítulo ${de}`, tipo: 'texto', valor: capitulo.parrafos, requerido: true,
      },
      {
        bloque, nombre: `las fotos del capítulo ${de}`, tipo: 'lista', valor: capitulo.imagenes, minimo: 1, maximo: MAXIMO_FOTOS_CAPITULO,
      },
    );
    capitulo.imagenes.forEach((foto, posicion) => {
      campos.push({
        bloque, nombre: `el pie de la foto ${posicion + 1} del capítulo ${de}`, tipo: 'texto', valor: foto.pie, requerido: false,
      });
    });
  });

  campos.push(
    {
      bloque: 'cierre', nombre: 'el título del cierre', tipo: 'texto', valor: datos.cierre.titulo, requerido: true,
    },
    {
      bloque: 'cierre', nombre: 'el texto del cierre', tipo: 'texto', valor: datos.cierre.parrafos, requerido: true,
    },
    {
      bloque: 'documental', nombre: 'el título del documental', tipo: 'texto', valor: datos.documental.titulo, requerido: true,
    },
    {
      bloque: 'documental', nombre: 'el texto del documental', tipo: 'texto', valor: datos.documental.texto, requerido: true,
    },
    {
      bloque: 'documental', nombre: 'la foto del documental', tipo: 'medio', valor: datos.documental.imagen, requerido: true,
    },
    {
      bloque: 'documental', nombre: 'el enlace del documental', tipo: 'url', valor: datos.documental.enlace, requerido: true,
    },
  );
  return campos;
}

export function validarSobreFely(datos) {
  return validarCampos(camposSobreFely(datos));
}
