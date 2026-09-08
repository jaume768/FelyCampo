'use client';

/* ============================================================
   LÍNEA DE CARRITO — Fely Campo (e-commerce)
   Uso:
     <LineaCarrito imagen="/img/aurora.jpg" nombre="Vestido Aurora"
        talla="M" color="Burdeos" colorHex="#6E2635" precio="890 €"
        cantidad={1} onCantidad={(n) => ...} onQuitar={() => ...} />
   ============================================================ */

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './LineaCarrito.module.css';
import { SelectorCantidad } from '../ui';

// Duración de la salida animada al bajar la cantidad a 0 (ver
// manejarCantidad) — tiene que coincidir con la transición de
// .saliendo en LineaCarrito.module.css. Mismo patrón que TarjetaCarrito.
const DURACION_SALIDA_MS = 300;

/**
 * Fila de producto dentro del carrito, con selector de
 * cantidad integrado y opción de quitar.
 */
function LineaCarrito({ imagen, nombre, talla, color, colorHex, precio, cantidad, onCantidad, onQuitar, sinStock = false, error }) {
  const t = useTranslations('carrito');

  // Bajar a 0 no actualiza el contexto directamente (actualizarCantidad
  // ya la fuerza de vuelta a 1, ver CarritoContext) — en vez de eso se
  // muestra el "0" un instante, la línea se desvanece, y solo entonces
  // se quita del carrito de verdad. Mismo patrón que TarjetaCarrito.
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
    <div className={`${styles.linea} ${eliminando ? styles.saliendo : ''}`}>
      <div className={styles.filaSuperior}>
        <div className={styles.columnaNombre}>
          <div className={styles.nombrePrecio}>
            <p className={styles.nombre}>{nombre}</p>
            <p className={styles.precio}>{precio}</p>
          </div>
          {talla && <span className={styles.talla}>{t('talla')} {talla}</span>}
          {color && <span className={styles.colorNombre}>{color}</span>}
        </div>

        {color && (
          <span className={styles.color} title={color}>
            {colorHex && <span className={styles.colorPunto} style={{ background: colorHex }} />}
          </span>
        )}
      </div>

      <div className={styles.marco}>
        {imagen && <img src={imagen} alt={nombre} className={styles.imagen} />}
      </div>

      <div className={styles.filaInferior}>
        <button type="button" onClick={onQuitar} className={styles.quitar}>
          {t('quitar')}
        </button>

        <div className={styles.pie}>
          <SelectorCantidad valor={cantidadMostrada} onChange={manejarCantidad} min={0} className={styles.controlAncho} />
        </div>
      </div>
    </div>
  );
}

export default LineaCarrito;
