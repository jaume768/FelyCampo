// ImageTitle.jsx

'use client';

import useEnVista from '@/hooks/useEnVista';
import Boton from './Boton';
import styles from './ImageTitle.module.css';

/**
 * Título + CTA pensados para ir superpuestos sobre una imagen o vídeo
 * (ej. HeroCarousel). El título es texto plano — el único elemento
 * clicable es el CTA, que siempre lleva a href (enlace real, no un
 * <a> envolviendo toda la imagen). variante="blanco" cambia el título
 * y el CTA a --color-crema para fondos oscuros; el default se queda en
 * --color-tinta.
 * Título y CTA entran con fundido + subida (CSS, ver .module.css) la
 * primera vez que este bloque entra en el viewport — de ahí useEnVista
 * en vez de disparar la animación directamente al montar.
 */
function ImageTitle({ titulo, ctaTexto, href, variante = 'oscuro', tabIndex }) {
  const [ref, enVista] = useEnVista();
  const claseTitulo = variante === 'blanco'
    ? `${styles.titulo} ${styles.blanco}`
    : styles.titulo;

  return (
    <div ref={ref} className={`${styles.contenido} ${enVista ? styles.enVista : ''}`}>
      <p className={claseTitulo}>{titulo}</p>
      <Boton
        variante={variante === 'blanco' ? 'texto-crema' : 'texto'}
        href={href}
        tabIndex={tabIndex}
      >
        {ctaTexto}
      </Boton>
    </div>
  );
}

export default ImageTitle;
