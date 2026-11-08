/* ============================================================
   Política de Privacidad — Fely Campo. Ruta: /legal/privacidad
   Texto en español e inglés — ver ../textos/privacidad.js.
   Maquetación común: ../TextoLegal.jsx.
   ============================================================ */

import { metadataPagina } from '@/lib/seo';
import TextoLegal from '../TextoLegal';
import { PRIVACIDAD } from '../textos/privacidad';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return metadataPagina({ locale, ruta: '/legal/privacidad' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TextoLegal texto={PRIVACIDAD} locale={locale} />;
}
