// RunwayVideoCierre.jsx

'use client';

/* ============================================================
   VÍDEO DE CIERRE DE COLECCIÓN — Fely Campo
   Último elemento de cada ficha de colección (ver
   /archivo/runway/[coleccion]/page.js): el vídeo de la colección a
   ancho completo, que arranca solo al llegar a su punto en la página
   (IntersectionObserver — no al montar, para no reproducir fuera de
   pantalla) y se detiene al salir de vista. Sin sonido por defecto;
   el propio usuario decide si lo activa. Dos botones abajo a la
   izquierda, mismo lenguaje visual que .flecha de GaleriaProducto
   (40px, fondo/tinta) pero con su propio CSS: sonido on/off y
   reproducir/pausar, con iconos de lucide en vez de flechas.
   Uso:
     <RunwayVideoCierre src={coleccion.video} />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import styles from './RunwayVideoCierre.module.css';

function RunwayVideoCierre({ src }) {
  const t = useTranslations('producto');
  const videoRef = useRef(null);
  const [conSonido, setConSonido] = useState(false);
  const [enReproduccion, setEnReproduccion] = useState(false);

  // Arranca al entrar en vista y se detiene al salir — no depende de
  // que el usuario le dé al play, solo de llegar a su punto en la
  // página. El propio botón de reproducir/pausar puede pisar este
  // estado en cualquier momento (ver alternarReproduccion).
  useEffect(() => {
    const nodo = videoRef.current;
    if (!nodo || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          nodo.play().catch(() => {});
          setEnReproduccion(true);
        } else {
          nodo.pause();
          setEnReproduccion(false);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  const alternarSonido = () => setConSonido((actual) => !actual);

  const alternarReproduccion = () => {
    const nodo = videoRef.current;
    if (!nodo) return;
    if (nodo.paused) {
      nodo.play().catch(() => {});
      setEnReproduccion(true);
    } else {
      nodo.pause();
      setEnReproduccion(false);
    }
  };

  if (!src) return null;

  return (
    <div className={styles.envoltorio}>
      <video ref={videoRef} src={src} className={styles.video} muted={!conSonido} loop playsInline />

      <div className={styles.controles}>
        <button
          type="button"
          className={styles.boton}
          onClick={alternarSonido}
          aria-label={conSonido ? t('videoSilenciar') : t('videoActivarSonido')}
        >
          {conSonido ? (
            <Volume2 size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          ) : (
            <VolumeX size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          )}
        </button>
        <button
          type="button"
          className={styles.boton}
          onClick={alternarReproduccion}
          aria-label={enReproduccion ? t('videoPausar') : t('videoReproducir')}
        >
          {enReproduccion ? (
            <Pause size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          ) : (
            <Play size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          )}
        </button>
      </div>
    </div>
  );
}

export default RunwayVideoCierre;
