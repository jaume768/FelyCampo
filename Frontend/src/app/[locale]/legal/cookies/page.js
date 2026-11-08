/* ============================================================
   Política de Cookies — Fely Campo. Ruta: /legal/cookies
   Texto en español e inglés — ver ../textos/cookies.js.
   Maquetación común: ../TextoLegal.jsx.
   ============================================================ */

import { metadataPagina } from '@/lib/seo';
import TextoLegal from '../TextoLegal';
import { COOKIES } from '../textos/cookies';
import { setRequestLocale } from 'next-intl/server';
import { cargarContenido } from '@/lib/contenidoServidor';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/legal/cookies' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return <TextoLegal texto={COOKIES} locale={locale} />;
}
