// atelierNovias.js
//
// DATOS DE ATELIER NOVIAS — colecciones y looks. Fuente única de las
// fichas de /atelier/novias/<look>, de sus páginas de categoría, del
// sitemap y de los datos SEO, y de lo que edita /admin/colecciones/novia.
// Nadie lee este array directamente: web y admin pasan por las funciones
// de src/lib/catalogoNovias.js.
//
// PARA EL PROGRAMADOR: sustituto provisional de la base de datos, con la
// misma forma que datos/atelierFiesta.js (ver docs/ADMIN.md).
// Generado el 2026-11-06 a partir de components/layout/noviaProductos.js
// (y sus -info.xlsx), sin cambiar nada de lo publicado: mismos nombres
// (dan las URLs), referencias, fotos en el mismo orden y descripciones.
//
// COLECCIÓN
//   id, nombre   "Bride 27"…
//   visible      si sus looks se ven en la web: su ficha, las páginas de
//                categoría de Novias y el sitemap. Oculta = no se ven en
//                ningún sitio (la ficha lleva a /atelier/novias con una
//                redirección temporal). Desde el 2026-11-07 todas ocultas
//                (a petición): /atelier/novias es solo editorial.
//   portada      foto de la colección (solo se usa en el admin).
//   carpeta      carpeta de sus fotos en public/img/collections/novia.
//   looks        en el orden en que salen (por su número).
//
// LOOK
//   id               identificador fijo (= la URL con la que se creó).
//   nombre           tal cual se ve ("Look 1 - ME Bridal"). Da la URL.
//   sku              referencia ("Ref." en la ficha). Opcional.
//   publicado        false = oculto: no sale en ningún sitio de la web.
//   descripcion      { es, en }. Vacía = texto automático (ver
//                    catalogoNovias.js); en inglés vacía = la española.
//   imagenes         rutas en orden: la 1.ª es la de la tarjeta y la ficha.
//   tags             estilo y silueta del excel, para los filtros de las
//                    páginas de categoría (no se editan en el admin).
//   slugsAnteriores  URLs antiguas si se renombró ya publicado (301).

