/* Ficha de atelier. Ruta: /atelier-fiesta/salamanca — ver
   AtelierDetalle.jsx (plantilla compartida con /madrid y /oviedo) y
   src/datos/ateliers.js (contenido de esta ficha, editable en el admin). */

import AtelierDetalle from '../AtelierDetalle';
import { metadataPagina } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return metadataPagina({ locale, ruta: '/atelier-fiesta/salamanca' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AtelierDetalle id="salamanca" locale={locale} />;
}
