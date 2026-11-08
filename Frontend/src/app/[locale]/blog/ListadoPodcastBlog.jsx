// ListadoPodcastBlog.jsx

'use client';

/* ============================================================
   INTRO + LISTADO DE /blog — Fely Campo
   Introducción (IntroSeccion: título "Podcast & Blog", texto y
   filtros) y, debajo, los episodios de podcast y los artículos de
   blog. Componente cliente porque los filtros ("Ver todo" / "Blog" /
   "Podcast") muestran u ocultan cada bloque en la propia página, sin
   navegar. page.js (servidor) le pasa las entradas ya preparadas
   (textos en el idioma, fecha formateada, href) y las etiquetas.
   Vista previa de un episodio desde el admin (?previa=podcast-<slug>):
   su tarjeta se pinta con el borrador (o se añade la primera, si es
   nuevo) y se actualiza sola mientras se edita. */

import { useEffect, useState } from 'react';
import BarraPrevia from '@/components/layout/BarraPrevia';
import { EDITOR_BLOG } from '@/lib/blog';
import { clavePrevia, PARAMETRO_PREVIA, textoEn } from '@/lib/previa';
// Import directo (no desde el índice de @/components/layout): el índice
// también exporta componentes de servidor (PedirCita...) que no pueden
// entrar en un componente cliente.
import BlogTarjeta from '@/components/layout/BlogTarjeta';
import BlogTarjetaPodcastDestacado from '@/components/layout/BlogTarjetaPodcastDestacado';
import IntroSeccion from '@/components/layout/IntroSeccion';
import styles from './page.module.css';
import { useTextoCabecera } from '@/components/layout/CabeceraPagina';

const PREFIJO_PREVIA = 'podcast-';

// Borrador del episodio que se está previsualizando (o null).
function useEpisodioEnPrevia() {
  const [previa, setPrevia] = useState(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get(PARAMETRO_PREVIA);
    if (!id?.startsWith(PREFIJO_PREVIA)) return undefined;
    const clave = clavePrevia(id);
    const leer = () => {
      try {
        const borrador = JSON.parse(localStorage.getItem(clave) || 'null');
        if (borrador) setPrevia({ slug: id.slice(PREFIJO_PREVIA.length), borrador });
      } catch {
        // Sin borrador legible: se ve lo publicado.
      }
    };
    leer();
    const alCambiar = (evento) => { if (evento.key === clave) leer(); };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);
  return previa;
}

function ListadoPodcastBlog({
  podcasts: publicados, articulos, textos, locale = 'es',
}) {
  // Título y texto de entrada: lib/cabeceras.js (con vista previa).
  const textoCabecera = useTextoCabecera('blog');
  const previa = useEpisodioEnPrevia();
  let podcasts = publicados;
  if (previa) {
    const { slug, borrador } = previa;
    const tarjeta = {
      slug,
      href: borrador.enlace || '#',
      titulo: textoEn(borrador.titulo, locale),
      imagen: borrador.imagenCubierta,
      meta: borrador.duracion,
    };
    podcasts = publicados.some((episodio) => episodio.slug === slug)
      ? publicados.map((episodio) => (episodio.slug === slug ? tarjeta : episodio))
      : [tarjeta, ...publicados];
  }

  const [filtro, setFiltro] = useState('todo');
  const verPodcast = filtro !== 'blog';
  const verBlog = filtro !== 'podcast';

  const filtros = [
    { id: 'todo', etiqueta: textos.filtroTodo },
    { id: 'blog', etiqueta: textos.filtroBlog },
    { id: 'podcast', etiqueta: textos.filtroPodcast },
  ];

  return (
    <>
      <IntroSeccion
        titulo={textoCabecera('introTitulo')}
        texto={textoCabecera('introTexto')}
        filtros={filtros}
        activo={filtro}
        onCambiar={setFiltro}
      />

      <section className={`${styles.pagina} contenedor`}>
        {verPodcast && podcasts.length > 0 && (
          <div className={styles.gridPodcast}>
            {podcasts.map((entrada) => (
              <div key={entrada.slug || entrada.href} className={styles.podcastDestacado}>
                <BlogTarjetaPodcastDestacado
                  href={entrada.href}
                  titulo={entrada.titulo}
                  meta={entrada.meta}
                  imagen={entrada.imagen}
                  alt={entrada.titulo}
                  textoBoton={textos.escucharEpisodio}
                />
              </div>
            ))}
          </div>
        )}

        {verBlog && articulos.length > 0 && (
          <div className={styles.gridBlog}>
            {articulos.map((entrada) => (
              <BlogTarjeta
                key={entrada.href}
                href={entrada.href}
                titulo={entrada.titulo}
                extracto={entrada.extracto}
                meta={entrada.meta}
                imagen={entrada.imagen}
                alt={entrada.titulo}
              />
            ))}
          </div>
        )}
      </section>
      {previa && <BarraPrevia editor={`${EDITOR_BLOG}?episodio=${previa.slug}`} />}
    </>
  );
}

export default ListadoPodcastBlog;
