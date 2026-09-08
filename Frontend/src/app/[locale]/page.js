/* ============================================================
   HOME — de momento solo el HeroCarousel. Resto de secciones
   pendientes de diseño.
   ============================================================ */

import { getTranslations } from 'next-intl/server';
import { HeroCarousel, SplitMedia, CuadriculaProductos, SectionClientsReview, SectionCompromiso, BloqueSeccion } from '@/components/layout';
import { catalog } from '@/lib/api/endpoints';
import { adaptarPaginaProductos } from '@/lib/api/adapters';
import { conValorPorDefecto } from '@/lib/api/client';
import styles from './page.module.css';

// RESPALDO de los bloques de la home cuando la API no responde (ver conValorPorDefecto
// más abajo). Con el backend en pie, estos NO se usan: la home pide `is_featured=true`.
// 12 productos: suficientes para que la banda desborde el viewport en
// cualquier ancho de pantalla y se vea el scroll + la barra de
// progreso (con menos de eso, en desktop ancho las tarjetas caben
// enteras y no hay nada que arrastrar). Como no hay catálogo real
// detrás todavía, las últimas 4 repiten foto de las 8 de arriba bajo
// un nombre distinto — a sustituir en cuanto haya 12 fotos reales.
const productosDestacados = [
  { imagen: '/img/ecommerce/27FW/FW27-Top-Look03.jpg', imagenHover: '/img/ecommerce/27FW/FW27-Look03.webp', nombre: 'Falda Vera', precio: '420 €', colores: [{ hex: '#EED3E8', nombre: 'Rosa suave' }, { hex: '#F7F7F7', nombre: 'Blanco' }] },
  { imagen: '/img/ecommerce/27FW/FW27-Dress-Look02.jpg', imagenHover: '/img/ecommerce/27FW/FW27-Look02.webp', nombre: 'Vestido Aurora', precio: '890 €', colores: [{ hex: '#6E2635', nombre: 'Burdeos' }, { hex: '#23324A', nombre: 'Azul marino' }] },
  { imagen: '/img/ecommerce/27FW/27fw-video.mp4', tipo: 'video', nombre: 'Vestido Sol', precio: '760 €', colores: [{ hex: '#6B705C', nombre: 'Verde oliva' }, { hex: '#C19A6B', nombre: 'Camel' }] },
  { imagen: '/img/ecommerce/27FW/FW27-Top-Look01.jpg', imagenHover: '/img/ecommerce/27FW/FW27-Look01.webp', nombre: 'Falda Mora', precio: '480 €', colores: [{ hex: '#202020', nombre: 'Tinta' }, { hex: '#F5F1EE', nombre: 'Crema' }] },
  { imagen: '/img/ecommerce/Invitada/LOOK1_2-scaled.webp', nombre: 'Vestido Alba', precio: '620 €', colores: [{ hex: '#EFD9D0', nombre: 'Nude' }, { hex: '#F5F1EE', nombre: 'Crema' }] },
  { imagen: '/img/ecommerce/Invitada/LOOK9_1-scaled.webp', nombre: 'Vestido Iris', precio: '580 €', colores: [{ hex: '#6B7A8F', nombre: 'Azul piedra' }, { hex: '#202020', nombre: 'Tinta' }] },
  { imagen: '/img/ecommerce/Invitada/LOOK12_2-scaled.webp', nombre: 'Vestido Coral', precio: '650 €', colores: [{ hex: '#D96C5F', nombre: 'Coral' }, { hex: '#F7F7F7', nombre: 'Blanco' }] },
  { imagen: '/img/ecommerce/Invitada/LOOK18_1-scaled.webp', nombre: 'Vestido Bruma', precio: '590 €', colores: [{ hex: '#B8C4C2', nombre: 'Gris verdoso' }, { hex: '#3A3A3A', nombre: 'Grafito' }] },
  { imagen: '/img/ecommerce/FC-0_NEW.webp', nombre: 'Falda Estrella', precio: '440 €', colores: [{ hex: '#C19A6B', nombre: 'Camel' }, { hex: '#202020', nombre: 'Tinta' }] },
  { imagen: '/img/ecommerce/27FW/FW27-Dress-Look02.jpg', imagenHover: '/img/ecommerce/27FW/FW27-Look02.webp', nombre: 'Vestido Nube', precio: '910 €', colores: [{ hex: '#F7F7F7', nombre: 'Blanco' }, { hex: '#EED3E8', nombre: 'Rosa suave' }] },
  { imagen: '/img/ecommerce/Invitada/LOOK1_2-scaled.webp', nombre: 'Vestido Eco', precio: '630 €', colores: [{ hex: '#F5F1EE', nombre: 'Crema' }, { hex: '#EFD9D0', nombre: 'Nude' }] },
  { imagen: '/img/ecommerce/FC-1_NEW.webp', nombre: 'Falda Lumen', precio: '500 €', colores: [{ hex: '#F5F1EE', nombre: 'Crema' }, { hex: '#202020', nombre: 'Tinta' }] },
  // FC-0..FC-3 (sin _NEW): añadidas como placeholder extra, sin
  // sustituir a sus versiones _NEW de arriba.
  { imagen: '/img/ecommerce/FC-0.webp', nombre: 'Falda Nova', precio: '440 €', colores: [{ hex: '#C19A6B', nombre: 'Camel' }, { hex: '#202020', nombre: 'Tinta' }] },
  { imagen: '/img/ecommerce/FC-1.webp', nombre: 'Falda Cinta', precio: '500 €', colores: [{ hex: '#F5F1EE', nombre: 'Crema' }, { hex: '#202020', nombre: 'Tinta' }] },
  { imagen: '/img/ecommerce/FC-2.webp', nombre: 'Vestido Alma', precio: '620 €', colores: [{ hex: '#EFD9D0', nombre: 'Nude' }, { hex: '#F5F1EE', nombre: 'Crema' }] },
  { imagen: '/img/ecommerce/FC-3.webp', nombre: 'Vestido Lino', precio: '590 €', colores: [{ hex: '#202020', nombre: 'Tinta' }, { hex: '#EED3E8', nombre: 'Rosa suave' }] },
  // FC-4..FC-7: mismo criterio que FC-0..FC-3, placeholder extra.
  { imagen: '/img/ecommerce/FC-4.webp', nombre: 'Falda Rocío', precio: '480 €', colores: [{ hex: '#6B7A8F', nombre: 'Azul piedra' }, { hex: '#F5F1EE', nombre: 'Crema' }] },
  { imagen: '/img/ecommerce/FC-5.webp', nombre: 'Vestido Marea', precio: '640 €', colores: [{ hex: '#6E2635', nombre: 'Burdeos' }, { hex: '#F5F1EE', nombre: 'Crema' }] },
  { imagen: '/img/ecommerce/FC-6.webp', nombre: 'Vestido Arena', precio: '600 €', colores: [{ hex: '#EFD9D0', nombre: 'Nude' }, { hex: '#202020', nombre: 'Tinta' }] },
  { imagen: '/img/ecommerce/FC-7.webp', nombre: 'Falda Bruna', precio: '460 €', colores: [{ hex: '#6B7A8F', nombre: 'Azul piedra' }, { hex: '#C19A6B', nombre: 'Camel' }] },
];

