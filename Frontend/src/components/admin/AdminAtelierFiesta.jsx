'use client';

/* ============================================================
   ADMIN · COLECCIÓN FIESTA — Fely Campo
   /admin/colecciones/fiesta: la pantalla común de colecciones de
   Atelier (AdminColeccionesAtelier.jsx) con lo propio de Fiesta. Datos y
   reglas: AtelierFiesta.jsx (estado) y lib/catalogoFiesta.js (lo mismo
   que usa la web). Ver docs/ADMIN.md.
   ============================================================ */

import {
  ID_PREVIA_LOOK_FIESTA, RUTA_FICHA_FIESTA, descripcionAutomatica, nombreInternoColeccion, nombreSugeridoLook,
  validarColeccionFiesta, validarLookFiesta,
} from '@/lib/catalogoFiesta';
import { sinNumeroColeccion } from '@/lib/nombreColeccion';
import { ID_PAGINA_FIESTA } from '@/lib/atelierEditorial';
import AdminColeccionesAtelier from './AdminColeccionesAtelier';
import { useAtelierFiesta } from './AtelierFiesta';

const CONFIG_FIESTA = {
  base: '/admin/colecciones/fiesta',
  titulo: 'Colección Fiesta',
  rutaFicha: RUTA_FICHA_FIESTA,
  idPrevia: ID_PREVIA_LOOK_FIESTA,
  conTemporada: true,
  usarCatalogo: useAtelierFiesta,
  // En la web, sin el número de temporada ("Opaline").
  nombreColeccion: (coleccion) => sinNumeroColeccion(nombreInternoColeccion(coleccion)),
  urlColeccion: (coleccion) => `/es${RUTA_FICHA_FIESTA}?coleccion=${encodeURIComponent(nombreInternoColeccion(coleccion))}`,
  pagina: { id: ID_PAGINA_FIESTA, rutaWeb: RUTA_FICHA_FIESTA, titulo: 'Página de Fiesta' },
  nombreSugeridoLook,
  descripcionAutomatica,
  validarLook: validarLookFiesta,
  validarColeccion: validarColeccionFiesta,
  ayudaVisible: 'las publicadas salen en el listado de /atelier/fiesta',
};

function AdminAtelierFiesta() {
  return <AdminColeccionesAtelier config={CONFIG_FIESTA} />;
}

export default AdminAtelierFiesta;
