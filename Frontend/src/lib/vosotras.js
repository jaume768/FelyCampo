// vosotras.js
//
// Fotos y reseñas de clientas de /atelier/vosotras: lo comparten la web
// (GaleriaVosotras.jsx) y el admin (/admin/vosotras).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerVosotras() para que lea de ella. Ver docs/ADMIN.md.

import { contenido } from './contenido';
import { validarCampos } from './camposPagina';

export const ID_PREVIA_VOSOTRAS = 'vosotras';
export const EDITOR_VOSOTRAS = '/admin/vosotras';
export const RUTA_WEB_VOSOTRAS = '/atelier/vosotras';

// Las dos pestañas de la página, en su orden.
export const PESTANAS_VOSOTRAS = [
  { id: 'invitadas', nombre: 'Invitadas', singular: 'invitada' },
  { id: 'novias', nombre: 'Novias', singular: 'novia' },
];

export function obtenerVosotras() {
  return contenido('vosotras');
}

// Looks publicados de una pestaña, en su orden.
export function looksVisibles(datos, pestana) {
  return datos[pestana].filter((look) => look.publicado && look.fotos.length > 0);
}

// La reseña entera de un look (la que se lee junto a sus fotos), si la tiene.
export function resenaDeLook(datos, lookId) {
  const resena = datos.resenas.find((r) => r.publicado && r.look === lookId && r.texto.some((p) => p.trim()));
  return resena ? { firma: resena.firma, parrafos: resena.texto.filter((p) => p.trim()) } : undefined;
}

// Casillas de reseña de la cuadrícula de Invitadas, en su orden:
// { portada (foto de portada de su look, si lo tiene y está visible), extracto, firma }.
export function resenasCuadricula(datos) {
  const visibles = [...looksVisibles(datos, 'invitadas'), ...looksVisibles(datos, 'novias')];
  return datos.resenas
    .filter((r) => r.publicado && r.extracto.trim())
    .map((r) => {
      const look = visibles.find((l) => l.id === r.look);
      return { portada: look?.fotos[0], extracto: r.extracto.trim(), firma: r.firma };
    });
}

// En qué pestaña está un look ('invitadas' | 'novias' | undefined).
export function pestanaDeLook(datos, lookId) {
  return PESTANAS_VOSOTRAS.find(({ id }) => datos[id].some((look) => look.id === lookId))?.id;
}

const vacio = () => ({ es: '', en: '' });
let contador = 0;
export const idNuevo = (prefijo) => `${prefijo}-${Date.now().toString(36)}${(contador += 1).toString(36)}`;

export function nuevoLook() {
  return { id: '', publicado: true, fotos: [] };
}

export function nuevaResena(look = '') {
  return {
    id: '', publicado: true, firma: vacio(), look, extracto: '', texto: [],
  };
}

export function camposLook(datos) {
  return [
    {
      bloque: 'fotos', nombre: 'las fotos', tipo: 'lista', valor: datos.fotos, minimo: 1,
    },
  ];
}

export const validarLook = (datos) => validarCampos(camposLook(datos));

export function camposResena(datos) {
  return [
    {
      bloque: 'resena', nombre: 'quién la escribe', tipo: 'texto', valor: datos.firma, requerido: true,
    },
    {
      bloque: 'resena', nombre: 'el texto de la casilla', tipo: 'medio', valor: datos.extracto.trim(), requerido: true,
    },
  ];
}

export const validarResena = (datos) => validarCampos(camposResena(datos));
