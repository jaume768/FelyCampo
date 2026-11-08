// BlogTarjeta.jsx

'use client';

/* ============================================================
   TARJETA DE BLOG — Fely Campo
   Calco de RunwayTarjeta.jsx/.module.css (mismo .marco a 16/9 +
   bloque de texto centrado debajo — misma cuadrícula que
   /colecciones-fely-campo, ver page.module.css/RunwayTarjeta.module.css)
   — único añadido: "extracto" (entrada.resumen en blog.js), un
   fragmento del post que Runway no necesita (solo nombre/temporada de
   la colección). Orden: fecha, título, extracto.
   Uso:
     <BlogTarjeta
       href="/es/blog/manifiesto-coleccion-ibiza"
       titulo="El manifiesto detrás de la colección de Ibiza"
       extracto="Luz y oscuridad, fuerza y calma: cómo un poema..."
       meta="12 jun 2026"
       imagen="/img/..."
       alt="..."
     />
   'use client' por useEnVista: la tarjeta entera aparece con scroll
   (ver .al-scroll/.en-vista en global.css), no de golpe con la
   cuadrícula completa. ============================================================ */

import styles from './BlogTarjeta.module.css';
import useEnVista from '@/hooks/useEnVista';
import { atributosImagen } from '@/lib/imagenes';

function BlogTarjeta({ href, titulo, extracto, meta, imagen, alt }) {
  const [ref, enVista] = useEnVista();

  return (
    <a ref={ref} href={href} className={`${styles.tarjeta} al-scroll ${enVista ? 'en-vista' : ''}`}>
      <div className={styles.marco}>
        <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 100vw, 33vw' })} alt={alt} className={styles.media} />
      </div>
      <div className={styles.etiqueta}>
        {meta && <p className={styles.temporada}>{meta}</p>}
        <p className={styles.nombre}>{titulo}</p>
        {extracto && <p className={styles.extracto}>{extracto}</p>}
      </div>
    </a>
  );
}

export default BlogTarjeta;
