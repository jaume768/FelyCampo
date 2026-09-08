'use client';

/* ============================================================
   TARJETA DE CARRITO — Fely Campo
   Card vertical para la página /carrito (bolsa): imagen grande con
   botón quitar superpuesto, cabecera (nombre + precio), color (solo
   el punto, sin nombre) y controles (cantidad, talla). Distinta de
   LineaCarrito (fila horizontal,
   pensada para el panel lateral estrecho) — aquí hay ancho de sobra al
   vivir en una cuadrícula de varias columnas.
   ============================================================ */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { SelectorCantidad } from '../ui';
import { slugify } from '@/lib/slugify';
import styles from './TarjetaCarrito.module.css';

// Duración de la salida animada al bajar la cantidad a 0 (ver
// manejarCantidad) — tiene que coincidir con la transición de
// .saliendo en TarjetaCarrito.module.css.
const DURACION_SALIDA_MS = 300;

function TarjetaCarrito({ imagen, nombre, precio, talla, color, colorHex, cantidad, onCantidad, onQuitar, slug, disponibles, sinStock = false, error }) {
  const t = useTranslations('carrito');
  const locale = useLocale();
  // El slug lo da la API; se cae a slugify(nombre) solo para los datos de ejemplo.
  const hrefProducto = `/${locale}/tienda/${slug || slugify(nombre)}`;

  // Bajar a 0 no actualiza el contexto directamente (actualizarCantidad
  // ya la fuerza de vuelta a 1, ver CarritoContext) — en vez de eso se
  // muestra el "0" un instante, la tarjeta se desvanece, y solo entonces
  // se quita la línea del carrito de verdad.
  const [eliminando, setEliminando] = useState(false);
  const [cantidadMostrada, setCantidadMostrada] = useState(cantidad);

  useEffect(() => {
    if (!eliminando) setCantidadMostrada(cantidad);
  }, [cantidad, eliminando]);

  useEffect(() => {
    if (!eliminando) return undefined;
    const id = window.setTimeout(onQuitar, DURACION_SALIDA_MS);
    return () => window.clearTimeout(id);
  }, [eliminando, onQuitar]);

  const manejarCantidad = (nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCantidadMostrada(0);
      setEliminando(true);
      return;
    }
    onCantidad(nuevaCantidad);
  };

  return (
    <div className={`${styles.tarjeta} ${eliminando ? styles.saliendo : ''}`}>
      <div className={styles.marco}>
        <a href={hrefProducto} className={styles.marcoEnlace}>
          {imagen && <img src={imagen} alt={nombre} className={styles.imagen} />}
        </a>
        <button type="button" onClick={onQuitar} className={styles.quitar} aria-label={t('quitar')}>
          <X size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
        </button>
      </div>

      <div className={styles.cabecera}>
        <p className={styles.nombre}>{nombre}</p>
        <p className={styles.precio}>{precio}</p>
      </div>

      {color && (
        <span className={styles.color} title={color}>
          {colorHex && <span className={styles.colorPunto} style={{ background: colorHex }} />}
        </span>
      )}

      <div className={styles.controles}>
        <SelectorCantidad valor={cantidadMostrada} onChange={manejarCantidad} min={0} className={styles.controlFlexible} />

        {/* La talla ya NO se cambia desde aquí: otra talla es OTRA variante, así que
            editarla sería quitar la línea y añadir la nueva. Se muestra, no se edita. */}
        {talla && <span className={styles.talla}>{talla}</span>}
      </div>

      {/* Errores de ESTA línea (sin stock, cantidad por encima del disponible), junto a
          la línea que los provocó y no en un aviso global. */}
      {sinStock && <p className={styles.errorLinea} role="alert">{t('lineaSinStock')}</p>}
      {error && <p className={styles.errorLinea} role="alert">{error}</p>}
      {!sinStock && typeof disponibles === 'number' && disponibles <= 3 && (
        <p className={styles.avisoPocas}>{t('quedanPocas', { cantidad: disponibles })}</p>
      )}
    </div>
  );
}

export default TarjetaCarrito;
