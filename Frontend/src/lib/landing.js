// landing.js
//
// Fotos, vídeo, textos y enlaces de la home: lo comparten la web
// (app/[locale]/page.js → components/layout/MediosLanding.jsx) y el admin
// (/admin/landing), así que no pueden desincronizarse.
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerLanding() para que lea de ella. Ver docs/ADMIN.md.

import { contenido } from './contenido';
import { coleccionesVisiblesFiesta } from './catalogoFiesta';
import { sinNumeroColeccion } from './nombreColeccion';
import { clavePrevia, completarCon } from './previa';
import { validarCampos } from './camposPagina';

// Vista previa (botón "Vista previa" de /admin/landing): el admin guarda
// el borrador en localStorage con esta clave y abre la home con
// ?previa=landing. Lo pinta components/layout/MediosLanding.jsx.
export const PARAMETRO_PREVIA_LANDING = 'landing';
export const CLAVE_PREVIA_LANDING = clavePrevia(PARAMETRO_PREVIA_LANDING);

// Largo a partir del cual el admin avisa (no bloquea): por encima, el
// texto ya no cabe bien sobre la foto o en su columna.
export const LARGO_RECOMENDADO = {
  frase: 60, titulo: 40, boton: 25, cita: 280,
};

export function obtenerLanding() {
  return contenido('landing');
}

// Páginas a las que puede llevar un botón de la landing: solo rutas que
// existen, para que no haya enlaces rotos. Sin idioma: la web pone /es o
// /en delante. Las colecciones de Fiesta salen de las visibles.
export function paginasEnlaceLanding() {
  return [
    {
      grupo: 'Páginas',
      opciones: [
        { ruta: '/sobre-fely', nombre: 'Sobre Fely' },
        { ruta: '/visita-fely-campo', nombre: 'Visita Fely Campo (ateliers)' },
        { ruta: '/visita-fely-campo/cita', nombre: 'Pedir cita' },
        { ruta: '/colecciones-fely-campo', nombre: 'Colecciones' },
        { ruta: '/puntos-de-venta-fely-campo', nombre: 'Dónde encontrar Fely Campo' },
        { ruta: '/blog', nombre: 'Blog & Podcast' },
      ],
    },
    {
      grupo: 'Atelier',
      opciones: [
        { ruta: '/atelier', nombre: 'Atelier' },
        { ruta: '/atelier/novias', nombre: 'Atelier Novias' },
        { ruta: '/atelier/fiesta', nombre: 'Atelier Fiesta' },
        { ruta: '/atelier/vosotras', nombre: 'Vosotras' },
      ],
    },
    {
      grupo: 'Una colección de Fiesta',
      opciones: coleccionesVisiblesFiesta().map((interno) => ({
        ruta: `/atelier/fiesta?coleccion=${encodeURIComponent(interno)}`,
        nombre: `Atelier Fiesta · ${sinNumeroColeccion(interno)}`,
      })),
    },
  ];
}

export function nombrePaginaEnlace(ruta) {
  for (const { opciones } of paginasEnlaceLanding()) {
    const encontrada = opciones.find((opcion) => opcion.ruta === ruta);
    if (encontrada) return encontrada.nombre;
  }
  return null;
}

// Texto en el idioma de la página (si faltara el inglés, el español).
export function textoEn(texto, locale) {
  if (!texto) return '';
  return texto[locale] || texto.es || '';
}

export function enlaceEn(ruta, locale) {
  return `/${locale}${ruta || '/'}`;
}

// Las dos diapositivas del carrusel de portada, en el formato de
// HeroCarousel, con la frase y el botón en el idioma de la página.
export function slidesHeroLanding(landing, locale) {
  const {
    imagen, video, videoMovil, texto, boton, enlace,
  } = landing.hero;
  const comun = {
    entradilla: textoEn(texto, locale),
    ctaTexto: textoEn(boton, locale),
    ctaHref: enlaceEn(enlace, locale),
  };
  return [
    {
      src: imagen.escritorio,
      ...(imagen.movil ? { srcMobile: imagen.movil } : {}),
      tipo: 'imagen',
      ...comun,
    },
    {
      src: video,
      ...(videoMovil ? { srcMobile: videoMovil } : {}),
      tipo: 'video',
      ...comun,
    },
  ];
}

