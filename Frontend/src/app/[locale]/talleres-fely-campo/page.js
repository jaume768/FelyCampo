/* ============================================================
   NUESTROS TALLERES — Fely Campo. Ruta: /talleres-fely-campo
   (antes /sobre-fely/talleres — renombrada, ver Navbar.jsx).
   Hero común + entradilla con filtros + un taller por fila con su
   carrusel. El contenido (textos, fotos y vídeos) sale de lib/talleres.js
   y se edita en /admin/paginas/talleres; lo pinta TalleresContenido.jsx
   (que también pinta la vista previa del admin). Solo "Ver todo" sigue en
   messages (talleres.filtroTodo). Ver docs/ADMIN.md.
   ============================================================ */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { obtenerTalleres } from '@/lib/talleres';
import { metadataPagina } from '@/lib/seo';
import TalleresContenido from './TalleresContenido';
import { cargarContenido } from '@/lib/contenidoServidor';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/talleres-fely-campo' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const t = await getTranslations('talleres');
  return <TalleresContenido publicado={obtenerTalleres()} locale={locale} etiquetaTodo={t('filtroTodo')} />;
}
