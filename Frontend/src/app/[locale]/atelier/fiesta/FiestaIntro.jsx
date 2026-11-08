// FiestaIntro.jsx

'use client';

/* ============================================================
   INTRO + CONTENIDO DE /atelier/fiesta — Fely Campo
   Mismo esquema que /blog y /talleres-fely-campo (IntroSeccion:
   título, texto y filtros) con dos pestañas:
     - "Así trabajamos": las imágenes editoriales con texto (BloqueSeccion
       en zigzag) + el backstage.
     - "Colección fiesta": la cuadrícula de looks.
   Por defecto está marcada "Así trabajamos" y se ve TODO seguido, en
   una sola columna: primero "Así trabajamos" y justo debajo la
   colección. "Colección fiesta" enseña solo la colección; volver a
   "Así trabajamos" vuelve a enseñarlo todo seguido (a petición).
   page.js (servidor) le pasa las dos partes ya pintadas ("editorial" y
   "colecciones"), así este componente solo decide qué se ve.
   ============================================================ */

import { useState } from 'react';
// Import directo (no desde el índice de @/components/layout): el índice
// también exporta componentes de servidor que no pueden entrar en un
// componente cliente.
import IntroSeccion from '@/components/layout/IntroSeccion';

export const VISTA_ATELIER = 'atelier';
export const VISTA_COLECCIONES = 'colecciones';

function FiestaIntro({ titulo, texto, etiquetas, editorial, colecciones }) {
  const [vista, setVista] = useState(VISTA_ATELIER);

  return (
    <>
      <IntroSeccion
        titulo={titulo}
        texto={texto}
        filtros={[
          { id: VISTA_ATELIER, etiqueta: etiquetas.atelier },
          { id: VISTA_COLECCIONES, etiqueta: etiquetas.colecciones },
        ]}
        activo={vista}
        onCambiar={setVista}
      />

      {vista === VISTA_ATELIER && editorial}
      {colecciones}
    </>
  );
}

export default FiestaIntro;
