// CarruselImagenes.jsx

'use client';

/* ============================================================
   Envoltorio mínimo de una tira de imágenes horizontal (ver .imagenes
   en talleres-fely-campo/page.module.css y atelier-fiesta/page.module.css,
   cada una con su propia copia del CSS — este componente solo aporta
   el comportamiento, genérico) para permitir scrollearla en horizontal
   con la rueda del ratón al pasar por encima — sin esto, el wheel
   vertical normal no mueve un overflow-x (solo el trackpad/shift+wheel
   lo hacen de forma nativa). onWheel de React es pasivo por defecto
   (no se puede preventDefault ahí), así que el listener se añade a
   mano con { passive: false } — de ahí que esto sea un Client
   Component aparte en vez de interactividad suelta en el page.js
   (Server Component) de quien lo usa.

   "Scroll chaining": solo se captura el wheel mientras el carrusel
   todavía tiene recorrido en ese sentido (izquierda/derecha) — al
   llegar a un extremo, el mismo gesto de scroll deja de tocar
   preventDefault y sigue de largo hacia la página, así el usuario
   nunca se queda "atrapado" en el carrusel al bajar/subir con el
   ratón encima. */
import { useEffect, useRef } from 'react';

function CarruselImagenes({ className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    function onWheel(evento) {
      // Gesto ya horizontal (trackpad, shift+wheel): se deja pasar tal cual.
      if (Math.abs(evento.deltaX) > Math.abs(evento.deltaY)) return;

      const avanzando = evento.deltaY > 0;
      const alInicio = el.scrollLeft <= 0;
      const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if ((avanzando && alFinal) || (!avanzando && alInicio)) return;

      evento.preventDefault();
      el.scrollLeft += evento.deltaY;
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default CarruselImagenes;
