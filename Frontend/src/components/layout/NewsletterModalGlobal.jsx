// NewsletterModalGlobal.jsx

'use client';

/* ============================================================
   POPUP NEWSLETTER — disparo automático — Fely Campo
   Envoltorio que abre NewsletterModal.jsx solo al llegar a la web,
   mismo criterio de montaje global que CarritoPanel/MiCuentaModal
   (ver Navbar.jsx) pero con estado propio en vez de un Context — nada
   más lo abre desde fuera. Vive en el layout raíz (ver
   src/app/[locale]/layout.js), montado solo en home ("isHome") — es
   un placeholder de captación, no un popup a repetir en cada página.

   Nunca al entrar (ni con un retraso fijo, que también acababa
   interrumpiendo a quien aún estaba mirando el hero): se abre por
   interés, con lo primero que ocurra de:
   - Scroll: la visitante ha bajado UMBRAL_SCROLL de la home — ya ha
     visto contenido, no es una interrupción a ciegas.
   - Intención de salida (solo escritorio, puntero fino): el ratón sale
     por arriba de la ventana, hacia pestañas/barra de direcciones.

   Nunca encima del aviso de cookies (CookieConsent.jsx): mientras no
   haya decisión guardada en su misma clave de localStorage, los
   disparadores se ignoran — el siguiente scroll lo vuelve a intentar.

   Una vez cerrado no vuelve en DIAS_SIN_MOSTRAR (localStorage con
   fecha, no sessionStorage: antes reaparecía en cada visita nueva),
   con el mismo try/catch de CarritoContext.jsx por si el navegador lo
   bloquea/está en modo privado. */

import { useEffect, useState } from 'react';
import NewsletterModal from './NewsletterModal';

const CLAVE_STORAGE = 'fc_newsletter_popup_visto';
const CLAVE_COOKIES = 'fc_cookies_consent'; // ver CookieConsent.jsx
const UMBRAL_SCROLL = 0.5;
const DIAS_SIN_MOSTRAR = 30;

function vistoRecientemente() {
  try {
    const fecha = Number(window.localStorage.getItem(CLAVE_STORAGE));
    return fecha > 0 && Date.now() - fecha < DIAS_SIN_MOSTRAR * 24 * 60 * 60 * 1000;
  } catch {
    // localStorage no disponible — se comporta como si no se hubiera
    // visto todavía, nunca rompe el popup.
    return false;
  }
}

function cookiesDecididas() {
  try {
    return Boolean(window.localStorage.getItem(CLAVE_COOKIES));
  } catch {
    return true;
  }
}

function NewsletterModalGlobal() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (vistoRecientemente()) return;

    const quitar = () => {
      window.removeEventListener('scroll', alHacerScroll);
      document.documentElement.removeEventListener('mouseleave', alSalir);
    };

    const intentarAbrir = () => {
      if (!cookiesDecididas()) return;
      quitar();
      setAbierto(true);
    };

    const alHacerScroll = () => {
      const recorrido = document.documentElement.scrollHeight - window.innerHeight;
      if (recorrido > 0 && window.scrollY / recorrido >= UMBRAL_SCROLL) intentarAbrir();
    };

    const alSalir = (evento) => {
      if (evento.clientY <= 0) intentarAbrir();
    };

    window.addEventListener('scroll', alHacerScroll, { passive: true });
    if (window.matchMedia?.('(pointer: fine)').matches) {
      document.documentElement.addEventListener('mouseleave', alSalir);
    }
    return quitar;
  }, []);

  const cerrar = () => {
    setAbierto(false);
    try {
      window.localStorage.setItem(CLAVE_STORAGE, String(Date.now()));
    } catch {
      // ver comentario de arriba — sin persistencia, solo no vuelve a
      // aparecer dentro de este mismo montaje.
    }
  };

  return <NewsletterModal abierto={abierto} onCerrar={cerrar} />;
}

export default NewsletterModalGlobal;
