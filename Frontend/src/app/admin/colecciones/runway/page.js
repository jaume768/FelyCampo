'use client';

/* /admin/colecciones/runway — colecciones de pasarela, con los mismos
   datos que enseñan /colecciones-fely-campo y /runways-<slug> (ver
   components/admin/AdminRunway.jsx y docs/ADMIN.md). Antes usaba
   ListaProductos (vista genérica con datos de ejemplo). */

import { Suspense } from 'react';
import AdminRunway from '@/components/admin/AdminRunway';

export default function ProductosRunwayPage() {
  // Suspense: la pantalla lee la URL (useSearchParams).
  return (
    <Suspense fallback={null}>
      <AdminRunway />
    </Suspense>
  );
}
