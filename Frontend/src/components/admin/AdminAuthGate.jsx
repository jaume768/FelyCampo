'use client';

/* ============================================================
   PUERTA DE ACCESO AL PANEL — Fely Campo (admin)

   Comprueba la sesión de staff con GET /api/v1/admin/me/ antes de
   dejar ver nada. Sin ella, TODAS las llamadas del panel devuelven 401
   y el panel se quedaría lleno de tablas vacías sin explicar por qué.

   No es un sistema de autenticación aparte: es la MISMA sesión + cookie
   del resto de la API, y `is_staff` es un flag más del usuario (ver
   `IsStaff` en apps/adminapi/permissions.py). Por eso el login de aquí
   usa el mismo POST /auth/login/ que la web pública.

   Guard EN CLIENTE, no en el middleware de Next: el middleware corre en
   el Edge y no puede validar una cookie de sesión de Django sin llamar
   a la API en cada navegación — latencia en todas las rutas para
   proteger unas pocas. Aquí basta una comprobación al montar.

   401 = sin sesión (se pide login). 403 = con sesión pero sin is_staff
   (una cuenta de cliente normal): son casos distintos y se explican
   distinto.
   ============================================================ */

import { useCallback, useEffect, useState } from 'react';

import { obtenerAdmin } from '@/lib/api/adminCatalog';
import { auth } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { Boton, Input } from '@/components/ui';

import styles from './AdminAuthGate.module.css';

export default function AdminAuthGate({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [comprobando, setComprobando] = useState(true);
  // 'sin_sesion' | 'sin_permiso' | 'red' | null
  const [motivo, setMotivo] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [errorLogin, setErrorLogin] = useState(null);

  const comprobar = useCallback(async () => {
    setComprobando(true);
    try {
      setUsuario(await obtenerAdmin());
      setMotivo(null);
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      setUsuario(null);
      if (error.status === 403) setMotivo('sin_permiso');
      else if (error.isNetworkError) setMotivo('red');
      else setMotivo('sin_sesion');
    } finally {
      setComprobando(false);
    }
  }, []);

  useEffect(() => {
    comprobar();
  }, [comprobar]);

  const entrar = async (evento) => {
    evento.preventDefault();
    setErrorLogin(null);
    setEntrando(true);
    try {
      await auth.iniciarSesion({ email: email.trim(), password });
      // Iniciar sesión no garantiza acceso: hace falta `is_staff`. Se vuelve a comprobar
      // en vez de dar por hecho que quien entra es personal.
      await comprobar();
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      if (error.status === 429) setErrorLogin('Demasiados intentos. Prueba dentro de un rato.');
      else if (error.isNetworkError) setErrorLogin('No hemos podido conectar con el servidor.');
      else setErrorLogin(error.firstDetail ?? 'Correo o contraseña incorrectos.');
    } finally {
      setEntrando(false);
    }
  };

  if (comprobando) {
    return (
      <div className={styles.pantalla} role="status">
        <p className={styles.texto}>Comprobando sesión…</p>
      </div>
    );
  }

  if (usuario) return children;

  if (motivo === 'sin_permiso') {
    return (
      <div className={styles.pantalla}>
        <h1 className={styles.titulo}>Sin acceso</h1>
        <p className={styles.texto}>
          Tu cuenta está identificada pero no tiene permiso de administración.
          Pide que te activen el acceso al panel.
        </p>
        <button type="button" className={styles.enlace} onClick={async () => { await auth.cerrarSesion(); comprobar(); }}>
          Entrar con otra cuenta
        </button>
      </div>
    );
  }

  if (motivo === 'red') {
    return (
      <div className={styles.pantalla}>
        <h1 className={styles.titulo}>Sin conexión con el servidor</h1>
        <p className={styles.texto}>No hemos podido contactar con la API. Comprueba que el backend está en marcha.</p>
        <Boton variante="solido" onClick={comprobar}>Reintentar</Boton>
      </div>
    );
  }

  return (
    <div className={styles.pantalla}>
      <form className={styles.form} onSubmit={entrar}>
        <h1 className={styles.titulo}>Panel de administración</h1>
        <Input etiqueta="Correo" tipo="email" nombre="email" valor={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <Input etiqueta="Contraseña" tipo="password" nombre="password" valor={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {errorLogin && <p className={styles.error} role="alert">{errorLogin}</p>}
        <Boton variante="solido" tamano="full" type="submit" disabled={entrando}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </Boton>
      </form>
    </div>
  );
}
