'use client';

/* ============================================================
   BLOG & PODCAST — estado del admin — Fely Campo
   Los artículos y episodios publicados mientras se trabaja en el admin.
   Parte de los mismos datos que la web (lib/blog.js) y vive en el
   layout del panel, así que lo publicado se mantiene al moverse por el
   admin. Sin base de datos todavía: se pierde al recargar.
   PARA EL PROGRAMADOR: cada acción de aquí es una llamada a la API
   (ver docs/ADMIN.md).
   ============================================================ */

import {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import {
  obtenerArticulos, obtenerEpisodios, slugDesdeTitulo, SLUG_NUEVO,
} from '@/lib/blog';

const BlogContext = createContext(null);

// Lista con el elemento de ese slug cambiado (o añadido, si es nuevo).
// Una entrada nueva recibe aquí su slug, a partir del título en español,
// sin repetir ninguno: artículos y episodios comparten /blog/<slug>.
function guardarEn(lista, datos, slugAnterior, todosLosSlugs) {
  if (!slugAnterior || slugAnterior === SLUG_NUEVO) {
    const slug = slugDesdeTitulo(datos.titulo.es, todosLosSlugs);
    return { lista: [...lista, { ...structuredClone(datos), slug }], slug };
  }
  return {
    lista: lista.map((item) => (item.slug === slugAnterior ? { ...structuredClone(datos), slug: slugAnterior } : item)),
    slug: slugAnterior,
  };
}

function BlogProvider({ children }) {
  // Copia profunda: el admin nunca muta los objetos que lee la web.
  const [articulos, setArticulos] = useState(() => structuredClone(obtenerArticulos()));
  const [episodios, setEpisodios] = useState(() => structuredClone(obtenerEpisodios()));

  const slugs = useMemo(() => [...articulos, ...episodios].map((item) => item.slug), [articulos, episodios]);

  // Devuelven el slug con el que queda guardado.
  const guardarArticulo = useCallback((datos, slugAnterior) => {
    const resultado = guardarEn(articulos, datos, slugAnterior, slugs);
    setArticulos(resultado.lista);
    return resultado.slug;
  }, [articulos, slugs]);

  const guardarEpisodio = useCallback((datos, slugAnterior) => {
    const resultado = guardarEn(episodios, datos, slugAnterior, slugs);
    setEpisodios(resultado.lista);
    return resultado.slug;
  }, [episodios, slugs]);

  const alternar = (setLista) => (slug) => setLista((lista) => lista.map((item) => (
    item.slug === slug ? { ...item, publicado: !item.publicado } : item
  )));
  const borrar = (setLista) => (slug) => setLista((lista) => lista.filter((item) => item.slug !== slug));

  const valor = {
    articulos,
    episodios,
    guardarArticulo,
    guardarEpisodio,
    alternarArticulo: alternar(setArticulos),
    alternarEpisodio: alternar(setEpisodios),
    borrarArticulo: borrar(setArticulos),
    borrarEpisodio: borrar(setEpisodios),
    reordenarEpisodios: setEpisodios,
  };

  return <BlogContext.Provider value={valor}>{children}</BlogContext.Provider>;
}

function useBlog() {
  const contexto = useContext(BlogContext);
  if (!contexto) throw new Error('useBlog debe usarse dentro de <BlogProvider>');
  return contexto;
}

export { BlogProvider, useBlog };
