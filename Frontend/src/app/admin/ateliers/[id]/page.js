/* /admin/ateliers/<id> (salamanca, madrid, oviedo) — la página de cada
   atelier y sus datos de contacto, con los mismos datos que lee la web.
   Ver components/admin/AdminAtelierSede.jsx y docs/ADMIN.md. */

import { notFound } from 'next/navigation';
import AdminAtelierSede from '@/components/admin/AdminAtelierSede';
import { IDS_SEDES } from '@/lib/ateliers';

export function generateStaticParams() {
  return IDS_SEDES.map((id) => ({ id }));
}

export default async function AtelierSedePage({ params }) {
  const { id } = await params;
  if (!IDS_SEDES.includes(id)) notFound();
  return <AdminAtelierSede id={id} />;
}