// "Un look para cada ocasión": las 4 fotos de ecommerce/invitada — de
// momento no hay catálogo real detrás de la ocasión, solo esta fila
// fija (antes tenía tabs para rotar entre ocasiones, quitados por no
// ser necesarios).
const productosOcasion = [
  { imagen: '/img/ecommerce/FC-2_NEW.webp', nombre: 'Vestido Alba', precio: '620 €', colores: [{ hex: '#EFD9D0', nombre: 'Nude' }, { hex: '#F5F1EE', nombre: 'Crema' }] },
  { imagen: '/img/ecommerce/invitada/LOOK9_1-scaled.webp', nombre: 'Vestido Iris', precio: '580 €', colores: [{ hex: '#6B7A8F', nombre: 'Azul piedra' }, { hex: '#202020', nombre: 'Tinta' }] },
  { imagen: '/img/ecommerce/invitada/LOOK12_2-scaled.webp', nombre: 'Vestido Coral', precio: '650 €', colores: [{ hex: '#D96C5F', nombre: 'Coral' }, { hex: '#F7F7F7', nombre: 'Blanco' }] },
  { imagen: '/img/ecommerce/invitada/LOOK18_1-scaled.webp', nombre: 'Vestido Bruma', precio: '590 €', colores: [{ hex: '#B8C4C2', nombre: 'Gris verdoso' }, { hex: '#3A3A3A', nombre: 'Grafito' }] },
];

