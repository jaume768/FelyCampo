// sobreFely.js — contenido de /sobre-fely ("Una vida entre telas"),
// editable desde /admin/paginas/sobre-fely.
//
// SUSTITUTO PROVISIONAL DE LA BASE DE DATOS (igual que datos/landing.js):
// la web lo lee a través de lib/sobreFely.js y el admin parte de aquí.
// Migrado tal cual de app/[locale]/sobre-fely/sobreFely.js y de
// messages/*.json (título y subtítulo del hero). Ver docs/ADMIN.md.
//
// Textos siempre { es, en }; los párrafos, listas { es: [...], en: [...] }.
// Un texto opcional vacío ("") no se pinta.
//
//   hero          imagen, titulo ("Fely Campo"), subtitulo.
//   capitulos     en el orden de la web (la foto principal alterna de lado):
//     etiqueta    título corto ("El comienzo").
//     titulo      subtítulo ("13 años. Un camino inesperado.").
//     parrafos    cuerpo de texto.
//     imagenes    [{ src, pie }], de 1 a 6 (lib/sobreFely.js): la 1.ª es
//                 la principal, junto al texto; si hay una más, va
//                 debajo del texto; si hay dos o más, todas las demás
//                 van en filas de dos debajo del capítulo (si sobra
//                 una, centrada).
//   cierre        titulo y parrafos antes de la tarjeta del documental.
//   documental    titulo, texto, imagen y enlace (dirección externa).

