/* ============================================================
   ETIQUETA — Fely Campo
   Badge de solo texto, sin fondo ni pill — el rosa y el resto
   de colores son siempre texto plano (referente: styleguide.html
   #etiquetas). Se usa suelta o dentro de TarjetaProducto (badge).
   Uso:
     <Etiqueta>Nueva colección</Etiqueta>
     <Etiqueta variante="rosa">-20%</Etiqueta>
     <Etiqueta variante="velo">Novia</Etiqueta>
     <Etiqueta variante="agotado">Agotado</Etiqueta>
   ============================================================ */

import styles from './Etiqueta.module.css';

function Etiqueta({ children, variante = 'tinta' }) {
  return (
    <span className={`${styles.etiqueta} ${styles[variante]}`}>
      {children}
    </span>
  );
}

export default Etiqueta;
