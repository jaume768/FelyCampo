// seoTextos.js
//
// Lectura y reglas de los textos de Google (title, description y el H1
// oculto) de las páginas fijas. Los datos: src/datos/seoTextos.js. Los
// lee metadataPagina() / textosSeo() en lib/seo.js y el sitemap; los
// edita «Textos de Google» en el admin (AdminTextosGoogle.jsx).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerSeoTextos(). Ver docs/ADMIN.md.

import { SEO_TEXTOS } from '@/datos/seoTextos';

export const ID_PAGINA_SEO = 'textos-google';

export function obtenerSeoTextos() {
  return SEO_TEXTOS;
}

// Largos recomendados: lo que Google suele mostrar antes de cortar con «…».
export const LARGO_TITULO = 60;
export const LARGO_DESCRIPCION = 160;

// Las páginas que se editan en el admin, agrupadas como en su menú.
// Quedan fuera (fijas a propósito) las privadas y las confirmaciones de
// cita: no salen en Google (noindex).
export const GRUPOS_SEO = [
  {
    id: 'inicio',
    nombre: 'Inicio y Sobre Fely',
    paginas: [
      ['/', 'Página de inicio'],
      ['/sobre-fely', 'Historia de Fely'],
      ['/blog', 'Blog & Podcast'],
      ['/talleres-fely-campo', 'Nuestros talleres'],
    ],
  },
  {
    id: 'atelier',
    nombre: 'Atelier y colecciones',
    paginas: [
      ['/atelier', 'Atelier'],
      ['/atelier-fiesta/salamanca', 'Atelier Salamanca'],
      ['/atelier-fiesta/madrid', 'Showroom Madrid'],
      ['/atelier-fiesta/oviedo', 'Atelier Oviedo'],
      ['/atelier/vosotras', 'Vosotras'],
      ['/atelier/fiesta', 'Colección Fiesta'],
      ['/atelier/novias', 'Colección Novias'],
      ['/colecciones-fely-campo', 'Runway'],
    ],
  },
  {
    id: 'pretaporter',
    nombre: 'Prêt-à-porter',
    paginas: [
      ['/pret-a-porter', 'Prêt-à-porter'],
    ],
  },
  {
    id: 'donde',
    nombre: 'Dónde encontrarnos',
    paginas: [
      ['/visita-fely-campo', 'Visítanos'],
      ['/visita-fely-campo/cita', 'Pedir cita'],
      ['/puntos-de-venta-fely-campo', 'Puntos de venta'],
    ],
  },
  {
    id: 'legal',
    nombre: 'Textos legales',
    paginas: [
      ['/legal/aviso-legal', 'Aviso legal'],
      ['/legal/privacidad', 'Política de privacidad'],
      ['/legal/cookies', 'Política de cookies'],
      ['/legal/terminos', 'Términos y condiciones'],
    ],
  },
];

export function camposSeo(datos) {
  return GRUPOS_SEO.flatMap(({ id, paginas }) => paginas.flatMap(([ruta, nombre]) => [
    {
      bloque: id, nombre: `el título de «${nombre}»`, tipo: 'texto', valor: datos[ruta].title, requerido: true,
    },
    {
      bloque: id, nombre: `la descripción de «${nombre}»`, tipo: 'texto', valor: datos[ruta].description, requerido: true,
    },
    ...(datos[ruta].h1 ? [{
      bloque: id, nombre: `el título principal de «${nombre}»`, tipo: 'texto', valor: datos[ruta].h1, requerido: true,
    }] : []),
  ]));
}

const normalizar = (texto) => String(texto || '').replace(/\s+/g, ' ').trim().toLowerCase();

// Lo que no es «falta un campo»: que dos páginas no compartan título ni
// descripción en el mismo idioma (Google las tomaría por repetidas).
export function validarExtraSeo(datos) {
  const errores = [];
  const paginas = GRUPOS_SEO.flatMap((grupo) => grupo.paginas);
  [['title', 'el mismo título'], ['description', 'la misma descripción']].forEach(([campo, texto]) => {
    ['es', 'en'].forEach((idioma) => {
      const vistos = new Map();
      paginas.forEach(([ruta, nombre]) => {
        const valor = normalizar(datos[ruta][campo]?.[idioma]);
        if (!valor) return;
        if (vistos.has(valor)) {
          errores.push(`«${vistos.get(valor)}» y «${nombre}» tienen ${texto} (${idioma === 'es' ? 'español' : 'inglés'}). Cada página necesita el suyo.`);
        } else vistos.set(valor, nombre);
      });
    });
  });
  return errores;
}
