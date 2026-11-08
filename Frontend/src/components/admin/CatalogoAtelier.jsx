'use client';

/* ============================================================
   CATÁLOGO DE ATELIER — estado del admin — Fely Campo
   Las colecciones y looks de un catálogo de Atelier (Fiesta, Novias)
   mientras se editan. Cada catálogo crea el suyo con
   crearCatalogoAtelier() (ver AtelierFiesta.jsx, AtelierNovias.jsx) y
   vive en el layout del admin, así que lo editado se mantiene al
   moverse por el panel. Parte de los mismos datos que la web.

   PARA EL PROGRAMADOR: hoy los cambios viven solo en memoria (se pierden
   al recargar, como el resto del admin). Al conectar la base de datos,
   guardarColeccion / reordenarColecciones / alternarColeccion /
   guardarLook / alternarLook / eliminarLook son los únicos puntos que
   tienen que llamar a la API.
   ============================================================ */

import {
  createContext, useCallback, useContext, useEffect, useState,
} from 'react';
import { ordenarLooks, slugLook } from '@/lib/catalogoFiesta';
import { useCategorias } from './Categorias';

// obtener(): las colecciones de la web. categoriasAdmin(colecciones): la
// forma que espera el submenú del menú lateral (tipoMenu: 'fiesta' | 'novia').
export function crearCatalogoAtelier({ nombre, obtener, categoriasAdmin, tipoMenu }) {
  const Contexto = createContext(null);

  function Provider({ children }) {
    // Copia profunda: el admin nunca muta el array que lee la web.
    const [colecciones, setColecciones] = useState(() => structuredClone(obtener()));
    const { reordenarCategorias } = useCategorias();

    // El submenú del menú lateral sigue a las colecciones.
    useEffect(() => {
      reordenarCategorias(tipoMenu, categoriasAdmin(colecciones));
    }, [colecciones, reordenarCategorias]);

    // Alta (sin id) o edición de una colección. Devuelve su id.
    const guardarColeccion = useCallback((datos) => {
      const id = datos.id || `coleccion-${Date.now()}`;
      setColecciones((actual) => {
        const existe = actual.some((c) => c.id === id);
        const limpia = {
          temporada: String(datos.temporada || '').trim(),
          nombre: datos.nombre.trim(),
          visible: Boolean(datos.visible),
          portada: datos.portada || '',
        };
        if (existe) return actual.map((c) => (c.id === id ? { ...c, ...limpia } : c));
        // Nueva: la primera (la más reciente), sin looks.
        return [{ id, carpeta: id, looks: [], ...limpia }, ...actual];
      });
      return id;
    }, []);

    const reordenarColecciones = useCallback((lista) => setColecciones(lista), []);

    // Alta o edición de un look en "coleccionId" (puede moverse de
    // colección). Si un look publicado cambia de nombre, su URL anterior
    // se guarda en slugsAnteriores para que la web la redirija.
    const guardarLook = useCallback((datos, coleccionId) => {
      const id = datos.id || slugLook(datos.nombre);
      setColecciones((actual) => {
        let anterior = null;
        actual.forEach((c) => c.looks.forEach((l) => { if (l.id === datos.id) anterior = l; }));
        const slugsAnteriores = [...(anterior?.slugsAnteriores || [])];
        if (anterior?.publicado && slugLook(anterior.nombre) !== slugLook(datos.nombre)
          && !slugsAnteriores.includes(slugLook(anterior.nombre))) {
          slugsAnteriores.push(slugLook(anterior.nombre));
        }
        const look = {
          ...(anterior || {}),
          id,
          nombre: datos.nombre.trim(),
          sku: (datos.sku || '').trim(),
          publicado: Boolean(datos.publicado),
          descripcion: { es: (datos.descripcion?.es || '').trim(), en: (datos.descripcion?.en || '').trim() },
          imagenes: datos.imagenes,
          slugsAnteriores: slugsAnteriores.filter((s) => s !== slugLook(datos.nombre)),
        };
        // El look ocupa su sitio por número (Look 1, 2, 3…), sea nuevo,
        // renombrado o movido de colección.
        return actual.map((c) => {
          const sinLook = c.looks.filter((l) => l.id !== datos.id);
          if (c.id !== coleccionId) return { ...c, looks: sinLook };
          return { ...c, looks: ordenarLooks([...sinLook, look]) };
        });
      });
      return id;
    }, []);

    const eliminarLook = useCallback((lookId) => {
      setColecciones((actual) => actual.map((c) => ({ ...c, looks: c.looks.filter((l) => l.id !== lookId) })));
    }, []);

    // Publicar / ocultar desde el listado (el botón del ojo).
    const alternarLook = useCallback((lookId) => {
      setColecciones((actual) => actual.map((c) => ({
        ...c, looks: c.looks.map((l) => (l.id === lookId ? { ...l, publicado: !l.publicado } : l)),
      })));
    }, []);

    const alternarColeccion = useCallback((id) => {
      setColecciones((actual) => actual.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)));
    }, []);

    return (
      <Contexto.Provider value={{
        colecciones, guardarColeccion, reordenarColecciones, guardarLook, eliminarLook, alternarLook, alternarColeccion,
      }}
      >
        {children}
      </Contexto.Provider>
    );
  }

  function useCatalogo() {
    const contexto = useContext(Contexto);
    if (!contexto) throw new Error(`${nombre}: usar dentro de su Provider`);
    return contexto;
  }

  return { Provider, useCatalogo };
}
