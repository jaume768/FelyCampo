// CarruselClientas.jsx

'use client';

/* ============================================================
   CARRUSEL DE CLIENTAS — Fely Campo
   Tira horizontal de fotos de clientas para la home, justo encima de
   BloqueSeccion ("De mujeres, Para mujeres, Por las mujeres") — sin
   título propio, solo la tira de fotos.
   Cada tile es CarruselFotos (ui/, cross-fade + barra de progreso al
   pasar el ratón, mismo componente que GaleriaVosotras.jsx) + el botón "+" (40px, esquina inferior derecha,
   visible solo al hover, ver .abrirBtn) que — igual que clicar la
   propia foto — abre el lightbox de abajo: MISMO mecanismo 1:1 que
   GaleriaVosotras.jsx (.lightbox/.abierta, cabecera con logo + cerrar,
   pista de .pistaItem con scroll-snap + rueda con cooldown, franja de
   miniaturas a la izquierda para saltar entre fotos sin cerrar) pero
   sin su panel inferior (nombre/comentario/"Consigue el look"): aquí
   son solo fotos de clientas, no reseñas con producto vinculado.
   Fotos reales de clientas (mismos grupos que GaleriaVosotras.jsx,
   /atelier/vosotras, ver vosotrasFotos.js — invitadas + novias, cada
   grupo ya trae su portada primera), en una tira sin gap entre sí (ver
   .item en CarruselClientas.module.css) que muestra 4 fotos enteras +
   1/4 de la 5ª asomando, para insinuar que se puede seguir
   scrolleando.
   Uso:
     <CarruselClientas />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
import { CarruselFotos } from '../ui';
import { fotosInvitadas, fotosNovias } from './vosotrasFotos';
import styles from './CarruselClientas.module.css';
import { atributosImagen } from '@/lib/imagenes';

// Mismos grupos de fotos que GaleriaVosotras.jsx — cada uno ya trae su
// portada primera.
const looksCarrusel = () => [...fotosInvitadas(), ...fotosNovias()];

function CarruselClientas() {
  const t = useTranslations();
  const locale = useLocale();
  const pistaRef = useRef(null);
  const cerrarRef = useRef(null);
  const ruedaEnCooldownRef = useRef(false);

  const [abierta, setAbierta] = useState(false);
  const [indiceLook, setIndiceLook] = useState(0);
  const [indiceFoto, setIndiceFoto] = useState(0);

  const fotosActivas = looksCarrusel()[indiceLook];

  const abrir = (indice) => {
    setIndiceLook(indice);
    setIndiceFoto(0);
    setAbierta(true);
  };
  const cerrar = () => setAbierta(false);

  // Foco en cerrar + sin scroll de la página detrás mientras está
  // abierto — mismo criterio que GaleriaVosotras/RunwayGaleria.
  useEffect(() => {
    if (!abierta) return undefined;
    const enfocadoAntes = document.activeElement;
    cerrarRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alTeclado = (evento) => {
      if (evento.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alTeclado);

    return () => {
      document.removeEventListener('keydown', alTeclado);
      document.body.style.overflow = overflowPrevio;
      enfocadoAntes?.focus?.();
    };
  }, [abierta]);

  // Al abrir (o cambiar de tile), salta de golpe a la primera foto — el
  // barrido solo se ve al navegar ya dentro.
  useEffect(() => {
    if (!abierta) return;
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indiceFoto * nodo.clientWidth, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta, indiceLook]);

  const irAIndice = (indice) => {
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indice * nodo.clientWidth, behavior: 'smooth' });
    setIndiceFoto(indice);
  };

  const alScroll = () => {
    const nodo = pistaRef.current;
    if (!nodo || nodo.clientWidth === 0) return;
    const indice = Math.round(nodo.scrollLeft / nodo.clientWidth);
    if (indice !== indiceFoto) setIndiceFoto(indice);
  };

  const alRueda = (evento) => {
    evento.preventDefault();
    if (ruedaEnCooldownRef.current) return;

    const delta = Math.abs(evento.deltaX) > Math.abs(evento.deltaY) ? evento.deltaX : evento.deltaY;
    if (Math.abs(delta) < 10) return;

    const siguiente = indiceFoto + (delta > 0 ? 1 : -1);
    if (siguiente < 0 || siguiente >= fotosActivas.length) return;

    ruedaEnCooldownRef.current = true;
    irAIndice(siguiente);
    setTimeout(() => { ruedaEnCooldownRef.current = false; }, 500);
  };

  const tabIndexInteractivo = abierta ? 0 : -1;

  return (
    <>
      <div className={styles.pista}>
        {looksCarrusel().map((fotos, indice) => (
          <div key={indice} className={styles.item} onClick={() => abrir(indice)}>
            <CarruselFotos fotos={fotos} />
            <button
              type="button"
              className={styles.abrirBtn}
              onClick={(evento) => { evento.stopPropagation(); abrir(indice); }}
              aria-label={t('vosotras.verGaleria')}
            >
              <Plus size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className={`${styles.lightbox} ${abierta ? styles.abierta : ''}`} aria-hidden={!abierta}>
        <div className={styles.cabecera}>
          <a href={`/${locale}`} className={styles.logoLink} tabIndex={tabIndexInteractivo}>
            <img src="/img/logo/fely-campo-logo.webp" alt="Fely Campo" className={styles.logo} />
          </a>
          <button
            ref={cerrarRef}
            type="button"
            className={styles.cerrar}
            onClick={cerrar}
            aria-label={t('producto.galeriaCerrar')}
            tabIndex={tabIndexInteractivo}
          >
            <X size={40} strokeWidth={1} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        </div>

        <div ref={pistaRef} className={styles.pistaLightbox} onScroll={alScroll} onWheel={alRueda}>
          {fotosActivas.map((foto) => (
            <div key={foto} className={styles.pistaItem}>
              <img {...atributosImagen(foto, { sizes: '100vw' })} alt="" className={styles.pistaImagen} />
            </div>
          ))}
        </div>

        {fotosActivas.length > 1 && (
          <div className={styles.miniaturas}>
            {fotosActivas.map((foto, indice) => (
              <button
                key={foto}
                type="button"
                className={`${styles.miniatura} ${indice === indiceFoto ? styles.miniaturaActiva : ''}`}
                onClick={() => irAIndice(indice)}
                aria-label={String(indice + 1)}
                aria-current={indice === indiceFoto}
                tabIndex={tabIndexInteractivo}
              >
                <img {...atributosImagen(foto, { sizes: '96px' })} alt="" className={styles.miniaturaImagen} />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default CarruselClientas;
