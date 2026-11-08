'use client';

/* /admin/productos/pret-a-porter — los productos de la tienda, con los
   mismos datos que enseñan /pret-a-porter, sus categorías y la ficha de
   cada producto (ver components/admin/AdminPretAPorter.jsx y
   docs/ADMIN.md). Antes usaba ListaProductos (vista
   genérica con datos de ejemplo). */

import { Suspense } from 'react';
import AdminPretAPorter from '@/components/admin/AdminPretAPorter';

export default function ProductosPretAPorterPage() {
  // Suspense: la pantalla lee la URL (useSearchParams).
  return (
    <Suspense fallback={null}>
      <AdminPretAPorter />
    </Suspense>
  );
}
