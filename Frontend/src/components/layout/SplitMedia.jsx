// SplitMedia.jsx

'use client';

import { useTranslations } from 'next-intl';
import useEnVista from '@/hooks/useEnVista';
import { Boton, ImageTitle } from '../ui';
import styles from './SplitMedia.module.css';

/**
 * Dos piezas editoriales lado a lado (imagen o vídeo), cada una con
 * su propio href — independientes entre sí. En móvil pasan a una
 * columna (ver SplitMedia.module.css). Recibe exactamente 2 items.
 *
 * variante="etiqueta" (default): etiqueta + CTA en blanco, abajo y
 * centrado. El CTA no lleva href propio (Boton sin href renderiza un
 * <span>), así que cada pieza puede ser un único <a> clicable sin
 * problema.
 * variante="imageTitle": la composición de ImageTitle (título + CTA)
 * en --color-tinta, abajo y centrado. ImageTitle exige href en su CTA
 * y renderiza su propio <a> — por eso aquí cada pieza pasa a ser un
 * <div>, no un <a>: la imagen deja de ser clicable por sí sola, solo
 * el CTA (enlace real) navega. Evita anidar <a> dentro de <a>.
 * variante="landing": sin gap entre piezas (ver .grid.landing) y sin
 * etiqueta — solo un <h1> en mayúsculas alineado a la izquierda + CTA.
 * Como "etiqueta": toda la pieza es un único <a> clicable (href en la
 * pieza, no en el CTA — Boton sin href renderiza un <span>, solo
 * visual). tituloKey y ctaKey son opcionales: un item sin ninguno de
 * los dos queda como imagen pura, sin overlay de texto ni link.
 */
/**
 * Una pieza del grid, como componente aparte: cada una necesita su
 * propio useEnVista (un hook por elemento observado), y eso no se
 * puede llamar dentro de un .map en el componente padre.
 */
function Pieza({ item, esImageTitle, esLanding, esClicableComoImagen, t }) {
  const [ref, enVista] = useEnVista();
  const Contenedor = esClicableComoImagen ? 'a' : 'div';
  const claseContenido = esLanding ? styles.contenidoLanding : styles.contenido;

  return (
    <Contenedor {...(esClicableComoImagen ? { href: item.href } : {})} className={styles.pieza}>
      {item.tipo === 'video' ? (
        <video src={item.src} className={styles.media} autoPlay muted loop playsInline />
      ) : (
        <img src={item.src} alt="" className={styles.media} />
      )}

      {esLanding && !item.tituloKey && !item.ctaKey ? null : (
        <div
          ref={esImageTitle ? undefined : ref}
          className={`${claseContenido} ${!esImageTitle && enVista ? styles.enVista : ''}`}
        >
          {esImageTitle ? (
            <ImageTitle
              titulo={t(item.tituloKey)}
              ctaTexto={t(item.ctaKey)}
              href={item.href}
              variante="oscuro"
            />
          ) : esLanding ? (
            <>
              {item.tituloKey && <h1 className={styles.tituloLanding}>{t(item.tituloKey)}</h1>}
              {item.ctaKey && (
                <Boton variante="texto" className={styles.cta}>{t(item.ctaKey)}</Boton>
              )}
            </>
          ) : (
            <>
              <p className={styles.etiqueta}>{t(item.labelKey)}</p>
              <Boton variante="texto" className={styles.cta}>{t(item.ctaKey)}</Boton>
            </>
          )}
        </div>
      )}
    </Contenedor>
  );
}

function SplitMedia({ items, variante = 'etiqueta' }) {
  const t = useTranslations();
  const esImageTitle = variante === 'imageTitle';
  const esLanding = variante === 'landing';
  const esClicableComoImagen = !esImageTitle;

  return (
    <div className={`${styles.grid} ${esLanding ? styles.landing : ''}`}>
      {items.map((item, index) => (
        <Pieza
          key={index}
          item={item}
          esImageTitle={esImageTitle}
          esLanding={esLanding}
          esClicableComoImagen={esClicableComoImagen}
          t={t}
        />
      ))}
    </div>
  );
}

export default SplitMedia;
