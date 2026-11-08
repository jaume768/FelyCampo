'use client';

/* ============================================================
   SESIÓN DEL PANEL — Fely Campo
   El proxy (src/proxy.js) ya no deja entrar en /admin sin la cookie de
   equipo. Aquí se comprueba además, al cargar, que la sesión de DJANGO
   sigue viva (GET /api/v1/admin/me/): es la que hace falta para guardar.
   Si caducó o la cuenta dejó de ser staff, se cierra la cookie de equipo
   y se vuelve al login, en vez de dejar editar algo que luego no se
   podría publicar.
   ============================================================ */

import {
  createContext, useCallback, useContext, useEffect, useState,
} from 'react';
import { apiFetch, ErrorApi, olvidarCsrf } from '@/lib/api';

const SesionContext = createContext(null);

function irAlLogin() {
  const destino = window.location.pathname + window.location.search;
  window.location.replace(`/acceso?destino=${encodeURIComponent(destino)}`);
}

async function olvidarEquipo() {
  try {
    await fetch('/api/acceso', { method: 'DELETE', credentials: 'same-origin' });
  } catch {
    // Sin red: la cookie caduca sola.
  }
}

export function SesionAdminProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    let vivo = true;
    apiFetch('/admin/me/')
      .then((datos) => { if (vivo) setUsuario(datos); })
      .catch(async (error) => {
        // Sin conexión con el backend no se echa a nadie: se reintentará
        // al guardar. Solo una respuesta clara de «sin sesión» o «sin
        // permiso» manda al login.
        if (error instanceof ErrorApi && (error.status === 401 || error.status === 403)) {
          await olvidarEquipo();
          irAlLogin();
        }
      });
    return () => { vivo = false; };
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await apiFetch('/auth/logout/', { method: 'POST' });
    } catch {
      // Si la sesión de Django ya no existía, da igual: se cierra la nuestra.
    }
    olvidarCsrf();
    await olvidarEquipo();
    window.location.replace('/acceso');
  }, []);

  return (
    <SesionContext.Provider value={{ usuario, cerrarSesion }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesionAdmin() {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesionAdmin debe usarse dentro de <SesionAdminProvider>');
  return contexto;
}
