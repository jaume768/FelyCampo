// useEnVista.js

'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * true la primera vez que el elemento referenciado entra en el
 * viewport — se queda en true para siempre después (deja de observar
 * en cuanto dispara una vez), pensado para animaciones de entrada que
 * no deben repetirse al subir/bajar por la página.
 * Sin IntersectionObserver (SSR, navegadores muy viejos): true desde
 * el principio, para no dejar el contenido oculto por error.
 */
function useEnVista({ margen = '0px 0px -10% 0px', umbral = 0.2 } = {}) {
  const ref = useRef(null);
  const [enVista, setEnVista] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setEnVista(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setEnVista(true);
          observer.unobserve(elemento);
        }
      },
      { rootMargin: margen, threshold: umbral }
    );

    observer.observe(elemento);
    return () => observer.disconnect();
  }, [margen, umbral]);

  return [ref, enVista];
}

export default useEnVista;
