/* Confirmación de cita — Ruta: /visita-fely-campo/cita/confirmacion
   Destino del formulario de cita (../page.js) tras un envío correcto,
   ahora que el formulario ya no pregunta si es de novia o de invitada.
   Ver ../ConfirmacionCita.jsx. */

import { metadataPagina } from '@/lib/seo';
import ConfirmacionCita from '../ConfirmacionCita';
import { setRequestLocale } from 'next-intl/server';
import { cargarContenido } from '@/lib/contenidoServidor';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/visita-fely-campo/cita/confirmacion', indexar: false });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return <ConfirmacionCita locale={locale} />;
}
