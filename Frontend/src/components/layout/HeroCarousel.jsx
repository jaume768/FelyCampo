// HeroCarousel.jsx

'use client';

import { useEffect, useRef, useState } from 'react';
import Boton from '../ui/Boton';
import styles from './HeroCarousel.module.css';
import { atributosImagen, srcSetDe } from '@/lib/imagenes';

// Duración de cada slide de IMAGEN: el primero se queda más (8s), el
// resto rota cada 6s. Los de VÍDEO no usan temporizador: duran lo que
// dura el vídeo (avanzan en su evento "ended", ver más abajo). La barra de progreso recibe la misma duración por inline
// style (ver .progresoRelleno abajo), así que van siempre sincronizadas.
const SLIDE_DURATION_MS = 6000;
const PRIMER_SLIDE_DURATION_MS = 8000;
const duracionSlide = (index) => (index === 0 ? PRIMER_SLIDE_DURATION_MS : SLIDE_DURATION_MS);

/**
 * Hero a pantalla completa de la home: slides (imagen o vídeo) que
 * rotan solos — las imágenes 8s el primero y 6s el resto, los vídeos lo
 * que dure el vídeo entero (de principio a fin, sin bucle). La barra de progreso lineal
 * está oculta (comentada al final del JSX).
 * Encima de cada slide, abajo,
 * una fila con la descripción a la izquierda y el CTA a la derecha. El
 * único elemento clicable es el CTA — la imagen no lleva su propio
 * enlace, para no anidar/duplicar <a> dentro del slide.
 * Los datos vienen por props, nada hardcodeado aquí.
 * "srcMobile" (opcional): versión propia para mobile (max-width:768px,
 * mismo corte que el resto del sitio) — en imágenes vía <picture>, en
 * vídeos vía <source media> (el navegador solo descarga uno de los dos).
 */
function HeroCarousel({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videosRef = useRef([]);
  const siguiente = () => setActiveIndex((actual) => (actual + 1) % slides.length);

  useEffect(() => {
    const hayVarios = slides.length > 1;
    // Accesibilidad: si el sistema pide reducir el movimiento, el
    // carrusel no avanza solo (el usuario puede seguir navegando a mano).
    const avanzaSolo = hayVarios && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Solo suena el vídeo del slide activo, y siempre desde el principio
    // (así dura entero); el resto en pausa.
    videosRef.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        video.currentTime = 0;
        video.loop = !avanzaSolo;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    if (!avanzaSolo) return undefined;
    // Slide de vídeo: avanza en su "ended" (ver onEnded), sin temporizador.
    if (slides[activeIndex].tipo === 'video') return undefined;

    // setTimeout por slide (no setInterval): cada uno tiene su duración.
    const temporizador = setTimeout(siguiente, duracionSlide(activeIndex));
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, slides]);

  return (
    <section className={styles.hero}>
      {slides.map((slide, index) => {
        const activo = index === activeIndex;
        return (
          <div
            key={index}
            className={`${styles.slide} ${activo ? styles.activo : ''}`}
            aria-hidden={!activo}
          >
            {slide.tipo === 'video' ? (
              <video
                ref={(nodo) => { videosRef.current[index] = nodo; }}
                src={slide.srcMobile ? undefined : slide.src}
                className={styles.media}
                autoPlay={activo}
                muted
                playsInline
                onEnded={activo ? siguiente : undefined}
              >
                {slide.srcMobile && <source media="(max-width: 768px)" src={slide.srcMobile} />}
                {slide.srcMobile && <source src={slide.src} />}
              </video>
            ) : slide.srcMobile ? (
              <picture>
                <source media="(max-width: 768px)" srcSet={srcSetDe(slide.srcMobile) || slide.srcMobile} sizes="100vw" />
                {/* La primera diapositiva es la imagen principal de la home (LCP). */}
                <img {...atributosImagen(slide.src, { sizes: '100vw', prioridad: index === 0 })} alt="" className={styles.media} />
              </picture>
            ) : (
              <img {...atributosImagen(slide.src, { sizes: '100vw', prioridad: index === 0 })} alt="" className={styles.media} />
            )}

            <div className={styles.pie}>
              {/* Solo la entradilla, centrada con el CTA
                  debajo (a petición). La segunda frase (slide.descripcion)
                  sigue en los datos por si se recupera:
                  <span>{slide.descripcion}</span> */}
              <p className={styles.descripcion}>{slide.entradilla}</p>
              <Boton
                variante="texto-crema"
                href={slide.ctaHref}
                tabIndex={activo ? 0 : -1}
              >
                {slide.ctaTexto}
              </Boton>
            </div>
          </div>
        );
      })}

      {/* Barra de progreso oculta a petición — recuperable tal cual
          (los estilos .progreso* siguen en HeroCarousel.module.css).
      <div className={styles.progreso}>
        <div className={styles.progresoPista} />
        // key={activeIndex}: fuerza a React a remontar el div en cada
        // cambio de slide, lo que reinicia la animación CSS desde 0%.
        <div
          key={activeIndex}
          className={styles.progresoRelleno}
          style={{ animationDuration: `${duracionSlide(activeIndex)}ms` }}
        />
      </div>
      */}
    </section>
  );
}

export default HeroCarousel;