export const SOBRE_FELY = {
  "hero": {
    "imagen": "/media/web/img/about-felycampo/fely-campo-sobre-fely-campo-conoce-a-disenadora.jpg",
    "titulo": {
      "es": "Fely Campo",
      "en": "Fely Campo"
    },
    "subtitulo": {
      "es": "Una vida entre telas",
      "en": "A life among fabrics"
    }
  },
  "capitulos": [
    {
      "id": "el-comienzo",
      "etiqueta": {
        "es": "El comienzo",
        "en": "The beginning"
      },
      "titulo": {
        "es": "13 años. Un camino inesperado.",
        "en": "13 years old. An unexpected path."
      },
      "parrafos": {
        "es": [
          "Tenía 13 años cuando mi vida empezó a tomar un rumbo que nunca habría imaginado. Con una timidez casi enfermiza y en el momento en que suspendí los estudios, mi madre decidió mandarme a un pequeño taller, sin saber que aquel lugar acabaría marcando mi futuro. Era una niña muy introvertida, incapaz de encontrar mi sitio en el mundo, y no podía imaginar que entre telas, agujas e hilos descubriría una forma de expresarme que iba mucho más allá de la ropa.",
          "A veces, la vida no te lleva por el camino que habías pensado, sino por aquel que, sin saberlo, estabas destinada a encontrar."
        ],
        "en": [
          "I was 13 when my life began to take a direction I could never have imagined. Almost painfully shy, and just as I failed at school, my mother decided to send me to a small workshop, unaware that the place would end up shaping my future. I was a deeply introverted girl, unable to find my place in the world, and I could not have imagined that among fabrics, needles and threads I would discover a way of expressing myself that went far beyond clothing.",
          "Sometimes life does not take you down the path you had planned, but down the one you were, without knowing it, destined to find."
        ]
      },
      "imagenes": [
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-comienzo.webp",
          "pie": {
            "es": "",
            "en": ""
          }
        }
      ]
    },
    {
      "id": "el-primer-vestido",
      "etiqueta": {
        "es": "El primer vestido",
        "en": "The first dress"
      },
      "titulo": {
        "es": "14 años. Descubrir una forma de expresarme.",
        "en": "14 years old. Discovering a way to express myself."
      },
      "parrafos": {
        "es": [
          "A los 14 años hice mi primer vestido. Tenía una inseguridad asombrosa; me costaba hablar, relacionarme y mostrar lo que llevaba dentro, pero cuando me puse aquel vestido, descubrí algo que no esperaba; podía esconderme detrás de él y, al mismo tiempo, sentirme fuerte. Comprendí, aunque todavía no supiera explicarlo, que la ropa podía cambiar nuestra manera de sentirnos, ayudarnos a encontrar nuestra voz y revelar quiénes somos. No hay ninguna fotografía de ese primer vestido, pero su imagen sigue presente en mi memoria."
        ],
        "en": [
          "At 14 I made my first dress. I was astonishingly insecure; I found it hard to speak, to connect with others and to show what I carried inside, but when I put that dress on, I discovered something I did not expect: I could hide behind it and, at the same time, feel strong. I understood, even if I could not yet explain it, that clothes could change the way we feel, help us find our voice and reveal who we are. There is no photograph of that first dress, but its image is still alive in my memory."
        ]
      },
      "imagenes": [
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-elprimervestido.webp",
          "pie": {
            "es": "Fely Campo en el año 1989 en su atelier de Salamanca",
            "en": "Fely Campo in 1989 at her atelier in Salamanca"
          }
        }
      ]
    },
    {
      "id": "la-primera-novia",
      "etiqueta": {
        "es": "La primera novia",
        "en": "The first bride"
      },
      "titulo": {
        "es": "15 años. El primer traje de novia.",
        "en": "15 years old. The first wedding dress."
      },
      "parrafos": {
        "es": [
          "Con 15 años hice mi primer vestido de novia. Era muy joven, pero aquel encargo me permitió descubrir una dimensión diferente de la moda. Detrás de un vestido había una mujer ilusionada con ese día que recordaría toda su vida. Sin darme cuenta, estaba descubriendo que quería crear prendas que no solo vistieran a una mujer, sino que la hicieran sentirse ella misma. Otro vestido que siempre permanecerá archivado en mi memoria."
        ],
        "en": [
          "At 15 I made my first wedding dress. I was very young, but that commission let me discover a different dimension of fashion. Behind a dress there was a woman excited about a day she would remember all her life. Without realising it, I was discovering that I wanted to create garments that would not only dress a woman, but make her feel like herself. Another dress that will always remain archived in my memory."
        ]
      },
      "imagenes": [
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-vestido-novia-1.webp",
          "pie": {
            "es": "",
            "en": ""
          }
        },
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-vestido-novia-2.webp",
          "pie": {
            "es": "Diseño de novia de Fely Campo de la década de los 80",
            "en": "A Fely Campo bridal design from the 1980s"
          }
        },
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-vestido-novia-3.webp",
          "pie": {
            "es": "",
            "en": ""
          }
        }
      ]
    },
    {
      "id": "aprender-el-oficio",
      "etiqueta": {
        "es": "Aprender el oficio",
        "en": "Learning the craft"
      },
      "titulo": {
        "es": "El valor de lo que no siempre se ve.",
        "en": "The value of what is not always seen."
      },
      "parrafos": {
        "es": [
          "El taller fue mi escuela. Descubrí que detrás de cada prenda hay mucho más de lo que se aprecia a primera vista; horas de trabajo, conocimiento, paciencia y una atención casi invisible a cada detalle. Aprendí observando, practicando, equivocándome y volviendo a empezar.",
          "Con los años entendí que la creatividad necesita del oficio para hacerse realidad y que la verdadera calidad nace de esa unión. Ese aprendizaje sigue presente en mi manera de trabajar, en el respeto por los materiales, en el cuidado de cada patrón y en la convicción de que las cosas bien hechas requieren dedicación."
        ],
        "en": [
          "The workshop was my school. I discovered that behind every garment there is much more than meets the eye: hours of work, knowledge, patience and an almost invisible attention to every detail. I learned by watching, practising, making mistakes and starting again.",
          "Over the years I understood that creativity needs craft to become real, and that true quality is born from that union. That learning is still present in the way I work: in respect for materials, in the care given to every pattern and in the conviction that things done well require dedication."
        ]
      },
      "imagenes": [
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-aprendereloficio-1.webp",
          "pie": {
            "es": "Fotografía de Fely Campo, 1996",
            "en": "Fely Campo, 1996"
          }
        },
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-aprendereloficio-2.webp",
          "pie": {
            "es": "Fotografía de Fely Campo en su atelier en 1996",
            "en": "Fely Campo at her atelier in 1996"
          }
        }
      ]
    },
    {
      "id": "nace-la-firma",
      "etiqueta": {
        "es": "Nace la firma Fely Campo",
        "en": "The Fely Campo label is born"
      },
      "titulo": {
        "es": "1997. Una forma propia de entender la moda.",
        "en": "1997. A way of understanding fashion of my own."
      },
      "parrafos": {
        "es": [
          "En 1997, todo aquel aprendizaje, aquella pasión y tantos años de dedicación tomaron forma en una firma propia: Fely Campo. Lo que había comenzado casi por casualidad se había convertido en una manera de entender la vida y en el deseo de crear con una identidad. Empezaba una nueva etapa, llena de retos, decisiones y oportunidades para llevar mi visión más lejos.",
          "La firma fue creciendo, las colecciones fueron encontrando su lugar y el trabajo comenzó a trascender el pequeño taller donde todo había empezado. Pero, en el fondo, la esencia seguía siendo la misma; crear desde la sensibilidad, cuidar el oficio y diseñar para mujeres que quieren sentirse seguras, elegantes y fieles a sí mismas."
        ],
        "en": [
          "In 1997, all that learning, that passion and so many years of dedication took shape in a label of my own: Fely Campo. What had begun almost by chance had become a way of understanding life and a desire to create with a distinct identity. A new chapter was beginning, full of challenges, decisions and opportunities to take my vision further.",
          "The label grew, the collections found their place and the work began to reach beyond the small workshop where it had all started. But, deep down, the essence remained the same: to create with sensitivity, to care for the craft and to design for women who want to feel confident, elegant and true to themselves."
        ]
      },
      "imagenes": [
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-primeratelier-1.webp",
          "pie": {
            "es": "",
            "en": ""
          }
        },
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-primeratelier-2.webp",
          "pie": {
            "es": "Primera boutique de Fely Campo en Salamanca, 1995",
            "en": "Fely Campo’s first boutique in Salamanca, 1995"
          }
        },
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-gridimages-1-2.webp",
          "pie": {
            "es": "Modelo con diseño Fely Campo en uno de sus desfiles (2014)",
            "en": "A model wearing Fely Campo at one of her shows (2014)"
          }
        },
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-gridimages-1.webp",
          "pie": {
            "es": "Fely Campo en el backstage de uno de sus desfiles de Salamanca (década de los 90)",
            "en": "Fely Campo backstage at one of her shows in Salamanca (1990s)"
          }
        },
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-gridimages-2.webp",
          "pie": {
            "es": "Fely Campo saliendo a saludar tras uno de sus desfiles de Salamanca (década de los 90)",
            "en": "Fely Campo taking her bow after one of her shows in Salamanca (1990s)"
          }
        },
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-gridimages-2-2.webp",
          "pie": {
            "es": "Encuentro con el diseño japonés en el Jardín de Salamanca en 2002",
            "en": "An encounter with Japanese design at the Jardín de Salamanca, 2002"
          }
        }
      ]
    },
    {
      "id": "hoy",
      "etiqueta": {
        "es": "Hoy",
        "en": "Today"
      },
      "titulo": {
        "es": "Una historia que sigue viva.",
        "en": "A story that is still alive."
      },
      "parrafos": {
        "es": [
          "Hoy, después de más de cinco décadas vinculada a la moda, sigo encontrando algo de aquella niña tímida en cada nueva creación. Continúo emocionándome al descubrir un tejido, imaginar una silueta o ver cómo una mujer se reconoce en una prenda.",
          "Han cambiado los años, las experiencias y las dimensiones del proyecto, pero hay algo que permanece intacto; la necesidad de crear para que las mujeres, a través de la moda, se vean a ellas mismas. Fely Campo es hoy el resultado de todo ese recorrido, de las manos que trabajan, del conocimiento que se transmite y de una forma de hacer que respeta el tiempo y los detalles.",
          "Cuando miro atrás, pienso que nunca imaginé hasta dónde me llevaría aquel primer vestido. Y, sin embargo, sigo persiguiendo la misma sensación que tuve entonces, la emoción de crear algo capaz de hacer sentir diferente a una mujer."
        ],
        "en": [
          "Today, after more than five decades devoted to fashion, I still find something of that shy girl in every new creation. I am still moved when I discover a fabric, imagine a silhouette or see a woman recognise herself in a garment.",
          "The years, the experiences and the scale of the project have changed, but something remains intact: the need to create so that women, through fashion, can see themselves. Fely Campo today is the result of that whole journey, of the hands that work, of the knowledge that is passed on and of a way of doing things that respects time and detail.",
          "When I look back, I think I never imagined how far that first dress would take me. And yet I am still chasing the same feeling I had then: the thrill of creating something that can make a woman feel different."
        ]
      },
      "imagenes": [
        {
          "src": "/media/web/img/about-felycampo/sobre-fely-campo/fely-campo-sobre-fely-campo-elegir-27.webp",
          "pie": {
            "es": "Fely Campo en la actualidad",
            "en": "Fely Campo today"
          }
        }
      ]
    }
  ],
  "cierre": {
    "titulo": {
      "es": "Una vida entre telas. Una historia que sigue.",
      "en": "A life among fabrics. A story that goes on."
    },
    "parrafos": {
      "es": [
        "Todo empezó con una niña que encontró fuerza en la moda como forma de expresarse al mundo. Hoy, esa misma pasión sigue dando vida a cada creación de Fely Campo.",
        "A lo largo de estos años he recibido numerosos premios. No es necesario enumerarlos, dado que el mayor premio para mí es el agradecimiento de mis clientas."
      ],
      "en": [
        "It all began with a girl who found strength in fashion as a way of expressing herself to the world. Today, that same passion still brings every Fely Campo creation to life.",
        "Over the years I have received many awards. There is no need to list them, since the greatest award for me is the gratitude of my clients."
      ]
    }
  },
  "documental": {
    "titulo": {
      "es": "Conoce a Fely Campo - Documental",
      "en": "Conoce a Fely Campo - Documental"
    },
    "texto": {
      "es": "54 cintas de vídeo resumen parte de mi historia",
      "en": "54 video tapes summarise part of my story"
    },
    "imagen": "/media/web/img/about-felycampo/fely-campo-sobre-fely-campo-documenta-54oldtapes-2.webp",
    "enlace": "https://www.youtube.com/watch?is=8lcOXOn4hPIHgaWe&v=QgepxasStTI&feature=youtu.be"
  }
};
