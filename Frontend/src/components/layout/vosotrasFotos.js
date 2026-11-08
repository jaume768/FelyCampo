// vosotrasFotos.js

/* ============================================================
   FOTOS DE CLIENTAS — Fely Campo
   Antes era aquí donde vivían las fotos y reseñas de Vosotras. Ahora
   viven en src/datos/vosotras.js (editables desde /admin/vosotras) y
   este archivo solo las ofrece con la forma antigua a quien aún la usa
   (CarruselClientas.jsx y el inicio del admin). GaleriaVosotras.jsx ya
   lee directamente de lib/vosotras.js.
   ============================================================ */

import {
  looksVisibles, obtenerVosotras, resenaDeLook, resenasCuadricula,
} from '@/lib/vosotras';

const datos = obtenerVosotras();

// Grupos de fotos publicados de cada pestaña (la primera, la portada).
export const FOTOS_INVITADAS = looksVisibles(datos, 'invitadas').map((look) => look.fotos);
export const FOTOS_NOVIAS = looksVisibles(datos, 'novias').map((look) => look.fotos);

// Reseña entera de cada look, por la foto de portada: { firma, parrafos }.
export const RESENAS_VOSOTRAS = Object.fromEntries(
  [...looksVisibles(datos, 'invitadas'), ...looksVisibles(datos, 'novias')]
    .map((look) => [look.fotos[0], resenaDeLook(datos, look.id)])
    .filter(([, resena]) => resena),
);

// Casillas de reseña de la cuadrícula de Invitadas: { portada, extracto, firma }.
export const RESENAS_INTERCALADAS = resenasCuadricula(datos);
