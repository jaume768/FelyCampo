'use client';

/**
 * Familias de producto (`Family`) desde `/api/v1/admin/families/`.
 *
 * Hace falta porque `Product.family` es una FK **obligatoria** y el formulario del panel
 * no tenía selector: sin ella, cualquier alta devuelve 400.
 *
 * **Acotadas por línea.** Sin el filtro, dando de alta una pieza de atelier salían
 * «Faldas» o «Zapatos», que ahí no pintan nada. El backend devuelve las de esa línea más
 * las que no acotan ninguna (`lines` vacío = «en todas»), para que una familia sin
 * clasificar no desaparezca del formulario.
 */

import { useEffect, useState } from 'react';

import { familias as apiFamilias, LINEA_POR_TIPO } from '@/lib/api/adminCatalog';
import { ApiError } from '@/lib/api/errors';

/**
 * @param {string} [tipo] Tipo del panel ('pret-a-porter', 'atelier'…). Sin él, todas.
 */
export function useFamiliasAdmin(tipo) {
  const [familias, setFamilias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const linea = LINEA_POR_TIPO[tipo];

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    (async () => {
      try {
        const pagina = await apiFamilias.listar({
          page_size: 100,
          is_active: true,
          ...(linea ? { line: linea } : {}),
        });
        const lista = Array.isArray(pagina) ? pagina : pagina.results || [];
        if (vigente) {
          setFamilias(lista.map((f) => ({
            id: f.id, nombre: f.name, code: f.code, slug: f.slug, lineas: f.lines || [],
          })));
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
  }, [linea]);

  return { familias, cargando, error };
}
