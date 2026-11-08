// ProductHero.jsx

/* ============================================================
   PRODUCT HERO — Fely Campo
   Antes: franja de 40vh sin texto (imagen de fondo) en las páginas de
   listado/ayuda. Ahora es un atajo de HeroPagina (mismo hero que el
   resto de páginas interiores: 100vh, título + línea corta abajo a la
   izquierda, en blanco) — se mantiene el nombre y la prop "imagen" para
   no tocar el resto de cada página.
   Uso:
     <ProductHero imagen="/img/..." titulo={['Prêt-à-porter', 'Vestidos']} />
     <ProductHero imagen="..." titulo="Envíos" className="entrada-suave" />
   "className" opcional, se suma al hero — "entrada-suave" (global.css,
   fundido+subida al montar) o "hero-arriba" (encuadre anclado arriba,
   ver HeroPagina.module.css).
   ============================================================ */

import HeroPagina from './HeroPagina';

function ProductHero({ imagen, alt = '', titulo, subtitulo, className }) {
  return (
    <HeroPagina
      imagen={imagen}
      alt={alt}
      titulo={titulo}
      subtitulo={subtitulo}
      className={className}
    />
  );
}

export default ProductHero;
