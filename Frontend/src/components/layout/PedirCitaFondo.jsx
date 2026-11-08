// PedirCitaFondo.jsx

'use client';

/* ============================================================
   FONDO CON PARALLAX DE PedirCita — Fely Campo
   Capa de la foto del atelier (con su velo) detrás del texto de
   PedirCita.jsx — componente cliente aparte porque PedirCita es de
   servidor (getTranslations) y el parallax necesita scroll en el
   navegador.

   Parallax "foto más lenta": al hacer scroll la foto se queda un
   VELOCIDAD (30%) por detrás de la página — se mueve más despacio que
   el texto, que va normal con la sección — y queda centrada cuando la
   sección está en mitad de la pantalla. La capa es más alta que la sección (ver .fondo en
   PedirCita.module.css, un 50% extra arriba y abajo) para que el
   desplazamiento nunca deje ver el borde; el valor se limita a ese
   margen por si la sección crece.

   Solo en escritorio (MEDIA_ESCRITORIO, mismo corte de 1024px que el
   resto de secciones partidas) y nunca con prefers-reduced-motion: ahí
   la foto se queda quieta, como un fondo normal. */

import { useEffect, useRef } from 'react';
import styles from './PedirCita.module.css';

const VELOCIDAD = 0.3;
const MEDIA_ESCRITORIO = '(min-width: 1024px)';
const MEDIA_SIN_MOVIMIENTO = '(prefers-reduced-motion: reduce)';

// "imagen": la foto de fondo (lib/piezasComunes.js); el velo negro lo pone el CSS.
function PedirCitaFondo({ imagen }) {
  const ref = useRef(null);

  useEffect(() => {
    const capa = ref.current;
    const seccion = capa?.parentElement;
    if (!capa || !seccion) return;

    const escritorio = window.matchMedia(MEDIA_ESCRITORIO);
    const sinMovimiento = window.matchMedia(MEDIA_SIN_MOVIMIENTO);
    let frame = 0;

    const actualizar = () => {
      frame = 0;
      if (!escritorio.matches || sinMovimiento.matches) {
        capa.style.transform = '';
        return;
      }
      const rect = seccion.getBoundingClientRect();
      // Distancia del centro de la sección al centro de la pantalla.
      const distancia = rect.top + rect.height / 2 - window.innerHeight / 2;
      const margen = rect.height * 0.5;
      const desplazamiento = Math.max(-margen, Math.min(margen, -distancia * VELOCIDAD));
      capa.style.transform = `translate3d(0, ${desplazamiento}px, 0)`;
    };

    const pedirFrame = () => {
      if (!frame) frame = requestAnimationFrame(actualizar);
    };

    actualizar();
    window.addEventListener('scroll', pedirFrame, { passive: true });
    window.addEventListener('resize', pedirFrame);
    escritorio.addEventListener('change', pedirFrame);
    sinMovimiento.addEventListener('change', pedirFrame);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', pedirFrame);
      window.removeEventListener('resize', pedirFrame);
      escritorio.removeEventListener('change', pedirFrame);
      sinMovimiento.removeEventListener('change', pedirFrame);
    };
  }, []);

  return <div ref={ref} className={styles.fondo} style={{ '--foto-pedir-cita': `url('${imagen}')` }} aria-hidden="true" />;
}

export default PedirCitaFondo;
