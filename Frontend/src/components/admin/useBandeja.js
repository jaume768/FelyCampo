'use client';

// Hooks de las bandejas del panel (citas, consultas, newsletter): cargan de
// la API (lib/solicitudesAdmin.js) y exponen el estado de carga y error.

import { useCallback, useEffect, useState } from 'react';
import { actualizar, listarTodo, obtenerUna } from '@/lib/solicitudesAdmin';

// Lista completa: { items, cargando, error, recargar }.
export function useBandeja(recurso) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setItems(await listarTodo(recurso));
    } catch (e) {
      setError(e.message || 'No se ha podido cargar');
    } finally {
      setCargando(false);
    }
  }, [recurso]);

  useEffect(() => { recargar(); }, [recargar]);
  return { items, cargando, error, recargar };
}

// Una solicitud: { item, cargando, error, guardar(cambios) }.
// guardar() devuelve la solicitud actualizada (con su historial, fecha del
// servidor) o lanza el error para que la pantalla lo enseñe.
export function useSolicitud(recurso, id) {
  const [item, setItem] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    obtenerUna(recurso, id)
      .then((datos) => { if (vivo) setItem(datos); })
      .catch((e) => { if (vivo) setError(e.status === 404 ? 'no-existe' : (e.message || 'error')); })
      .finally(() => { if (vivo) setCargando(false); });
    return () => { vivo = false; };
  }, [recurso, id]);

  const guardar = useCallback(async (cambios) => {
    const nuevo = await actualizar(recurso, id, cambios);
    setItem(nuevo);
    return nuevo;
  }, [recurso, id]);

  return { item, cargando, error, guardar };
}
