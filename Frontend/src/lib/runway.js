// runway.js
//
// Colecciones de pasarela: lo comparten la web (/colecciones-fely-campo,
// /runways-<slug>, el sitemap) y el admin (/admin/colecciones/runway).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerColeccionesRunway(). Ver docs/ADMIN.md.

import { productosEjemplo } from '@/components/layout/productosEjemplo';
import { COLECCIONES_RUNWAY } from '@/datos/runway';
import { slugify } from './slugify';

export const EDITOR_RUNWAY = '/admin/colecciones/runway';
export const SLUG_NUEVA_RUNWAY = 'nueva';
// Vista previa: /runways-<slug>?previa=runway-<slug>.
export const idPreviaRunway = (slug) => `runway-${slug}`;

export function obtenerColeccionesRunway() {
  return COLECCIONES_RUNWAY;
}

// Las que salen en la web, en su orden.
export function coleccionesVisiblesRunway(colecciones = obtenerColeccionesRunway()) {
  return colecciones.filter((coleccion) => coleccion.publicado);
}

export function coleccionRunwayPorSlug(slug, colecciones = coleccionesVisiblesRunway()) {
  return colecciones.find((coleccion) => coleccion.slug === slug);
}

const enIdioma = (texto, locale) => ((texto?.[locale] || '').trim() || (texto?.es || '').trim());

// Una colección → lo que pintan las plantillas de la web (la misma forma
// que tenía el antiguo colecciones.js).
export function coleccionParaWeb(coleccion, locale) {
  const enlace = coleccion.videoEnlace;
  return {
    slug: coleccion.slug,
    nombre: coleccion.nombre,
    temporada: coleccion.temporada,
    medios: coleccion.portada ? [{ src: coleccion.portada }] : [],
    descripcion: enIdioma(coleccion.descripcion, locale),
    backstage: coleccion.backstage || [],
    looks: (coleccion.looks || []).map((look) => ({
      imagen: look.src,
      descripcion: enIdioma(look.pie, locale) || undefined,
      productos: (look.productos || []).map((indice) => productosEjemplo[indice]).filter(Boolean),
    })),
    video: coleccion.video || undefined,
    videoEnlace: !coleccion.video && enlace?.href
      ? {
        href: enlace.href, imagen: enlace.imagen, titulo: enlace.titulo, meta: enIdioma(enlace.meta, locale),
      }
      : undefined,
  };
}

// "La Colección" → "la-coleccion", sin repetir ninguno de los existentes.
export function slugRunway(nombre, existentes = []) {
  const base = slugify(nombre || '') || 'coleccion';
  let slug = base;
  for (let numero = 2; existentes.includes(slug) || slug === SLUG_NUEVA_RUNWAY; numero += 1) slug = `${base}-${numero}`;
  return slug;
}

export function nuevaColeccionRunway() {
  return {
    id: '',
    slug: '',
    publicado: true,
    nombre: '',
    temporada: '',
    portada: '',
    descripcion: { es: '', en: '' },
    backstage: [],
    looks: [],
    video: '',
    videoEnlace: {
      href: '', imagen: '', titulo: '', meta: { es: 'Ver el desfile completo en YouTube', en: 'Watch the full show on YouTube' },
    },
  };
}

// Campos (ver lib/camposPagina.js). La descripción en inglés es opcional:
// si falta, se enseña la española (como hasta ahora).
export function camposColeccionRunway(datos) {
  return [
    {
      bloque: 'datos', nombre: 'el nombre', tipo: 'medio', valor: (datos.nombre || '').trim(), requerido: true,
    },
    {
      bloque: 'datos', nombre: 'la temporada', tipo: 'medio', valor: (datos.temporada || '').trim(), requerido: true,
    },
    {
      bloque: 'portada', nombre: 'la foto de portada', tipo: 'medio', valor: datos.portada, requerido: true,
    },
    {
      bloque: 'descripcion', nombre: 'el texto en español', tipo: 'medio', valor: (datos.descripcion?.es || '').trim(), requerido: true,
    },
    {
      bloque: 'looks', nombre: 'las fotos de los looks', tipo: 'lista', valor: datos.looks, minimo: 1,
    },
    {
      bloque: 'video', nombre: 'el enlace al desfile', tipo: 'url', valor: datos.videoEnlace?.href, requerido: false,
    },
  ];
}

// Temporada: dos letras y dos cifras, como las de siempre ("AW27", "SS26").
export function validarExtraRunway(datos) {
  const temporada = (datos.temporada || '').trim();
  return temporada && !/^(AW|SS|FW)\d{2}$/i.test(temporada)
    ? ['La temporada se escribe con AW o SS y dos cifras, por ejemplo AW27 o SS26.']
    : [];
}

// ---------- Admin: submenú "Runway" del menú lateral ----------
// La forma que espera Categorias.jsx. La usan Runway.jsx (estado) y
// mockData.js (estado inicial del menú, para que coincidan desde el
// principio y no haya saltos al cargar).
export function categoriasAdminRunway(colecciones = obtenerColeccionesRunway()) {
  return colecciones.map((coleccion, indice) => ({
    id: coleccion.id,
    nombre: `${coleccion.nombre}${coleccion.temporada ? ` (${coleccion.temporada})` : ''}`,
    visible: coleccion.publicado,
    orden: indice + 1,
    fija: true,
    numeroLooks: coleccion.looks.length,
    looks: coleccion.looks.map((look, posicion) => ({ nombre: `Look ${posicion + 1}`, imagenes: [look.src] })),
  }));
}
