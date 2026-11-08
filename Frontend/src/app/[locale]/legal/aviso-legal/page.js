/* ============================================================
   Aviso legal — Fely Campo. Ruta: /legal/aviso-legal
   Texto en español e inglés — ver ../textos/avisoLegal.js.
   Maquetación común: ../TextoLegal.jsx.
   ============================================================ */

import { metadataPagina } from '@/lib/seo';
import TextoLegal from '../TextoLegal';
import { AVISO_LEGAL } from '../textos/avisoLegal';
import { setRequestLocale } from 'next-intl/server';
import { cargarContenido } from '@/lib/contenidoServidor';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/legal/aviso-legal' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return <TextoLegal texto={AVISO_LEGAL} locale={locale} />;
}
