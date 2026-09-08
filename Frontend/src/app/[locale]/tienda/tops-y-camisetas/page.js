/* Ruta: /tienda/tops-y-camisetas — datos REALES de GET /api/v1/catalog/products/.
   Server Component: la lectura sale en el HTML inicial (SEO) y viaja por la red
   interna de Docker (API_INTERNAL_URL). Los filtros van en la URL, y el filtrado
   y la paginación los hace el SERVIDOR. Ver src/lib/api/README.md. */

import { ListadoProductos, ProductHero } from '@/components/layout';
import { FAMILIA_POR_RUTA } from '@/lib/api/filtrosTienda';

export default async function Pagina({ params, searchParams }) {
  const { locale } = await params;
  const filtros = await searchParams;

  return (
    <section className="seccion">
      <ProductHero imagen="/img/ecommerce/Categorias/camisa.webp" />
      <ListadoProductos
        locale={locale}
        searchParams={filtros}
        filtrosBase={{ family: FAMILIA_POR_RUTA['tops-y-camisetas'], line: 'pret_a_porter' }}
        seccionSinBackend={FAMILIA_POR_RUTA['tops-y-camisetas'] === null}
        propsCuadricula={{
          tituloKey: 'catalogo.subtituloTienda',
          coleccionKey: 'nav.submenus.tienda.tops',
          descriptionKey: 'cuadriculaProductos.novedadesDescripcion',
        }}
      />
    </section>
  );
}
