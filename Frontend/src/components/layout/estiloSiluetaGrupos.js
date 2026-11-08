// estiloSiluetaGrupos.js
//
// "Estilo y silueta" (Atelier Novias/Fiesta) — un único sitio para los
// grupos/opciones (Ocasión, Silueta, Volumen, Largo, Estilo, Detalles)
// que antes vivían solo dentro de PanelFiltros.jsx. Se extrae aquí
// porque ahora los usan tres sitios que no deben importarse entre sí:
// PanelFiltros.jsx (los chips del filtro), CuadriculaProductos.jsx
// (resuelve "categoriaActiva" en miga de pan/título) y las páginas
// /atelier/{novias,fiesta}/categoria/[categoria]/page.js (Server
// Components — generan los slugs válidos y su metadata). Mismas claves
// de traducción que antes: filtros.estiloYSilueta.grupos.*.
// "ocasion" solo tiene sentido en Fiesta (soloFiesta: true) — no en
// Novias — y es el primer sub-bloque (antes iba último).
export const GRUPOS_ESTILO_SILUETA = [
  { id: 'ocasion', opciones: ['alfombraRoja', 'noche', 'tarde', 'dia'], soloFiesta: true },
  { id: 'silueta', opciones: ['corteA', 'recto', 'sirena', 'princesa'] },
  { id: 'volumen', opciones: ['dosPiezas'] },
  { id: 'largo', opciones: ['corto', 'midi', 'largo', 'cola'] },
  { id: 'estilo', opciones: ['minimal', 'lencero', 'diferente', 'clasico', 'romantico'] },
  { id: 'detalles', opciones: ['asimetrico', 'escoteEspalda', 'fluido', 'mangas'] },
];

// Slug de URL (segmento "categoria", ver
// /atelier/{seccion}/categoria/[categoria]/page.js) -> {grupo, opcion}
// que necesita PanelFiltros para preseleccionar el chip. "esFiesta"
// también acepta las opciones de "ocasion" (soloFiesta); Novias no.
// Slug de URL de una opción: minúsculas con guiones (SEO) — "corteA" →
// "corte-a", "alfombraRoja" → "alfombra-roja". El id interno (camelCase)
// sigue siendo la clave de traducción y del filtro; solo la URL cambia.
export function slugCategoria(opcion) {
  return opcion.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);
}

// Acepta el slug de la URL ("corte-a"), no el id interno: las URLs
// antiguas en camelCase redirigen con 301 (ver next.config.mjs).
export function encontrarCategoria(slug, { esFiesta = false } = {}) {
  for (const grupo of GRUPOS_ESTILO_SILUETA) {
    if (grupo.soloFiesta && !esFiesta) continue;
    const opcion = grupo.opciones.find((candidata) => slugCategoria(candidata) === slug);
    if (opcion) return { grupo: grupo.id, opcion };
  }
  return null;
}

// Etiqueta en español de cada opción (mismo texto que
// filtros.estiloYSilueta.grupos.*.opciones.* en messages/es.json,
// normalizado sin acentos/mayúsculas) — solo para reconocer, dentro de
// un tag REAL del excel de una colección (ver "Tags (categoría)" en
// noviaProductos.js), cuál coincide con una opción de este filtro y
// así poder enlazarlo a su página de categoría real
// (FichaProductoAtelier.jsx). Los tags sin entrada aquí (tejidos,
// "Colección", el nombre de la propia colección...) no tienen
// categoría equivalente — se pintan como texto suelto, sin forzarlos.
const ETIQUETAS_ES = {
  corteA: ['corte a'],
  recto: ['recto'],
  sirena: ['sirena'],
  princesa: ['princesa'],
  dosPiezas: ['dos piezas'],
  corto: ['corto'],
  midi: ['midi'],
  largo: ['largo'],
  cola: ['cola'],
  minimal: ['minimal'],
  lencero: ['lencero'],
  diferente: ['diferente'],
  clasico: ['clasico'],
  romantico: ['romantico'],
  asimetrico: ['asimetrico'],
  escoteEspalda: ['escote espalda'],
  fluido: ['fluido'],
  mangas: ['mangas', 'manga'],
};

function normalizarEtiqueta(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// Tag real (string, tal cual viene del excel) -> {grupo, opcion}, o
// null si no coincide con ninguna opción conocida.
export function tagACategoria(tag, { esFiesta = false } = {}) {
  const normalizado = normalizarEtiqueta(tag);
  for (const grupo of GRUPOS_ESTILO_SILUETA) {
    if (grupo.soloFiesta && !esFiesta) continue;
    for (const opcion of grupo.opciones) {
      if ((ETIQUETAS_ES[opcion] || []).includes(normalizado)) return { grupo: grupo.id, opcion };
    }
  }
  return null;
}
