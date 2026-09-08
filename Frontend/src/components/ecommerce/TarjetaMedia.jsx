/* ============================================================
   TARJETA DE MEDIA — Fely Campo (e-commerce)
   No es una tarjeta de producto: sin nombre, precio, badge ni
   colores — solo una imagen/gif/vídeo en bucle que ocupa el hueco
   entero del slot. Pensada para intercalarse entre TarjetaProducto
   dentro de CuadriculaProductos y romper el ritmo de la fila.
   Uso:
     <TarjetaMedia src="/img/detalle.gif" />
     <TarjetaMedia src="/img/detalle.mp4" tipo="video" />
   ============================================================ */

import styles from './TarjetaMedia.module.css';

function TarjetaMedia({ src, tipo = 'imagen', alt = '', variante }) {
  const esCarrusel = variante === 'carrusel';

  return (
    <div className={`${styles.tarjetaMedia} ${esCarrusel ? styles.tarjetaMediaCarrusel : ''}`}>
      {tipo === 'video' ? (
        <video src={src} className={styles.media} autoPlay muted loop playsInline />
      ) : (
        <img src={src} alt={alt} className={styles.media} />
      )}
    </div>
  );
}

export default TarjetaMedia;
