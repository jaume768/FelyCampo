// pretAPorter.js — productos de Prêt-à-porter (/pret-a-porter, sus 5
// categorías y la ficha de cada producto), editables desde
// /admin/productos/pret-a-porter.
//
// EN EL ORDEN DE LA WEB: el de /pret-a-porter y el de cada categoría
// (se cambia arrastrando en el admin).
//
// SUSTITUTO PROVISIONAL DE LA BASE DE DATOS: la web lo lee a través de
// lib/pretAPorter.js y el admin parte de aquí. Migrado tal cual desde el
// antiguo components/layout/tiendaProductos.js (ver docs/ADMIN.md).
//
//   id               identificador fijo (= la URL con la que se creó).
//   publicado        false = oculto: no sale en ningún sitio de la web.
//   nombre           tal cual se ve. Da la URL (/pret-a-porter/<nombre>); si
//                    se cambia uno publicado, la antigua va a slugsAnteriores (301).
//   categoria        faldas | chaquetas-y-abrigos | vestidos | pantalones |
//                    tops-y-camisetas (las 5 páginas de categoría).
//   sku              referencia (no se ve; va a los datos para Google). Opcional.
//   descripcion      { es, en }. En inglés vacía = la española.
//   colores          [{ hex, nombre }] de la biblioteca de colores del admin.
//   composicion, disenadoEn, fabricadoEn
//                    { es, en }, opcionales: el desplegable «Composición» de
//                    la ficha. Vacío (o sin el campo) = el texto general de
//                    messages/*.json (producto.composicionTexto,
//                    origenDisenado, origenFabricado). En inglés vacío = el
//                    español, como la descripción.
//   imagenes         en orden: la 1.ª en la tarjeta y la ficha, la 2.ª al
//                    pasar el ratón por la tarjeta.
//   fotoPasarela     { src, antes } foto de pasarela que sale junto al
//                    producto en /pret-a-porter (no en las categorías), delante
//                    ("antes": true) o detrás. src "" = sin foto.
//   precio, tallasDisponibles   NO se ven en la web (sin venta online, a
//                    petición) y no se editan en el admin; se conservan para
//                    el carrito y por si vuelve la venta online.

