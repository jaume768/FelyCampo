/* Ruta DINÁMICA: listado de Fiesta filtrado por una categoría de
   "Estilo y silueta" — /atelier/fiesta/categoria/romantico... Mismo
   criterio que atelier/novias/categoria/[categoria]/page.js (ver los
   comentarios ahí) — aquí además acepta las opciones del grupo
   "ocasion" (soloFiesta: true en GRUPOS_ESTILO_SILUETA), que Novias no
   tiene sentido que sirva. */

import { notFound } from 'next/navigation';
import { ListadoProductos, ProductHero } from '@/components/layout';
import { CATEGORIA_POR_SECCION_ATELIER } from '@/lib/api/filtrosTienda';
import { encontrarCategoria } from '@/components/layout/estiloSiluetaGrupos';
import { parametrosCategoria, metadataCategoria, breadcrumbJsonLd } from '@/lib/atelierCategoriaSeo';

const ES_FIESTA = true;
const SECCION_KEY = 'nav.submenus.atelier.fiesta';
const SECCION_HREF = 'atelier/fiesta';

// Mismas colecciones que ../page.js (COLECCIONES_FIESTA) — ver
// comentario en atelier/novias/categoria/[categoria]/page.js.
const COLECCIONES_FIESTA = [
  'Primavera Verano 2026',
  'Primavera Verano 2025',
  'Prêt-à-porter',
  'En Madrid',
  'A Walk',
  'Bambú',
  'Savia',
  'Miscelanea',
  'Essentielle',
  'Furisode',
];

export function generateStaticParams() {
  return parametrosCategoria(ES_FIESTA);
}

export async function generateMetadata({ params }) {
  const { locale, categoria } = await params;
  const categoriaActiva = encontrarCategoria(categoria, { esFiesta: ES_FIESTA });
  return metadataCategoria({ locale, categoriaActiva, seccionKey: SECCION_KEY });
}

export default async function Pagina({ params, searchParams }) {
  const { locale, categoria } = await params;
  const filtrosUrl = await searchParams;
  const categoriaActiva = encontrarCategoria(categoria, { esFiesta: ES_FIESTA });
  if (!categoriaActiva) notFound();

  const jsonLd = await breadcrumbJsonLd({ locale, seccionKey: SECCION_KEY, seccionHref: SECCION_HREF, categoriaActiva });

  return (
    <section className="seccion">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductHero imagen="/img/invitadas-sección-FelyCampo.jpg" />
      {/* Datos REALES. "Estilo y silueta" NO filtra de verdad: no existe ese atributo
          en el backend (docs/CONTRATO.md) — solo da título y miga de pan. Lo que sí
          filtra es line=atelier + category. */}
      <ListadoProductos
        locale={locale}
        searchParams={filtrosUrl}
        filtrosBase={{ line: 'atelier', category: CATEGORIA_POR_SECCION_ATELIER.fiesta }}
        propsCuadricula={{
          tituloKey: 'nav.links.atelier',
          coleccionKey: SECCION_KEY,
          descriptionKey: 'cuadriculaTabs.descripcion',
          ocultarPrecio: true,
          colecciones: COLECCIONES_FIESTA,
          hrefBase: SECCION_HREF,
          estiloYSilueta: true,
          esFiesta: true,
          categoriaActiva,
        }}
      />
    </section>
  );
}
