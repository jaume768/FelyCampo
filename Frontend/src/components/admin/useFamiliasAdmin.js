'use client';

/**
 * Familias de producto (`Family`) desde `/api/v1/admin/families/`.
 *
 * Hace falta porque `Product.family` es una FK **obligatoria** y el formulario del panel
 * no tenía selector: sin ella, cualquier alta devuelve 400.
 *
 * Son pocas y cambian poco, así que se traen de una (`page_size` alto) en vez de paginar.
 */

import { useEffect, useState } from 'react';

import { familias as apiFamilias } from '@/lib/api/adminCatalog';
import { ApiError } from '@/lib/api/errors';

export function useFamiliasAdmin() {
  const [familias, setFamilias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const pagina = await apiFamilias.listar({ page_size: 100 });
        // El endpoint pagina; si algún día devolviera lista plana, también funciona.
        const lista = Array.isArray(pagina) ? pagina : pagina.results || [];
        if (vigente) {
          setFamilias(lista.map((f) => ({ id: f.id, nombre: f.name, code: f.code, slug: f.slug })));
        }
      } catch (fallo) {
        if (!(fallo instanceof ApiError)) throw fallo;
        if (vigente) setError(fallo);
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, []);

  return { familias, cargando, error };
}
