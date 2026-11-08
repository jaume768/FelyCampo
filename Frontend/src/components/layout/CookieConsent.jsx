// CookieConsent.jsx

'use client';

/* ============================================================
   AVISO DE COOKIES — Fely Campo
   Barra fija al pie de LA VENTANA (no del documento: position:fixed,
   no relativa al scroll — ver .banner en CookieConsent.module.css),
   distinta de un Modal (ui/Modal.jsx). Lleva un velo negro al 40%
   detrás (.velo) que centra la atención y bloquea clics y scroll de
   la página hasta elegir, en mobile y escritorio, a petición — sigue
   siendo válido según la AEPD porque aceptar y rechazar están a la
   vista con el mismo peso (ver abajo). No atrapa el foco.

   "Aceptar todas" y "Rechazar todas" con el mismo peso visual
   (un botón .solido y otro .contorno del mismo tamaño, uno junto al
   otro) — guía de la AEPD (2021): un cookie banner no es válido si
   aceptar es un botón grande y rechazar un enlace diminuto o solo
   accesible tras entrar en "configurar". "Personalizar" expande un
   panel con consentimiento granular por categoría (Necesarias, fijas
   e imprescindibles / Analíticas / Marketing).

   Vive en el layout raíz (ver src/app/[locale]/layout.js), en TODAS
   las páginas (a diferencia de NewsletterModalGlobal.jsx, solo en
   home) — el aviso de cookies debe verse la primera vez que se visita
   cualquier página del sitio, no solo la home.

   Persistencia en localStorage (no sessionStorage: la decisión debe
   recordarse entre sesiones, no solo dentro de la visita actual), con
   el mismo
   try/catch por si el navegador la bloquea (modo privado) que
   CarritoContext.jsx. La lectura vive en un useEffect (no en el
   useState inicial): con "visible" arrancando siempre en false tanto
   en servidor como en cliente, el primer render de hidratación
   coincide en los dos y evita el aviso de "server/client mismatch" de
   React — el aviso aparece un instante después de montar, no de
   golpe, pero sin ese riesgo.

   Entrada y salida animadas (.entrada-suave/.salida-suave, ver
   global.css): al elegir cualquiera de las tres acciones
   (aceptar/rechazar/guardar preferencias) el aviso no desaparece de
   golpe — cerrarConAnimacion guarda la preferencia al instante, pone
   .salida-suave y retrasa el unmount real (setVisible(false))
   SALIDA_SUAVE_MS, el tiempo que tarda esa animación en verse
   completa (respeta prefers-reduced-motion saltándose la espera).

   Guarda la preferencia y la aplica al momento vía
   window.fcAplicarConsentimiento (definida en Analitica.jsx): Consent
   Mode de GTM para "Analíticas"/"Marketing" y carga del píxel de Meta
   solo con "Marketing". */

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Boton } from '../ui';
import styles from './CookieConsent.module.css';

const CLAVE_STORAGE = 'fc_cookies_consent';
// Debe coincidir con la duración de .salida-suave en global.css — el
// unmount real se retrasa este tiempo para que la animación de cierre
// (fundido + bajada) se vea completa antes de desaparecer de golpe.
const SALIDA_SUAVE_MS = 350;

