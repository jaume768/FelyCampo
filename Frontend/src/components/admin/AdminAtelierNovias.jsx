'use client';

/* ============================================================
   ADMIN · COLECCIÓN NOVIAS — Fely Campo
   /admin/colecciones/novia: la misma pantalla que Colección Fiesta
   (AdminColeccionesAtelier.jsx) con lo propio de Novias: sin temporada y
   sin página de colección en la web (las colecciones publicadas salen en
   las cuadrículas de las páginas de categoría). Datos y reglas:
   AtelierNovias.jsx (estado) y lib/catalogoNovias.js (lo mismo que usa
   la web). Ver docs/ADMIN.md.
   ============================================================ */

import {
  ID_PREVIA_LOOK_NOVIAS, RUTA_FICHA_NOVIAS, descripcionAutomaticaNovia, nombreSugeridoLookNovia,
  validarColeccionNovia, validarLookNovia,
} from '@/lib/catalogoNovias';
import { ID_PAGINA_NOVIAS } from '@/lib/atelierEditorial';
import AdminColeccionesAtelier from './AdminColeccionesAtelier';
import { useAtelierNovias } from './AtelierNovias';

const CONFIG_NOVIAS = {
  base: '/admin/colecciones/novia',
  titulo: 'Colección Novias',
  rutaFicha: RUTA_FICHA_NOVIAS,
  idPrevia: ID_PREVIA_LOOK_NOVIAS,
  conTemporada: false,
  usarCatalogo: useAtelierNovias,
  nombreColeccion: (coleccion) => (coleccion.nombre || '').trim(),
  urlColeccion: null,
  pagina: { id: ID_PAGINA_NOVIAS, rutaWeb: '/atelier/novias', titulo: 'Página de Novias' },
  nombreSugeridoLook: nombreSugeridoLookNovia,
  descripcionAutomatica: descripcionAutomaticaNovia,
  validarLook: validarLookNovia,
  validarColeccion: validarColeccionNovia,
  ayudaVisible: 'los looks de las publicadas se ven en la web; los de las ocultas, en ningún sitio',
  // Recuadro de explicación, según haya o no colecciones publicadas.
  aviso: (colecciones) => (colecciones.some((c) => c.visible) ? (
    <p>
      <strong>Solo se ven en la web los looks de las colecciones publicadas</strong> (su ficha, las páginas de categoría y Google).
      Los de las ocultas no se ven en ningún sitio, pero se pueden seguir editando.
    </p>
  ) : (
    <>
      <p><strong>Ahora mismo los vestidos de novia no se enseñan en la web:</strong> todas las colecciones están ocultas.</p>
      <p>
        Las fotos que se ven en la página de Novias (/atelier/novias) son las de su portada y sus bloques de texto: son
        editoriales, no estos looks. Las fichas de estos looks no se pueden abrir, no salen en ninguna página ni en Google.
      </p>
      <p>
        Cuando queráis enseñar una colección, pulsad su ojo (<em>Mostrar en la web</em>): sus looks volverán a tener su ficha
        y a salir en las páginas de categoría y en Google. Mientras tanto podéis seguir editándolos.
      </p>
    </>
  )),
};

function AdminAtelierNovias() {
  return <AdminColeccionesAtelier config={CONFIG_NOVIAS} />;
}

export default AdminAtelierNovias;
