// vosotras.js — fotos y reseñas de clientas de /atelier/vosotras,
// editables desde /admin/vosotras.
//
// SUSTITUTO PROVISIONAL DE LA BASE DE DATOS (igual que datos/blog.js): la
// web lo lee a través de lib/vosotras.js y el admin parte de aquí.
// Migrado tal cual desde el antiguo components/layout/vosotrasFotos.js
// (ver docs/ADMIN.md). Las fotos están en
// public/img/Clientes/CLIENTAS/ (y sus subcarpetas novias/ y finales/).
//
//   invitadas, novias   los "looks" de cada pestaña, en el orden de la
//                       cuadrícula. Un look = las fotos de una clienta:
//     id          fijo.
//     publicado   false = oculto en la web.
//     fotos       rutas; la primera es la portada de la casilla.
//   resenas       en el orden en que salen en la cuadrícula de Invitadas
//                 (una casilla cada dos filas):
//     id, publicado
//     firma       { es, en } quién la escribe ("Mari Carmen, Gijón").
//     look        id del look de la clienta ('' si no tiene fotos): al
//                 pulsar la casilla se abren sus fotos.
//     extracto    lo que se lee en la casilla de la cuadrícula (se le
//                 añade "(...)"). Texto literal de la clienta: no se traduce.
//     texto       la reseña entera, en párrafos, que se lee junto a sus
//                 fotos al abrirlas (solo si tiene look). No se traduce.

export const VOSOTRAS = {
  "invitadas": [
    {
      "id": "inv-01",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-madrina-azul-03.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-madrina-azul-01.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-madrina-azul-02.webp"
      ]
    },
    {
      "id": "inv-02",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-invitada-verde-01.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-invitada-verde-02.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-invitada-verde-03.webp"
      ]
    },
    {
      "id": "inv-03",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-invitada-turquesa-01.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-invitada-turquesa-02.webp"
      ]
    },
    {
      "id": "inv-04",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-madrina-review-1.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-madrina-review-2.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-madrina-review-1-1.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-madrina-review-1-2.webp"
      ]
    },
    {
      "id": "inv-05",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-madrinas.webp"
      ]
    },
    {
      "id": "inv-06",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-13-03.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-13-01.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-13-02.webp"
      ]
    },
    {
      "id": "inv-07",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-30-01.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-30-02.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-30-03.webp"
      ]
    },
    {
      "id": "inv-08",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-fiesta.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-fiesta-2.webp"
      ]
    },
    {
      "id": "inv-09",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras.webp"
      ]
    },
    {
      "id": "inv-10",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-madrinas.webp"
      ]
    },
    {
      "id": "inv-11",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-madrinas-look.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-madrinas-look-1-2.webp"
      ]
    },
    {
      "id": "inv-12",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-foto.webp"
      ]
    },
    {
      "id": "inv-13",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-madrinas-look-1.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-madrinas-look-12.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-madrinas-look-13.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-vosotras-madrinas-look-14.webp"
      ]
    },
    {
      "id": "inv-14",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-16-01.webp"
      ]
    },
    {
      "id": "inv-15",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-19-01.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-19-02.webp"
      ]
    },
    {
      "id": "inv-16",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-20-05.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-20-01.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-20-02.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-20-03.webp"
      ]
    },
    {
      "id": "inv-17",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-14-01.webp"
      ]
    },
    {
      "id": "inv-18",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-21-01.webp",
        "/media/web/img/Clientes/CLIENTAS/fely-campo-invitadas-reales-nuestras-21-02.webp"
      ]
    }
  ],
  "novias": [
    {
      "id": "nov-01",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-01.webp"
      ]
    },
    {
      "id": "nov-02",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-02.webp"
      ]
    },
    {
      "id": "nov-03",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-03.webp"
      ]
    },
    {
      "id": "nov-04",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-04.webp"
      ]
    },
    {
      "id": "nov-05",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-05.webp"
      ]
    },
    {
      "id": "nov-06",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-06.webp"
      ]
    },
    {
      "id": "nov-07",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-07.webp"
      ]
    },
    {
      "id": "nov-08",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-08.webp"
      ]
    },
    {
      "id": "nov-09",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-09.webp"
      ]
    },
    {
      "id": "nov-10",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-10.webp"
      ]
    },
    {
      "id": "nov-11",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-11.webp"
      ]
    },
    {
      "id": "nov-12",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-12.webp"
      ]
    },
    {
      "id": "nov-13",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-13.webp"
      ]
    },
    {
      "id": "nov-14",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-14.webp"
      ]
    },
    {
      "id": "nov-15",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-15.webp"
      ]
    },
    {
      "id": "nov-16",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-16.webp"
      ]
    },
    {
      "id": "nov-17",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/finales/fely-campo-novias-reales-17.webp"
      ]
    },
    {
      "id": "nov-18",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-01-01.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-01-02.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-01-03.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-01-04.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-01-05.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-01-06.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-01-07.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-01-08.webp"
      ]
    },
    {
      "id": "nov-19",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-03-01.webp"
      ]
    },
    {
      "id": "nov-20",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-04-01.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-04-02.webp"
      ]
    },
    {
      "id": "nov-21",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-09-01.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-09-02.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-09-03.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-09-04.webp"
      ]
    },
    {
      "id": "nov-22",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-10-01.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-10-02.webp"
      ]
    },
    {
      "id": "nov-23",
      "publicado": true,
      "fotos": [
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-13-01.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-13-02.webp",
        "/media/web/img/Clientes/CLIENTAS/novias/fely-campo-novias-reales-nuestras-13-03.webp"
      ]
    }
  ],
  "resenas": [
    {
      "id": "res-01",
      "publicado": true,
      "firma": {
        "es": "Madrina de boda",
        "en": "Mother of the groom"
      },
      "look": "inv-04",
      "extracto": "Feliz y orgullosa siendo la madrina de la boda de mi hijo pequeño. Fue uno de los días más felices y entrañables de mi vida. Estoy muy agradecida a Fely que diseñó mi vestido, me sentí elegante, cómoda y, mal es decirlo, muy guapa",
      "texto": [
        "Feliz y orgullosa siendo la madrina de la boda de mi hijo pequeño. Fue uno de los días más felices y entrañables de mi vida.",
        "Estoy muy agradecida a Fely que diseñó mi vestido, me sentí elegante, cómoda y, mal es decirlo, muy guapa. Admiro su trabajo y sobre todo su filosofía de trabajo. Un orgullo para Salamanca.",
        "La artífice fue Charo que, con su psicología para captar lo que la cliente quisiera, acierta totalmente en aconsejar. Es paciente, amable, cariñosa y supo ver desde el primer día lo que quería. No tengo palabras para agradecer su trato exquisito."
      ]
    },
    {
      "id": "res-02",
      "publicado": true,
      "firma": {
        "es": "Mari Carmen, Gijón",
        "en": "Mari Carmen, Gijón"
      },
      "look": "",
      "extracto": "La boda de Rubén salió fenomenal, nos acompañó un día de sol espectacular y yo me encontré estupenda con el traje y los complementos. Agradeceros todo el proceso y la paciencia que conmigo habéis tenido",
      "texto": []
    }
  ]
};
