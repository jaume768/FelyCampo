'use client';

/* ============================================================
   VÍDEO DIFERIDO — Fely Campo
   Los vídeos decorativos (autoPlay muted loop) de los bloques de la web.
   Un <video autoPlay> se descarga entero al cargar la página, aunque esté
   tres pantallas más abajo: en /atelier/fiesta eso eran ~11 MB antes de que
   la visita llegara a verlos. Aquí el archivo no se pide hasta que el
   vídeo está a punto de entrar en pantalla (300 px antes), y entonces se
   reproduce solo, igual que antes.

   Sin JavaScript o sin IntersectionObserver se carga directamente.
   Los vídeos del hero (arriba del todo) NO usan esto: deben empezar ya.
   ============================================================ */

import { useEffect, useRef, useState } from 'react';

export default function VideoDiferido({ src, className, poster, ...resto }) {
  const ref = useRef(null);
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || typeof IntersectionObserver === 'undefined') {
      setCerca(true);
      return undefined;
    }
    const observador = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) {
        setCerca(true);
        observador.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={cerca ? src : undefined}
      poster={poster}
      className={className}
      preload="none"
      autoPlay
      muted
      loop
      playsInline
      {...resto}
    />
  );
}
