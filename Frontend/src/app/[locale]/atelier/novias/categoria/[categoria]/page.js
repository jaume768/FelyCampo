/* Ruta DINÁMICA: listado de Novias filtrado por una categoría de
   "Estilo y silueta" — /atelier/novias/categoria/romantico...
   El parámetro llega en params.categoria (uno de las opciones de
   GRUPOS_ESTILO_SILUETA, ver estiloSiluetaGrupos.js). Vive en
   "categoria/[categoria]" y no directamente en "[categoria]" porque
   "novias/" ya tiene un segmento dinámico propio ([producto], ver
   ../[producto]/page.js) — Next.js no admite dos nombres de segmento
   dinámico distintos al mismo nivel.

   A diferencia de ../page.js (listado normal, sin categoría), esta
   página SÍ es indexable por categoría de verdad: generateStaticParams
   la pre-renderiza para cada opción válida, generateMetadata le da
   título/descripción propios, y pasa "categoriaActiva" a
   CuadriculaProductos por prop (no por hash de URL) para que la miga
   de pan + título de categoría salgan ya en el HTML servido. Enlazada
   desde los tags de categoría de FichaProductoAtelier.jsx. Sigue sin
   filtrar la cuadrícula de verdad (mismo placeholder de
   "estiloYSilueta" que ../page.js — ver CuadriculaProductos.jsx). */

import { notFound } from 'next/navigation';
import { ListadoProductos, ProductHero } from '@/components/layout';
import { CATEGORIA_POR_SECCION_ATELIER } from '@/lib/api/filtrosTienda';
import { encontrarCategoria } from '@/components/layout/estiloSiluetaGrupos';
import { parametrosCategoria, metadataCategoria, breadcrumbJsonLd } from '@/lib/atelierCategoriaSeo';

const ES_FIESTA = false;
const SECCION_KEY = 'nav.submenus.atelier.novias';
const SECCION_HREF = 'atelier/novias';

// Mismas colecciones que ../page.js (COLECCIONES_NOVIAS) — solo
// alimentan el desplegable "Colección" de PanelFiltros, no filtran de
// verdad (ver comentario en CuadriculaProductos.jsx), así que no
// dependen de la categoría.
const COLECCIONES_NOVIAS = [
  'Bride 27',
  'ME',
  'Bambú Novia',
  'Savia Novia',
  'Inside',
  'Introspección',
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
      <ProductHero imagen="/img/novias-sección-FelyCampo3.jpg" />
      {/* Datos REALES. "Estilo y silueta" NO filtra de verdad: no existe ese atributo
          en el backend (docs/CONTRATO.md) — solo da título y miga de pan. Lo que sí
          filtra es line=atelier + category. */}
      <ListadoProductos
        locale={locale}
        searchParams={filtrosUrl}
        filtrosBase={{ line: 'atelier', category: CATEGORIA_POR_SECCION_ATELIER.novias }}
        propsCuadricula={{
          tituloKey: 'nav.links.atelier',
          coleccionKey: SECCION_KEY,
          descriptionKey: 'cuadriculaTabs.descripcion',
          ocultarPrecio: true,
          colecciones: COLECCIONES_NOVIAS,
          hrefBase: SECCION_HREF,
          estiloYSilueta: true,
          categoriaActiva,
        }}
      />
    </section>
  );
}
