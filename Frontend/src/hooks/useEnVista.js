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
 *
 * Dispara en cuanto el borde superior del elemento asoma un 5% por
 * abajo de la pantalla (umbral 0, margen -5%), sea cual sea su alto.
 * Antes pedía un 20% del propio elemento visible (umbral 0.2): en
 * bloques altos (80–120vh) eso era mucho scroll con el bloque aún
 * invisible, y uno de más de ~4,5 pantallas no llegaba nunca al 20% y
 * se quedaba oculto para siempre.
 */
function useEnVista({ margen = '0px 0px -5% 0px', umbral = 0 } = {}) {
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
