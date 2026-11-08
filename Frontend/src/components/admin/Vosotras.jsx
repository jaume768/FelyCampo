'use client';

/* ============================================================
   VOSOTRAS — estado del admin — Fely Campo
   Los looks (fotos de clientas) y las reseñas publicados mientras se
   trabaja en el admin. Parte de los mismos datos que la web
   (lib/vosotras.js) y vive en el layout del panel, así que lo publicado
   se mantiene al moverse por el admin. Sin base de datos todavía: se
   pierde al recargar.
   PARA EL PROGRAMADOR: cada acción de aquí es una llamada a la API
   (ver docs/ADMIN.md).
   ============================================================ */

import {
  createContext, useCallback, useContext, useState,
} from 'react';
import { idNuevo, obtenerVosotras, PESTANAS_VOSOTRAS } from '@/lib/vosotras';

const VosotrasContext = createContext(null);

// La página entera con este look guardado: si cambia de pestaña, se
// mueve; si es nuevo, va el primero de su pestaña.
export function conLook(datos, look, pestana) {
  const copia = structuredClone(datos);
  let posicion = 0;
  PESTANAS_VOSOTRAS.forEach(({ id }) => {
    const indice = copia[id].findIndex((otro) => otro.id === look.id);
    if (indice >= 0) {
      if (id === pestana) posicion = indice;
      copia[id].splice(indice, 1);
    }
  });
  copia[pestana].splice(posicion, 0, structuredClone(look));
  return copia;
}

// La página entera con esta reseña guardada (si es nueva, va la última).
export function conResena(datos, resena) {
  const copia = structuredClone(datos);
  const indice = copia.resenas.findIndex((otra) => otra.id === resena.id);
  if (indice >= 0) copia.resenas[indice] = structuredClone(resena);
  else copia.resenas.push(structuredClone(resena));
  return copia;
}

function VosotrasProvider({ children }) {
  // Copia profunda: el admin nunca muta los objetos que lee la web.
  const [datos, setDatos] = useState(() => structuredClone(obtenerVosotras()));

  // Devuelven el id con el que queda guardado.
  const guardarLook = useCallback((look, pestana) => {
    const id = look.id || idNuevo(pestana === 'novias' ? 'nov' : 'inv');
    setDatos((actual) => conLook(actual, { ...look, id }, pestana));
    return id;
  }, []);

  const guardarResena = useCallback((resena) => {
    const id = resena.id || idNuevo('res');
    setDatos((actual) => conResena(actual, { ...resena, id }));
    return id;
  }, []);

  const cambiarLooks = (pestana, cambio) => setDatos((actual) => ({ ...actual, [pestana]: cambio(actual[pestana]) }));
  const cambiarResenas = (cambio) => setDatos((actual) => ({ ...actual, resenas: cambio(actual.resenas) }));
  const alternar = (lista, id) => lista.map((item) => (item.id === id ? { ...item, publicado: !item.publicado } : item));

  const valor = {
    datos,
    guardarLook,
    guardarResena,
    alternarLook: (pestana, id) => cambiarLooks(pestana, (lista) => alternar(lista, id)),
    // Al borrar un look, sus reseñas se quedan, pero sin fotos.
    borrarLook: (pestana, id) => setDatos((actual) => ({
      ...actual,
      [pestana]: actual[pestana].filter((look) => look.id !== id),
      resenas: actual.resenas.map((resena) => (resena.look === id ? { ...resena, look: '' } : resena)),
    })),
    reordenarLooks: (pestana, lista) => cambiarLooks(pestana, () => lista),
    alternarResena: (id) => cambiarResenas((lista) => alternar(lista, id)),
    borrarResena: (id) => cambiarResenas((lista) => lista.filter((resena) => resena.id !== id)),
    reordenarResenas: (lista) => cambiarResenas(() => lista),
  };

  return <VosotrasContext.Provider value={valor}>{children}</VosotrasContext.Provider>;
}

function useVosotras() {
  const contexto = useContext(VosotrasContext);
  if (!contexto) throw new Error('useVosotras debe usarse dentro de <VosotrasProvider>');
  return contexto;
}

export { VosotrasProvider, useVosotras };
