'use client';

/* /admin/colecciones/fiesta — colecciones y looks de Atelier Fiesta con
   los mismos datos que enseña /atelier/fiesta (ver
   components/admin/AdminAtelierFiesta.jsx y docs/ADMIN.md).
   Antes usaba ListaProductos (vista genérica de Runway/Novia/Fiesta con
   datos de ejemplo); Novia y Runway la siguen usando. */

import { Suspense } from 'react';
import AdminAtelierFiesta from '@/components/admin/AdminAtelierFiesta';

export default function ProductosFiestaPage() {
  // Suspense: AdminAtelierFiesta lee la URL (useSearchParams).
  return (
    <Suspense fallback={null}>
      <AdminAtelierFiesta />
    </Suspense>
  );
}
