// BlogPodcast.jsx

/* ============================================================
   EPISODIO DE PODCAST — Fely Campo
   Ficha de una entrada de tipo "podcast" en /blog/[entrada] (ver ese
   page.js) — a diferencia de BlogArticulo, aquí TODA la página es un
   único bloque a pantalla completa (min-height:100dvh, puede crecer
   si las notas no caben): la portada del episodio a sangre de fondo,
   un degradado oscuro que cubre de abajo hasta la mitad (legibilidad
   del texto, sin oscurecer la mitad superior de la foto) y, encima,
   .datos (fecha/duración + badge "Entre telas y palabras: Episodio N"
   — nombre del podcast fijo, igual que en
   BlogTarjetaPodcastDestacado.jsx, no viene de blog.js + título +
   invitada, en ese orden) seguido de .notas — ambos dentro de
   .contenido, anclado al fondo. Tamaños de .datos cruzados a
   propósito: .meta (fecha/duración) toma el font-size pequeño de
   <Etiqueta> (--text-caption) y el badge toma el de .meta
   (--text-body) — ver ".episodio" en BlogPodcast.module.css para el
   porqué del !important.
   data-navbar-hero: el Navbar del sitio pasa a transparente/claro
   sobre esta página (ver esPodcastBlog en
   ../../app/[locale]/layout.js, que mira "entrada.tipo" en blog.js
   para esta ruta dinámica) y se vuelve sólido al salir de este bloque,
   mismo mecanismo que en /sobre-fely o la ficha de colección de
   Runway.
   Dos reproductores, uno visible según el ancho (CSS, no JS — los dos
   se renderizan siempre, cada uno oculto en el breakpoint que no le
   toca, ver BlogPodcast.module.css):
   - .reproductor (escritorio): discreto, última pieza de .contenido —
     play pequeño (borde, sin relleno) + pista + duración.
   - .reproductorMobile (mobile, <768px): un único círculo de play,
     centrado en .pagina entera, fuera de .contenido — sin pista ni
     duración (ya está en .meta).
   Los dos son maqueta visual, sin audio real (no hay archivos de
   audio en el proyecto, ver blog.js — <audio> real + controles a
   falta de esos archivos, para no fingir una reproducción que no
   existe): decorativos, aria-hidden, no <button>.
   Uso:
     <BlogPodcast entrada={entrada} locale={locale} volverHref="/es/blog" volverTexto="Volver al blog" textos={{...}} />
   ============================================================ */

import { Etiqueta } from '@/components/ui';
import styles from './BlogPodcast.module.css';
import { atributosImagen } from '@/lib/imagenes';

function BlogPodcast({ entrada, locale, volverHref, volverTexto, textoEpisodio, textoCon }) {
  const { imagenCubierta, titulo, fecha, episodio, duracion, invitada, notas } = entrada;

  const fechaLegible = new Date(fecha).toLocaleDateString(locale === 'en' ? 'en-GB' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className={styles.pagina} data-navbar-hero>
      <img {...atributosImagen(imagenCubierta, { sizes: '(max-width: 768px) 100vw, 33vw' })} alt={titulo[locale]} className={styles.imagen} />
      <div className={styles.degradado} aria-hidden="true" />

      <a href={volverHref} className={styles.volver} aria-label={volverTexto}>
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
          <path d="M8 1L1 8L8 15M1 8H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
      </a>

      {/* Botón de play — solo mobile (ver nota arriba). */}
      <div className={styles.reproductorMobile} aria-hidden="true">
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
          <path d="M0 0L20 12L0 24V0Z" fill="currentColor" />
        </svg>
      </div>

      <div className={styles.contenido}>
        <div className={styles.datos}>
          <p className={styles.meta}>
            {fechaLegible} · {duracion}
          </p>
          <Etiqueta variante="tinta" className={styles.episodio}>
            Entre telas y palabras: {textoEpisodio} {episodio}
          </Etiqueta>
          <h1 className={styles.titulo}>{titulo[locale]}</h1>
          {invitada && (
            <p className={styles.invitada}>
              {textoCon} {invitada[locale]}
            </p>
          )}
        </div>

        <div className={styles.notas}>
          {notas[locale].map((parrafo, indice) => (
            <p key={indice}>{parrafo}</p>
          ))}
        </div>

        {/* Reproductor — solo escritorio (ver nota arriba). */}
        <div className={styles.reproductor}>
          <div className={styles.play} aria-hidden="true">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M0 0L12 7L0 14V0Z" fill="currentColor" />
            </svg>
          </div>
          <div className={styles.pista}>
            <div className={styles.progreso} />
          </div>
          <span className={styles.duracion}>{duracion}</span>
        </div>
      </div>
    </article>
  );
}

export default BlogPodcast;
