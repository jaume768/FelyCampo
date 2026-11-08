// Solo metadata: page.js es un Client Component ('use client') y no
// puede exportar generateMetadata — ver metadataPagina en src/lib/seo.js.

import { metadataPagina } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return metadataPagina({ locale, ruta: '/visita-fely-campo/cita' });
}

export default function Layout({ children }) {
  return children;
}
