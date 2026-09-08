'use client';

/* ============================================================
   CONTEXTO DE MI CUENTA — Fely Campo

   Estado del modal Y de la SESIÓN del cliente.

   La sesión va por COOKIE, no por token: aquí no se guarda ninguna
   credencial, ni en localStorage ni en memoria. Lo único que se guarda
   es quién es el usuario, y eso se pregunta al servidor
   (`GET /account/me/`), que es la única fuente de verdad.

   Al iniciar sesión se manda el `X-Cart-Id` del invitado: el backend
   fusiona ese carrito con el del usuario (`merge_carts`), sumando
   cantidades sin pasarse del stock. Sin eso, lo que alguien metió en la
   cesta antes de entrar se perdería.

   Verificación de correo: el registro la dispara (correo con enlace),
   pero **no bloquea nada por ahora** — se puede entrar y comprar sin
   confirmar. `usuario.emailVerificado` dice si está pendiente.
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { auth, account } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { leerCartId, borrarCartId } from '@/lib/api/cartId';

const MiCuentaContext = createContext(null);

function adaptarUsuario(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    nombre: u.first_name || '',
    apellidos: u.last_name || '',
    nombreCompleto: u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
    telefono: u.phone || '',
    aceptaMarketing: u.accepts_marketing === true,
    emailVerificado: u.email_verified === true,
  };
}

export function MiCuentaProvider({ children }) {
  const [abierta, setAbierta] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  /** Pregunta al servidor quién es. 403 = no hay sesión, que es un caso normal. */
  const refrescar = useCallback(async () => {
    try {
      setUsuario(adaptarUsuario(await account.obtenerPerfil()));
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      // Sin sesión (403) o backend caído: no hay usuario. No es un error que mostrar.
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  /**
   * @returns {Promise<{ok: boolean, mensaje?: string, detalles?: object}>} Nunca lanza:
   *   el modal decide qué enseñar.
   */
  const iniciarSesion = useCallback(async (email, password) => {
    try {
      // El cartId va para que el backend FUSIONE el carrito de invitado con el del
      // usuario. Es el propio backend quien lo hace, no el frontend.
      const u = await auth.iniciarSesion({ email, password }, leerCartId());
      setUsuario(adaptarUsuario(u));
      setAbierta(false);
      return { ok: true };
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      return {
        ok: false,
        detalles: error.details,
        mensaje: error.status === 429
          ? 'demasiadosIntentos'
          : error.isNetworkError
            ? 'errorRed'
            : error.firstDetail ?? error.message,
      };
    }
  }, []);

  /**
   * El backend deja la sesión iniciada al registrar, así que no hay que hacer login
   * después. También manda el correo de verificación, que hoy no bloquea nada.
   */
  const registrarse = useCallback(async (datos) => {
    try {
      const u = await auth.registrarse({
        email: datos.email,
        password: datos.password,
        first_name: datos.nombre ?? '',
        last_name: datos.apellidos ?? '',
        accepts_marketing: datos.aceptaMarketing ?? false,
      });
      setUsuario(adaptarUsuario(u));
      setAbierta(false);
      return { ok: true };
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      return {
        ok: false,
        detalles: error.details,
        mensaje: error.status === 429
          ? 'demasiadosIntentos'
          : error.isNetworkError
            ? 'errorRed'
            : error.firstDetail ?? error.message,
      };
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await auth.cerrarSesion();
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      // Aunque el servidor falle, en este navegador ya no hay sesión que usar.
    }
    setUsuario(null);
    // El carrito que quedaba era el del usuario, no el de invitado: olvidarlo evita
    // que el siguiente visitante herede un id que ya no le sirve.
    borrarCartId();
  }, []);

  const valor = useMemo(() => ({
    abierta,
    abrir: () => setAbierta(true),
    cerrar: () => setAbierta(false),

    usuario,
    haySesion: Boolean(usuario),
    cargandoSesion: cargando,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    refrescar,
  }), [abierta, usuario, cargando, iniciarSesion, registrarse, cerrarSesion, refrescar]);

  return <MiCuentaContext.Provider value={valor}>{children}</MiCuentaContext.Provider>;
}

export function useMiCuenta() {
  const contexto = useContext(MiCuentaContext);
  if (!contexto) throw new Error('useMiCuenta debe usarse dentro de <MiCuentaProvider>.');
  return contexto;
}
