'use client';

/* ============================================================
   ATELIER FIESTA — estado del admin — Fely Campo
   Las colecciones y looks de Fiesta mientras se editan en
   /admin/colecciones/fiesta. Es el estado común de los catálogos de
   Atelier (CatalogoAtelier.jsx) con los datos de Fiesta
   (src/datos/atelierFiesta.js, src/lib/catalogoFiesta.js). Mantiene al
   día el submenú "Colección Fiesta" del menú lateral.
   Ver docs/ADMIN.md.
   ============================================================ */

import { categoriasAdminFiesta, obtenerColeccionesFiesta } from '@/lib/catalogoFiesta';
import { crearCatalogoAtelier } from './CatalogoAtelier';

const { Provider, useCatalogo } = crearCatalogoAtelier({
  nombre: 'useAtelierFiesta',
  obtener: obtenerColeccionesFiesta,
  categoriasAdmin: categoriasAdminFiesta,
  tipoMenu: 'fiesta',
});

export { Provider as AtelierFiestaProvider, useCatalogo as useAtelierFiesta };
