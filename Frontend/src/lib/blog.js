// blog.js
//
// Artículos y episodios de /blog: lo comparten la web
// (app/[locale]/blog, BlogArticulo.jsx) y el admin (/admin/blog).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerArticulos() y obtenerEpisodios() para que lean de ella. Ver
// docs/ADMIN.md.

import { ARTICULOS, EPISODIOS } from '@/datos/blog';
import { validarCampos } from './camposPagina';

export const EDITOR_BLOG = '/admin/blog';

// Claves de la vista previa (lib/previa.js): ?previa=blog-<slug> en la
// página del artículo y ?previa=podcast-<slug> en el listado.
export const idPreviaArticulo = (slug) => `blog-${slug}`;
export const idPreviaEpisodio = (slug) => `podcast-${slug}`;

// Slug provisional de una entrada que todavía no se ha publicado (su
// dirección se crea a partir del título al publicarla).
export const SLUG_NUEVO = 'nuevo';

// Fotos de un bloque "Fotos en fila".
export const FOTOS_FILA = { minimo: 2, maximo: 4 };

export function obtenerArticulos() {
  return ARTICULOS;
}

export function obtenerEpisodios() {
  return EPISODIOS;
}

// Lo que se ve en la web: artículos publicados, del más reciente al más
// antiguo, y episodios publicados en su orden.
export function articulosVisibles(articulos = obtenerArticulos()) {
  return articulos.filter((articulo) => articulo.publicado).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function episodiosVisibles(episodios = obtenerEpisodios()) {
  return episodios.filter((episodio) => episodio.publicado);
}

export function articuloPorSlug(slug, articulos = obtenerArticulos()) {
  return articulos.find((articulo) => articulo.slug === slug);
}

export function esEpisodio(slug, episodios = obtenerEpisodios()) {
  return episodios.some((episodio) => episodio.slug === slug);
}

// "La Niña de la Aguja" → "la-nina-de-la-aguja", sin repetir ninguno
// de los que ya existen (artículos y episodios comparten /blog/<slug>).
export function slugDesdeTitulo(titulo, existentes = []) {
  const base = String(titulo || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '') || 'entrada';
  let slug = base;
  for (let numero = 2; existentes.includes(slug) || slug === SLUG_NUEVO; numero += 1) slug = `${base}-${numero}`;
  return slug;
}

const vacio = () => ({ es: '', en: '' });
const hoy = () => new Date().toISOString().slice(0, 10);

export function nuevoArticulo() {
  return {
    slug: '', publicado: true, fecha: hoy(), imagenCubierta: '', titulo: vacio(), resumen: vacio(),
    // Id fijo: el artículo vacío se crea igual en el servidor y en el
    // navegador (los bloques que se añadan después ya llevan uno único).
    bloques: [{ ...nuevoBloque('texto'), id: 'b1' }],
  };
}

export function nuevoEpisodio() {
  return {
    slug: '', publicado: true, titulo: vacio(), enlace: '', imagenCubierta: '', duracion: '',
  };
}

let contador = 0;
const idBloque = () => `b${Date.now().toString(36)}${(contador += 1).toString(36)}`;

// Un bloque vacío del cuerpo de un artículo (ver datos/blog.js).
export function nuevoBloque(tipo) {
  const id = idBloque();
  if (tipo === 'texto') return { id, tipo, texto: { es: [''], en: [''] } };
  if (tipo === 'subtitulo') return { id, tipo, texto: vacio() };
  if (tipo === 'foto') return { id, tipo, src: '', alt: '', pie: vacio() };
  if (tipo === 'fotos') return { id, tipo, fotos: [] };
  if (tipo === 'cita') return { id, tipo, texto: vacio(), autor: vacio() };
  throw new Error(`Tipo de bloque desconocido: ${tipo}`);
}

// Nombre de cada tipo de bloque en el editor.
export const TIPOS_BLOQUE = {
  texto: 'Texto',
  subtitulo: 'Subtítulo',
  foto: 'Foto',
  fotos: 'Fotos en fila',
  cita: 'Cita destacada',
};

// Descripción de la foto (alt): la escrita o, si no hay, su pie.
export function altFoto(foto, locale, porDefecto = '') {
  return foto.alt || foto.pie?.[locale] || foto.pie?.es || porDefecto;
}

// Campos de un artículo (ver lib/camposPagina.js). Bloques del editor:
// "datos" (cabecera y tarjeta) y "cuerpo".
export function camposArticulo(datos) {
  const campos = [
    {
      bloque: 'datos', nombre: 'el título', tipo: 'texto', valor: datos.titulo, requerido: true,
    },
    {
      bloque: 'datos', nombre: 'el resumen', tipo: 'texto', valor: datos.resumen, requerido: true,
    },
    {
      bloque: 'datos', nombre: 'la foto de portada', tipo: 'medio', valor: datos.imagenCubierta, requerido: true,
    },
    {
      bloque: 'datos', nombre: 'la fecha', tipo: 'medio', valor: datos.fecha, requerido: true,
    },
    {
      bloque: 'cuerpo', nombre: 'el contenido', tipo: 'lista', valor: datos.bloques, minimo: 1,
    },
  ];
  datos.bloques.forEach((bloque, indice) => {
    const de = `del bloque ${indice + 1} (${TIPOS_BLOQUE[bloque.tipo]})`;
    if (bloque.tipo === 'foto') {
      campos.push(
        {
          bloque: 'cuerpo', nombre: `la foto ${de}`, tipo: 'medio', valor: bloque.src, requerido: true,
        },
        {
          bloque: 'cuerpo', nombre: `el pie ${de}`, tipo: 'texto', valor: bloque.pie, requerido: false,
        },
      );
    } else if (bloque.tipo === 'fotos') {
      campos.push({
        bloque: 'cuerpo', nombre: `las fotos ${de}`, tipo: 'lista', valor: bloque.fotos, minimo: FOTOS_FILA.minimo, maximo: FOTOS_FILA.maximo,
      });
      bloque.fotos.forEach((foto, posicion) => campos.push({
        bloque: 'cuerpo', nombre: `el pie de la foto ${posicion + 1} ${de}`, tipo: 'texto', valor: foto.pie, requerido: false,
      }));
    } else {
      campos.push({
        bloque: 'cuerpo', nombre: `el texto ${de}`, tipo: 'texto', valor: bloque.texto, requerido: true,
      });
      if (bloque.tipo === 'cita') {
        campos.push({
          bloque: 'cuerpo', nombre: `quién dice la cita ${de}`, tipo: 'texto', valor: bloque.autor, requerido: false,
        });
      }
    }
  });
  return campos;
}

export const validarArticulo = (datos) => validarCampos(camposArticulo(datos));

export function camposEpisodio(datos) {
  return [
    {
      bloque: 'episodio', nombre: 'el título', tipo: 'texto', valor: datos.titulo, requerido: true,
    },
    {
      bloque: 'episodio', nombre: 'la foto de portada', tipo: 'medio', valor: datos.imagenCubierta, requerido: true,
    },
    {
      bloque: 'episodio', nombre: 'el enlace al episodio', tipo: 'url', valor: datos.enlace, requerido: true,
    },
    {
      bloque: 'episodio', nombre: 'la duración', tipo: 'medio', valor: datos.duracion, requerido: true,
    },
  ];
}

export const validarEpisodio = (datos) => validarCampos(camposEpisodio(datos));
