'use client';

/* ============================================================
   ATELIER NOVIAS — estado del admin — Fely Campo
   Las colecciones y looks de Novias mientras se editan en
   /admin/colecciones/novia. El mismo estado que Fiesta
   (CatalogoAtelier.jsx) con los datos de Novias
   (src/datos/atelierNovias.js, src/lib/catalogoNovias.js). Mantiene al
   día el submenú "Colección Novias" del menú lateral.
   Ver docs/ADMIN.md.
   ============================================================ */

import { categoriasAdminNovias, obtenerColeccionesNovias } from '@/lib/catalogoNovias';
import { crearCatalogoAtelier } from './CatalogoAtelier';

const { Provider, useCatalogo } = crearCatalogoAtelier({
  nombre: 'useAtelierNovias',
  clave: 'colecciones-novias',
  categoriasAdmin: categoriasAdminNovias,
  tipoMenu: 'novia',
});

export { Provider as AtelierNoviasProvider, useCatalogo as useAtelierNovias };