export const COLECCIONES_NOVIAS = [
  {
    "id": "bride-27",
    "nombre": "Bride 27",
    "visible": false,
    "portada": "/media/web/img/collections/novia/Bride27-cover.webp",
    "carpeta": "bride-27",
    "looks": [
      {
        "id": "look-1-bride-27",
        "nombre": "Look 1 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-1.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-1-2.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-1-3.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-2-bride-27",
        "nombre": "Look 2 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-2.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-3-bride-27",
        "nombre": "Look 3 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-3.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-4-bride-27",
        "nombre": "Look 4 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-4.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-4-2.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-5-bride-27",
        "nombre": "Look 5 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-5.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-5-2.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-6-bride-27",
        "nombre": "Look 6 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-6.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-7-bride-27",
        "nombre": "Look 7 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-7.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-7-2.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-8-bride-27",
        "nombre": "Look 8 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-8.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-9-bride-27",
        "nombre": "Look 9 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-9.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-10-bride-27",
        "nombre": "Look 10 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-10.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-10-2.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-10-3.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-11-bride-27",
        "nombre": "Look 11 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-11.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-11-2.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-12-bride-27",
        "nombre": "Look 12 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-12.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-13-bride-27",
        "nombre": "Look 13 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-13-1.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-13-2.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-14-bride-27",
        "nombre": "Look 14 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-14-1.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-15-bride-27",
        "nombre": "Look 15 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-15-1.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-15-2-1.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-16-bride-27",
        "nombre": "Look 16 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-16-3.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-16-2.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-16.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-17-bride-27",
        "nombre": "Look 17 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-17.webp",
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-17-2.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-18-bride-27",
        "nombre": "Look 18 - Bride 27",
        "sku": "",
        "publicado": true,
        "descripcion": {
          "es": "Vestido Novia nueva colección 26/27",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-19.webp"
        ],
        "tags": [
          "Bride 27"
        ],
        "slugsAnteriores": []
      }
    ]
  },
  {
    "id": "me",
    "nombre": "ME",
    "visible": false,
    "portada": "/media/web/img/collections/novia/ME-cover.webp",
    "carpeta": "me",
    "looks": [
      {
        "id": "look-1-me-bridal",
        "nombre": "Look 1 - ME Bridal",
        "sku": "23303 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido de líneas lápiz, con detalle pieza corsé en cintura. Escote en espalda cuadrado pronunciado. Detalle de manga abullonada en satén azul.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-1-2.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-1-1.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-1-3.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-1-4.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-2-me-bridal",
        "nombre": "Look 2 - ME Bridal",
        "sku": "23308 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido de línea recta inspiración años 20, con detalles de banda encaje en cuerpo, falda tableada con ligeros recogidos. Detalle de botones y caídas con satén azul.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-2-1.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-2-2.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-3-me-bridal",
        "nombre": "Look 3 - ME Bridal",
        "sku": "23303 V C",
        "publicado": true,
        "descripcion": {
          "es": "Vestido de líneas lápiz, con detalle pieza corsé en cintura. Escote en espalda cuadrado pronunciado. Detalle de manga abullonada en satén azul. Capa en gasa de Seda",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-3-2.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-3-3.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-3-4.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-3-1.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-4-me-bridal",
        "nombre": "Look 4 - ME Bridal",
        "sku": "23301 A - 23304 V",
        "publicado": true,
        "descripcion": {
          "es": "Abrigo de manga japonesa abullonadas, con detalle de escote en espalda con cuello al bies, colas cuadradas. Combinado con vestido de satén con brillo de silueta lápiz con espalda volada.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-4-3.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-4-2.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-4-4.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-4-1.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-5-me-bridal",
        "nombre": "Look 5 - ME Bridal",
        "sku": "23305 V F",
        "publicado": true,
        "descripcion": {
          "es": "Conjunto 3 piezas de cuerpo de encaje, con manga abullonada y abertura en espalda. Combinación de raso y falda de tafetán en línea A con grandes godets.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-5-2.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-5-4.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-5-3.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-5-1.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-6-me-bridal",
        "nombre": "Look 6 - ME Bridal",
        "sku": "23304 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido de escote recto, con tirante fino, de líneas puras con detalle de escote espalda separada, Confeccionado en raso de seda.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-6-2.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-6-1.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-6-4.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-6-3.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-7-me-bridal",
        "nombre": "Look 7 - ME Bridal",
        "sku": "23310 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido de línea A, con esote bañera, hombros al descubiertos, manga larga. En delantero detalle abullonado en satén, en espalda escote cuadrado. Confeccionado en crep.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-7-4.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-7-3.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-7-1.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-7-6.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-7-2.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-7-5.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-8-me-bridal",
        "nombre": "Look 8 - ME Bridal",
        "sku": "23MB25 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido de largos asimétricos, corto por delante y con cola. Escote cuadrado muy pronunciado en espalda, confeccionado en tafetán con textura y detalle de pedrería con perlas en delantero. Manguitos con caídas largas.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-83.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-82.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-81.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-9-me-bridal",
        "nombre": "Look 9 - ME Bridal",
        "sku": "23302 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido línea A, con manga larga, y escote pronunciado en espalda. Confeccionado en raso con flores brocadas, con detalle de botones en espalda en satén azul.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-94.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-92.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-91.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-93.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-10-me-bridal",
        "nombre": "Look 10 - ME Bridal",
        "sku": "23307 A - 23306 V",
        "publicado": true,
        "descripcion": {
          "es": "Abrigo de líneas geométricas, con cuello chimenea, y abertura pronunciada en espalda con colas. Combinado con vestido de saten tafetanado, de falda tableada.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-103.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-101.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-102.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-11-me-bridal",
        "nombre": "Look 11 - ME Bridal",
        "sku": "23314 C - 23309 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido de silueta sirena, confeccionado en crep. Con hombro metido y escote delantero a pico. Detalle de tul bordado en flores de perlas y lentejuelas en cuerpo. Capa confeccionada en crep, con gran vuelo.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-111.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-112.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-113.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-12-me-bridal",
        "nombre": "Look 12 - ME Bridal",
        "sku": "23306 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido entallado en cuerpo, con falda de vuelo tableada. Detalle de cinturón lazos a altura de cadera. Confeccionado en satén tafetaneado.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-122.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-121.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-123.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-13-me-bridal",
        "nombre": "Look 13 - ME Bridal",
        "sku": "23MB22 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido midi, silueta A, con cancán pronunciado en falda, de tules. Escote en espalda. Confeccionado a mano en red de pedrería y perlas.",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-132.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-131.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-133.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-14-me-bridal",
        "nombre": "Look 14 - ME Bridal",
        "sku": "23311 V",
        "publicado": true,
        "descripcion": {
          "es": "Vestido baby doll, confeccionado en tul y encaje de red con tonos holográficos. Escotes cuadrados pronunciados. Detalle de guantes abullonados",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-142.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-143.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-144.webp",
          "/media/web/img/collections/novia/me/fely-campo-coleccion-novia-me-look-141.webp"
        ],
        "tags": [
          "ME"
        ],
        "slugsAnteriores": []
      }
    ]
  },
  {
    "id": "bambu",
    "nombre": "Bambú Novia",
    "visible": false,
    "portada": "/media/web/img/collections/novia/Bambu-cover.webp",
    "carpeta": "bambu",
    "looks": [
      {
        "id": "look-1-bambu-novia",
        "nombre": "Look 1 - Bambú Novia",
        "sku": "N0001",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-1-2.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-1-3.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-1.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Diferente",
          "Escote espalda",
          "Fluido",
          "Manga",
          "Romántico",
          "Sirena"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-2-bambu-novia",
        "nombre": "Look 2 - Bambú Novia",
        "sku": "22204 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-2.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-2-2.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Clásico",
          "Escote espalda",
          "Fluido",
          "Manga",
          "Minimal",
          "Recto"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-3-bambu-novia",
        "nombre": "Look 3 - Bambú Novia",
        "sku": "22202 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-3.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-3-2.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Clásico",
          "Princesa",
          "Romántico"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-4-bambu-novia",
        "nombre": "Look 4 - Bambú Novia",
        "sku": "20187 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-4.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-4-3.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-4-2.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Cola",
          "Corte A",
          "Diferente",
          "Dos piezas",
          "Escote espalda",
          "Fluido",
          "Lencero",
          "Minimal",
          "Sirena"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-5-bambu-novia",
        "nombre": "Look 5 - Bambú Novia",
        "sku": "14210 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-5.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-5-3.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-5-2.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Diferente",
          "Escote espalda",
          "Sirena"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-6-bambu-novia",
        "nombre": "Look 6 - Bambú Novia",
        "sku": "19184 P",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-6-2.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-6-3.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-6-4.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-6.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Corte A",
          "Diferente",
          "Dos piezas",
          "Fluido",
          "Manga",
          "Minimal",
          "Recto"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-7-bambu-novia",
        "nombre": "Look 7 - Bambú Novia",
        "sku": "22201 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-7.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-7-2.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Clásico",
          "Cola",
          "Dos piezas",
          "Escote espalda",
          "Fluido",
          "Lencero",
          "Minimal",
          "Recto",
          "Romántico",
          "Sirena"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-8-bambu-novia",
        "nombre": "Look 8 - Bambú Novia",
        "sku": "20172 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-8.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-8-3.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-8-4.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-8-2.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Cola",
          "Diferente",
          "Dos piezas",
          "Escote espalda",
          "Princesa",
          "Romántico"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-9-bambu-novia",
        "nombre": "Look 9 - Bambú Novia",
        "sku": "20183 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-9.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-9-2.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Clásico",
          "Manga",
          "Princesa"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-10-bambu-novia",
        "nombre": "Look 10 - Bambú Novia",
        "sku": "19184 C _ 19161 P",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-10.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-10-2.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Clásico",
          "Diferente",
          "Dos piezas",
          "Escote espalda",
          "Fluido",
          "Lencero",
          "Manga",
          "Minimal"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-11-bambu-novia",
        "nombre": "Look 11 - Bambú Novia",
        "sku": "20210 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-11.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Clásico",
          "Fluido",
          "Manga",
          "Midi",
          "Minimal",
          "Recto"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-12-bambu-novia",
        "nombre": "Look 12 - Bambú Novia",
        "sku": "20115 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-12.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-12-3.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-12-2.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-12-4.webp"
        ],
        "tags": [
          "Bambú Novia",
          "Cola",
          "Corte A",
          "Diferente",
          "Midi"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-13-bambu-novia",
        "nombre": "Look 13 - Bambú Novia",
        "sku": "N0013",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-13.webp",
          "/media/web/img/collections/novia/bambu/fely-campo-coleccion-novia-bambu-look-13-2.webp"
        ],
        "tags": [
          "Bambú Novia"
        ],
        "slugsAnteriores": []
      }
    ]
  },
  {
    "id": "savia",
    "nombre": "Savia Novia",
    "visible": false,
    "portada": "/media/web/img/collections/novia/Savia-cover.webp",
    "carpeta": "savia",
    "looks": [
      {
        "id": "look-1-savia-novia",
        "nombre": "Look 1 - Savia Novia",
        "sku": "N0041",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-1-2.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-1.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-2-savia-novia",
        "nombre": "Look 2 - Savia Novia",
        "sku": "N0042",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-2.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-2-2.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-3-savia-novia",
        "nombre": "Look 3 - Savia Novia",
        "sku": "N0043",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-3-2.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-3.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-4-savia-novia",
        "nombre": "Look 4 - Savia Novia",
        "sku": "N0044",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-4.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-4-2.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-5-savia-novia",
        "nombre": "Look 5 - Savia Novia",
        "sku": "N0045",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-5.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-5-2.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-6-savia-novia",
        "nombre": "Look 6 - Savia Novia",
        "sku": "N0046",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-6.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-6-2.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-7-savia-novia",
        "nombre": "Look 7 - Savia Novia",
        "sku": "N0047",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-7.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-7-2.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-8-savia-novia",
        "nombre": "Look 8 - Savia Novia",
        "sku": "N0048",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-8-2.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-8.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-9-savia-novia",
        "nombre": "Look 9 - Savia Novia",
        "sku": "N0049",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-9.webp",
          "/media/web/img/collections/novia/savia/fely-campo-coleccion-novia-savia-look-10-2.webp"
        ],
        "tags": [
          "Savia Novia"
        ],
        "slugsAnteriores": []
      }
    ]
  },
  {
    "id": "inside",
    "nombre": "Inside",
    "visible": false,
    "portada": "/media/web/img/collections/novia/Inside-cover.webp",
    "carpeta": "inside",
    "looks": [
      {
        "id": "look-1-inside-introspection-novia",
        "nombre": "Look 1 - Inside Introspection Novia",
        "sku": "17130 N",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-1-2.webp",
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-1.webp"
        ],
        "tags": [
          "Clásico",
          "Cola",
          "Diferente",
          "Escote espalda",
          "Fluido",
          "Inside",
          "Lencero",
          "Manga",
          "Minimal",
          "Princesa",
          "Recto",
          "Romántico"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-2-inside-introspection-novia",
        "nombre": "Look 2 - Inside Introspection Novia",
        "sku": "20211 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-2-2.webp",
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-2.webp"
        ],
        "tags": [
          "Clásico",
          "Escote espalda",
          "Inside",
          "Minimal",
          "Princesa"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-3-inside-introspection-novia",
        "nombre": "Look 3 - Inside Introspection Novia",
        "sku": "20209 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-3.webp"
        ],
        "tags": [
          "Cola",
          "Diferente",
          "Fluido",
          "Inside",
          "Manga",
          "Minimal",
          "Recto",
          "Sirena"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-4-inside-introspection-novia",
        "nombre": "Look 4 - Inside Introspection Novia",
        "sku": "20208 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-4.webp"
        ],
        "tags": [
          "Clásico",
          "Cola",
          "Fluido",
          "Inside",
          "Minimal",
          "Sirena"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-5-inside-introspection-novia",
        "nombre": "Look 5 - Inside Introspection Novia",
        "sku": "N0018",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-5-1.webp"
        ],
        "tags": [
          "Inside"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-6-inside-introspection-novia",
        "nombre": "Look 6 - Inside Introspection Novia",
        "sku": "17351 A _ 29350 F",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-6-2-1.webp",
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-6-1.webp"
        ],
        "tags": [
          "Dos piezas",
          "Inside",
          "Mangas",
          "Midi",
          "Minimal",
          "Recto"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-7-inside-introspection-novia",
        "nombre": "Look 7 - Inside Introspection Novia",
        "sku": "20178 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-7-2-1.webp",
          "/media/web/img/collections/novia/inside/fely-campo-coleccion-novia-inside-insideintrospectionnovia-look-7-1.webp"
        ],
        "tags": [
          "Inside",
          "Lencero",
          "Recto",
          "Romántico"
        ],
        "slugsAnteriores": []
      }
    ]
  },
  {
    "id": "introspeccion",
    "nombre": "Introspección",
    "visible": false,
    "portada": "/media/web/img/collections/novia/Introspeccion-cover.webp",
    "carpeta": "introspeccion",
    "looks": [
      {
        "id": "look-1-introspeccion-novia",
        "nombre": "Look 1 - Introspección Novia",
        "sku": "N0028",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-1-1.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-1-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-1.webp"
        ],
        "tags": [
          "Introspección"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-2-introspeccion-novia",
        "nombre": "Look 2 - Introspección Novia",
        "sku": "N0029",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-2-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-2-4.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-2-2.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-2.webp"
        ],
        "tags": [
          "Introspección"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-3-introspeccion-novia",
        "nombre": "Look 3 - Introspección Novia",
        "sku": "20151",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-3-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-3-2.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-3.webp"
        ],
        "tags": [
          "Clásico",
          "Cola",
          "Escote espalda",
          "Fluido",
          "Introspección",
          "Lencero",
          "Manga",
          "Princesa",
          "Romántico",
          "Sirena"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-4-introspeccion-novia",
        "nombre": "Look 4 - Introspección Novia",
        "sku": "20142 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-4-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-4-4.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-4.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-4-2.webp"
        ],
        "tags": [
          "Clásico",
          "Cola",
          "Corte A",
          "Introspección"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-5-introspeccion-novia",
        "nombre": "Look 5 - Introspección Novia",
        "sku": "20121 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-5.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-5-2.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-5-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-5-4.webp"
        ],
        "tags": [
          "Clásico",
          "Escote espalda",
          "Fluido",
          "Introspección",
          "Manga",
          "Romántico",
          "Sirena"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-6-introspeccion-novia",
        "nombre": "Look 6 - Introspección Novia",
        "sku": "20195 C _ 20140 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-6-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-6-2.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-6.webp"
        ],
        "tags": [
          "Cola",
          "Diferente",
          "Dos piezas",
          "Introspección",
          "Manga",
          "Princesa",
          "Romántico"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-7-introspeccion-novia",
        "nombre": "Look 7 - Introspección Novia",
        "sku": "20148 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-7-4.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-7-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-7.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-7-2.webp"
        ],
        "tags": [
          "Cola",
          "Fluido",
          "Introspección",
          "Manga",
          "Recto",
          "Romántico"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-8-introspeccion-novia",
        "nombre": "Look 8 - Introspección Novia",
        "sku": "20141 F _ 20192 T",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-8.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-8-2.webp"
        ],
        "tags": [
          "Clásico",
          "Diferente",
          "Dos piezas",
          "Fluido",
          "Introspección",
          "Recto",
          "Romántico"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-9-introspeccion-novia",
        "nombre": "Look 9 - Introspección Novia",
        "sku": "20118 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-9-2.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-9-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-9.webp"
        ],
        "tags": [
          "Clásico",
          "Corte A",
          "Fluido",
          "Introspección",
          "Manga",
          "Minimal"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-10-introspeccion-novia",
        "nombre": "Look 10 - Introspección Novia",
        "sku": "20163 V _ 20163-F F",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-10-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-10-4.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-10.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-10-2.webp"
        ],
        "tags": [
          "Clásico",
          "Cola",
          "Dos piezas",
          "Escote espalda",
          "Introspección",
          "Lencero",
          "Princesa"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-11-introspeccion-novia",
        "nombre": "Look 11 - Introspección Novia",
        "sku": "20134 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-11-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-11-4.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-11.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-11-2.webp"
        ],
        "tags": [
          "Clásico",
          "Fluido",
          "Introspección",
          "Recto",
          "Romántico"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-12-introspeccion-novia",
        "nombre": "Look 12 - Introspección Novia",
        "sku": "20112 T _ 20135 V",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-12.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-12-2-2.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-12-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-12-2.webp"
        ],
        "tags": [
          "Clásico",
          "Corte A",
          "Dos piezas",
          "Fluido",
          "Introspección",
          "Princesa",
          "Romántico"
        ],
        "slugsAnteriores": []
      },
      {
        "id": "look-13-introspeccion-novia",
        "nombre": "Look 13 - Introspección Novia",
        "sku": "N0040",
        "publicado": true,
        "descripcion": {
          "es": "",
          "en": ""
        },
        "imagenes": [
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-13-3.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-13.webp",
          "/media/web/img/collections/novia/introspeccion/fely-campo-coleccion-novia-introspeccion-look-13-2.webp"
        ],
        "tags": [
          "Clásico",
          "Cola",
          "Introspección",
          "Manga",
          "Princesa"
        ],
        "slugsAnteriores": []
      }
    ]
  }
];
