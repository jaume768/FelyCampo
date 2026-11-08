/* ============================================================
   TARJETA DE MEDIA — Fely Campo (e-commerce)
   No es una tarjeta de producto: sin nombre, precio, badge ni
   colores — solo una imagen/gif/vídeo en bucle que ocupa el hueco
   entero del slot. Pensada para intercalarse entre TarjetaProducto
   dentro de CuadriculaProductos y romper el ritmo de la fila.
   Uso:
     <TarjetaMedia src="/img/detalle.gif" />
     <TarjetaMedia src="/img/detalle.mp4" tipo="video" />
     <TarjetaMedia src="/img/look.webp" href="/es/pret-a-porter/falda-jeju" />
   "href" (opcional): toda la tarjeta enlaza ahí (ej. la foto de
   pasarela de un producto, que lleva a la misma ficha que él — ver
   "imagenEditorial" en CuadriculaProductos.jsx). Sin href, no enlaza.
   ============================================================ */

import styles from './TarjetaMedia.module.css';
import { atributosImagen } from '@/lib/imagenes';
import VideoDiferido from '@/components/ui/VideoDiferido';

function TarjetaMedia({ src, tipo = 'imagen', alt = '', variante, href }) {
  const esCarrusel = variante === 'carrusel';
  const Contenedor = href ? 'a' : 'div';

  return (
    <Contenedor
      href={href}
      className={`${styles.tarjetaMedia} ${esCarrusel ? styles.tarjetaMediaCarrusel : ''} ${href ? styles.enlace : ''}`}
    >
      {tipo === 'video' ? (
        <VideoDiferido src={src} className={styles.media} />
      ) : (
        <img {...atributosImagen(src, { sizes: '(max-width: 768px) 50vw, 25vw' })} alt={alt} className={styles.media} />
      )}
    </Contenedor>
  );
}

export default TarjetaMedia;
