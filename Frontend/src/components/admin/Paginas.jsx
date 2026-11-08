'use client';

/* ============================================================
   PÁGINAS EDITABLES — estado del admin — Fely Campo
   El contenido publicado de las páginas que se editan con EditorPagina
   (inicio, Sobre Fely, Talleres, los ateliers…). Cada página es un
   documento de la base de datos o una parte de uno (las cabeceras y los
   ateliers comparten documento):

     usePagina(id) → { publicado, guardar(datos) }

   guardar() publica en la base de datos a través de ContenidoAdmin.jsx
   (con su versión, subida de fotos y aviso de conflicto si otra persona
   ha publicado entretanto). Antes vivía en memoria y se perdía al recargar.
   ============================================================ */

import { useCallback } from 'react';
import { PARAMETRO_PREVIA_LANDING } from '@/lib/landing';
import { ID_PAGINA_SOBRE_FELY } from '@/lib/sobreFely';
import { ID_PAGINA_TALLERES } from '@/lib/talleres';
import { ID_PAGINA_FIESTA, ID_PAGINA_NOVIAS, ID_PAGINA_PRET_A_PORTER } from '@/lib/atelierEditorial';
import { ID_PAGINA_CONTACTO } from '@/lib/contacto';
import { ID_PAGINA_PIEZAS } from '@/lib/piezasComunes';
import { ID_PAGINA_SEO } from '@/lib/seoTextos';
import { useContenidoAdmin } from './ContenidoAdmin';

// id de página del panel → documento de la base de datos.
const DOCUMENTO_DE_PAGINA = {
  [PARAMETRO_PREVIA_LANDING]: 'landing',
  [ID_PAGINA_SOBRE_FELY]: 'sobre-fely',
  [ID_PAGINA_TALLERES]: 'talleres',
  [ID_PAGINA_NOVIAS]: 'editorial-novias',
  [ID_PAGINA_FIESTA]: 'editorial-fiesta',
  [ID_PAGINA_PRET_A_PORTER]: 'editorial-pret-a-porter',
  [ID_PAGINA_CONTACTO]: 'contacto',
  [ID_PAGINA_PIEZAS]: 'piezas-comunes',
  [ID_PAGINA_SEO]: 'seo-textos',
};

// Las que son una parte de un documento: «cabecera-blog» es
// cabeceras.blog; «sede-madrid», sedes.madrid.
const PARTES = [
  { prefijo: 'cabecera-', documento: 'cabeceras' },
  { prefijo: 'sede-', documento: 'sedes' },
];

export function ubicacionPagina(id) {
  if (DOCUMENTO_DE_PAGINA[id]) return { documento: DOCUMENTO_DE_PAGINA[id], parte: null };
  const parte = PARTES.find(({ prefijo }) => id.startsWith(prefijo));
  if (parte) return { documento: parte.documento, parte: id.slice(parte.prefijo.length) };
  throw new Error(`Página desconocida en el panel: ${id}`);
}

// Se mantiene el nombre del proveedor (lo monta app/admin/layout.js), pero
// el estado vive en ContenidoAdmin.
function PaginasProvider({ children }) {
  return children;
}

// Lo publicado de una página y cómo publicar cambios.
function usePagina(id) {
  const { documentos, publicar } = useContenidoAdmin();
  const { documento, parte } = ubicacionPagina(id);
  const publicado = parte ? documentos[documento]?.[parte] : documentos[documento];
  const guardar = useCallback(
    (datos) => publicar(documento, parte
      ? (actual) => ({ ...actual, [parte]: structuredClone(datos) })
      : structuredClone(datos)),
    [documento, parte, publicar],
  );
  return { publicado, guardar };
}

export { PaginasProvider, usePagina };
