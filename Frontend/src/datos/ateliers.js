// ateliers.js
//
// Los 3 ateliers propios (Salamanca, Madrid, Oviedo): su página
// (/atelier-fiesta/<id>) y sus datos de contacto, que salen también en
// /visita-fely-campo y en el formulario de cita. Lo editan las páginas
// «Atelier Salamanca», «Showroom Madrid» y «Atelier Oviedo» del admin.
// Migrado tal cual de los antiguos atelier-fiesta/atelieres.js (la página)
// y visita-fely-campo/ubicaciones.js (el contacto). Reglas y lectura:
// src/lib/ateliers.js. Ver docs/ADMIN.md.
//
//   nombreCiudad    el nombre grande de la portada («Salamanca»); también en
//                   las tarjetas «Atelier … & Showroom» del pie de algunas páginas.
//   etiqueta        lo que va antes, en la portada («Atelier», «Atelier & Showroom»).
//   subtitulo       la frase bajo la ciudad («Visítanos siempre con cita previa.»),
//                   migrada de messages/*.json (heroPagina.atelierCiudad).
//                   Los dos, migrados de messages/*.json (atelierFiesta.<id>).
//   heroMedio       la portada: foto o vídeo. En vídeo, "srcMovil" es otro
//                   vídeo para móvil, "poster" la imagen mientras carga y
//                   "encuadre: 'arriba'" ancla el encuadre arriba ('' si no).
//   descripcion     el texto bajo la portada (frases o párrafos).
//   medioSuperior   la foto o el vídeo grande bajo el texto; "ajustarAlto"
//                   enseña entera una foto vertical.
//   secciones       foto + título + texto, alternando de lado.
//   imagenesTira    las fotos y vídeos del final (un vídeo = .mp4).
//   contacto        nombre de la tarjeta, dirección (2 líneas), teléfonos
//                   (1 o 2), WhatsApp, horario ({es:'',en:''} = «con cita
//                   previa»), el texto de su tarjeta en Visítanos y sus fotos
//                   ("fotos", pasan solas; migradas de ListadoUbicaciones.jsx).
//   ciudad          interno (no se edita): el nombre de la sede en el código.

