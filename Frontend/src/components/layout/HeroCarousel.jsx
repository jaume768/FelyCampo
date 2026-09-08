// HeroCarousel.jsx

'use client';

import { useEffect, useState } from 'react';
import { ImageTitle } from '../ui';
import styles from './HeroCarousel.module.css';

// Debe coincidir con la duración de la animación @keyframes avanceProgreso
// en HeroCarousel.module.css (8s) — la barra de progreso y el cambio de
// slide van sincronizados.
const SLIDE_DURATION_MS = 8000;

/**
 * Hero a pantalla completa de la home: 3 slides (imagen o vídeo) que
 * rotan solos cada 8s, con una barra de progreso lineal. El único
 * elemento clicable de cada slide es el CTA (ImageTitle) — la imagen no
 * lleva su propio enlace, para no anidar/duplicar <a> dentro del slide.
 * Los datos vienen por props, nada hardcodeado aquí.
 */
function HeroCarousel({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    // Accesibilidad: si el sistema pide reducir el movimiento, el
    // carrusel no avanza solo (el usuario puede seguir navegando a mano).
    const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereMenosMovimiento) return undefined;

    const intervalo = setInterval(() => {
      setActiveIndex((actual) => (actual + 1) % slides.length);
    }, SLIDE_DURATION_MS);

    return () => clearInterval(intervalo);
  }, [slides.length]);

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
                src={slide.src}
                className={styles.media}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img src={slide.src} alt="" className={styles.media} />
            )}

            <div className={styles.contenido}>
              <ImageTitle
                titulo={slide.titulo}
                ctaTexto={slide.ctaTexto}
                href={slide.ctaHref}
                tabIndex={activo ? 0 : -1}
                variante="blanco"
              />
            </div>
          </div>
        );
      })}

      <div className={styles.progreso}>
        <div className={styles.progresoPista} />
        {/* key={activeIndex}: fuerza a React a remontar el div en cada
            cambio de slide, lo que reinicia la animación CSS desde 0%
            sin tener que controlar el ancho a mano desde JS. */}
        <div key={activeIndex} className={styles.progresoRelleno} />
      </div>
    </section>
  );
}

export default HeroCarousel;
