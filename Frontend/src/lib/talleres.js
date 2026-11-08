// talleres.js
//
// Contenido de /talleres-fely-campo: lo comparten la web
// (app/[locale]/talleres-fely-campo → TalleresContenido.jsx) y el admin
// (/admin/paginas/talleres).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerTalleres() para que lea de ella. Ver docs/ADMIN.md.

import { contenido } from './contenido';
import { validarCampos } from './camposPagina';

export const ID_PAGINA_TALLERES = 'talleres';
export const EDITOR_TALLERES = '/admin/paginas/talleres';

// Un taller nuevo, vacío (su nombre es también su botón de filtro en la web).
export function nuevoTaller() {
  return {
    id: `taller-${Date.now().toString(36)}`, nombre: { es: '', en: '' }, ubicacion: { es: '', en: '' }, responsable: { es: '', en: '' }, parrafos: { es: [], en: [] }, medios: [],
  };
}

export function obtenerTalleres() {
  return contenido('talleres');
}

// Las fotos y los vídeos del carrusel son rutas; los vídeos se
// distinguen por la extensión (o por ser un vídeo recién subido).
export const esVideoTaller = (src) => /\.(mp4|webm|mov)(\?|#|$)/i.test(src) || /#video$/.test(src);

export function opcionalesTalleres(datos = contenido('talleres')) {
  return datos.talleres.flatMap((_, indice) => [`talleres.${indice}.responsable.es`, `talleres.${indice}.responsable.en`]);
}

export function camposTalleres(datos) {
  const campos = [
    {
      bloque: 'portada', nombre: 'la foto de portada', tipo: 'medio', valor: datos.hero.imagen, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'el título de portada', tipo: 'texto', valor: datos.hero.titulo, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'la frase de portada', tipo: 'texto', valor: datos.hero.lema, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'el texto de introducción', tipo: 'texto', valor: datos.hero.intro, requerido: true,
    },
  ];
  datos.talleres.forEach((taller, indice) => {
    const de = `«${taller.nombre?.es || `Taller ${indice + 1}`}»`;
    const bloque = taller.id;
    campos.push(
      {
        bloque, nombre: `el nombre del taller ${de}`, tipo: 'texto', valor: taller.nombre, requerido: true,
      },
      {
        bloque, nombre: `la ubicación del taller ${de}`, tipo: 'texto', valor: taller.ubicacion, requerido: true,
      },
      {
        bloque, nombre: `quién lleva el taller ${de}`, tipo: 'texto', valor: taller.responsable, requerido: false,
      },
      {
        bloque, nombre: `el texto del taller ${de}`, tipo: 'texto', valor: taller.parrafos, requerido: true,
      },
      {
        bloque, nombre: `el carrusel del taller ${de}`, tipo: 'lista', valor: taller.medios, minimo: 1,
      },
    );
  });
  return campos;
}

export function validarTalleres(datos) {
  return validarCampos(camposTalleres(datos));
}
