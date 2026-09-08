/* ============================================================
   LISTADO DE PRODUCTOS — Server Component
   Única vía por la que un listado obtiene productos reales.

   SERVER Component a propósito (sin 'use client'): la lectura del
   catálogo sale en el HTML inicial (SEO y velocidad) y usa
   API_INTERNAL_URL, la red interna de Docker. Ver src/lib/api/README.md.

   Filtrado, orden y paginación ocurren en el SERVIDOR: no se trae el
   catálogo entero para recortarlo en el cliente.
   ============================================================ */

import { getTranslations } from 'next-intl/server';

import { catalog } from '@/lib/api/endpoints';
import { adaptarPaginaProductos } from '@/lib/api/adapters';
import { filtrosDesdeUrl, estadoFiltrosDesdeUrl } from '@/lib/api/filtrosTienda';
import { ApiError } from '@/lib/api/errors';

import CuadriculaProductos from './CuadriculaProductos';
import { ListadoError, ListadoVacio } from './EstadoListado';

/**
 * @param {object} props
 * @param {string} props.locale
 * @param {Record<string, string|string[]>} [props.searchParams] Ya resuelto por la página.
 * @param {object} [props.filtrosBase] Filtros fijos de la ruta (`{ family: 'vestidos' }`).
 * @param {boolean} [props.seccionSinBackend] La sección no tiene datos posibles todavía
 *   (p. ej. `zapatos`: no existe esa `Family`). Enseña un vacío explicado, no un error.
 * @param {object} [props.propsCuadricula] Lo que se pasa tal cual a `CuadriculaProductos`
 *   (tituloKey, coleccionKey, hrefBase, ocultarPrecio...).
 */
export default async function ListadoProductos({
  locale,
  searchParams = {},
  filtrosBase = {},
  seccionSinBackend = false,
  propsCuadricula = {},
}) {
  const t = await getTranslations();

  if (seccionSinBackend) {
    return (
      <ListadoVacio
        titulo={t('errores.seccionVaciaTitulo')}
        mensaje={t('errores.seccionVaciaTexto')}
      />
    );
  }

  const filtros = filtrosDesdeUrl(searchParams, filtrosBase);

  let pagina;
  try {
    pagina = await catalog.listarProductos(filtros, {
      // Revalidación corta: el catálogo cambia poco, pero el stock sí.
      next: { revalidate: 60 },
    });
  } catch (error) {
    // Un backend caído no puede dejar la página en blanco: se explica y se puede
    // reintentar recargando. No se traga el error en silencio.
    if (error instanceof ApiError) {
      return (
        <ListadoError titulo={t('errores.catalogoTitulo')} mensaje={t('errores.catalogoTexto')} />
      );
    }
    throw error;
  }

  const { productos, hayMas, total } = adaptarPaginaProductos(pagina, locale);

  return (
    <CuadriculaProductos
      productos={productos}
      disposicion="grid"
      modoServidor={{
        total,
        hayMas,
        filtros: estadoFiltrosDesdeUrl(searchParams),
      }}
      {...propsCuadricula}
    />
  );
}
