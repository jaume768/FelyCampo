'use client';

/* ============================================================
   TARJETA DE WISHLIST — Fely Campo
   Card vertical para /wishlist — mismo esqueleto visual que
   TarjetaCarrito.jsx (imagen grande con botón quitar superpuesto,
   cabecera nombre+precio, punto de color) pero SIN selector de
   cantidad ni de talla: aquí no se ha elegido ninguna combinación
   todavía, solo "esto me gusta". Sin CTA "Añadir a la cesta" tampoco —
   se quita la pieza de la wishlist desde su propia ficha (clicando la
   imagen) o con el botón "Quitar", no desde aquí.
   Uso:
     <TarjetaWishlist imagen="/img/aurora.jpg" nombre="Vestido Aurora"
       precio="890 €" colores={[{ hex: '#EED3E8', nombre: 'Rosa suave' }]}
       onQuitar={...} />
   ============================================================ */

import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { slugify } from '@/lib/slugify';
import styles from './TarjetaWishlist.module.css';

function TarjetaWishlist({ imagen, nombre, precio, colores = [], onQuitar }) {
  const t = useTranslations('carrito');
  const locale = useLocale();
  const hrefProducto = `/${locale}/tienda/${slugify(nombre)}`;
  const color = colores[0];

  return (
    <div className={styles.tarjeta}>
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
        <span className={styles.color} title={color.nombre}>
          <span className={styles.colorPunto} style={{ background: color.hex }} />
        </span>
      )}
    </div>
  );
}

export default TarjetaWishlist;
