'use client';

/**
 * Listado de productos del panel, contra `/api/v1/admin/products/`.
 *
 * Sustituye a `productosMock`. Diferencias que NO son cosméticas:
 *
 * - **Filtrado y paginación en SERVIDOR.** Antes era un `Array.filter` sobre el mock
 *   entero; ahora cada cambio de filtro es una petición con `?search=&line=&status=&page=`.
 *   Con un catálogo real no se puede traer todo para recortarlo en el cliente.
 * - **Todo se relaciona por UUID.** El mock buscaba por nombre (`.find(p => p.nombre === x)`).
 * - **Los precios son decimales**, no strings con formato. El panel formatea en la vista.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { productos as apiProductos, adaptarProductoAdmin, filtrosProductosAdmin } from '@/lib/api/adminCatalog';
import { ApiError } from '@/lib/api/errors';

/**
 * @param {object} filtros
 * @param {string} [filtros.busqueda]
 * @param {string} [filtros.tipo]    Tipo del panel ('pret-a-porter'…), 'Todos' para ninguno.
 * @param {string} [filtros.estado]  Estado del panel ('Activo'…), 'Todos' para ninguno.
 * @param {string} [filtros.coleccionId]
 * @param {string} [filtros.categoriaSlug]
 * @param {number} [filtros.pagina]
 * @param {number} [filtros.porPagina]
 */
export function useProductosAdmin(filtros = {}) {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const {
    busqueda = '',
    tipo,
    estado,
    coleccionId,
    categoriaSlug,
    pagina = 1,
    porPagina = 20,
  } = filtros;

  // Descarta respuestas de peticiones ya superadas: al teclear en el buscador salen
  // varias en vuelo y la lenta no puede pisar a la rápida.
  const peticionRef = useRef(0);

  const cargar = useCallback(async () => {
    const identificador = ++peticionRef.current;
    setCargando(true);
    setError(null);
    try {
      const pagina_ = await apiProductos.listar(
        filtrosProductosAdmin({
          busqueda,
          // 'Todos'/'Todas' son valores de la interfaz, no filtros: no se mandan.
          tipo: tipo && tipo !== 'Todos' ? tipo : undefined,
          estado: estado && estado !== 'Todos' ? estado : undefined,
          coleccionId: coleccionId && coleccionId !== 'Todas' ? coleccionId : undefined,
          categoriaSlug,
          pagina,
          porPagina,
        })
      );
      if (identificador !== peticionRef.current) return;
      setProductos((pagina_.results || []).map(adaptarProductoAdmin));
      setTotal(pagina_.count ?? 0);
    } catch (fallo) {
      if (identificador !== peticionRef.current) return;
      if (!(fallo instanceof ApiError)) throw fallo;
      setError(fallo);
      setProductos([]);
      setTotal(0);
    } finally {
      if (identificador === peticionRef.current) setCargando(false);
    }
  }, [busqueda, tipo, estado, coleccionId, categoriaSlug, pagina, porPagina]);

  useEffect(() => {
    // Pequeño retardo para no disparar una petición por tecla en el buscador.
    const temporizador = setTimeout(cargar, busqueda ? 300 : 0);
    return () => clearTimeout(temporizador);
  }, [cargar, busqueda]);

  const paginas = Math.max(1, Math.ceil(total / porPagina));

  return { productos, total, paginas, cargando, error, recargar: cargar };
}

/**
 * Escrituras sobre productos, contra la API. Nunca se cambia el estado local y ya:
 * se llama a la API y se recarga con lo que ella diga.
 *
 * @param {() => Promise<void>} recargar
 */
export function useAccionesProductoAdmin(recargar) {
  const [guardando, setGuardando] = useState(false);

  /** Envuelve una escritura devolviendo `{ok, mensaje}` en vez de lanzar. */
  const ejecutar = useCallback(async (accion) => {
    setGuardando(true);
    try {
      await accion();
      await recargar();
      return { ok: true };
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      return { ok: false, error, mensaje: error.firstDetail ?? error.message };
    } finally {
      setGuardando(false);
    }
  }, [recargar]);

  return {
    guardando,

    /** @param {string} id @param {object} cuerpo Cuerpo ya serializado. */
    actualizar: (id, cuerpo) => ejecutar(() => apiProductos.actualizar(id, cuerpo)),

    /**
     * Cambia el estado de publicación.
     *
     * `status` es la fuente de verdad: `is_published` se deriva en `Product.save()` y no
     * se manda nunca a mano.
     * @param {string} id @param {'draft'|'active'|'archived'} status
     */
    cambiarEstado: (id, status) => ejecutar(() => apiProductos.actualizar(id, { status })),

    /**
     * En bloque. Secuencial a propósito: el backend no tiene endpoint de lote, y lanzar
     * 50 peticiones a la vez chocaría con el límite de ritmo `admin`.
     * @param {string[]} ids @param {object} cuerpo
     */
    aplicarEnBloque: (ids, cuerpo) => ejecutar(async () => {
      for (const id of ids) {
        await apiProductos.actualizar(id, cuerpo);
      }
    }),

    /**
     * "Borrar" un producto lo ARCHIVA, no lo elimina: el histórico de pedidos lo
     * referencia (ver `Product.archive()` y ADMIN_API_PLAN.md, D8). El DELETE del
     * ViewSet hace justo eso.
     * @param {string[]} ids
     */
    archivar: (ids) => ejecutar(async () => {
      for (const id of ids) {
        await apiProductos.borrar(id);
      }
    }),
  };
}
