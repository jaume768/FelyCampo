'use client';

/* ============================================================
   BOTÓN GUARDAR (wishlist) — Fely Campo
   Icono de guardar en tinta, con tooltip "Añadir a wishlist".
   Referente: styleguide.html #botones (icono .wishlist-tag) —
   el trazo es tinta siempre, y se rellena en tinta al activarse
   (la nota en prosa del styleguide dice "gris 700", pero el CSS
   real de esa misma página usa --tinta; seguimos el CSS).
   ============================================================ */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './BotonGuardar.module.css';

/* Bookmark de lucide-react trae esquinas redondeadas horneadas en el
   propio path (arcos en las esquinas superiores y en la muesca) —
   strokeLinejoin/strokeLinecap no las tocan. Path propio con solo
   líneas rectas para que el icono sea 100% anguloso.
   "variante" de BotonGuardar ('icono' por defecto): icono suelto, sin
   fondo, 20px — el badge de wishlist sobre la imagen de
   TarjetaProducto. 'solido': botón cuadrado en tinta, tan alto como
   su hermano (ej. "Añadir a la cesta") en una fila con
   align-items:stretch — ver FichaProductoAcciones. 'compacto': mismo
   icono de 18px sin fondo, pero sin caja de tamaño fijo — el hueco de
   clic lo da el padding, no un ancho/alto impuesto (ej. esquina de un
   panel suelto, ver GaleriaProductoLightbox). */
function Bookmark({ fill, strokeWidth, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      strokeLinecap="butt"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 3h14v18l-7-4-7 4V3z" />
    </svg>
  );
}

function BotonGuardar({ guardado: guardadoProp, onToggle, variante = 'icono', tabIndex }) {
  const t = useTranslations('producto');
  const [guardadoInterno, setGuardadoInterno] = useState(false);
  const guardado = guardadoProp ?? guardadoInterno;

  const alternar = (e) => {
    const siguiente = !guardado;
    setGuardadoInterno(siguiente);
    onToggle?.(siguiente);
    e.currentTarget.blur();
  };

  return (
    <span className={`${styles.tooltip} ${variante === 'solido' ? styles.tooltipSolido : ''} ${variante === 'compacto' ? styles.tooltipCompacto : ''}`}>
      <button
        type="button"
        aria-pressed={guardado}
        aria-label={t('anadirWishlist')}
        onClick={alternar}
        className={`${styles.boton} ${variante === 'solido' ? styles.botonSolido : ''} ${variante === 'compacto' ? styles.botonCompacto : ''}`}
        tabIndex={tabIndex}
      >
        <Bookmark
          className={styles.icono}
          fill={guardado ? 'currentColor' : 'none'}
          strokeWidth={1}
        />
      </button>
      <span className={styles.tooltipTexto}>{t('anadirWishlist')}</span>
    </span>
  );
}

export default BotonGuardar;
