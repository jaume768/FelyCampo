'use client';

/* ============================================================
   CATEGORÍAS — Fely Campo (admin)
   Estado compartido (mismo patrón que Toast.jsx) para que las
   categorías creadas en /admin/categorias aparezcan al instante como
   sub-nivel del sidebar bajo cada tipo de producto — sin esto, cada
   página tendría su propia copia de categoriasMock y no se verían
   los cambios entre pantallas.
   ============================================================ */

import { createContext, useCallback, useContext, useState } from 'react';
import { categoriasMock } from './mockData';

const CategoriasContext = createContext(null);

function CategoriasProvider({ children }) {
  const [categorias, setCategorias] = useState(categoriasMock);

  // `datos` acepta un nombre suelto (alta simple, /admin/categorias) o un
  // objeto { nombre, imagen?, numeroLooks?, temporada?, fija?, orden? }
  // (alta de colección desde ListaProductos.jsx — Runway/Novia/Fiesta, ver
  // FormularioColeccion). `orden` es opcional: si no se pasa, se añade al
  // final como antes; ListaProductos.jsx lo pasa explícito para insertar la
  // colección nueva en la posición correcta (la más reciente).
  const anadirCategoria = useCallback((tipo, datos) => {
    const info = typeof datos === 'string' ? { nombre: datos } : datos;
    setCategorias((actual) => ({
      ...actual,
      [tipo]: [
        ...actual[tipo],
        {
          id: `cat${Date.now()}`,
          nombre: info.nombre,
          ...(info.imagen && { imagen: info.imagen }),
          ...(info.numeroLooks && { numeroLooks: info.numeroLooks }),
          ...(info.temporada && { temporada: info.temporada }),
          ...(info.fija && { fija: true }),
          visible: true,
          orden: info.orden ?? actual[tipo].length + 1,
        },
      ],
    }));
  }, []);

  // Edita los campos de una categoría existente (hoy solo lo usa el editar
  // colección de Runway/Novia/Fiesta, ver FormularioColeccion) —
  // `cambios` es un objeto parcial, se mezcla sobre la categoría actual.
  const editarCategoria = useCallback((tipo, id, cambios) => {
    setCategorias((actual) => ({
      ...actual,
      [tipo]: actual[tipo].map((c) => (c.id === id ? { ...c, ...cambios } : c)),
    }));
  }, []);

  // Borra una categoría entera — hoy solo lo usa "Borrar colección" en
  // FormularioColeccion (Runway/Novia/Fiesta); Prêt-à-porter/Atelier no
  // tienen flujo de borrado de categoría, solo ocultar (`alternarVisible`).
  const eliminarCategoria = useCallback((tipo, id) => {
    setCategorias((actual) => ({
      ...actual,
      [tipo]: actual[tipo].filter((c) => c.id !== id),
    }));
  }, []);

  const alternarVisible = useCallback((tipo, id) => {
    setCategorias((actual) => ({
      ...actual,
      [tipo]: actual[tipo].map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)),
    }));
  }, []);

  const reordenarCategorias = useCallback((tipo, nuevaLista) => {
    setCategorias((actual) => ({ ...actual, [tipo]: nuevaLista }));
  }, []);

  return (
    <CategoriasContext.Provider value={{
      categorias, anadirCategoria, editarCategoria, eliminarCategoria, alternarVisible, reordenarCategorias,
    }}
    >
      {children}
    </CategoriasContext.Provider>
  );
}

function useCategorias() {
  const contexto = useContext(CategoriasContext);
  if (!contexto) throw new Error('useCategorias debe usarse dentro de <CategoriasProvider>');
  return contexto;
}

export { CategoriasProvider, useCategorias };
