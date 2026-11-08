// ListadoTalleres.jsx

'use client';

/* ============================================================
   INTRO + LISTADO DE /talleres-fely-campo — Fely Campo
   Misma estructura que /blog (ver blog/ListadoPodcastBlog.jsx):
   IntroSeccion (título, texto y filtros) y, debajo, la lista de
   talleres. Componente cliente por los filtros: "Ver todo" y uno por
   taller ("Taller propio", "Taller I", "Taller II"), que muestran solo
   ese taller sin salir de la página.

   page.js (servidor) le pasa cada taller ya pintado ({id, contenido} —
   el <li> entero con su carrusel e info), así este componente solo
   decide cuáles se ven, sin duplicar el marcado del taller aquí.
   ============================================================ */

import { Fragment, useState } from 'react';
// Import directo (no desde el índice de @/components/layout): el índice
// también exporta componentes de servidor que no pueden entrar en un
// componente cliente.
import IntroSeccion from '@/components/layout/IntroSeccion';
import styles from './page.module.css';

const TODO = 'todo';

function ListadoTalleres({ titulo, texto, etiquetaTodo, talleres }) {
  const [filtro, setFiltro] = useState(TODO);

  const filtros = [
    { id: TODO, etiqueta: etiquetaTodo },
    ...talleres.map(({ id, etiqueta }) => ({ id, etiqueta })),
  ];
  const visibles = filtro === TODO ? talleres : talleres.filter(({ id }) => id === filtro);

  return (
    <>
      <IntroSeccion
        className={styles.intro}
        titulo={titulo}
        texto={texto}
        filtros={filtros}
        activo={filtro}
        onCambiar={setFiltro}
      />

      <div className="contenedor">
        <ul className={styles.grid}>
          {visibles.map(({ id, contenido }) => (
            <Fragment key={id}>{contenido}</Fragment>
          ))}
        </ul>
      </div>
    </>
  );
}

export default ListadoTalleres;
