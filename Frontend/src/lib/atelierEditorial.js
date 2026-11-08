// atelierEditorial.js
//
// La parte editorial (fotos y textos) de /atelier/novias, /atelier/fiesta y
// /pret-a-porter: lo comparten la web (NoviasContenido.jsx,
// FiestaContenido.jsx, PretAPorterCabecera.jsx) y el admin (pestaña «Página
// de la web» de Colección Novias, Colección Fiesta y Prêt-à-porter).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerEditorialNovias() / obtenerEditorialFiesta() /
// obtenerEditorialPretAPorter(). Ver
// docs/ADMIN.md.

import { contenido } from './contenido';

// Ids de página (Paginas.jsx) y de vista previa (?previa=<id>).
export const ID_PAGINA_NOVIAS = 'atelier-novias';
export const ID_PAGINA_FIESTA = 'atelier-fiesta';
export const ID_PAGINA_PRET_A_PORTER = 'pret-a-porter-pagina';

export function obtenerEditorialNovias() {
  return contenido('editorial-novias');
}

export function obtenerEditorialFiesta() {
  return contenido('editorial-fiesta');
}

export function obtenerEditorialPretAPorter() {
  return contenido('editorial-pret-a-porter');
}

// /pret-a-porter: el carrusel de la portada y la descripción.
export function camposEditorialPretAPorter(datos) {
  return [
    {
      bloque: 'portada', nombre: 'las fotos de la portada', tipo: 'lista', valor: datos.portada, minimo: 1, mensaje: 'Añade al menos una foto a la portada.',
    },
    {
      bloque: 'descripcion', nombre: 'la descripción', tipo: 'texto', valor: datos.descripcion, requerido: true,
    },
  ];
}

// Un bloque de foto + texto nuevo, vacío (el id no cambia al moverlo).
export function nuevoBloqueEditorial() {
  return {
    id: `bloque-${Date.now().toString(36)}`, tipo: 'imagen', src: '', titulo: { es: '', en: '' }, texto: { es: '', en: '' },
  };
}

export const esVideoEditorial = (src) => /\.(mp4|webm|mov)(\?|#|$)/i.test(src || '') || /#video$/.test(src || '');

// Galería final → lo que espera RunwayBackstage: una foto es su ruta y un
// vídeo, { tipo: 'video', src }.
export function galeriaParaWeb(lista = []) {
  return lista.map((src) => (esVideoEditorial(src) ? { tipo: 'video', src } : src));
}

// Campos de la página (ver lib/camposPagina.js). Bloques del editor:
// portada, introduccion, [pestanas], cada bloque (por su id) y galeria.
export function camposEditorial(datos) {
  const campos = [
    {
      bloque: 'portada', nombre: 'la foto de portada', tipo: 'medio', valor: datos.hero.imagen, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'la frase de la portada', tipo: 'texto', valor: datos.hero.subtitulo, requerido: true,
    },
    {
      bloque: 'introduccion', nombre: 'la introducción', tipo: 'texto', valor: datos.descripcion, requerido: true,
    },
  ];
  if (datos.pestanas) {
    campos.push(
      {
        bloque: 'pestanas', nombre: 'el nombre de la 1.ª pestaña', tipo: 'texto', valor: datos.pestanas.atelier, requerido: true,
      },
      {
        bloque: 'pestanas', nombre: 'el nombre de la 2.ª pestaña', tipo: 'texto', valor: datos.pestanas.colecciones, requerido: true,
      },
    );
  }
  datos.bloques.forEach((bloque, indice) => {
    const de = `del bloque ${indice + 1}`;
    campos.push(
      {
        bloque: bloque.id, nombre: `la foto o el vídeo ${de}`, tipo: 'medio', valor: bloque.src, requerido: true,
      },
      {
        bloque: bloque.id, nombre: `el título ${de}`, tipo: 'texto', valor: bloque.titulo, requerido: true,
      },
      {
        bloque: bloque.id, nombre: `el texto ${de}`, tipo: 'texto', valor: bloque.texto, requerido: true,
      },
    );
  });
  return campos;
}
