'use client';

/* /admin/paginas/visitanos — la cabecera y el texto de entrada de
   /visita-fely-campo (las tarjetas de los ateliers se editan en cada
   atelier; el mapa, en Puntos de venta). Ver components/admin/AdminCabecera.jsx
   y docs/ADMIN.md. */

import AdminCabecera from '@/components/admin/AdminCabecera';

export default function VisitanosPage() {
  return <AdminCabecera id="visitanos" migas="Dónde encontrarnos" />;
}
