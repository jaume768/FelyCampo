// VerMasOverlay.jsx

'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import styles from './VerMasOverlay.module.css';

/**
 * Botón "Ver más" pensado para el último elemento de una cuadrícula de
 * productos (ecommerce behaviour): solo una flecha, como el arrow que
 * cambia de foto en un carrusel — no un panel entero. Vive encima de
 * la imagen, centrado en altura respecto al alto real de esa imagen
 * (no de toda la tarjeta, que sigue teniendo nombre/precio debajo), y
 * pegado al lateral derecho. El resto de la tarjeta sigue siendo
 * clicable — solo el botón en sí navega. Solo en desktop (ver media
 * query en el CSS): en mobile la cuadrícula pasa a 2x2 y no hay sitio.
 * El elemento que lo contenga necesita position:relative.
 * Oculto por defecto (opacity:0): la clase "vermas-overlay" es un
 * hook estable (sin hash de CSS module) para que quien lo use pueda
 * revelarlo al hacer hover de un antepasado que sí conoce (ej.
 * ".cuadricula:hover :global(.vermas-overlay)" en CuadriculaProductos).
 * Uso:
 *   <div style={{ position: 'relative' }}>
 *     <TarjetaProducto {...producto} />
 *     <VerMasOverlay href="/coleccion/vestidos" />
 *   </div>
 */
function VerMasOverlay({ href, textKey = 'cuadriculaProductos.verMas' }) {
  const t = useTranslations();

  return (
    <a href={href} aria-label={t(textKey)} className={`${styles.overlay} vermas-overlay`}>
      <span className={styles.boton}>
        <ArrowRight aria-hidden="true" strokeWidth={1} className={styles.flecha} />
      </span>
    </a>
  );
}

export default VerMasOverlay;
