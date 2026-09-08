// ProductHero.jsx

/* ============================================================
   PRODUCT HERO — Fely Campo
   Cabecera visual de 50vh a ancho completo (imagen de fondo, cover y
   centrada) usada en páginas de listado de producto (Tienda/Atelier)
   antes de la cuadrícula — sin texto ni CTA, solo ambientación.
   Uso:
     <ProductHero imagen="/img/ecommerce/Categorias/vestido.webp" />
   ============================================================ */

import styles from './ProductHero.module.css';

/**
 * data-navbar-hero: marca este bloque para que Navbar (ver
 * Navbar.jsx) sepa cuándo volverse sólido — mientras esté en el
 * viewport, el header se mantiene transparente con el logo pequeño y
 * los enlaces en blanco; en cuanto se scrollea fuera de él, pasa al
 * navbar normal. Mismo criterio (IntersectionObserver) que ya usa
 * Navbar.jsx para saber cuándo el Footer entra en pantalla.
 *
 * El marcador vive en .envoltorio, NO en .hero — a propósito. .hero
 * pasa a position:fixed en mobile (ver ProductHero.module.css): su
 * recuadro respecto al viewport ya no cambia nunca al hacer scroll, así
 * que el observer lo vería "siempre visible" y el navbar se quedaría
 * transparente para siempre. .envoltorio, en cambio, reserva el hueco
 * de 50vh en el flujo NORMAL siempre (en cualquier ancho) y sí se
 * desplaza de verdad con la página — el observer detecta que sale de
 * escena exactamente cuando CuadriculaProductos (que va justo detrás en
 * el flujo, tapando la imagen fija) llega a tocar el navbar, ni antes
 * ni después. En escritorio .hero ocupa el mismo recuadro que
 * .envoltorio (sin position:fixed), así que el comportamiento no
 * cambia nada ahí.
 */
function ProductHero({ imagen, alt = '' }) {
  return (
    <div className={styles.envoltorio} data-navbar-hero>
      <div
        className={styles.hero}
        style={{ backgroundImage: `url(${imagen})` }}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
      />
    </div>
  );
}

export default ProductHero;
