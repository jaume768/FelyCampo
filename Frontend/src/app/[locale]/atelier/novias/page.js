/* Ruta: /atelier/novias — datos REALES de GET /api/v1/catalog/products/.
   Filtro: line=atelier + category=novia (decidido; ambas Category ya existen
   en el backend). Server Component, filtrado y paginación en el servidor. */

import { Suspense } from 'react';

import { ListadoProductos, ProductHero, ListadoCargando } from '@/components/layout';
import { CATEGORIA_POR_SECCION_ATELIER } from '@/lib/api/filtrosTienda';

// Colecciones de Novias, de la más reciente a la más antigua. DATOS DE EJEMPLO: hoy
// solo alimentan el desplegable de PanelFiltros, no filtran de verdad — el backend
// tiene `Collection` pero ninguna sembrada para atelier (ver docs/CONTRATO.md).
const COLECCIONES_NOVIAS = [
  'Bride 27',
  'ME',
  'Bambú Novia',
  'Savia Novia',
  'Inside',
  'Introspección',
];

export default async function Pagina({ params, searchParams }) {
  const { locale } = await params;
  const filtros = await searchParams;

  return (
    <section className="seccion">
      <ProductHero imagen="/img/novias-sección-FelyCampo3.jpg" />
      {/* Suspense AQUÍ y no en un loading.js del segmento: un loading.js envolvería
          también a las rutas hijas ([producto]), y con la respuesta ya transmitiéndose
          el `notFound()` de una ficha inexistente no puede cambiar el status a 404. */}
      <Suspense fallback={<ListadoCargando />}>
        <ListadoProductos
          locale={locale}
          searchParams={filtros}
          filtrosBase={{ line: 'atelier', category: CATEGORIA_POR_SECCION_ATELIER.novias }}
          propsCuadricula={{
            tituloKey: 'nav.links.atelier',
            coleccionKey: 'nav.submenus.atelier.novias',
            descriptionKey: 'cuadriculaTabs.descripcion',
            // Atelier no vende de catálogo: sin precio, va por consulta (sale_mode
            // "on_request"). El adapter ya deja `precio` vacío; esto oculta el hueco.
            ocultarPrecio: true,
            colecciones: COLECCIONES_NOVIAS,
            hrefBase: 'atelier/novias',
            estiloYSilueta: true,
          }}
        />
      </Suspense>
    </section>
  );
}
