// MediaBanner.jsx

'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useEnVista from '@/hooks/useEnVista';
import { Boton, ImageTitle } from '../ui';
import styles from './MediaBanner.module.css';

/**
 * Pieza editorial estática: una única imagen o vídeo a ancho completo
 * con texto superpuesto abajo, centrado — emparentada visualmente con
 * HeroCarousel pero sin carrusel ni barra de progreso.
 *
 * variante="etiqueta" (default): etiqueta en mayúsculas + CTA, blanco.
 * El CTA no lleva href propio (Boton sin href renderiza un <span>), así
 * que toda la pieza es un único <a> clicable.
 * variante="imageTitle": la composición de ImageTitle (título + CTA)
 * en --color-tinta. ImageTitle exige href en su CTA y renderiza su
 * propio <a>, así que el contenedor aquí es un <div> (evita anidar
 * <a> dentro de <a>) pero navega igualmente al hacer click en
 * cualquier punto del banner mediante router.push; el click en el
 * CTA interno corta la propagación para no disparar la navegación
 * dos veces.
 */
function MediaBanner({ src, tipo = 'imagen', labelKey, tituloKey, ctaKey, href, variante = 'etiqueta' }) {
  const t = useTranslations();
  const router = useRouter();
  const [ref, enVista] = useEnVista();
  const esImageTitle = variante === 'imageTitle';
  const Contenedor = esImageTitle ? 'div' : 'a';

  return (
    <Contenedor
      {...(esImageTitle ? { onClick: () => router.push(href) } : { href })}
      className={styles.banner}
    >
      {tipo === 'video' ? (
        <video src={src} className={styles.media} autoPlay muted loop playsInline />
      ) : (
        <img src={src} alt="" className={styles.media} />
      )}

      <div
        ref={esImageTitle ? undefined : ref}
        className={`${styles.contenido} ${!esImageTitle && enVista ? styles.enVista : ''}`}
      >
        {esImageTitle ? (
          <span onClick={(e) => e.stopPropagation()}>
            <ImageTitle
              titulo={t(tituloKey)}
              ctaTexto={t(ctaKey)}
              href={href}
              variante="oscuro"
            />
          </span>
        ) : (
          <>
            <p className={styles.etiqueta}>{t(labelKey)}</p>
            <Boton variante="texto" className={styles.cta}>{t(ctaKey)}</Boton>
          </>
        )}
      </div>
    </Contenedor>
  );
}

export default MediaBanner;
