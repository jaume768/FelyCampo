'use client';

/* /admin/vosotras — fotos de clientas (looks) y reseñas de
   /atelier/vosotras, con los mismos datos que enseña la web (ver
   components/admin/AdminVosotras.jsx y docs/ADMIN.md). Sustituye
   a la versión anterior (formulario en ventana emergente, sin publicar). */

import { Suspense } from 'react';
import AdminVosotras from '@/components/admin/AdminVosotras';

export default function VosotrasPage() {
  // Suspense: AdminVosotras lee la URL (useSearchParams).
  return (
    <Suspense fallback={null}>
      <AdminVosotras />
    </Suspense>
  );
}
