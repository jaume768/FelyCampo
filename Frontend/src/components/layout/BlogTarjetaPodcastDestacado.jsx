// BlogTarjetaPodcastDestacado.jsx

/* ============================================================
   TARJETA DESTACADA DE PODCAST — Fely Campo
   Celda especial de la cuadrícula de /blog (ver page.js, prop
   "entrada.destacado" en blog.js) — foto a sangre (cubre toda la
   celda, no "imagen arriba + texto debajo" como BlogTarjeta), degradado
   oscuro abajo para legibilidad y, encima, el botón de "play" seguido
   del nombre del podcast + episodio/duración — inspirado en las
   tarjetas de podcast de Spotify. El botón NO reproduce nada aquí: toda
   la tarjeta es un enlace al vídeo del episodio en YouTube (pestaña
   nueva si "href" es externo).
   .titulo es fijo — "Entre telas y palabras: El Podcast", el nombre
   de la serie, no el de este episodio en concreto — igual en todos
   los episodios, no viene de blog.js (mismo criterio que "Fely Campo"
   en el resto de "alt" del sitio). El título del episodio ("titulo",
   prop) se cuela en .meta junto a la duración en vez de perderse, y
   sigue usándose en el aria-label del enlace.
   Uso:
     <BlogTarjetaPodcastDestacado
       href="/es/blog/podcast-01-crear-sin-pedir-permiso"
       titulo="Crear sin pedir permiso"
       meta="34 min"
       imagen="/img/..."
       alt="..."
       textoBoton="Escuchar episodio"
     />
   ============================================================ */

import styles from './BlogTarjetaPodcastDestacado.module.css';
import { atributosImagen } from '@/lib/imagenes';

function BlogTarjetaPodcastDestacado({ href, titulo, meta, imagen, alt, textoBoton }) {
  return (
    <a
      href={href}
      className={styles.tarjeta}
      aria-label={`${textoBoton}: ${titulo}`}
      // Enlace externo (YouTube): en pestaña nueva.
      {...(/^https?:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt={alt} className={styles.imagen} />
      <div className={styles.degradado} aria-hidden="true" />
      <div className={styles.contenido}>
        {/* Triángulo de "play" suelto, sin recuadro (mismo que el
            documental de TarjetaEnlaceExterno). */}
        <span className={styles.botonSinBorde} aria-hidden="true">
          <svg width="12" height="14" viewBox="0 0 16 18" fill="none">
            <path d="M0 0L16 9L0 18V0Z" fill="currentColor" />
          </svg>
        </span>
        <p className={styles.titulo}>Entre telas y palabras: El Podcast</p>
        <p className={styles.meta}>
          {titulo}
          {meta && ` · ${meta}`}
        </p>
      </div>
    </a>
  );
}

export default BlogTarjetaPodcastDestacado;
