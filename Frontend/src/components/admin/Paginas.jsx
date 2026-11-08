'use client';

/* ============================================================
   PÁGINAS EDITABLES — estado del admin — Fely Campo
   El contenido publicado de las páginas que se editan con EditorPagina
   (inicio, Sobre Fely, Talleres, los ateliers…) mientras se trabaja en el admin. Parte
   de los mismos datos que la web (lib/landing.js, lib/sobreFely.js,
   lib/talleres.js) y vive en el layout del panel, así que lo publicado
   se mantiene al moverse por el admin. Sin base de datos todavía: se
   pierde al recargar.
   PARA EL PROGRAMADOR: guardar(id, datos) es la acción que debe llamar a
   la API (ver docs/ADMIN.md).
   ============================================================ */

import {
  createContext, useCallback, useContext, useState,
} from 'react';
import { obtenerLanding, PARAMETRO_PREVIA_LANDING } from '@/lib/landing';
import { ID_PAGINA_SOBRE_FELY, obtenerSobreFely } from '@/lib/sobreFely';
import { ID_PAGINA_TALLERES, obtenerTalleres } from '@/lib/talleres';
import {
  ID_PAGINA_FIESTA, ID_PAGINA_NOVIAS, ID_PAGINA_PRET_A_PORTER, obtenerEditorialFiesta, obtenerEditorialNovias, obtenerEditorialPretAPorter,
} from '@/lib/atelierEditorial';
import { idPaginaSede, obtenerSedes } from '@/lib/ateliers';
import { ID_PAGINA_CONTACTO, obtenerContacto } from '@/lib/contacto';
import { idPaginaCabecera, obtenerCabeceras } from '@/lib/cabeceras';
import { ID_PAGINA_PIEZAS, obtenerPiezasComunes } from '@/lib/piezasComunes';
import { ID_PAGINA_SEO, obtenerSeoTextos } from '@/lib/seoTextos';

const PaginasContext = createContext(null);

function PaginasProvider({ children }) {
  // Copia profunda: el admin nunca muta los objetos que lee la web.
  const [paginas, setPaginas] = useState(() => structuredClone({
    [PARAMETRO_PREVIA_LANDING]: obtenerLanding(),
    [ID_PAGINA_SOBRE_FELY]: obtenerSobreFely(),
    [ID_PAGINA_TALLERES]: obtenerTalleres(),
    [ID_PAGINA_NOVIAS]: obtenerEditorialNovias(),
    [ID_PAGINA_FIESTA]: obtenerEditorialFiesta(),
    [ID_PAGINA_PRET_A_PORTER]: obtenerEditorialPretAPorter(),
    // Los 3 ateliers (sede-salamanca, sede-madrid, sede-oviedo).
    [ID_PAGINA_CONTACTO]: obtenerContacto(),
    // Fotos del menú, banda «Pedir cita», tarjetas de los ateliers y newsletter.
    [ID_PAGINA_PIEZAS]: obtenerPiezasComunes(),
    // Título y descripción de las páginas fijas en Google.
    [ID_PAGINA_SEO]: obtenerSeoTextos(),
    // Cabeceras de Blog, Vosotras, Runway, Visítanos y Puntos de venta.
    ...Object.fromEntries(Object.entries(obtenerCabeceras()).map(([id, datos]) => [idPaginaCabecera(id), datos])),
    ...Object.fromEntries(obtenerSedes().map((sede) => [idPaginaSede(sede.id), sede])),
  }));

  const guardar = useCallback((id, datos) => {
    setPaginas((actual) => ({ ...actual, [id]: structuredClone(datos) }));
  }, []);

  return (
    <PaginasContext.Provider value={{ paginas, guardar }}>
      {children}
    </PaginasContext.Provider>
  );
}

// Lo publicado de una página y cómo publicar cambios.
function usePagina(id) {
  const contexto = useContext(PaginasContext);
  if (!contexto) throw new Error('usePagina debe usarse dentro de <PaginasProvider>');
  return {
    publicado: contexto.paginas[id],
    guardar: (datos) => contexto.guardar(id, datos),
  };
}

export { PaginasProvider, usePagina };
