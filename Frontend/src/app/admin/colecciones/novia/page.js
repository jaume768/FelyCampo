'use client';

/* /admin/colecciones/novia — colecciones y looks de Atelier Novias con
   los mismos datos que enseñan sus fichas y páginas de categoría (ver
   components/admin/AdminAtelierNovias.jsx y docs/ADMIN.md).
   Antes usaba ListaProductos (vista genérica con datos de ejemplo). */

import { Suspense } from 'react';
import AdminAtelierNovias from '@/components/admin/AdminAtelierNovias';

export default function ProductosNoviaPage() {
  // Suspense: la pantalla lee la URL (useSearchParams).
  return (
    <Suspense fallback={null}>
      <AdminAtelierNovias />
    </Suspense>
  );
}
