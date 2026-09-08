// MiCuentaModal.jsx

'use client';

/* ============================================================
   MODAL DE MI CUENTA — Fely Campo
   Iniciar sesión / crear cuenta como modal a pantalla completa (no
   una página aparte) — se abre desde "Mi cuenta" en el Navbar
   (escritorio y menú móvil) y desde el aviso de /carrito, todos vía
   useMiCuenta() (MiCuentaContext.jsx): así no se ve ni el Navbar ni el
   Footer detrás mientras está abierto, a diferencia de una página
   normal. Vive montado una sola vez en Navbar.jsx (mismo criterio que
   CarritoPanel), "abierta" viene del contexto — igual mecanismo de
   apertura/cierre que GaleriaProductoLightbox.jsx (foco en cerrar,
   scroll de fondo bloqueado, Escape cierra), sin pista de imágenes:
   aquí el contenido es el propio formulario.

   Layout 50%/50% (foto a la izquierda, formulario a la derecha, ver
   MiCuentaModal.module.css) — en mobile la foto pasa a ser una franja
   fija arriba. Login/Registro alternan qué formulario se pinta a la
   derecha — no con pestañas arriba (confundían con navegación real),
   sino con una pregunta bajo el botón de Google ("¿Eres nueva en Fely
   Campo? Crear cuenta" / "¿Ya tienes cuenta? Iniciar sesión"), mismo
   patrón que cualquier login/registro estándar. Cada apertura empieza
   en "login".

   CONECTADO de verdad: POST /auth/login/ y /auth/register/, sesión por
   COOKIE (aquí no se guarda ninguna credencial, ni en localStorage ni
   en memoria). Al entrar se manda el X-Cart-Id del invitado para que el
   backend FUSIONE su carrito con el del usuario.

   Dos cambios obligados respecto al diseño de partida:
     · El registro ahora pide CONTRASEÑA. El backend la exige, y sin
       ella no hay alta posible.
     · La FECHA DE NACIMIENTO se ha quitado: `accounts.User` no tiene
       ese campo, así que pedirla era pedir un dato que se tiraba.
   El nombre completo se parte en nombre + apellidos, que es como lo
   guarda el modelo (`first_name` / `last_name`).

   Verificación de correo: el registro dispara el correo con el enlace,
   pero NO bloquea nada — se puede entrar y comprar sin confirmarlo.
   Uso:
     <MiCuentaModal />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Input, Boton } from '../ui';
import { useMiCuenta } from '@/context/MiCuentaContext';
import styles from './MiCuentaModal.module.css';

// "G" de Google, mismos cuatro colores de marca de siempre — icono
// suelto embebido (Lucide no trae logos de marca).
function IconoGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

function MiCuentaModal() {
  const t = useTranslations('miCuenta');
  const locale = useLocale();
  const { abierta, cerrar, iniciarSesion, registrarse } = useMiCuenta();
  const cerrarRef = useRef(null);
  const [modo, setModo] = useState('login');
  const esLogin = modo === 'login';
  const tabIndexInteractivo = abierta ? 0 : -1;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [enviando, setEnviando] = useState(false);
  // Errores del backend por campo, traducidos donde los conocemos.
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);

  /** Traduce lo que sabemos nombrar; deja pasar el texto del backend si es más preciso. */
  const traducirError = (clave) => {
    if (clave === 'errorRed') return t('errorRed');
    if (clave === 'demasiadosIntentos') return t('demasiadosIntentos');
    return clave;
  };

  const alEnviar = async (evento) => {
    evento.preventDefault();
    setErrores({});
    setErrorGeneral(null);

    if (!email.trim() || !password) {
      setErrores({
        ...(email.trim() ? {} : { email: [t('campoObligatorio')] }),
        ...(password ? {} : { password: [t('campoObligatorio')] }),
      });
      return;
    }

    setEnviando(true);
    // El nombre se parte por el primer espacio: el modelo guarda nombre y apellidos
    // aparte, y pedirlos en un solo campo era la forma del diseño, no del dato.
    const [nombre, ...resto] = nombreCompleto.trim().split(/\s+/);
    const resultado = esLogin
      ? await iniciarSesion(email.trim(), password)
      : await registrarse({
        email: email.trim(),
        password,
        nombre: nombre ?? '',
        apellidos: resto.join(' '),
      });
    setEnviando(false);

    if (resultado.ok) {
      // Recarga completa a propósito: el sitio navega con <a> normales y así todo
      // (Navbar, carrito) se repinta ya con la sesión iniciada.
      window.location.href = `/${locale}/mi-cuenta/panel`;
      return;
    }

    // Campo a campo cuando el backend lo detalla; si no, un mensaje general.
    if (resultado.detalles && Object.keys(resultado.detalles).length) setErrores(resultado.detalles);
    else setErrorGeneral(traducirError(resultado.mensaje));
  };

  const errorDe = (campo) => {
    const valor = errores[campo];
    if (!valor) return null;
    return Array.isArray(valor) ? String(valor[0]) : String(valor);
  };

  // Foco en cerrar + sin scroll de la página detrás mientras está
  // abierto — mismo criterio que GaleriaProductoLightbox/RunwayGaleria.
  useEffect(() => {
    if (!abierta) return undefined;
    const enfocadoAntes = document.activeElement;
    cerrarRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alTeclado = (evento) => {
      if (evento.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alTeclado);

    return () => {
      document.removeEventListener('keydown', alTeclado);
      document.body.style.overflow = overflowPrevio;
      enfocadoAntes?.focus?.();
    };
  }, [abierta, cerrar]);

  // Cada apertura empieza en "login" — igual criterio que resetear la
  // talla en GaleriaProductoLightbox al abrir.
  useEffect(() => {
    if (abierta) setModo('login');
  }, [abierta]);

  return (
    <div className={`${styles.modal} ${abierta ? styles.abierta : ''}`} aria-hidden={!abierta}>
      <button
        ref={cerrarRef}
        type="button"
        className={styles.cerrar}
        onClick={cerrar}
        aria-label={t('cerrar')}
        tabIndex={tabIndexInteractivo}
      >
        <X size={28} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
      </button>

      <div className={styles.layout}>
        <div className={styles.imagenPanel}>
          <img src="/img/felycampo-lacoleccion-3.webp" alt="" className={styles.imagen} />
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formContenedor}>
            <div className={styles.cabecera}>
              <h1 className={styles.titulo}>{esLogin ? t('tituloLogin') : t('tituloRegistro')}</h1>
              <p className={styles.subtitulo}>{esLogin ? t('subtituloLogin') : t('subtituloRegistro')}</p>
            </div>

            <form className={styles.form} onSubmit={alEnviar}>
              {/* El nombre solo se pide al registrarse. La fecha de nacimiento se quitó:
                  `accounts.User` no la tiene, así que era un dato que se tiraba. */}
              {!esLogin && (
                <Input
                  etiqueta={t('nombreCompleto')}
                  tipo="text"
                  nombre="nombreCompleto"
                  placeholder={t('nombreCompletoPlaceholder')}
                  valor={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  autoComplete="name"
                  tabIndex={tabIndexInteractivo}
                />
              )}

              <Input
                etiqueta={t('email')}
                tipo="email"
                nombre="email"
                placeholder={t('emailPlaceholder')}
                valor={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errorDe('email')}
                autoComplete="email"
                tabIndex={tabIndexInteractivo}
              />

              {/* Obligatoria también al registrarse: el backend la exige. */}
              <Input
                etiqueta={t('password')}
                tipo="password"
                nombre="password"
                valor={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errorDe('password')}
                autoComplete={esLogin ? 'current-password' : 'new-password'}
                tabIndex={tabIndexInteractivo}
              />

              {errorGeneral && <p className={styles.error} role="alert">{errorGeneral}</p>}
              {errorDe('non_field_errors') && (
                <p className={styles.error} role="alert">{errorDe('non_field_errors')}</p>
              )}

              <Boton variante="solido" tamano="full" type="submit" desactivado={enviando} tabIndex={tabIndexInteractivo}>
                {enviando ? t('enviando') : (esLogin ? t('enviarLogin') : t('enviarRegistro'))}
              </Boton>
            </form>

            {/* Entrar con Google NO está implementado: no hay OAuth en el backend. El
                botón se deja visible pero inerte y explicado, en vez de fingir que
                autentica y llevar al panel sin haber comprobado nada. */}
            <button
              type="button"
              className={styles.googleBtn}
              disabled
              title={t('googleNoDisponible')}
              tabIndex={-1}
            >
              <IconoGoogle />
              {t('google')}
            </button>
            <p className={styles.nota}>{t('googleNoDisponible')}</p>

            <p className={styles.cambiarModo}>
              {esLogin ? t('preguntaRegistro') : t('preguntaLogin')}{' '}
              <button
                type="button"
                className={styles.cambiarModoBtn}
                onClick={() => setModo(esLogin ? 'registro' : 'login')}
                tabIndex={tabIndexInteractivo}
              >
                {esLogin ? t('tabRegistro') : t('tabLogin')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiCuentaModal;
