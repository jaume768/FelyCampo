// seoTextos.js
//
// <title>, meta description y (solo donde la página no tiene un título
// visible que haga de H1: home, Atelier, Vosotras, Prêt-à-porter,
// carrito, wishlist) "h1" — que se pinta con .sr-only, ver global.css —
// de cada página fija, por ruta (sin locale), cada uno en { es, en }.
// Lo edita «Textos de Google» en el admin; lectura y reglas:
// src/lib/seoTextos.js (y metadataPagina() en src/lib/seo.js). Ver
// docs/ADMIN.md.
//
// Criterio:
//   - title: ~50-60 caracteres, palabra clave primero y marca al final
//     ("… | Fely Campo"). Cada atelier lleva su ciudad.
//   - description: ~140-160 caracteres, qué hay en la página + llamada a
//     la acción. Ninguna se repite entre páginas.
// Las páginas dinámicas (fichas de producto, runways, entradas del blog,
// categorías de Atelier) generan los suyos a partir de sus propios datos
// — ver generateMetadata en cada page.js.

export const SEO_TEXTOS = {
  // ---------- Inicio ----------
  '/': {
    title: {
      es: 'Fely Campo | Moda de autor, novia y fiesta',
      en: 'Fely Campo | Made-to-measure bridal and eveningwear',
    },
    h1: {
      es: 'Fely Campo: moda de autor, vestidos de novia y fiesta en Salamanca, Madrid y Oviedo',
      en: 'Fely Campo: made-to-measure bridal and evening gowns in Salamanca, Madrid and Oviedo',
    },
    description: {
      es: 'Moda de autor hecha en España. Vestidos de novia y fiesta a medida en Salamanca, Madrid y Oviedo, y prêt-à-porter de Fely Campo. Descubre la firma.',
      en: 'Spanish fashion house born in Salamanca: made-to-measure bridal and evening gowns at our ateliers in Salamanca, Madrid and Oviedo, plus ready-to-wear.',
    },
  },

  // ---------- Atelier ----------
  '/atelier': {
    title: {
      es: 'Atelier de vestidos de novia y fiesta a medida | Fely Campo',
      en: 'Made-to-measure bridal and evening atelier | Fely Campo',
    },
    h1: {
      es: 'Atelier de vestidos de novia y fiesta a medida',
      en: 'Made-to-measure bridal and evening atelier',
    },
    description: {
      es: 'Descubre los ateliers de Fely Campo para vestidos de novia y fiesta a medida. Asesoramiento personalizado y atención con cita previa en tres ciudades.',
      en: 'Discover the Fely Campo atelier: bridal and evening gowns designed and made to measure, with one-to-one styling by appointment.',
    },
  },
  '/atelier/novias': {
    title: {
      es: 'Vestidos de novia a medida en atelier | Fely Campo',
      en: 'Made-to-measure wedding dresses | Fely Campo Atelier',
    },
    description: {
      es: 'Descubre los vestidos de novia a medida de Fely Campo. Diseños cuidados, tejidos seleccionados y asesoramiento personal en el atelier. Pide tu cita.',
      en: 'Wedding dresses designed and made to measure at the Fely Campo atelier. Explore our bridal collections and book your appointment.',
    },
  },
  '/atelier/fiesta': {
    title: {
      es: 'Vestidos de fiesta, madrina e invitada a medida | Fely Campo',
      en: 'Made-to-measure evening and guest dresses | Fely Campo',
    },
    description: {
      es: 'Vestidos de fiesta a medida para madrinas e invitadas de boda. Descubre los diseños de Fely Campo y reserva una cita personalizada en el atelier.',
      en: 'Evening, mother-of-the-bride and wedding guest dresses made to measure at the Fely Campo atelier. Explore the collections and book a visit.',
    },
  },
  '/atelier/vosotras': {
    title: {
      es: 'Novias e invitadas reales con vestidos Fely Campo',
      en: 'Fely Campo brides and guests | Our women',
    },
    h1: {
      es: 'Novias e invitadas reales con diseños Fely Campo',
      en: 'Fely Campo brides and guests',
    },
    description: {
      es: 'Descubre fotografías reales de novias e invitadas que eligieron Fely Campo para sus ocasiones especiales. Inspírate con sus vestidos y sus historias.',
      en: 'Brides and guests who wore Fely Campo on their special day. Real photos of our clients in their made-to-measure dresses.',
    },
  },
  '/atelier-fiesta/salamanca': {
    title: {
      es: 'Atelier de novia y fiesta en Salamanca | Fely Campo',
      en: 'Made-to-measure bridal and evening atelier in Salamanca | Fely Campo',
    },
    description: {
      es: 'Visita el atelier de Fely Campo en Salamanca para descubrir vestidos de novia y fiesta, colecciones prêt-à-porter y asesoramiento personalizado. Pide cita.',
      en: 'Fely Campo atelier and workshop in Salamanca: made-to-measure bridal and evening gowns, personal styling and showroom. Visit us by appointment.',
    },
  },
  '/atelier-fiesta/madrid': {
    title: {
      es: 'Atelier de novia y fiesta a medida en Madrid | Fely Campo',
      en: 'Made-to-measure bridal and evening atelier in Madrid | Fely Campo',
    },
    description: {
      es: 'Descubre el atelier y showroom de Fely Campo en Madrid. Vestidos de novia y fiesta a medida, además de prêt-à-porter de lujo. Reserva tu cita.',
      en: 'Fely Campo atelier and showroom in Madrid, on Calle Jorge Juan: made-to-measure bridal and evening gowns. Book your appointment.',
    },
  },
  '/atelier-fiesta/oviedo': {
    title: {
      es: 'Atelier de novia y fiesta a medida en Oviedo | Fely Campo',
      en: 'Made-to-measure bridal and evening atelier in Oviedo | Fely Campo',
    },
    description: {
      es: 'Visita el atelier de Fely Campo en Oviedo para descubrir vestidos de fiesta, novia e invitada y recibir asesoramiento personalizado. Pide tu cita.',
      en: 'Fely Campo atelier in central Oviedo: made-to-measure bridal, evening and guest dresses plus ready-to-wear. We see you by appointment.',
    },
  },

  // ---------- Prêt-à-porter ----------
  '/pret-a-porter': {
    title: {
      es: 'Prêt-à-porter de lujo para mujer | Fely Campo',
      en: "Women's designer ready-to-wear | Fely Campo",
    },
    h1: {
      es: 'Prêt-à-porter de lujo para mujer de Fely Campo',
      en: "Fely Campo women's ready-to-wear",
    },
    description: {
      es: 'Descubre el prêt-à-porter de lujo de Fely Campo: vestidos, faldas, pantalones, tops, chaquetas y abrigos de diseño de autor. Consúltanos.',
      en: 'Discover Fely Campo ready-to-wear: dresses, skirts, trousers, tops and coats designed and made in Salamanca, Spain.',
    },
  },

  // ---------- Sobre Fely ----------
  '/sobre-fely': {
    title: {
      es: 'Fely Campo: historia de una diseñadora de moda española',
      en: 'Fely Campo, the designer | Our story',
    },
    description: {
      es: 'Descubre la trayectoria de Fely Campo, diseñadora de moda española: una historia nacida en Salamanca entre telas, oficio artesanal y más de cinco décadas de creación.',
      en: 'The story of Fely Campo: from the girl with the needle in Salamanca to a bridal, evening and ready-to-wear label with ateliers in three cities.',
    },
  },
  '/colecciones-fely-campo': {
    title: {
      es: 'Colecciones de moda y desfiles de Fely Campo',
      en: 'Runway collections and shows | Fely Campo',
    },
    description: {
      es: 'Explora las colecciones de moda de autor de Fely Campo y sus desfiles de pasarela. Descubre los tejidos, siluetas, inspiración y vídeos de cada colección.',
      en: 'Every Fely Campo runway collection, from Diafonía to La Colección: looks, backstage and videos from each show.',
    },
  },
  '/talleres-fely-campo': {
    title: {
      es: 'Talleres de confección artesanal en Salamanca | Fely Campo',
      en: 'Our workshops in Salamanca | Fely Campo',
    },
    description: {
      es: 'Conoce cómo se confeccionan las prendas de Fely Campo en Salamanca y en talleres de la sierra de Castilla y León, donde el oficio y las manos expertas dan forma a cada pieza.',
      en: "Meet Fely Campo's workshops: the Salamanca atelier and two small workshops in the sierra where skilled hands make every piece.",
    },
  },
  '/blog': {
    title: {
      es: 'Blog y podcast de moda: el universo Fely Campo',
      en: 'Fashion blog and podcast | Fely Campo',
    },
    description: {
      es: 'Lee artículos y escucha conversaciones sobre moda de autor, vestidos de novia y fiesta, prêt-à-porter y el oficio artesanal detrás de Fely Campo.',
      en: 'Articles and podcast episodes from Fely Campo about wedding, guest and mother-of-the-bride dresses and the craft of the atelier.',
    },
  },

  // ---------- Visítanos ----------
  '/visita-fely-campo': {
    title: {
      es: 'Ateliers de moda en Salamanca, Madrid y Oviedo | Fely Campo',
      en: 'Ateliers in Salamanca, Madrid and Oviedo | Fely Campo',
    },
    description: {
      es: 'Encuentra los ateliers y el showroom de Fely Campo en Salamanca, Madrid y Oviedo. Consulta las ubicaciones y solicita una cita para novia o fiesta.',
      en: 'Visit the Fely Campo ateliers and showroom in Salamanca, Madrid and Oviedo. Addresses, opening hours and appointments for brides and guests.',
    },
  },
  '/visita-fely-campo/cita': {
    title: {
      es: 'Pedir cita en el atelier de Fely Campo | Novia y fiesta',
      en: 'Book an atelier appointment | Bride and guest | Fely Campo',
    },
    description: {
      es: 'Solicita tu cita en Fely Campo para encontrar tu vestido de novia o de fiesta. Cuéntanos qué buscas y nuestro equipo contactará contigo.',
      en: 'Book your appointment at the Fely Campo atelier in Salamanca, Madrid or Oviedo for your wedding or guest dress. We confirm by email.',
    },
  },
  '/visita-fely-campo/cita/confirmacion': {
    title: {
      es: 'Cita solicitada | Fely Campo',
      en: 'Appointment requested | Fely Campo',
    },
    description: {
      es: 'Hemos recibido tu solicitud de cita en el atelier de Fely Campo.',
      en: 'We have received your appointment request at the Fely Campo atelier.',
    },
  },
  '/visita-fely-campo/cita/confirmacion-novia': {
    title: {
      es: 'Cita de novia solicitada | Fely Campo',
      en: 'Bridal appointment requested | Fely Campo',
    },
    description: {
      es: 'Hemos recibido tu solicitud de cita de novia en el atelier de Fely Campo.',
      en: 'We have received your bridal appointment request at the Fely Campo atelier.',
    },
  },
  '/visita-fely-campo/cita/confirmacion-invitada': {
    title: {
      es: 'Cita de invitada solicitada | Fely Campo',
      en: 'Guest appointment requested | Fely Campo',
    },
    description: {
      es: 'Hemos recibido tu solicitud de cita de invitada en el atelier de Fely Campo.',
      en: 'We have received your guest appointment request at the Fely Campo atelier.',
    },
  },
  '/puntos-de-venta-fely-campo': {
    title: {
      es: 'Dónde comprar Fely Campo | Boutiques y puntos de venta',
      en: 'Stockists and boutiques | Fely Campo',
    },
    description: {
      es: 'Encuentra dónde comprar Fely Campo en boutiques seleccionadas. Consulta los puntos de venta disponibles y localiza el establecimiento más cercano.',
      en: 'Find Fely Campo at selected boutiques in Spain, Europe and the United States. Stockist map and postcode search.',
    },
  },

  // ---------- Legal ----------
  '/legal/aviso-legal': {
    title: {
      es: 'Aviso legal | Fely Campo',
      en: 'Legal notice | Fely Campo',
    },
    description: {
      es: 'Aviso legal de felycampo.com: titular del sitio web, datos de contacto y condiciones de uso.',
      en: 'Legal notice for felycampo.com: website owner, contact details and terms of use.',
    },
  },
  '/legal/privacidad': {
    title: {
      es: 'Política de privacidad | Fely Campo',
      en: 'Privacy policy | Fely Campo',
    },
    description: {
      es: 'Cómo trata Fely Campo tus datos personales: finalidades, base legal, plazos de conservación y tus derechos.',
      en: 'How Fely Campo handles your personal data: purposes, legal basis, retention periods and your rights.',
    },
  },
  '/legal/cookies': {
    title: {
      es: 'Política de cookies | Fely Campo',
      en: 'Cookie policy | Fely Campo',
    },
    description: {
      es: 'Qué cookies usa felycampo.com, para qué sirven y cómo cambiar tus preferencias en cualquier momento.',
      en: 'Which cookies felycampo.com uses, what they are for and how to change your preferences at any time.',
    },
  },
  '/legal/terminos': {
    title: {
      es: 'Términos y condiciones | Fely Campo',
      en: 'Terms and conditions | Fely Campo',
    },
    description: {
      es: 'Condiciones de uso de la web de Fely Campo: solicitud de cita, información sobre una pieza, encargos en el atelier, compras en boutiques y garantía.',
      en: 'Terms of use of the Fely Campo website: appointment requests, information about a piece, orders at the atelier, boutique purchases and guarantee.',
    },
  },
};
