// cabeceras.js
//
// La cabecera (foto, título y subtítulo) y los textos de entrada de las
// páginas que son sobre todo un listado: Blog & Podcast, Vosotras, Runway,
// Visítanos y Puntos de venta. Se editan en la pestaña «Página de la web»
// de cada sección del admin (Visítanos, en su propia página). Lectura y
// reglas: src/lib/cabeceras.js. Ver docs/ADMIN.md.
// Migrado tal cual de las fotos que estaban fijas en cada page.js y de
// messages/*.json (las claves de origen, en cada entrada).

export const CABECERAS = {
  // blog/page.js + nav.submenus.elMundoDeFely.podcast, heroPagina.podcast,
  // blog.introTitulo, blog.introTexto
  blog: {
    imagen: '/media/web/img/about-felycampo/fely-campo-sobre-fely-campo-madrid-moda-capital-podcast.webp',
    titulo: { es: 'Blog & Podcast', en: 'Blog & Podcast' },
    subtitulo: { es: 'Entre telas y palabras.', en: 'Between fabrics and words.' },
    introTitulo: { es: 'Podcast & Blog', en: 'Podcast & Blog' },
    introTexto: {
      es: 'Un espacio para conversar sin prisas. En el podcast, Fely Campo comparte con invitados del mundo de la moda, el arte y la artesanía las historias que hay detrás de cada creación; en el blog reunimos reflexiones, consejos para novias e invitadas y el día a día de nuestros ateliers. Palabras, telas y oficio, contados en primera persona.',
      en: 'A place for unhurried conversation. In the podcast, Fely Campo talks with guests from fashion, art and craft about the stories behind each creation; on the blog we gather reflections, advice for brides and guests, and everyday life in our ateliers. Words, fabric and craft, told first-hand.',
    },
  },

  // nav.submenus.atelier.vosotras, vosotras.descripcion (sin foto: la
  // página empieza directamente con el título y las fotos de las clientas)
  vosotras: {
    titulo: { es: 'Vosotras', en: 'For You' },
    texto: {
      es: '¿Y qué decir de vosotras? Si las palabras no son suficientes, que hablen las fotos.',
      en: "And what can we say about you? If words aren't enough, let the photos speak.",
    },
  },

  // colecciones-fely-campo/page.js + catalogo.tituloColecciones,
  // heroPagina.runwayArchivo
  runway: {
    imagen: '/media/web/img/hero-pages/fely-campo-cabecera-hero-pages-pretaporter-faldas.webp',
    titulo: { es: 'Colecciones y desfiles', en: 'Collections and runway shows' },
    subtitulo: { es: 'Todas nuestras colecciones de pasarela.', en: 'All our runway collections.' },
  },

  // visita-fely-campo/page.js + visitenos.titulo, heroPagina.atelierCiudad,
  // visitenos.intro
  visitanos: {
    imagen: '/media/web/img/atelier/atelier-salamanca/fely-campo-atelier-salamanca-fiesta-3.webp',
    titulo: { es: 'Nuestros Ateliers', en: 'Our Ateliers' },
    subtitulo: { es: 'Visítanos siempre con cita previa.', en: 'Visit us, always by appointment.' },
    introTitulo: { es: 'Nuestros Ateliers', en: 'Our Ateliers' },
    introTexto: {
      es: 'Nuestros ateliers y showroom, siempre con cita previa para atenderte con calma en nuestras ubicaciones en Salamanca, Madrid u Oviedo.',
      en: 'Our ateliers and showroom — always by appointment, so we can give you our full attention — in Salamanca, Madrid and Oviedo.',
    },
  },

  // puntos-de-venta-fely-campo/page.js + puntosVenta.* (el título y el texto
  // del mapa salen también al final de Visítanos)
  'puntos-de-venta': {
    imagen: '/media/web/img/atelier/atelier-salamanca/fely-campo-atelier-salamanca-foto-4.webp',
    titulo: { es: 'Boutiques selectas', en: 'Selected Boutiques' },
    subtitulo: { es: 'Encuentra tu Fely Campo en nuestros puntos de venta.', en: 'Find your Fely Campo at our points of sale.' },
    mapaTitulo: { es: 'Puntos de venta', en: 'Points of sale' },
    mapaTexto: {
      es: 'Descubre nuestros ateliers y la red de boutique que trabajan con Fely Campo, en España y en el resto del mundo. Contamos con más de 200 puntos de venta. Encuentra tu punto de venta más cercano',
      en: 'Our ateliers and the network of boutiques that carry Fely Campo, in Spain and around the world. We have more than 200 points of sale. Find your nearest store',
    },
    internacionalTitulo: { es: 'Fely Campo y Guffanti: presencia internacional', en: 'Fely Campo and Guffanti: international presence' },
    showroom: {
      imagen: '/media/web/img/atelier/fely-campo-atelier-punto-venta-internacional-2.webp',
      nombre: { es: 'Showroom Milán', en: 'Milan Showroom' },
      texto: {
        es: 'Desde hace más de diez años, trabajamos con Guffanti, uno de nuestros representantes internacionales más importantes. Desde su showroom en Milán, distribuye las colecciones de Fely Campo a otros showrooms de Italia, consolidando la presencia de la firma en el mercado italiano.',
        en: 'For more than ten years we have worked with Guffanti, one of our most important international representatives. From its showroom in Milan, it distributes Fely Campo collections to other showrooms across Italy, strengthening the label’s presence in the Italian market.',
      },
    },
  },
};
