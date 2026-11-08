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
import useEnVista from '@/hooks/useEnVista';

// Duración de la salida animada al bajar la cantidad a 0 (ver
// manejarCantidad) — tiene que coincidir con la transición de
// .saliendo en TarjetaCarrito.module.css.
const DURACION_SALIDA_MS = 300;

function TarjetaCarrito({ imagen, nombre, precio, talla, tallasDisponibles = [], color, colorHex, cantidad, onCantidad, onTalla, onQuitar }) {
  const t = useTranslations('carrito');
  const locale = useLocale();
  const hrefProducto = `/${locale}/pret-a-porter/${slugify(nombre)}`;

  // Bajar a 0 no actualiza el contexto directamente (actualizarCantidad
  // ya la fuerza de vuelta a 1, ver CarritoContext) — en vez de eso se
  // muestra el "0" un instante, la tarjeta se desvanece, y solo entonces
  // se quita la línea del carrito de verdad.
  const [eliminando, setEliminando] = useState(false);
  const [cantidadMostrada, setCantidadMostrada] = useState(cantidad);
  const [ref, enVista] = useEnVista();

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
    <div ref={ref} className={`${styles.tarjeta} ${eliminando ? styles.saliendo : ''} al-scroll ${enVista ? 'en-vista' : ''}`}>
      <div className={styles.marco}>
        <a href={hrefProducto} className={styles.marcoEnlace}>
          {imagen && <img src={imagen} alt={nombre} className={styles.imagen} loading="lazy" decoding="async" />}
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

        {tallasDisponibles.length > 0 && (
          <select
            className={styles.selectTalla}
            value={talla ?? ''}
            onChange={(evento) => onTalla(evento.target.value)}
            aria-label={t('talla')}
          >
            {tallasDisponibles.map((opcion) => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

export default TarjetaCarrito;
