// RunwayBackstage.jsx

'use client';

/* ============================================================
   BACKSTAGE DE COLECCIÓN — Fely Campo
   Cuadrícula editorial de fotos de backstage, entre la descripción y
   la cuadrícula de looks de cada ficha de colección (ver
   /colecciones-fely-campo/[coleccion]/page.js) — opcional, solo se pinta si la
   colección trae "backstage" (ver colecciones.js; de momento solo La
   Colección tiene reportaje de backstage real).
   .envoltorio ocupa el 100% (para que el fondo/padding de quien la use
   no tenga que saber del 80%) y dentro, .grid se acota al 80% y se
   centra — ver RunwayBackstage.module.css para el patrón de cascada
   (se repite cada 4 fotos: una sola a todo el ancho, dos en la misma
   fila, una sola a la izquierda) y los gaps generosos entre fotos.
   Cada imagen conserva su proporción natural (sin recorte forzado).
   "poema" es opcional (ver /sobre-fely, page.js): un verso poético,
   un verso por línea, que se intercala como una fila más entre las
   fotos — en "sándwich", con fotos antes y después, nunca al final.
   En vez de ir suelto a todo el ancho, se trata como una imagen más:
   cae en la columna derecha de su fila, con "poema.imagenes" (una o
   dos fotos, apiladas si son dos) en la columna izquierda de esa
   misma fila — por eso ambas piezas fuerzan su columna vía CSS
   (.poemaImagenes/.poema en RunwayBackstage.module.css, con más
   prioridad que la cascada de nth-child) en vez de depender de en qué
   posición numérica caigan. "poema.indice" fija dónde se inserta esa
   fila sobre "imagenes" (por defecto, al final).
   Uso:
     <RunwayBackstage imagenes={coleccion.backstage} alt={coleccion.nombre} />
     <RunwayBackstage
       imagenes={fotos}
       poema={{ texto: versos, imagenes: [fotoA, fotoB], indice: 3 }}
       alt="..."
     />
   Cada pieza de la cuadrícula aparece con scroll por su cuenta (ver
   .al-scroll/.en-vista en global.css) — un hook por elemento repetido
   (useEnVista no puede llamarse dentro de un .map), de ahí las
   pequeñas piezas PiezaImagen/PiezaPoemaImagenes/PiezaPoema en vez de
   pintar los <img>/<div> directamente en el .map de más abajo.
   ============================================================ */

import styles from './RunwayBackstage.module.css';
import useEnVista from '@/hooks/useEnVista';
import { atributosImagen } from '@/lib/imagenes';

function PiezaImagen({ src, alt }) {
  const [ref, enVista] = useEnVista();
  return <img ref={ref} {...atributosImagen(src, { sizes: '(max-width: 768px) 50vw, 33vw' })} alt={alt} className={`${styles.imagen} al-scroll ${enVista ? 'en-vista' : ''}`} />;
}

// Vídeo como una pieza más de la cascada (ver /atelier/fiesta, que
// alterna foto y vídeo): mismo .imagen, misma proporción natural.
function PiezaVideo({ src }) {
  const [ref, enVista] = useEnVista();
  // Sin src hasta que entra en pantalla: en /atelier/fiesta estos vídeos
  // (~7 MB) se descargaban enteros al abrir la página.
  return <video ref={ref} src={enVista ? src : undefined} preload="none" className={`${styles.imagen} al-scroll ${enVista ? 'en-vista' : ''}`} autoPlay muted loop playsInline />;
}

function PiezaPoemaImagenes({ srcs, alt }) {
  const [ref, enVista] = useEnVista();
  return (
    <div ref={ref} className={`${styles.poemaImagenes} al-scroll ${enVista ? 'en-vista' : ''}`}>
      {srcs.map((src) => (
        <img key={src} {...atributosImagen(src, { sizes: '(max-width: 768px) 50vw, 33vw' })} alt={alt} />
      ))}
    </div>
  );
}

function PiezaPoema({ texto }) {
  const [ref, enVista] = useEnVista();
  return (
    <div ref={ref} className={`${styles.poema} al-scroll ${enVista ? 'en-vista' : ''}`}>
      {texto.map((verso, i) => (
        <p key={i}>{verso}</p>
      ))}
    </div>
  );
}

function RunwayBackstage({ imagenes = [], poema, alt }) {
  const tienePoema = poema?.texto?.length > 0;
  if (imagenes.length === 0 && !tienePoema) return null;

  // Cada entrada: un src suelto (foto) o {tipo: 'imagen' | 'video', src}.
  const piezas = imagenes.map((medio) => (typeof medio === 'string' ? { tipo: 'imagen', src: medio } : medio));
  if (tienePoema) {
    const indice = Math.min(Math.max(poema.indice ?? imagenes.length, 0), imagenes.length);
    piezas.splice(
      indice,
      0,
      { tipo: 'poemaImagenes', srcs: poema.imagenes ?? [] },
      { tipo: 'poema', texto: poema.texto }
    );
  }

  return (
    <div className={styles.envoltorio}>
      <div className={styles.grid}>
        {piezas.map((pieza) => {
          if (pieza.tipo === 'imagen') {
            return <PiezaImagen key={pieza.src} src={pieza.src} alt={alt} />;
          }

          if (pieza.tipo === 'video') {
            return <PiezaVideo key={pieza.src} src={pieza.src} />;
          }

          if (pieza.tipo === 'poemaImagenes') {
            return <PiezaPoemaImagenes key="poema-imagenes" srcs={pieza.srcs} alt={alt} />;
          }

          return <PiezaPoema key="poema" texto={pieza.texto} />;
        })}
      </div>
    </div>
  );
}

export default RunwayBackstage;
