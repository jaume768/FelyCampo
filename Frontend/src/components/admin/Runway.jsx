'use client';

/* ============================================================
   RUNWAY — estado del admin — Fely Campo
   Las colecciones de pasarela publicadas mientras se trabaja en el
   admin. Parte de los mismos datos que la web (lib/runway.js) y vive en
   el layout del panel. Mantiene al día el submenú "Runway" del menú
   lateral. Sin base de datos todavía: se pierde al recargar.
   PARA EL PROGRAMADOR: cada acción es una llamada a la API (ver
   docs/ADMIN.md).
   ============================================================ */

import {
  createContext, useCallback, useContext, useEffect, useState,
} from 'react';
import {
  categoriasAdminRunway, obtenerColeccionesRunway, slugRunway, SLUG_NUEVA_RUNWAY,
} from '@/lib/runway';
import { useCategorias } from './Categorias';
import { useDocumentoAdmin } from './ContenidoAdmin';

const RunwayContext = createContext(null);

function RunwayProvider({ children }) {
  // Copia profunda: el admin nunca muta los objetos que lee la web.
  const [colecciones, setColecciones] = useDocumentoAdmin('colecciones-runway');
  const { reordenarCategorias } = useCategorias();

  useEffect(() => {
    reordenarCategorias('archivo', categoriasAdminRunway(colecciones));
  }, [colecciones, reordenarCategorias]);

  // Guarda una colección y devuelve su id. Una nueva recibe su dirección
  // a partir del nombre y va la primera (la más reciente).
  const guardar = useCallback((datos, idAnterior) => {
    if (!idAnterior || idAnterior === SLUG_NUEVA_RUNWAY) {
      const slug = slugRunway(datos.nombre, colecciones.map((c) => c.slug));
      setColecciones((actual) => [{ ...structuredClone(datos), id: slug, slug }, ...actual]);
      return slug;
    }
    setColecciones((actual) => actual.map((c) => (c.id === idAnterior ? { ...structuredClone(datos), id: c.id, slug: c.slug } : c)));
    return idAnterior;
  }, [colecciones]);

  const valor = {
    colecciones,
    guardar,
    alternar: (id) => setColecciones((actual) => actual.map((c) => (c.id === id ? { ...c, publicado: !c.publicado } : c))),
    borrar: (id) => setColecciones((actual) => actual.filter((c) => c.id !== id)),
    reordenar: setColecciones,
  };

  return <RunwayContext.Provider value={valor}>{children}</RunwayContext.Provider>;
}

function useRunway() {
  const contexto = useContext(RunwayContext);
  if (!contexto) throw new Error('useRunway debe usarse dentro de <RunwayProvider>');
  return contexto;
}

export { RunwayProvider, useRunway };
