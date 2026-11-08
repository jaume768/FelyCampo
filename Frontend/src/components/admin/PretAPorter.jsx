'use client';

/* ============================================================
   PRÊT-À-PORTER — estado del admin — Fely Campo
   Los productos publicados mientras se trabaja en el admin. Parte de los
   mismos datos que la web (lib/pretAPorter.js) y vive en el layout del
   panel. Mantiene al día el submenú «Prêt-à-porter» del menú lateral (sus
   5 categorías). Sin base de datos todavía: se pierde al recargar.
   PARA EL PROGRAMADOR: cada acción es una llamada a la API (ver
   docs/ADMIN.md).
   ============================================================ */

import {
  createContext, useCallback, useContext, useEffect, useState,
} from 'react';
import { categoriasAdminPretAPorter, obtenerProductosPretAPorter, slugProducto } from '@/lib/pretAPorter';
import { useCategorias } from './Categorias';
import { useDocumentoAdmin } from './ContenidoAdmin';

const PretAPorterContext = createContext(null);

function PretAPorterProvider({ children }) {
  // Copia profunda: el admin nunca muta los objetos que lee la web.
  const [productos, setProductos] = useDocumentoAdmin('productos-pret-a-porter');
  const { reordenarCategorias } = useCategorias();

  // Submenú del menú lateral: las 5 categorías, con su número de productos.
  useEffect(() => {
    reordenarCategorias('pret-a-porter', categoriasAdminPretAPorter(productos));
  }, [productos, reordenarCategorias]);

  // Alta (sin id) o edición. Devuelve el id. Si un producto publicado
  // cambia de nombre, su URL anterior se guarda en slugsAnteriores para
  // que la web la redirija (301).
  const guardar = useCallback((datos) => {
    const id = datos.id || slugProducto(datos.nombre);
    setProductos((actual) => {
      const anterior = actual.find((p) => p.id === datos.id);
      const slugsAnteriores = [...(anterior?.slugsAnteriores || [])];
      if (anterior?.publicado && slugProducto(anterior.nombre) !== slugProducto(datos.nombre)
        && !slugsAnteriores.includes(slugProducto(anterior.nombre))) {
        slugsAnteriores.push(slugProducto(anterior.nombre));
      }
      const producto = {
        ...structuredClone(datos),
        id,
        nombre: datos.nombre.trim(),
        sku: (datos.sku || '').trim(),
        slugsAnteriores: slugsAnteriores.filter((s) => s !== slugProducto(datos.nombre)),
      };
      // Uno nuevo va el primero; uno editado se queda en su sitio.
      return anterior ? actual.map((p) => (p.id === datos.id ? producto : p)) : [producto, ...actual];
    });
    return id;
  }, []);

  const valor = {
    productos,
    guardar,
    alternar: (id) => setProductos((actual) => actual.map((p) => (p.id === id ? { ...p, publicado: !p.publicado } : p))),
    borrar: (id) => setProductos((actual) => actual.filter((p) => p.id !== id)),
    // Nuevo orden de una parte de la lista (todos, o los de una categoría):
    // esos productos se recolocan en los huecos que ocupaban, sin mover
    // los demás. El orden es el de la web (/pret-a-porter y cada categoría).
    reordenar: (parte) => setProductos((actual) => {
      const ids = new Set(parte.map((p) => p.id));
      const cola = [...parte];
      return actual.map((p) => (ids.has(p.id) ? cola.shift() : p));
    }),
  };

  return <PretAPorterContext.Provider value={valor}>{children}</PretAPorterContext.Provider>;
}

function usePretAPorter() {
  const contexto = useContext(PretAPorterContext);
  if (!contexto) throw new Error('usePretAPorter debe usarse dentro de <PretAPorterProvider>');
  return contexto;
}

export { PretAPorterProvider, usePretAPorter };