const slidesHero = [
  {
    // Temporal: sustituye el vídeo mientras dura la campaña de abrigos.
    src: '/img/FW27-Hero3.mp4',
    tipo: 'video',
    titulo: 'Prêt-à-porter',
    ctaHref: '/tienda',
  },
  {
    src: '/img/HERO-2.jpg',
    tipo: 'imagen',
    titulo: 'Prêt-à-porter',
    ctaHref: '/tienda',
  },
  {
    src: '/img/novias-sección-FelyCampo3.jpg',
    tipo: 'imagen',
    titulo: 'Collection Bride 27',
    ctaHref: '/atelier/novias',
  },
];

export default async function Home({ params }) {
  const { locale } = await params;
  const tHero = await getTranslations('heroCarousel');
  const tCompromiso = await getTranslations('compromiso');
  const tVisitaAtelier = await getTranslations('visitaAtelier');

  // Igual que en el Navbar (ver withLocale en Navbar.jsx): los hrefs
  // internos llevan el locale por delante para no perder el idioma
  // elegido al navegar. Mismo CTA ("Ver más"/"Discover more") en los
  // tres slides — no cada uno con su propio texto.
  // ESCAPARATE REAL: `is_featured` en Product (campo nuevo, decidido esta sesión), con
  // `featured_position` para el orden. Editable desde el panel, sin tocar código.
  //
  // Bloques secundarios de la home: si la API falla se caen a los datos de ejemplo en vez
  // de tumbar la portada entera (conValorPorDefecto). Una home en blanco es peor que una
  // home con el escaparate desactualizado.
  const paginaDestacados = await conValorPorDefecto(
    catalog.listarProductos(
      { is_featured: true, ordering: 'featured_position', page_size: 12 },
      { next: { revalidate: 300 } }
    ),
    null
  );
  const destacadosReales = paginaDestacados
    ? adaptarPaginaProductos(paginaDestacados, locale).productos
    : [];

  // "Por ocasión": atelier (novia y fiesta), que no muestra precio de catálogo.
  const paginaOcasion = await conValorPorDefecto(
    catalog.listarProductos({ line: 'atelier', page_size: 8 }, { next: { revalidate: 300 } }),
    null
  );
  const ocasionReales = paginaOcasion ? adaptarPaginaProductos(paginaOcasion, locale).productos : [];

  const slidesConLocale = slidesHero.map((slide) => ({
    ...slide,
    ctaTexto: tHero('cta'),
    ctaHref: `/${locale}${slide.ctaHref}`,
  }));

  return (
    <div className={styles.landing}>
      <HeroCarousel slides={slidesConLocale} />
      <CuadriculaProductos
        productos={destacadosReales.length ? destacadosReales : productosDestacados}
        coleccionKey="cuadriculaProductos.coleccion"
        tituloKey="cuadriculaProductos.novedades"
        descriptionKey="cuadriculaProductos.novedadesDescripcion"
      />
      <SplitMedia
        variante="landing"
        items={[
          {
            src: '/img/novias-sección-FelyCampo2.jpg',
            tipo: 'imagen',
            tituloKey: 'splitMedia.item1.titulo',
            ctaKey: 'splitMedia.item1.cta',
            href: `/${locale}/atelier/novias`,
          },
          {
            src: '/img/invitadas-sección-FelyCampo.jpg',
            tipo: 'imagen',
            tituloKey: 'splitMedia.item2.titulo',
            ctaKey: 'splitMedia.item2.cta',
            href: `/${locale}/atelier/fiesta`,
          },
        ]}
      />
      <CuadriculaProductos
        productos={ocasionReales.length ? ocasionReales : productosOcasion}
        ocultarPrecio={ocasionReales.length > 0}
        tituloKey="cuadriculaTabs.subtitulo"
        coleccionKey="cuadriculaTabs.titulo"
        descriptionKey="cuadriculaTabs.descripcion"
        botonTextKey="cuadriculaTabs.reservarCita"
        verMasHref={`/${locale}/visita-fely-campo/cita`}
      />
      <SectionClientsReview />
      <SectionCompromiso
        imagen="/img/atelier/ateliernovia-lamedida-felycampo-2.mp4"
        tipo="video"
        texto={tCompromiso('texto')}
        subtitulo={tCompromiso('subtitulo')}
      />
      <BloqueSeccion
        imagen="/img/atelier/ateliernovia-lamedida-felycampo-3.webp"
        titulo={tVisitaAtelier('titulo')}
        texto={tVisitaAtelier('texto')}
        enlace={tVisitaAtelier('enlace')}
        href={`/${locale}/visita-fely-campo/cita`}
      />
    </div>
  );
}
