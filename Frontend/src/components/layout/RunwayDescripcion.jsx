// RunwayDescripcion.jsx

'use client';

/* ============================================================
   DESCRIPCIÓN DE COLECCIÓN — Fely Campo
   Texto editorial, debajo del hero de cada ficha de colección (ver
   /colecciones-fely-campo/[coleccion]/page.js) — vive junto a .textoRow dentro
   de un contenedor común a 70% de ancho (.textoDescripcion en
   page.module.css), sin ancho propio. Mismo criterio de repetición
   que RunwayMediaLateral: solo cambia el texto (coleccion.descripcion,
   ver colecciones.js).
   Uso:
     <RunwayDescripcion texto={coleccion.descripcion} />
   "className" opcional, se suma a .texto — para overrides puntuales
   de una sola página (ej. /atelier), no cambia el resto de usos.
   'use client' por useEnVista: el párrafo aparece con scroll (ver
   .al-scroll/.en-vista en global.css), no de golpe al cargar.

   "texto" también admite un array de frases cortas (en vez de un
   único string): cada frase se pinta en su propia línea (no un párrafo justificado
   normal) y entra por separado, una detrás de otra (animation-delay
   escalonado sobre la misma animación de .al-scroll/.en-vista), no
   todas de golpe como el párrafo único de siempre. Un solo
   IntersectionObserver (useEnVista) en el contenedor decide CUÁNDO
   empieza a entrar el grupo entero; el delay de cada frase decide el
   ORDEN dentro de ese mismo scroll. */

import styles from './RunwayDescripcion.module.css';
import useEnVista from '@/hooks/useEnVista';

// Frase a frase (ver comentario de arriba): 0.25s entre cada una — lo
// bastante para leerse como una entrada en cascada, no tan largo como
// para sentirse lento con solo 3 frases cortas.
const RETARDO_ENTRE_FRASES_S = 0.25;

function RunwayDescripcion({ texto, className }) {
  const [ref, enVista] = useEnVista();

  if (!texto) return null;

  const frases = Array.isArray(texto) ? texto : [texto];

  return (
    <div ref={ref} className={styles.descripcion}>
      {frases.map((frase, indice) => (
        <p
          key={frase}
          className={`${styles.texto} ${className || ''} al-scroll ${enVista ? 'en-vista' : ''}`}
          style={frases.length > 1 ? { animationDelay: `${indice * RETARDO_ENTRE_FRASES_S}s` } : undefined}
        >
          {frase}
        </p>
      ))}
    </div>
  );
}

export default RunwayDescripcion;