// Campos que pueden quedar vacíos a propósito (versiones de móvil).
export const OPCIONALES_LANDING = ['hero.imagen.movil', 'hero.videoMovil'];

// Límites de los vídeos de portada (MB). Por encima de "maximo" el admin
// no deja subirlo; por encima de "aviso", recomienda comprimirlo. El
// servidor debe aplicar los mismos al conectar la base de datos.
export const LIMITES_VIDEO = {
  ordenador: { aviso: 10, maximo: 15, anchoMaximo: 1920 },
  movil: { aviso: 5, maximo: 8, anchoMaximo: 1080 },
  duracionAviso: 30,
};

// Rellena lo que falte en un borrador con lo publicado (para la vista
// previa: un campo obligatorio vacío o un borrador antiguo sin algún
// campo no deben romper la home). Las versiones de móvil vacías se
// respetan: son opcionales.
export function completarLanding(borrador, base) {
  return completarCon(borrador, base, OPCIONALES_LANDING);
}

// Campos de la página (ver lib/camposPagina.js): lo usan el editor
// (qué falta, qué bloque está incompleto) y la validación al publicar.
export function camposLanding(landing) {
  const rutas = paginasEnlaceLanding().flatMap(({ opciones }) => opciones.map((opcion) => opcion.ruta));
  const { hero, atelier, descubre } = landing;
  const campos = [
    {
      bloque: 'portada', nombre: 'la foto de portada para ordenador', tipo: 'medio', valor: hero?.imagen?.escritorio, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'el vídeo de portada', tipo: 'medio', valor: hero?.video, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'la frase de portada', tipo: 'texto', valor: hero?.texto, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'el texto del botón de portada', tipo: 'texto', valor: hero?.boton, requerido: true,
    },
    {
      bloque: 'portada', nombre: 'el botón de portada', tipo: 'enlace', valor: hero?.enlace, rutas,
    },
  ];
  [['novias', 'Atelier Novias'], ['fiesta', 'Atelier Fiesta']].forEach(([clave, nombre]) => {
    const pieza = atelier?.[clave];
    campos.push(
      {
        bloque: 'atelier', nombre: `la foto de ${nombre}`, tipo: 'medio', valor: pieza?.imagen, requerido: true,
      },
      {
        bloque: 'atelier', nombre: `el título de ${nombre}`, tipo: 'texto', valor: pieza?.titulo, requerido: true,
      },
      {
        bloque: 'atelier', nombre: `el texto del botón de ${nombre}`, tipo: 'texto', valor: pieza?.boton, requerido: true,
      },
      {
        bloque: 'atelier', nombre: `el botón de ${nombre}`, tipo: 'enlace', valor: pieza?.enlace, rutas,
      },
    );
  });
  campos.push(
    {
      bloque: 'descubre', nombre: 'la foto de «Descubre a Fely»', tipo: 'medio', valor: descubre?.imagen, requerido: true,
    },
    {
      bloque: 'descubre', nombre: 'el título de «Descubre a Fely»', tipo: 'texto', valor: descubre?.titulo, requerido: true,
    },
    {
      bloque: 'descubre', nombre: 'la cita de «Descubre a Fely»', tipo: 'texto', valor: descubre?.cita, requerido: true,
    },
    {
      bloque: 'descubre', nombre: 'el texto del botón de «Descubre a Fely»', tipo: 'texto', valor: descubre?.boton, requerido: true,
    },
    {
      bloque: 'descubre', nombre: 'el botón de «Descubre a Fely»', tipo: 'enlace', valor: descubre?.enlace, rutas,
    },
  );
  return campos;
}

// Errores en castellano para el admin (y para el servidor, cuando lo haya).
export function validarLanding(landing) {
  return validarCampos(camposLanding(landing));
}
