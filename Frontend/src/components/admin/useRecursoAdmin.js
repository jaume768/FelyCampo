'use client';

/**
 * Listado + CRUD de un recurso simple del panel (colores, tejidos, categorías…).
 *
 * Son catálogos pequeños y cerrados, así que se traen de una (`page_size` alto) en vez de
 * paginar: paginar 5 colores sería ruido. Los productos SÍ paginan en servidor
 * (`useProductosAdmin`), que es donde importa.
 */

import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/lib/api/errors';

/**
 * @param {{listar: Function, crear: Function, actualizar: Function, borrar: Function}} recurso
 *   Uno de los `crud()` de `@/lib/api/adminCatalog`.
 * @param {(fila: object) => object} [adaptar] API → forma del componente.
 */
export function useRecursoAdmin(recurso, adaptar = (x) => x) {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const pagina = await recurso.listar({ page_size: 200 });
      const lista = Array.isArray(pagina) ? pagina : pagina.results || [];
      setFilas(lista.map(adaptar));
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      setError(fallo);
      setFilas([]);
    } finally {
      setCargando(false);
    }
  }, [recurso, adaptar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  /** Envuelve una escritura: recarga con lo que diga el servidor, nunca estado local. */
  const ejecutar = useCallback(async (accion) => {
    setGuardando(true);
    try {
      await accion();
      await cargar();
      return { ok: true };
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      return { ok: false, error: fallo, mensaje: fallo.firstDetail ?? fallo.message };
    } finally {
      setGuardando(false);
    }
  }, [cargar]);

  return {
    filas,
    cargando,
    error,
    guardando,
    recargar: cargar,
    crear: (datos) => ejecutar(() => recurso.crear(datos)),
    actualizar: (id, datos) => ejecutar(() => recurso.actualizar(id, datos)),
    /**
     * Borrado real. Ojo: `Color`, `Fabric` y `Category` los referencian otros modelos con
     * `on_delete=PROTECT`, así que borrar uno en uso devuelve un error del backend en vez
     * de romper el catálogo. Ese mensaje es el que hay que enseñar.
     */
    borrar: (id) => ejecutar(() => recurso.borrar(id)),
  };
}
