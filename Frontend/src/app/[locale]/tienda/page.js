/* Ruta: /tienda — datos REALES de GET /api/v1/catalog/products/.
   Server Component: la lectura sale en el HTML inicial (SEO) y viaja por la red
   interna de Docker (API_INTERNAL_URL). Los filtros van en la URL, y el filtrado
   y la paginación los hace el SERVIDOR. Ver src/lib/api/README.md. */

import { Suspense } from 'react';

import { ListadoProductos, ProductHero, ListadoCargando } from '@/components/layout';

export default async function Pagina({ params, searchParams }) {
  const { locale } = await params;
  const filtros = await searchParams;

  return (
    <section className="seccion">
      <ProductHero imagen="/img/FW27-HERO.webp" />
      {/* Suspense AQUÍ y no en un loading.js del segmento: un loading.js envolvería
          también a las rutas hijas ([producto]), y con la respuesta ya transmitiéndose
          el `notFound()` de una ficha inexistente no puede cambiar el status a 404. */}
      <Suspense fallback={<ListadoCargando />}>
        <ListadoProductos
          locale={locale}
          searchParams={filtros}
          filtrosBase={{ line: 'pret_a_porter' }}
          propsCuadricula={{
            tituloKey: 'catalogo.subtituloFelyCampo',
            coleccionKey: 'catalogo.tituloTienda',
            descriptionKey: 'cuadriculaProductos.novedadesDescripcion',
          }}
        />
      </Suspense>
    </section>
  );
}
