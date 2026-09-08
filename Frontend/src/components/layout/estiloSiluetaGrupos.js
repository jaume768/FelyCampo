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
export function encontrarCategoria(opcion, { esFiesta = false } = {}) {
  for (const grupo of GRUPOS_ESTILO_SILUETA) {
    if (grupo.soloFiesta && !esFiesta) continue;
    if (grupo.opciones.includes(opcion)) return { grupo: grupo.id, opcion };
  }
  return null;
}
