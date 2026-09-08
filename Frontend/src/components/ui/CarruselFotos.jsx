// CarruselFotos.jsx

'use client';

/* ============================================================
   CARRUSEL DE FOTOS (hover) — Fely Campo
   Pieza reutilizable: dado un array de fotos, las cicla con cross-fade
   + una barra de progreso segmentada superpuesta arriba (mismo
   lenguaje visual que SectionClientsReview.jsx) al pasar el ratón por
   encima. En dispositivos sin ratón real (móvil/táctil, "hover: hover"
   no coincide) arranca sola al montar y sigue en bucle sin parar — ahí
   no hay "hover" al que esperar.
   Usada por ResenasClientes.jsx (TarjetaResena) y GaleriaVosotras.jsx
   — cada una le da su propio tamaño/aspect-ratio/radio/overflow al
   contenedor que la envuelve (ver "Uso" abajo): este componente ocupa
   el 100% de ese contenedor (position:absolute, inset:0), no decide
   su propio tamaño.
   Con 0 o 1 foto no pinta nada (ni barra ni cross-fade posible) — el
   consumidor decide su propio estado "vacío"/"una sola foto fija".
   Uso:
     <div className={misEstilos.marco}> // position:relative, aspect-ratio, overflow:hidden
       <CarruselFotos fotos={['/a.jpg', '/b.jpg']} />
     </div>
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import styles from './CarruselFotos.module.css';

// Debe coincidir con la duración de @keyframes avanceProgresoFoto en
// CarruselFotos.module.css (2s) — mismo criterio/comentario que
// SLIDE_DURATION_MS en SectionClientsReview.jsx.
const INTERVALO_MS = 2000;

function CarruselFotos({ fotos = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [enHover, setEnHover] = useState(false);
  const intervaloRef = useRef(null);
  // "true" hasta que el efecto de abajo compruebe de verdad si el
  // dispositivo tiene ratón — evita que alEntrar/alSalir (ligados a
  // onMouseEnter/onMouseLeave, que algunos navegadores móviles también
  // disparan en el primer toque) interrumpan el bucle automático de
  // móvil/táctil antes de que dé tiempo a desactivarlos.
  const tieneHoverRef = useRef(true);

  const iniciarIntervalo = () => {
    if (fotos.length <= 1 || intervaloRef.current) return;
    intervaloRef.current = setInterval(() => {
      setActiveIndex((actual) => (actual + 1) % fotos.length);
    }, INTERVALO_MS);
  };

  const alEntrar = () => {
    if (!tieneHoverRef.current) return;
    setEnHover(true);
    // Primer hover: cambia de foto al momento, no espera a que pase el
    // primer INTERVALO_MS entero — si no, con la barra a 0 recién
    // aparecida, pasar el ratón un instante no se notaría.
    if (!intervaloRef.current && fotos.length > 1) {
      setActiveIndex((actual) => (actual + 1) % fotos.length);
    }
    iniciarIntervalo();
  };

  const alSalir = () => {
    if (!tieneHoverRef.current) return;
    clearInterval(intervaloRef.current);
    intervaloRef.current = null;
    setEnHover(false);
    setActiveIndex(0);
  };

  // Móvil/táctil: sin ratón real, onMouseEnter no llegaría a
  // dispararse nunca y el carrusel se quedaría siempre parado en su
  // primera foto — en vez de eso, arranca solo al montar y sigue en
  // bucle sin parar (sin "salir" al que volver).
  useEffect(() => {
    tieneHoverRef.current = window.matchMedia('(hover: hover)').matches;
    if (!tieneHoverRef.current) {
      setEnHover(true);
      iniciarIntervalo();
    }
    return () => {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fotos.length === 0) return null;

  return (
    <div className={styles.raiz} onMouseEnter={alEntrar} onMouseLeave={alSalir}>
      <div className={styles.pistaFotos}>
        {fotos.map((foto, index) => (
          <img
            key={foto}
            src={foto}
            alt=""
            className={`${styles.foto} ${index === activeIndex ? styles.fotoActiva : ''}`}
          />
        ))}
      </div>

      {fotos.length > 1 && enHover && (
        <div className={styles.barras}>
          {fotos.map((foto, index) => {
            const completo = index < activeIndex;
            const animando = index === activeIndex;
            const claseRelleno = [
              styles.segmentoRelleno,
              completo && styles.completo,
              animando && styles.animando,
            ].filter(Boolean).join(' ');

            return (
              <div key={foto} className={styles.segmento}>
                <div className={styles.segmentoPista} />
                <div key={animando ? activeIndex : undefined} className={claseRelleno} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CarruselFotos;
