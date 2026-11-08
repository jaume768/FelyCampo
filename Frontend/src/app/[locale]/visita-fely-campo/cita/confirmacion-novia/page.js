/* Confirmación de cita de novia — Ruta: /visita-fely-campo/cita/confirmacion-novia
   Destino del formulario de cita (../page.js) tras un envío correcto.
   Ver ../ConfirmacionCita.jsx. */

import { metadataPagina } from '@/lib/seo';
import ConfirmacionCita from '../ConfirmacionCita';
import { setRequestLocale } from 'next-intl/server';
import { cargarContenido } from '@/lib/contenidoServidor';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/visita-fely-campo/cita/confirmacion-novia', indexar: false });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return <ConfirmacionCita locale={locale} tipo="novia" />;
}
