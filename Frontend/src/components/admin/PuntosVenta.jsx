'use client';

/* ============================================================
   PUNTOS DE VENTA — estado del admin — Fely Campo
   Los puntos del mapa mientras se trabaja en el admin. Parte de los
   mismos datos que la web (lib/puntosVenta.js) y vive en el layout del
   panel, así que lo publicado se mantiene al moverse por el admin. Sin
   base de datos todavía: se pierde al recargar.
   PARA EL PROGRAMADOR: cada acción es una llamada a la API (ver
   docs/ADMIN.md).
   ============================================================ */

import {
  createContext, useCallback, useContext, useState,
} from 'react';
import { limpiarPunto, puntosGuardados, slugPunto } from '@/lib/puntosVenta';

const PuntosVentaContext = createContext(null);

// La lista con un punto guardado: si es nuevo, va el último de su país.
export function conPunto(puntos, punto) {
  const limpio = limpiarPunto(punto);
  if (puntos.some((otro) => otro.id === limpio.id)) {
    return puntos.map((otro) => (otro.id === limpio.id ? limpio : otro));
  }
  const ultimoDelPais = puntos.map((otro) => otro.pais).lastIndexOf(limpio.pais);
  if (ultimoDelPais < 0) return [...puntos, limpio];
  return [...puntos.slice(0, ultimoDelPais + 1), limpio, ...puntos.slice(ultimoDelPais + 1)];
}

function PuntosVentaProvider({ children }) {
  // Copia profunda: el admin nunca muta los objetos que lee la web.
  const [puntos, setPuntos] = useState(() => structuredClone(puntosGuardados()));

  // Guarda un punto y devuelve su id. Uno nuevo recibe su id a partir
  // del nombre.
  const guardar = useCallback((datos) => {
    const id = datos.id || slugPunto(datos.nombre, puntos.map((punto) => punto.id));
    setPuntos((actual) => conPunto(actual, { ...datos, id }));
    return id;
  }, [puntos]);

  const alternar = useCallback((id) => {
    setPuntos((actual) => actual.map((punto) => (punto.id === id ? { ...punto, publicado: !punto.publicado } : punto)));
  }, []);

  const borrar = useCallback((id) => {
    setPuntos((actual) => actual.filter((punto) => punto.id !== id));
  }, []);

  return (
    <PuntosVentaContext.Provider value={{
      puntos, guardar, alternar, borrar,
    }}
    >
      {children}
    </PuntosVentaContext.Provider>
  );
}

function usePuntosVenta() {
  const contexto = useContext(PuntosVentaContext);
  if (!contexto) throw new Error('usePuntosVenta debe usarse dentro de <PuntosVentaProvider>');
  return contexto;
}

export { PuntosVentaProvider, usePuntosVenta };
