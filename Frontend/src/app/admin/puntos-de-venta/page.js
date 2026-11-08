'use client';

/* /admin/puntos-de-venta — los puntos del mapa de la web, con los mismos
   datos que lee la web. Ver components/admin/AdminPuntosVenta.jsx y
   docs/ADMIN.md. */

import { Suspense } from 'react';
import AdminPuntosVenta from '@/components/admin/AdminPuntosVenta';

export default function PuntosVentaPage() {
  // Suspense: AdminPuntosVenta lee la URL (useSearchParams). Sin él,
  // `next build` falla al prerenderizar esta página (venía así del
  // commit e556a76 del repo de Miriam).
  return (
    <Suspense fallback={null}>
      <AdminPuntosVenta />
    </Suspense>
  );
}