function leerConsentimientoGuardado() {
  try {
    const guardado = window.localStorage.getItem(CLAVE_STORAGE);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function guardarConsentimiento(preferencias) {
  try {
    window.localStorage.setItem(
      CLAVE_STORAGE,
      JSON.stringify({ ...preferencias, fecha: new Date().toISOString() }),
    );
  } catch {
    // localStorage no disponible — la decisión no persiste entre
    // visitas, pero el aviso de esta ya se cierra igual.
  }
  // Aplica la elección al momento (Consent Mode de GTM + píxel de Meta)
  // — ver Analitica.jsx. No existe si no hay IDs de tracking configurados.
  window.fcAplicarConsentimiento?.(preferencias);
}

function CookieConsent() {
  const t = useTranslations('cookies');
  const locale = useLocale();

  const [visible, setVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [personalizando, setPersonalizando] = useState(false);
  const [analiticas, setAnaliticas] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!leerConsentimientoGuardado()) setVisible(true);
  }, []);

  // Mientras el aviso está visible, la página de detrás no hace scroll
  // (el velo ya bloquea los clics) — mismo criterio que MiCuentaModal.
  useEffect(() => {
    if (!visible) return undefined;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [visible]);

  if (!visible) return null;

  // Guarda la preferencia al instante (no hace falta esperar a la
  // animación para eso) y anima el cierre antes de desmontar de
  // verdad — igual que .entrada-suave, respeta prefers-reduced-motion
  // saltándose la espera (ver matchMedia en MapaPuntosVenta.jsx).
  const cerrarConAnimacion = () => {
    setCerrando(true);
    const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => setVisible(false), reducirMovimiento ? 0 : SALIDA_SUAVE_MS);
  };

  const aceptarTodas = () => {
    guardarConsentimiento({ necesarias: true, analiticas: true, marketing: true });
    cerrarConAnimacion();
  };

  const rechazarTodas = () => {
    guardarConsentimiento({ necesarias: true, analiticas: false, marketing: false });
    cerrarConAnimacion();
  };

  const guardarPreferencias = () => {
    guardarConsentimiento({ necesarias: true, analiticas, marketing });
    cerrarConAnimacion();
  };

  return (
    <>
      {/* Velo negro al 40% detrás del aviso: centra la atención y bloquea
          la página hasta elegir (clic en él no cierra nada — la decisión
          tiene que ser explícita). Solo fundido (sin la subida de
          .entrada-suave, que despegaría el velo del borde). */}
      <div
        className={`${styles.velo} ${cerrando ? styles.veloSaliendo : ''}`}
        aria-hidden="true"
      />
      <div
        className={`${styles.banner} ${cerrando ? 'salida-suave' : 'entrada-suave'}`}
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-label={t('titulo')}
      >
        <div className={styles.contenido}>
          <div className={styles.texto}>
            <p className={styles.titulo}>{t('titulo')}</p>
            <p className={styles.parrafo}>
              {t('texto')}{' '}
              <a href={`/${locale}/legal/cookies`} className={styles.enlace}>{t('enlace')}</a>
            </p>
          </div>

          <div className={styles.acciones}>
            <Boton variante="texto" className={styles.enlacePersonalizar} onClick={() => setPersonalizando((v) => !v)}>
              {t('personalizar')}
            </Boton>
            {/* Aceptar (contorno) antes y Rechazar (sólido, negro)
                después: Rechazar queda a la derecha en escritorio y
                abajo del todo en mobile (acciones en columna). Mismo
                tamaño los dos — ver criterio AEPD arriba. */}
            <Boton variante="contorno" tamano="s" onClick={aceptarTodas}>
              {t('aceptar')}
            </Boton>
            <Boton variante="solido" tamano="s" onClick={rechazarTodas}>
              {t('rechazar')}
            </Boton>
          </div>
        </div>

        {personalizando && (
          <div className={styles.preferencias}>
            <label className={styles.categoria}>
              <input type="checkbox" checked disabled className={styles.checkbox} />
              <span className={styles.categoriaTextos}>
                <span className={styles.categoriaNombre}>{t('categorias.necesarias.nombre')}</span>
                <span className={styles.categoriaTexto}>{t('categorias.necesarias.texto')}</span>
              </span>
            </label>

            <label className={styles.categoria}>
              <input
                type="checkbox"
                checked={analiticas}
                onChange={(evento) => setAnaliticas(evento.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.categoriaTextos}>
                <span className={styles.categoriaNombre}>{t('categorias.analiticas.nombre')}</span>
                <span className={styles.categoriaTexto}>{t('categorias.analiticas.texto')}</span>
              </span>
            </label>

            <label className={styles.categoria}>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(evento) => setMarketing(evento.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.categoriaTextos}>
                <span className={styles.categoriaNombre}>{t('categorias.marketing.nombre')}</span>
                <span className={styles.categoriaTexto}>{t('categorias.marketing.texto')}</span>
              </span>
            </label>

            <Boton variante="solido" tamano="s" className={styles.botonGuardar} onClick={guardarPreferencias}>
              {t('guardar')}
            </Boton>
          </div>
        )}
      </div>
    </>
  );
}

export default CookieConsent;
