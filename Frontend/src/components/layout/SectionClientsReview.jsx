// SectionClientsReview.jsx

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CollectionTitle } from '../ui';
import styles from './SectionClientsReview.module.css';

// Debe coincidir con la duración de la animación @keyframes avanceProgreso
// en SectionClientsReview.module.css (6s).
const SLIDE_DURATION_MS = 6000;

// Solo 2 fotos para 5 reseñas — se repiten en bucle (índice % length),
// no hay una foto real por clienta todavía.
const IMAGENES_CLIENTES = [
  '/img/Clientes/ClientReview- (1).jpg',
  '/img/Clientes/ClientReview- (2).jpg',
];

/**
 * "Ellas te lo cuentan": carrusel automático de reseñas de clientas,
 * una a la vez, centrado. Sin props — el contenido (reseña + nombre)
 * vive en messages/{locale}.json bajo "clientsReview.resenas" y se lee
 * con t.raw(), así que sigue siendo 100% traducible. El título es un
 * CollectionTitle normal, dentro de esta misma sección (no un
 * hermano en page.js).
 *
 * Las 5 reseñas están todas montadas y apiladas en la misma celda de
 * grid (.pista), cada una con su propia foto — solo cambia la
 * opacidad (.activo) para pasar de una a otra, un cross-fade lento y
 * quieto (sin key/remount ni keyframes), no un corte seco.
 *
 * Debajo, una barra de progreso segmentada (un segmento por reseña, a
 * diferencia de la barra única de HeroCarousel) marca cuál está activa
 * y cuánto falta para la siguiente.
 */
function SectionClientsReview() {
  const t = useTranslations('clientsReview');
  const resenas = t.raw('resenas');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (resenas.length <= 1) return undefined;

    // Igual que en HeroCarousel: sin avance automático si el sistema
    // pide reducir el movimiento.
    const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereMenosMovimiento) return undefined;

    const intervalo = setInterval(() => {
      setActiveIndex((actual) => (actual + 1) % resenas.length);
    }, SLIDE_DURATION_MS);

    return () => clearInterval(intervalo);
  }, [resenas.length]);

  return (
    <section className={styles.seccion}>
      <CollectionTitle titleKey="clientsReview.titulo" />

      <div className={styles.pista}>
        {resenas.map((resena, index) => {
          const activo = index === activeIndex;
          return (
            <div
              key={index}
              className={`${styles.slide} ${activo ? styles.activo : ''}`}
              aria-hidden={!activo}
            >
              <img
                src={IMAGENES_CLIENTES[index % IMAGENES_CLIENTES.length]}
                alt=""
                className={styles.imagen}
              />
              <p className={styles.texto}>{resena.texto}</p>
              <p className={styles.nombre}>{resena.nombre}</p>
            </div>
          );
        })}
      </div>

      <div className={styles.barras}>
        {resenas.map((_, index) => {
          const completo = index < activeIndex;
          const activo = index === activeIndex;
          const claseRelleno = [
            styles.segmentoRelleno,
            completo && styles.completo,
            activo && styles.animando,
          ].filter(Boolean).join(' ');

          return (
            <div key={index} className={styles.segmento}>
              <div className={styles.segmentoPista} />
              <div key={activo ? activeIndex : undefined} className={claseRelleno} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SectionClientsReview;
