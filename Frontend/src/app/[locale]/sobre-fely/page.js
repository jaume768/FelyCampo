/* ============================================================
   SOBRE FELY — Fely Campo. Ruta: /sobre-fely
   "Una vida entre telas": hero → capítulos de biografía → cierre →
   tarjeta del documental. El contenido (textos, fotos, pies y enlace)
   sale de lib/sobreFely.js y se edita en /admin/paginas/sobre-fely; lo
   pinta SobreFelyContenido.jsx (que también pinta la vista previa del
   admin). Ver docs/ADMIN.md.
   ============================================================ */

import { obtenerSobreFely } from '@/lib/sobreFely';
import { metadataPagina } from '@/lib/seo';
import SobreFelyContenido from './SobreFelyContenido';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return metadataPagina({ locale, ruta: '/sobre-fely' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SobreFelyContenido publicado={obtenerSobreFely()} locale={locale} />;
}
