// usePrevia.js

'use client';

/* ============================================================
   VISTA PREVIA DE UNA PÁGINA EDITABLE — Fely Campo
   usePrevia(id, publicado, opcionales): si la URL lleva ?previa=<id> y
   el admin dejó un borrador en este navegador (ver lib/previa.js),
   devuelve el borrador (completado con lo publicado) y enPrevia = true.
   Mientras el editor siga abierto, se actualiza sola con cada cambio
   (evento "storage"). Si no, devuelve lo publicado.
   La barra de aviso es <BarraPrevia />.
   ============================================================ */

import { useEffect, useState } from 'react';
import { PARAMETRO_PREVIA, clavePrevia, completarCon } from '@/lib/previa';

function leerBorrador(clave) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

export default function usePrevia(id, publicado, opcionales = []) {
  const [datos, setDatos] = useState(publicado);
  const [enPrevia, setEnPrevia] = useState(false);
  // true en cuanto se ha mirado si hay borrador (lo necesita una entrada
  // nueva del blog, que sin borrador no tiene nada que enseñar).
  const [comprobado, setComprobado] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get(PARAMETRO_PREVIA) !== id) {
      setComprobado(true);
      return undefined;
    }
    const clave = clavePrevia(id);
    const borrador = leerBorrador(clave);
    setComprobado(true);
    if (!borrador) return undefined;
    setDatos(completarCon(borrador, publicado, opcionales));
    setEnPrevia(true);
    const alCambiar = (evento) => {
      if (evento.key !== clave) return;
      const nuevo = leerBorrador(clave);
      if (nuevo) setDatos(completarCon(nuevo, publicado, opcionales));
    };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, publicado]);

  return { datos, enPrevia, comprobado };
}