export const SEDES = {
  "salamanca": {
    "id": "salamanca",
    "ciudad": "Salamanca",
    "nombreCiudad": {
      "es": "Salamanca",
      "en": "Salamanca"
    },
    "etiqueta": {
      "es": "Atelier",
      "en": "Atelier"
    },
    "subtitulo": {
      "es": "Visítanos siempre con cita previa.",
      "en": "Visit us, always by appointment."
    },
    "heroMedio": {
      "tipo": "imagen",
      "src": "/media/web/img/atelier/atelier-salamanca/fely-campo-atelier-salamanca-foto-4.webp",
      "srcMovil": "",
      "poster": "",
      "encuadre": ""
    },
    "descripcion": {
      "es": [
        "En Salamanca, el atelier de Fely Campo está unido al corazón creativo de la firma. Aquí se encuentran el diseño, el patronaje y el cuidado de los tejidos, en un espacio donde el oficio y la esencia de Castilla forman parte de cada creación."
      ],
      "en": [
        "In Salamanca, the atelier lives alongside the creative heart of Fely Campo. A space where craft, precision and creation meet, with the essence of Castile as part of the world of the label."
      ]
    },
    "medioSuperior": {
      "tipo": "imagen",
      "src": "/media/web/img/talleres/inhouse/ateliernovia-lamedida-felycampo-2.webp",
      "ajustarAlto": false
    },
    "secciones": [
      {
        "id": "seccion-1",
        "titulo": {
          "es": "El Atelier",
          "en": "The Atelier"
        },
        "imagen": "/media/web/img/atelier/atelier-salamanca/fely-campo-atelier-salamanca-foto-3.webp",
        "texto": {
          "es": [
            "Visita nuestro atelier en Salamanca para descubrir las colecciones de Fely Campo, probar diseños y conocer de cerca la firma. Prendas de líneas atemporales, pensadas para permanecer más allá de cada temporada."
          ],
          "en": [
            "A space to discover Fely Campo, try on its collections and get to know the world of the label up close. Timeless designs and pieces that endure beyond each season."
          ]
        }
      },
      {
        "id": "seccion-2",
        "titulo": {
          "es": "Asesoramiento personalizado",
          "en": "Personalised styling"
        },
        "imagen": "/media/web/img/atelier/atelier-salamanca/fely-campo-atelier-salamanca-fiesta-3.webp",
        "texto": {
          "es": [
            "Cada cita en el atelier comienza escuchándote. Nuestro equipo te asesora para encontrar el diseño, el corte, el color y el tejido que mejor encajan contigo, y valorar las posibles modificaciones de la prenda elegida."
          ],
          "en": [
            "Every appointment begins with you. Our team guides you to find the design, cut, colour and fabric that suit you best, and to consider the possible alterations to the chosen piece."
          ]
        }
      },
      {
        "id": "seccion-3",
        "titulo": {
          "es": "Encuentra tu vestido de novia",
          "en": "Find your wedding dress"
        },
        "imagen": "/media/web/img/fely-campo-web-novias-seccion-3.webp",
        "texto": {
          "es": [
            "A través de una atención personalizada, te asesoramos en la elección de la silueta, los tejidos y los detalles para crear tu vestido de novia ideal."
          ],
          "en": [
            "Through personalised attention, we guide you in choosing the silhouette, fabrics and details to create your ideal wedding dress."
          ]
        }
      }
    ],
    "imagenesTira": [
      "/media/web/img/atelier/atelier-salamanca/20260428-125217_Z0JLEAAc.mp4",
      "/media/web/img/atelier/atelier-salamanca/fely-campo-atelier-salamanca-foto-2.webp",
      "/media/web/img/atelier/atelier-salamanca/20260826-143026_DCFGo89w.mp4",
      "/media/web/img/atelier/atelier-salamanca/fely-campo-atelier-salamanca-foto.webp"
    ],
    "contacto": {
      "nombre": "Atelier Salamanca",
      "direccion": [
        "C/ Laguna Negra 17-19",
        "37008 Salamanca"
      ],
      "telefonos": [
        "+34 923 19 00 53",
        "+34 659 00 62 57"
      ],
      "whatsapp": "+34 659 00 62 57",
      "horario": {
        "es": "Lun - Vie: 09:30 - 17:30",
        "en": "Mon - Fri: 9:30am - 5:30pm"
      },
      "descripcion": {
        "es": "Espacio dedicado a la novia y a nuestras colecciones de fiesta, además de contar con una sección de nuestra línea pret-a-porter.",
        "en": "Bridal and eveningwear atelier: fittings, pattern-making, made-to-measure gowns and statement pieces for special occasions."
      },
      "fotos": [
        "/media/web/img/atelier/atelier-salamanca/fely-campo-atelier-salamanca-foto-4.webp",
        "/media/web/img/talleres/inhouse/ateliernovia-lamedida-felycampo-2.webp"
      ]
    }
  },
  "madrid": {
    "id": "madrid",
    "ciudad": "Madrid",
    "nombreCiudad": {
      "es": "Madrid",
      "en": "Madrid"
    },
    "etiqueta": {
      "es": "Atelier & Showroom",
      "en": "Atelier & Showroom"
    },
    "subtitulo": {
      "es": "Visítanos siempre con cita previa.",
      "en": "Visit us, always by appointment."
    },
    "heroMedio": {
      "tipo": "video",
      "src": "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-hero-horizontal.mp4",
      "srcMovil": "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-vertical.mp4",
      "poster": "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-hero-horizontal-poster.webp",
      "encuadre": "arriba"
    },
    "descripcion": {
      "es": [
        "En la calle Jorge Juan, el atelier y showroom de Fely Campo en Madrid ofrece un espacio íntimo para descubrir la firma. En la cita, la diseñadora escucha tus necesidades y te asesora sobre el diseño, las proporciones y los tejidos para dar forma a una pieza que refleje tu personalidad."
      ],
      "en": [
        "Our Madrid atelier occupies a very special spot on Calle Jorge Juan. An intimate space, designed to discover the label in a close, personal way. There, you can meet the designer and define every detail, every proportion and every fabric to begin shaping a one-of-a-kind piece: a space where time stands still to dress each woman from her own essence."
      ]
    },
    "medioSuperior": {
      "tipo": "imagen",
      "src": "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-showroom.webp",
      "ajustarAlto": true
    },
    "secciones": [
      {
        "id": "seccion-1",
        "titulo": {
          "es": "A medida",
          "en": "Made-to-measure"
        },
        "imagen": "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-tomando-medidas.webp",
        "texto": {
          "es": [
            "En el atelier de Madrid, la diseñadora trabaja contigo para crear prendas a medida. El diseño nace de una conversación y se desarrolla cuidando la silueta, las proporciones y cada detalle."
          ],
          "en": [
            "With complicity as her goal, the designer creates made-to-measure, one-of-a-kind pieces designed especially for each woman."
          ]
        }
      },
      {
        "id": "seccion-2",
        "titulo": {
          "es": "Showroom",
          "en": "Showroom"
        },
        "imagen": "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-foto-2.webp",
        "texto": {
          "es": [
            "El showroom del atelier de Madrid reúne prendas representativas de Fely Campo y permite descubrir de cerca la identidad de la firma, construida a lo largo de más de cinco décadas dedicadas a la moda."
          ],
          "en": [
            "The Showroom is the space within her Madrid Atelier where the designer displays many of the label's most iconic pieces. You'll immerse yourself in a universe of garments that reflect the soul and essence of their creator across her more than 50-year career in the world of fashion."
          ]
        }
      },
      {
        "id": "seccion-3",
        "titulo": {
          "es": "Novias",
          "en": "Bridal"
        },
        "imagen": "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-foto-3.webp",
        "texto": {
          "es": [
            "En el atelier de novias de Madrid, cada vestido se construye a medida a partir de la personalidad de la novia, sus preferencias y cómo desea sentirse el día de su boda. La elección de tejidos, las proporciones y los detalles dan forma al diseño."
          ],
          "en": [
            "At her Madrid Atelier, the designer offers a space to meet where every bride can imagine, build and shape her dream dress, made to measure and designed exclusively for her. Her personality, her sense of beauty, her feelings and the fabrics that move her set the starting point for every design."
          ]
        }
      },
      {
        "id": "seccion-4",
        "titulo": {
          "es": "Prêt-à-porter",
          "en": "Prêt-à-porter"
        },
        "imagen": "/media/web/img/atelier/fely-campo-atelier-punto-venta-internacional.webp",
        "texto": {
          "es": [
            "El atelier de Madrid cuenta con un espacio dedicado al prêt-à-porter de lujo de Fely Campo: colecciones de diseño de autor que trasladan el patronaje, los tejidos y la identidad de la firma a la forma de vestir cotidiana."
          ],
          "en": [
            "Fely Campo's Madrid Atelier has a space entirely dedicated to the luxury prêt-à-porter collections through which the designer has brought her design signature into everyday life."
          ]
        }
      }
    ],
    "imagenesTira": [
      "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-carrusel.mp4",
      "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-sala-pruebas.webp",
      "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-medida-fiesta-novia.webp",
      "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-vestidos-fiesta.webp"
    ],
    "contacto": {
      "nombre": "Showroom Madrid",
      "direccion": [
        "C/ Jorge Juan 29, 1º Derecha",
        "28001 Madrid"
      ],
      "telefonos": [
        "+34 659 00 62 57"
      ],
      "whatsapp": "+34 659 00 62 57",
      "horario": {
        "es": "",
        "en": ""
      },
      "descripcion": {
        "es": "Espacio Showroom y Atelier a medida. Cuenta con las últimas colecciones de prêt-à-porter de lujo presentadas en Mercedes Benz Fashion Week Madrid, además de espacios dedicados para las colecciones de novia y fiesta.",
        "en": "Discover the full collection in an intimate space, in the heart of the Golden Mile."
      },
      "fotos": [
        "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-foto-3.webp",
        "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-sala-pruebas.webp",
        "/media/web/img/atelier/showroom-madrid/fely-campo-atelier-madrid-showroom-3.webp"
      ]
    }
  },
  "oviedo": {
    "id": "oviedo",
    "ciudad": "Oviedo",
    "nombreCiudad": {
      "es": "Oviedo",
      "en": "Oviedo"
    },
    "etiqueta": {
      "es": "Atelier",
      "en": "Atelier"
    },
    "subtitulo": {
      "es": "Visítanos siempre con cita previa.",
      "en": "Visit us, always by appointment."
    },
    "heroMedio": {
      "tipo": "imagen",
      "src": "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-tienda-4-1.webp",
      "srcMovil": "",
      "poster": "",
      "encuadre": ""
    },
    "descripcion": {
      "es": [
        "En el corazón de Asturias, el atelier de Fely Campo en Oviedo es un espacio para descubrir vestidos de fiesta, diseños de novia y colecciones de la firma con asesoramiento personalizado.",
        "Desde 2015, el atelier de Fely Campo en Oviedo acompaña a cada mujer en la elección de una pieza especial, con atención a la silueta, los tejidos y cada detalle."
      ],
      "en": [
        "In the heart of Asturias, a space where fashion meets emotion.",
        "Since 2015, Fely Campo has accompanied every woman in choosing a special piece, caring for every silhouette, every fabric and every detail."
      ]
    },
    "medioSuperior": {
      "tipo": "video",
      "src": "/media/web/img/atelier/atelier-oviedo/WhatsApp Video 2026-09-11 at 10.18.12.mp4",
      "ajustarAlto": false
    },
    "secciones": [
      {
        "id": "seccion-1",
        "titulo": {
          "es": "Nuestro equipo",
          "en": "Our Team"
        },
        "imagen": "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-carlos.webp",
        "texto": {
          "es": [
            "Asesoramiento personalizado por nuestro equipo de cuatro personas liderado por Carlos Albuixech.",
            "Nuestro equipo te ofrece asesoramiento personalizado para elegir la silueta, el color y los detalles que mejor encajan contigo y con la ocasión."
          ],
          "en": [
            "Personalised styling from our team of four, led by Carlos Albuixech.",
            "We listen to you to find the silhouette, the colour and the details that best speak of you."
          ]
        }
      },
      {
        "id": "seccion-2",
        "titulo": {
          "es": "El proceso",
          "en": "The Process"
        },
        "imagen": "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-fiesta-espacio-1.webp",
        "texto": {
          "es": [
            "Cada vestido de fiesta o diseño de novia requiere tiempo, oficio y una mirada precisa. En el atelier cuidamos el proceso para que cada detalle encuentre su lugar.",
            "Te acompañamos en cada prueba para que el vestido encuentre su forma definitiva: la tuya."
          ],
          "en": [
            "Behind every creation lies time, craft and a precise eye.",
            "We accompany you at every fitting so the dress finds its final shape: yours."
          ]
        }
      },
      {
        "id": "seccion-3",
        "titulo": {
          "es": "El espacio",
          "en": "The Space"
        },
        "imagen": "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-tienda-2.webp",
        "texto": {
          "es": [
            "Un lugar para descubrir Fely Campo de cerca.",
            "Visita el atelier de Fely Campo en Oviedo para conocer las colecciones, descubrir los tejidos de cerca y apreciar los detalles de cada diseño."
          ],
          "en": [
            "A place to discover Fely Campo up close.",
            "An intimate space to explore our collections, feel the fabrics and let yourself be carried away by the details."
          ]
        }
      },
      {
        "id": "seccion-4",
        "titulo": {
          "es": "Novia",
          "en": "Bridal"
        },
        "imagen": "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-fiesta-5.webp",
        "texto": {
          "es": [
            "Para un día que merece ser único.",
            "Creaciones pensadas para acompañarte con naturalidad, elegancia y personalidad desde el primer momento."
          ],
          "en": [
            "For a day that deserves to be unique.",
            "Creations designed to accompany you with naturalness, elegance and personality from the very first moment."
          ]
        }
      }
    ],
    "imagenesTira": [
      "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-foto-5.webp",
      "/media/web/img/atelier/atelier-oviedo/WhatsApp Video 2026-09-11 at 10.18.15.mp4",
      "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-fiesta-espacio-1.webp",
      "/media/web/img/atelier/atelier-oviedo/WhatsApp Video 2026-09-11 at 10.18.10.mp4"
    ],
    "contacto": {
      "nombre": "Atelier Oviedo",
      "direccion": [
        "C/ Gil de Jaz 15",
        "33004 Oviedo"
      ],
      "telefonos": [
        "+34 985 73 83 46",
        "+34 661 58 54 04"
      ],
      "whatsapp": "+34 661 58 54 04",
      "horario": {
        "es": "Lun - Sáb: 10:30 - 14:00 y 17:00 - 20:30",
        "en": "Mon - Sat: 10:30am - 2pm & 5pm - 8:30pm"
      },
      "descripcion": {
        "es": "Espacio dedicado a colecciones de fiesta. Además de contar con una sección de colecciones de novia.",
        "en": "Boutique and atelier in central Oviedo: ready-to-wear and made-to-order pieces."
      },
      "fotos": [
        "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-fiesta-espacio-1.webp",
        "/media/web/img/atelier/atelier-oviedo/fely-campo-atelier-oviedo-tienda-4-1.webp"
      ]
    }
  }
};
