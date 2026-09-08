/* Ruta: /atelier/fiesta — datos REALES de GET /api/v1/catalog/products/.
   Filtro: line=atelier + category=fiesta (decidido; ambas Category ya existen
   en el backend). Server Component, filtrado y paginación en el servidor. */

import { Suspense } from 'react';

import { ListadoProductos, ProductHero, ListadoCargando } from '@/components/layout';
import { CATEGORIA_POR_SECCION_ATELIER } from '@/lib/api/filtrosTienda';

// Colecciones de Fiesta, de la más reciente a la más antigua. DATOS DE EJEMPLO: solo
// alimentan el desplegable de PanelFiltros, no filtran de verdad (ver docs/CONTRATO.md).
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

export default async function Pagina({ params, searchParams }) {
  const { locale } = await params;
  const filtros = await searchParams;

  return (
    <section className="seccion">
      <ProductHero imagen="/img/invitadas-sección-FelyCampo.jpg" />
      {/* Suspense AQUÍ y no en un loading.js del segmento: un loading.js envolvería
          también a las rutas hijas ([producto]), y con la respuesta ya transmitiéndose
          el `notFound()` de una ficha inexistente no puede cambiar el status a 404. */}
      <Suspense fallback={<ListadoCargando />}>
        <ListadoProductos
          locale={locale}
          searchParams={filtros}
          filtrosBase={{ line: 'atelier', category: CATEGORIA_POR_SECCION_ATELIER.fiesta }}
          propsCuadricula={{
            tituloKey: 'nav.links.atelier',
            coleccionKey: 'nav.submenus.atelier.fiesta',
            descriptionKey: 'cuadriculaTabs.descripcion',
            // Atelier no vende de catálogo: sin precio, va por consulta (sale_mode
            // "on_request"). El adapter ya deja `precio` vacío; esto oculta el hueco.
            ocultarPrecio: true,
            colecciones: COLECCIONES_FIESTA,
            hrefBase: 'atelier/fiesta',
            estiloYSilueta: true,
            esFiesta: true,
          }}
        />
      </Suspense>
    </section>
  );
}