export const PRODUCTOS_PRET_A_PORTER = [
  {
    "id": "chaqueta-samarcanda",
    "publicado": true,
    "nombre": "Chaqueta Samarcanda",
    "categoria": "chaquetas-y-abrigos",
    "sku": "MBO3739",
    "descripcion": {
      "es": "Chaqueta Samarcanda a cuadros marrón y negro.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#4B3621",
        "nombre": "Chocolate"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-mbo3739-chaquetacuadros-front.webp",
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-mbo3739-chaquetacuadros-back.webp"
    ],
    "precio": "600 €",
    "tallasDisponibles": [
      38
    ],
    "fotoPasarela": {
      "src": "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-17-recorte.webp",
      "antes": true
    },
    "slugsAnteriores": []
  },
  {
    "id": "falda-lhasa",
    "publicado": true,
    "nombre": "Falda Lhasa",
    "categoria": "faldas",
    "sku": "MBO3740",
    "descripcion": {
      "es": "Falda Lhasa a cuadros color marrón bronce.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#8C6A3F",
        "nombre": "Bronce"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/faldas/fely-campo-pret-a-porter-faldas-falda-cuadros-front.webp",
      "/media/web/img/ecommerce/faldas/fely-campo-pret-a-porter-faldas-falda-cuadros-back-fff.webp"
    ],
    "precio": "450 €",
    "tallasDisponibles": [
      38
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "falda-basilea",
    "publicado": true,
    "nombre": "Falda Basilea",
    "categoria": "faldas",
    "sku": "",
    "descripcion": {
      "es": "Falda Basilea estampada color verde esmeralda.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#0F5C43",
        "nombre": "Esmeralda"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/faldas/fely-campo-pret-a-porter-faldas-falda-verde-front.webp",
      "/media/web/img/ecommerce/faldas/fely-campo-pret-a-porter-faldas-falda-verde-back.webp"
    ],
    "precio": "450 €",
    "tallasDisponibles": [
      40,
      42
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "vestido-largo-chicago",
    "publicado": true,
    "nombre": "Vestido Largo Chicago",
    "categoria": "vestidos",
    "sku": "MBO2752",
    "descripcion": {
      "es": "Vestido Largo Chicago de manga larga en encaje negro.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#111111",
        "nombre": "Negro"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/vestidos/fely-campo-pret-a-porter-vestidos-mbo2752-vestidolargo-encaje-front.webp",
      "/media/web/img/ecommerce/vestidos/fely-campo-pret-a-porter-vestidos-mbo2752-vestidolargo-encaje-back.webp"
    ],
    "precio": "450 €",
    "tallasDisponibles": [
      38,
      44
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "falda-sucre",
    "publicado": true,
    "nombre": "Falda Sucre",
    "categoria": "faldas",
    "sku": "MBO2702",
    "descripcion": {
      "es": "Falda Sucre con abertura color marrón.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#8C6A3F",
        "nombre": "Bronce"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/faldas/fely-campo-pret-a-porter-faldas-mbo2702-falda-abertura-sucre-front.webp",
      "/media/web/img/ecommerce/faldas/fely-campo-pret-a-porter-faldas-mbo2702-falda-abertura-sucre-back.webp"
    ],
    "precio": "450 €",
    "tallasDisponibles": [
      38
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "chaqueta-sucre",
    "publicado": true,
    "nombre": "Chaqueta Sucre",
    "categoria": "chaquetas-y-abrigos",
    "sku": "",
    "descripcion": {
      "es": "Chaqueta Sucre de lana color marrón.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#8C6A3F",
        "nombre": "Bronce"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-chaquetalanamarron-front.webp",
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-chaquetalanamarron-back.webp"
    ],
    "precio": "550 €",
    "tallasDisponibles": [
      38
    ],
    "fotoPasarela": {
      "src": "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-16-recorte.webp",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "pantalon-goree",
    "publicado": true,
    "nombre": "Pantalón Goree",
    "categoria": "pantalones",
    "sku": "MBO2724",
    "descripcion": {
      "es": "Pantalón Goree a rayas color antracita.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#4A4A48",
        "nombre": "Antracita"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/pantalones/fely-campo-pret-a-porter-pantalones-mbo2724-pantalon-raya-front.webp",
      "/media/web/img/ecommerce/pantalones/fely-campo-pret-a-porter-pantalones-mbo2724-pantalon-raya-back.webp"
    ],
    "precio": "450 €",
    "tallasDisponibles": [
      38,
      40,
      42
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "chaqueta-aranjuez",
    "publicado": true,
    "nombre": "Chaqueta Aranjuez",
    "categoria": "chaquetas-y-abrigos",
    "sku": "MBO2749",
    "descripcion": {
      "es": "Chaqueta Aranjuez de paillette color dorado.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#C6A664",
        "nombre": "Oro / Champán"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-chaqueta-aranjuez-front.webp",
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-chaqueta-aranjuez-back.webp"
    ],
    "precio": "550 €",
    "tallasDisponibles": [
      38
    ],
    "fotoPasarela": {
      "src": "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-24-recorte.webp",
      "antes": true
    },
    "slugsAnteriores": []
  },
  {
    "id": "abrigo-corto",
    "publicado": true,
    "nombre": "Abrigo Corto",
    "categoria": "chaquetas-y-abrigos",
    "sku": "",
    "descripcion": {
      "es": "Abrigo corto color morado.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#3E2A44",
        "nombre": "Berenjena"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-abrigo-corto-frontffff.webp",
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-abrigo-corto-back.webp"
    ],
    "precio": "550 €",
    "tallasDisponibles": [
      38
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "top-ubud",
    "publicado": true,
    "nombre": "Top Ubud",
    "categoria": "tops-y-camisetas",
    "sku": "MBO2723",
    "descripcion": {
      "es": "Top Ubud de cuerpo pellizcado color rojo y negro.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#111111",
        "nombre": "Negro"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/tops-y-camisas/fely-campo-pret-a-porter-tops-y-camisas-top-ubud-front.webp"
    ],
    "precio": "350 €",
    "tallasDisponibles": [
      42
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "falda-jeju",
    "publicado": true,
    "nombre": "Falda Jeju",
    "categoria": "faldas",
    "sku": "",
    "descripcion": {
      "es": "Falda Jeju a cuadros color gris.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#A8A29A",
        "nombre": "Gris piedra"
      },
      {
        "hex": "#1F2A44",
        "nombre": "Azul marino"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/faldas/fely-campo-pret-a-porter-faldas-jeju-falda-cuadros-front.webp",
      "/media/web/img/ecommerce/faldas/fely-campo-pret-a-porter-faldas-jeju-falda-cuadros-back.webp"
    ],
    "precio": "450 €",
    "tallasDisponibles": [
      38,
      42
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "top-lencero",
    "publicado": true,
    "nombre": "Top lencero",
    "categoria": "tops-y-camisetas",
    "sku": "",
    "descripcion": {
      "es": "",
      "en": ""
    },
    "colores": [
      {
        "hex": "#111111",
        "nombre": "Negro"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/fely-campo-pret-a-porter-top-encaje-producto-portada.webp",
      "/media/web/img/ecommerce/fely-campo-pret-a-porter-fw27-look-01.webp"
    ],
    "precio": "350 €",
    "tallasDisponibles": [
      42
    ],
    "fotoPasarela": {
      "src": "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-04-recorte.webp",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "abrigo-copenhague",
    "publicado": true,
    "nombre": "Abrigo Copenhague",
    "categoria": "chaquetas-y-abrigos",
    "sku": "",
    "descripcion": {
      "es": "Abrigo Copenhague de lana color rosa palo.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#D9B8B2",
        "nombre": "Rosa palo"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-abrigo-lana-front.webp",
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-abrigo-lana-back.webp",
      "/media/web/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-abrigo-lana-model.webp"
    ],
    "precio": "600 €",
    "tallasDisponibles": [
      38
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "vestido-ciruela",
    "publicado": true,
    "nombre": "Vestido Ciruela",
    "categoria": "vestidos",
    "sku": "",
    "descripcion": {
      "es": "",
      "en": ""
    },
    "colores": [
      {
        "hex": "#5A2A4A",
        "nombre": "Ciruela"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/fely-campo-pret-a-porter-vestido-producto-portada.webp",
      "/media/web/img/ecommerce/fely-campo-pret-a-porter-fw27-look-02.webp"
    ],
    "precio": "700 €",
    "tallasDisponibles": [
      40
    ],
    "fotoPasarela": {
      "src": "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-03-recorte.webp",
      "antes": true
    },
    "slugsAnteriores": []
  },
  {
    "id": "top-encaje-paris",
    "publicado": true,
    "nombre": "Top Encaje París",
    "categoria": "tops-y-camisetas",
    "sku": "MBO2746",
    "descripcion": {
      "es": "Top Encaje París de encaje en diversos colores.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#B03060",
        "nombre": "Fucsia"
      },
      {
        "hex": "#6E1E2B",
        "nombre": "Burdeos"
      },
      {
        "hex": "#111111",
        "nombre": "Negro"
      },
      {
        "hex": "#CFCCC6",
        "nombre": "Gris perla"
      },
      {
        "hex": "#C4C7CC",
        "nombre": "Plata"
      },
      {
        "hex": "#1E4D4A",
        "nombre": "Petróleo"
      },
      {
        "hex": "#4A6B8A",
        "nombre": "Denim"
      },
      {
        "hex": "#1F2A44",
        "nombre": "Azul marino"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/tops-y-camisas/fely-campo-pret-a-porter-tops-y-camisas-top-encaje-rosa-front.webp",
      "/media/web/img/ecommerce/tops-y-camisas/fely-campo-pret-a-porter-tops-y-camisas-top-encaje-rosa-back.webp"
    ],
    "precio": "350 €",
    "tallasDisponibles": [
      42
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "vestido-zahara",
    "publicado": true,
    "nombre": "Vestido Zahara",
    "categoria": "vestidos",
    "sku": "27119",
    "descripcion": {
      "es": "Vestido Zahara plisado color verde botella.",
      "en": ""
    },
    "colores": [
      {
        "hex": "#14342B",
        "nombre": "Verde botella"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/tops-y-camisas/fely-campo-pret-a-porter-tops-y-camisas-vestido-plisado-front.webp"
    ],
    "precio": "300 €",
    "tallasDisponibles": [
      40
    ],
    "fotoPasarela": {
      "src": "",
      "antes": false
    },
    "slugsAnteriores": []
  },
  {
    "id": "chaqueta",
    "publicado": true,
    "nombre": "Chaqueta",
    "categoria": "chaquetas-y-abrigos",
    "sku": "",
    "descripcion": {
      "es": "",
      "en": ""
    },
    "colores": [
      {
        "hex": "#4A4A48",
        "nombre": "Antracita"
      }
    ],
    "imagenes": [
      "/media/web/img/ecommerce/fely-campo-pret-a-porter-chaqueta-producto-portada.webp",
      "/media/web/img/ecommerce/fely-campo-pret-a-porter-fw27-look-03.webp"
    ],
    "precio": "400 €",
    "tallasDisponibles": [
      40,
      42
    ],
    "fotoPasarela": {
      "src": "/media/web/img/collections/runway/fw27-lacoleccion/carrusel-png/fely-campo-pasarela-la-coleccion-look-05-recorte.webp",
      "antes": false
    },
    "slugsAnteriores": []
  }
];
