// talleres.js — contenido de /talleres-fely-campo ("Nuestros talleres"),
// editable desde /admin/paginas/talleres.
//
// SUSTITUTO PROVISIONAL DE LA BASE DE DATOS (igual que datos/landing.js):
// la web lo lee a través de lib/talleres.js y el admin parte de aquí.
// Migrado tal cual de app/[locale]/talleres-fely-campo/talleres.js y de
// messages/*.json (título y entradilla). Ver docs/ADMIN.md.
//
// Textos siempre { es, en }; los párrafos, listas { es: [...], en: [...] }.
//
//   hero          imagen, titulo ("Nuestros talleres"), lema (subtítulo
//                 del hero y título de la entradilla) e intro (párrafos
//                 de la entradilla).
//   talleres      en el orden de la web:
//     nombre      "Taller propio", "Taller I"… También es el filtro.
//     ubicacion   segunda línea ("72 km desde nuestro taller…").
//     responsable tercera línea, opcional ("Liderado por Blanca").
//     parrafos    texto del taller.
//     medios      fotos y vídeos del carrusel, en orden (rutas; los
//                 vídeos se reconocen por la extensión .mp4/.webm).

export const TALLERES = {
  "hero": {
    "imagen": "/media/web/img/talleres/inhouse/ateliernovia-lamedida-felycampo-2.webp",
    "titulo": {
      "es": "Nuestros talleres",
      "en": "Our Workshops"
    },
    "lema": {
      "es": "Donde las manos cuentan historias",
      "en": "Where hands tell stories"
    },
    "intro": {
      "es": [
        "Cada pieza Fely Campo nace cerca. En nuestro atelier y en dos pequeños talleres de la sierra, manos expertas transforman cada tejido con tiempo, precisión y sensibilidad. Detrás de esas manos hay mujeres, oficio y territorio."
      ],
      "en": [
        "Every Fely Campo piece is born close by. In our atelier and two small workshops in the sierra, skilled hands transform each fabric with time, precision and sensitivity. Behind those hands are women, craft and territory."
      ]
    }
  },
  "talleres": [
    {
      "id": "taller-inhouse",
      "nombre": {
        "es": "Taller propio",
        "en": "In-house workshop"
      },
      "ubicacion": {
        "es": "Nuestro taller principal",
        "en": "Our main workshop"
      },
      "responsable": {
        "es": "",
        "en": ""
      },
      "parrafos": {
        "es": [
          "En Salamanca se encuentra el lugar donde todo comienza: nuestro atelier. Es aquí donde nacen las ideas, se prueban los primeros prototipos y ocurre toda la magia de Fely Campo.",
          "En este espacio trabajamos los diseños, creamos los patrones y seleccionamos los tejidos que darán forma a cada colección. Una vez definidos, las piezas se cortan y se envían a nuestros talleres de apoyo, donde continúa el proceso de confección con el mismo cuidado y dedicación."
        ],
        "en": [
          "In Salamanca lies the place where it all begins: our atelier. This is where ideas are born, the first prototypes are tried on and all the magic of Fely Campo happens.",
          "In this space we develop the designs, create the patterns and select the fabrics that will shape each collection. Once defined, the pieces are cut and sent to our partner workshops, where the making process continues with the same care and dedication."
        ]
      },
      "medios": [
        "/media/web/img/talleres/inhouse/artesany-2.mp4",
        "/media/web/img/talleres/inhouse/ateliernovia-lamedida-felycampo-2.webp",
        "/media/web/img/talleres/inhouse/fely-campo-taller-salamanca-foto.webp",
        "/media/web/img/talleres/inhouse/fely-campo-taller-salamanca-foto-2.webp",
        "/media/web/img/talleres/inhouse/fely-campo-taller-salamanca-foto-3.webp"
      ]
    },
    {
      "id": "taller-1",
      "nombre": {
        "es": "Taller I",
        "en": "Workshop I"
      },
      "ubicacion": {
        "es": "72 km desde nuestro taller en Salamanca",
        "en": "72 km from our workshop in Salamanca"
      },
      "responsable": {
        "es": "Liderado por Blanca",
        "en": "Led by Blanca"
      },
      "parrafos": {
        "es": [
          "Su historia con la costura inició cuando ella cumple 12 años, cuando su madre la llevó a aprender con una modista. A los 16, cuando antaño se podía empezar a trabajar, entró en una fábrica y desde entonces coser se convirtió en su manera de estar en el mundo: es lo que ama, lo que conoce y lo que sigue haciendo, cada día, con la misma entrega.",
          "Después de pasar por distintas fábricas y ver cómo fueron cerrando una tras otra, hace 13 años abrió su propio taller. Fue entonces cuando comenzó también su historia con Fely Campo, una relación construida puntada a puntada, desde el oficio, la constancia y el amor por hacer las cosas bien.",
          "Su lugar de trabajo habla de ella. Está lleno de plantas y flores, de fotos de sus mascotas y de su familia, de dos canarios en la ventana rodeados de verde, y de frases sobre la historia de la moda que cubren las paredes. Un taller lleno de vida, donde la costura no es solo un oficio, sino una forma de habitar el tiempo."
        ],
        "en": [
          "Her story with sewing began when she turned 12, when her mother took her to learn from a dressmaker. At 16 — back when you could start working at that age — she joined a factory, and from then on sewing became her way of being in the world: it’s what she loves, what she knows, and what she still does, every day, with the same dedication.",
          "After working in several factories and watching them close down one after another, she opened her own workshop 13 years ago. That was also when her story with Fely Campo began — a relationship built stitch by stitch, out of craft, perseverance and a love of doing things well.",
          "Her workshop speaks of her. It’s full of plants and flowers, photos of her pets and her family, two canaries by the window surrounded by greenery, and quotes about the history of fashion covering the walls. A workshop full of life, where sewing isn’t just a craft but a way of inhabiting time."
        ]
      },
      "medios": [
        "/media/web/img/talleres/bejar/fely-campo-taller-bejar-foto-01.webp",
        "/media/web/img/talleres/bejar/fely-campo-taller-bejar-foto-02.webp",
        "/media/web/img/talleres/bejar/fely-campo-taller-bejar-foto-03.webp",
        "/media/web/img/talleres/bejar/fely-campo-taller-bejar-foto-04.webp",
        "/media/web/img/talleres/bejar/fely-campo-taller-bejar-foto-05.webp",
        "/media/web/img/talleres/bejar/fely-campo-taller-bejar-foto-06.webp"
      ]
    },
    {
      "id": "taller-2",
      "nombre": {
        "es": "Taller II",
        "en": "Workshop II"
      },
      "ubicacion": {
        "es": "54 km desde nuestro taller en Salamanca",
        "en": "54 km from our workshop in Salamanca"
      },
      "responsable": {
        "es": "Liderado por María José",
        "en": "Led by María José"
      },
      "parrafos": {
        "es": [
          "En Tamames, el tiempo se mide con experiencia y sueños cumplidos.",
          "María José lleva 44 años dedicándose a la costura. Amalia, 25. Isabel, 36. Amalia e Isabel son hermanas, y las tres comparten mucho más que un oficio. Realmente es una pasión.",
          "Hace 35 años trabajaban juntas en un pequeño taller de la misma calle para otros costureros. Desde su ventana veían, justo enfrente, el espacio que algún día imaginaron como propio. Un lugar más grande, más suyo, donde continuar haciendo aquello que sabían hacer con las manos y con el corazón.",
          "Un día cruzaron la calle.",
          "Desde entonces, aquel taller soñado se convirtió en su lugar de trabajo. Y desde hace 19 años, también forma parte de la historia de Fely Campo. En los tablones de corcho conviven pequeñas estampas religiosas, que colecciona Amalia, con una fotografía de David Bustamante, el favorito de María José. Pequeños gestos que han acumulado por el paso de los años y hablan de ellas, convirtiendo el espacio de trabajo en algo íntimo y propio.",
          "Tres mujeres, décadas de oficio y una manera de entender la costura que no se aprende deprisa. Se transmite, se perfecciona y se conserva."
        ],
        "en": [
          "In Tamames, time is measured in experience and dreams come true.",
          "María José has been sewing for 44 years. Amalia, 25. Isabel, 36. Amalia and Isabel are sisters, and the three of them share much more than a craft — it’s truly a passion.",
          "Thirty-five years ago they worked together in a small workshop on the same street, for other tailors. From their window they could see, right across the street, the space they once imagined as their own: somewhere bigger, more theirs, where they could keep doing what they knew how to do with their hands and their heart.",
          "One day they crossed the street.",
          "Since then, that dreamed-of workshop became their workplace. And for the past 19 years, it has also been part of Fely Campo’s story. On the corkboards, small religious prints collected by Amalia sit alongside a photo of David Bustamante, María José’s favourite. Small details gathered over the years that speak of who they are, turning the workspace into something intimate and their own.",
          "Three women, decades of craft, and a way of understanding sewing that isn’t learned quickly. It’s passed down, refined, and kept alive."
        ]
      },
      "medios": [
        "/media/web/img/talleres/tamares/fely-campo-taller-tamares-foto-00.webp",
        "/media/web/img/talleres/tamares/fely-campo-taller-tamares-foto-01.webp",
        "/media/web/img/talleres/tamares/fely-campo-taller-tamares-foto-02.webp",
        "/media/web/img/talleres/tamares/fely-campo-taller-tamares-foto-03.webp",
        "/media/web/img/talleres/tamares/fely-campo-taller-tamares-foto-04.webp",
        "/media/web/img/talleres/tamares/fely-campo-taller-tamares-foto-05.webp",
        "/media/web/img/talleres/tamares/fely-campo-taller-tamares-foto-06.webp",
        "/media/web/img/talleres/tamares/fely-campo-taller-tamares-foto-07.webp"
      ]
    }
  ]
};
