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
  looksVisibles, resenaDeLook, resenasCuadricula,
} from '@/lib/vosotras';
import { derivado } from '@/lib/contenido';

// Funciones memorizadas y no constantes: el contenido viene de la base de
// datos y no está cargado al importar (ver src/lib/contenido.js).
const vista = derivado('vosotras', (datos) => ({
  invitadas: looksVisibles(datos, 'invitadas').map((look) => look.fotos),
  novias: looksVisibles(datos, 'novias').map((look) => look.fotos),
  resenas: Object.fromEntries(
    [...looksVisibles(datos, 'invitadas'), ...looksVisibles(datos, 'novias')]
      .map((look) => [look.fotos[0], resenaDeLook(datos, look.id)])
      .filter(([, resena]) => resena),
  ),
  intercaladas: resenasCuadricula(datos),
}));

export const fotosInvitadas = () => vista().invitadas;
export const fotosNovias = () => vista().novias;
export const resenasVosotras = () => vista().resenas;
export const resenasIntercaladas = () => vista().intercaladas;
