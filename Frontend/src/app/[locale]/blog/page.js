/* ============================================================
   PODCAST & BLOG — Fely Campo. Ruta: /blog (antes /podcast, y antes de eso /blog).
   Hero común (HeroPagina) arriba; debajo, ListadoPodcastBlog: una
   introducción de 80vh ("Podcast & Blog", texto y filtros "Ver todo" /
   "Blog" / "Podcast") y los episodios (BlogTarjetaPodcastDestacado,
   foto a sangre + play) y artículos (BlogTarjeta) de lib/blog.js, que los
   filtros muestran u ocultan en la propia página. Los episodios enlazan
   directamente a su vídeo de YouTube (sin ficha propia); los artículos,
   a /blog/[slug] (ver [entrada]/page.js).
   ============================================================ */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { articulosVisibles, episodiosVisibles } from '@/lib/blog';
import ListadoPodcastBlog from './ListadoPodcastBlog';
import styles from './page.module.css';
import { CabeceraPagina, HeroCabecera } from '@/components/layout/CabeceraPagina';
import { obtenerCabecera } from '@/lib/cabeceras';
import { metadataPagina } from '@/lib/seo';
import { cargarContenido } from '@/lib/contenidoServidor';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/blog' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const t = await getTranslations('blog');

  // Entradas ya preparadas para ListadoPodcastBlog (componente cliente):
  // textos en el idioma, href y meta (duración del episodio o fecha del
  // artículo). Artículos del más reciente al más antiguo.
  const formatoFecha = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  // Datos de lib/blog.js (los mismos que edita /admin/blog), solo los
  // publicados. Episodios: sin ficha propia, la tarjeta enlaza al vídeo
  // ("#" solo si a un episodio le faltara el enlace).
  const podcasts = episodiosVisibles().map((episodio) => ({
    slug: episodio.slug,
    href: episodio.enlace || '#',
    titulo: episodio.titulo[locale] || episodio.titulo.es,
    imagen: episodio.imagenCubierta,
    meta: episodio.duracion,
  }));
  // Artículos, del más reciente al más antiguo.
  const articulos = articulosVisibles().map((articulo) => ({
    href: `/${locale}/blog/${articulo.slug}`,
    titulo: articulo.titulo[locale] || articulo.titulo.es,
    extracto: articulo.resumen[locale] || articulo.resumen.es,
    imagen: articulo.imagenCubierta,
    meta: formatoFecha.format(new Date(articulo.fecha)),
  }));

  return (
    <>
    {/* Cabecera e introducción: lib/cabeceras.js (editables en el admin,
        Blog & Podcast › Página de la web, con vista previa).
        heroEncuadre: en mobile lleva el recorte a la derecha, sobre Fely
        (ver page.module.css). */}
    <CabeceraPagina id="blog" publicado={obtenerCabecera('blog')}>
    <HeroCabecera className={styles.heroEncuadre} />
    {/* Intro ("Podcast & Blog" + texto + filtros) y listado filtrable
        de episodios y artículos — ver ListadoPodcastBlog.jsx. */}
    <ListadoPodcastBlog
      podcasts={podcasts}
      articulos={articulos}
      locale={locale}
      textos={{
        filtroTodo: t('filtroTodo'),
        filtroBlog: t('filtroBlog'),
        filtroPodcast: t('filtroPodcast'),
        escucharEpisodio: t('escucharEpisodio'),
      }}
    />
    </CabeceraPagina>
    </>
  );
}
