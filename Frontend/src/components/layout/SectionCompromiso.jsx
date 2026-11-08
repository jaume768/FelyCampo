// SectionCompromiso.jsx

'use client';

import useEnVista from '@/hooks/useEnVista';
import styles from './SectionCompromiso.module.css';
import { atributosImagen } from '@/lib/imagenes';
import VideoDiferido from '@/components/ui/VideoDiferido';

/**
 * Declaración de marca a pantalla completa: una imagen (o vídeo) de
 * 70vh con un texto centrado encima, en los dos ejes — sin label, CTA
 * ni link (a diferencia de MediaBanner/HeroCarousel, esto no navega a
 * ningún sitio). "subtitulo" es opcional: una línea pequeña en
 * mayúsculas debajo de la frase principal. texto/subtitulo son props
 * ya traducidas — mismo criterio que BloqueSeccion, el componente no
 * sabe de i18n. Entran con el mismo fundido + subida que el resto del
 * sistema, el subtítulo un poco después del texto, la primera vez que
 * la sección entra en el viewport (ver useEnVista) — no al montar la
 * página.
 */
function SectionCompromiso({ imagen, tipo = 'imagen', texto, subtitulo }) {
  const [ref, enVista] = useEnVista();

  return (
    <section className={styles.seccion}>
      {tipo === 'video' ? (
        <VideoDiferido src={imagen} className={styles.media} />
      ) : (
        <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt="" className={styles.media} />
      )}

      <div ref={ref} className={`${styles.contenido} ${enVista ? styles.enVista : ''}`}>
        <p className={styles.texto}>{texto}</p>
        {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
      </div>
    </section>
  );
}

export default SectionCompromiso;
