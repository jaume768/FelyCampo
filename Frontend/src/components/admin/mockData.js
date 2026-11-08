// mockData.js — Panel de administración
//
// Datos de ejemplo, 100% estáticos (sin API/BBDD detrás). Las imágenes
// reutilizan assets reales del sitio público (public/img/...) para que el
// panel se vea coherente con la web, no con placeholders genéricos.

import { TALLAS_DISPONIBLES } from '@/components/ecommerce/guiaTallasData';
import { categoriasAdminFiesta, obtenerColeccionesFiesta } from '@/lib/catalogoFiesta';
import { categoriasAdminNovias, obtenerColeccionesNovias } from '@/lib/catalogoNovias';
import { categoriasAdminPretAPorter } from '@/lib/pretAPorter';
import { categoriasAdminRunway } from '@/lib/runway';

// ---------- PRODUCTOS ----------
// tipo: 'pret-a-porter' | 'atelier' | 'archivo'
// estado: 'Borrador' | 'Activo' | 'Archivado'

// `novia`/`fiesta` son archivos de colecciones pasadas (mismo espíritu que
// `archivo`/Runway: nombre + `fija: true`, sin precio/tallas/colores), NO
// lo mismo que las categorías "Novias"/"Fiesta" de Atelier (`cat3`/`cat4`
// en categoriasMock.atelier) — esas son catálogo vivo, esto es archivo
// editorial. Viven en su propio grupo de sidebar "Colecciones", no en
// "Productos" (ver AdminSidebar.jsx).
export const tiposProducto = [
  { valor: 'pret-a-porter', etiqueta: 'Prêt-à-porter' },
  { valor: 'atelier', etiqueta: 'Atelier' },
  { valor: 'archivo', etiqueta: 'Runway' },
  { valor: 'novia', etiqueta: 'Novia' },
  { valor: 'fiesta', etiqueta: 'Fiesta' },
];

// Base de ruta admin de cada tipo — Prêt-à-porter/Atelier viven bajo
// /admin/productos; los archivos de colecciones (Runway/Novia/Fiesta)
// bajo /admin/colecciones, porque así están agrupados en el sidebar (grupo
// "Colecciones" en AdminSidebar.jsx) aunque el valor interno de `tipo`
// siga siendo 'archivo'/'novia'/'fiesta'. Único sitio que sabe este mapeo
// — cualquier página que construya un link "a la ruta de este tipo" debe
// usar esta función en vez de concatenar '/admin/productos/' a mano
// (ese hardcode fue justo el bug que dejó rota la vuelta desde la ficha de
// producto tras el rename de archivo → Runway).
const RUTA_TIPO_COLECCIONES = {
  archivo: '/admin/colecciones/runway',
  novia: '/admin/colecciones/novia',
  fiesta: '/admin/colecciones/fiesta',
};

export function rutaTipoProducto(tipo) {
  return RUTA_TIPO_COLECCIONES[tipo] || `/admin/productos/${tipo}`;
}

// Tallas estándar: el admin elige de esta lista fija en vez de escribir
// el nombre de la talla a mano en cada fila — mismo rango (36 a 64) que
// el resto del sitio, ver TALLAS_DISPONIBLES en guiaTallasData.js.
export const tallasEstandar = TALLAS_DISPONIBLES;

// Colección/temporada de cada producto (código corto tipo SKU + año,
// mismo criterio "fw"/"ss" que ya usan los assets del sitio público,
// p.ej. /img/ecommerce/27FW/...). Etiqueta legible para mostrar en tabla/filtro.
export const coleccionesMock = [
  { valor: 'FW27', etiqueta: 'Otoño-Invierno 2027' },
  { valor: 'ss26', etiqueta: 'Primavera-Verano 2026' },
  { valor: 'fw26', etiqueta: 'Otoño-Invierno 2026' },
  { valor: 'ss25', etiqueta: 'Primavera-Verano 2025' },
];

// ---------- MATERIALES: colores y telas reutilizables ----------
// Biblioteca compartida (sección Materiales) — los productos referencian
// estos ids (colorIds/telaIds) en vez de escribir hex/nombre a mano cada
// vez, así el mismo color/tela se ve igual en todas las fichas.

// Paleta de colores: movida a src/lib/paletaColores.js (datos públicos,
// ver su cabecera). Reexportada aquí para que el admin no cambie.
export { familiasColorMock, coloresMock } from '@/lib/paletaColores';

export const telasMock = [
  { id: 'tel1', nombre: 'Jacquard floral', composicion: '70% algodón, 30% poliéster' },
  { id: 'tel2', nombre: 'Tafetán', composicion: '100% poliéster' },
  { id: 'tel3', nombre: 'Encaje francés', composicion: '60% algodón, 40% nylon' },
  { id: 'tel4', nombre: 'Gasa de seda', composicion: '100% seda' },
  { id: 'tel5', nombre: 'Popelín', composicion: '97% algodón, 3% elastano' },
];

export const productosMock = [
  {
    id: 'p1',
    tipo: 'pret-a-porter',
    categoriaId: 'cat1',
    nombre: 'Vestido Aurora',
    descripcionCorta: 'Vestido midi en jacquard con flores en relieve.',
    imagen: '/img/ecommerce/27FW/FW27-Dress-Look02.jpg',
    imagenes: ['/img/ecommerce/27FW/FW27-Dress-Look02.jpg', '/img/ecommerce/27FW/FW27-Look02.webp'],
    precio: '890 €',
    tallas: [
      { talla: 38, stock: 3 },
      { talla: 40, stock: 5 },
      { talla: 42, stock: 0 },
    ],
    colorIds: ['bordeaux', 'navy'],
    telaIds: ['tel1'],
    estado: 'Activo',
    coleccion: 'fw26',
    sku: 'FC-VES-AUR',
  },
  {
    id: 'p2',
    tipo: 'pret-a-porter',
    categoriaId: 'cat2',
    nombre: 'Falda Vera',
    descripcionCorta: 'Falda evasé en tafetán rosa suave.',
    imagen: '/img/ecommerce/27FW/FW27-Top-Look03.jpg',
    imagenes: ['/img/ecommerce/27FW/FW27-Top-Look03.jpg', '/img/ecommerce/27FW/FW27-Look03.webp'],
    precio: '420 €',
    tallas: [
      { talla: 38, stock: 2 },
      { talla: 40, stock: 4 },
      { talla: 42, stock: 4 },
    ],
    colorIds: ['powder-pink', 'optic-white'],
    telaIds: ['tel2'],
    estado: 'Activo',
    coleccion: 'fw26',
    sku: 'FC-FAL-VER',
  },
  {
    id: 'p3',
    tipo: 'atelier',
    categoriaId: 'cat3',
    nombre: 'Vestido Elena',
    descripcionCorta: 'Vestido de novia a medida, encaje francés y cola desmontable.',
    imagen: '/img/novias-sección-FelyCampo2.jpg',
    imagenes: ['/img/novias-sección-FelyCampo2.jpg', '/img/fely-campo-web-novias-seccion-3.webp'],
    precio: 'Desde 2.400 €',
    colorIds: ['ivory'],
    telaIds: ['tel3'],
    coleccion: 'ss26',
    estado: 'Activo',
    sku: 'FC-ATL-ELE',
  },
  {
    id: 'p4',
    tipo: 'atelier',
    categoriaId: 'cat4',
    nombre: 'Vestido Celeste',
    descripcionCorta: 'Vestido de fiesta a medida en gasa de seda.',
    imagen: '/img/invitadas-sección-FelyCampo.jpg',
    imagenes: ['/img/invitadas-sección-FelyCampo.jpg'],
    precio: 'Desde 980 €',
    colorIds: ['blue-grey'],
    telaIds: ['tel4'],
    coleccion: 'fw26',
    estado: 'Borrador',
    sku: 'FC-ATL-CEL',
  },
  {
    id: 'p5',
    tipo: 'archivo',
    categoriaId: 'cat11',
    nombre: 'Look Runway 12',
    descripcionCorta: 'Look de pasarela FW27, pieza única de archivo.',
    imagen: '/img/ecommerce/Invitada/LOOK12_2-scaled.webp',
    imagenes: ['/img/ecommerce/Invitada/LOOK12_2-scaled.webp'],
    coleccion: 'FW27',
    estado: 'Activo',
    sku: 'FC-ARC-R12',
  },
  {
    id: 'p6',
    tipo: 'archivo',
    categoriaId: 'cat14',
    nombre: 'Colección Bride 25',
    descripcionCorta: 'Colección de novias SS25, editorial completo.',
    imagen: '/img/novias-sección-FelyCampo4.jpg',
    imagenes: ['/img/novias-sección-FelyCampo4.jpg', '/img/novias-sección-FelyCampo.jpg'],
    coleccion: 'ss25',
    estado: 'Archivado',
    sku: 'FC-ARC-B25',
  },
  {
    id: 'p7',
    tipo: 'pret-a-porter',
    categoriaId: 'cat8',
    nombre: 'Abrigo Nieve',
    descripcionCorta: 'Abrigo oversize en paño de lana, colección Otoño-Invierno 2027.',
    imagen: '/img/abrigos-2026.jpg',
    imagenes: ['/img/abrigos-2026.jpg', '/img/abrigos-2026-2.jpg'],
    precio: '760 €',
    tallas: [
      { talla: 38, stock: 4 },
      { talla: 40, stock: 6 },
      { talla: 42, stock: 2 },
    ],
    colorIds: ['black', 'camel'],
    telaIds: ['tel5'],
    estado: 'Programado',
    coleccion: 'FW27',
    sku: 'FC-VES-NIE',
  },
  {
    id: 'p8',
    tipo: 'pret-a-porter',
    categoriaId: 'cat2',
    nombre: 'Falda Invierno',
    descripcionCorta: 'Falda midi en paño de lana, temporada pasada.',
    imagen: '/img/ecommerce/27FW/Coat-Look-3.jpg',
    imagenes: ['/img/ecommerce/27FW/Coat-Look-3.jpg', '/img/ecommerce/27FW/Coat-Look-4.jpg'],
    precio: '380 €',
    tallas: [
      { talla: 38, stock: 0 },
      { talla: 40, stock: 0 },
    ],
    colorIds: ['navy'],
    telaIds: ['tel5'],
    estado: 'Archivado',
    coleccion: 'ss25',
    sku: 'FC-FAL-INV',
  },
  {
    id: 'p9',
    tipo: 'atelier',
    categoriaId: 'cat4',
    nombre: 'Vestido Nube',
    descripcionCorta: 'Vestido de fiesta a medida, temporada anterior, fuera de catálogo.',
    imagen: '/img/ecommerce/27FW/invitadas-sección-FelyCampo2.jpg',
    imagenes: ['/img/ecommerce/27FW/invitadas-sección-FelyCampo2.jpg'],
    precio: 'Desde 890 €',
    colorIds: ['optic-white'],
    telaIds: ['tel2'],
    coleccion: 'ss25',
    estado: 'Archivado',
    sku: 'FC-ATL-NUB',
  },
  {
    id: 'p10',
    tipo: 'archivo',
    categoriaId: 'cat11',
    nombre: 'Look Runway 18',
    descripcionCorta: 'Look de pasarela FW27, pendiente de publicar en el archivo.',
    imagen: '/img/ecommerce/Invitada/LOOK18_1-scaled.webp',
    imagenes: ['/img/ecommerce/Invitada/LOOK18_1-scaled.webp'],
    coleccion: 'FW27',
    estado: 'Programado',
    sku: 'FC-ARC-R18',
  },
  // p11-p18: completan los 3 estados (Publicado/Esperando/Archivado) dentro
  // de CADA categoría, no solo dentro de cada tipo — así el filtro por
  // categoría (sidebar → ?categoria=catX) también muestra los 3 colores.
  {
    id: 'p11',
    tipo: 'pret-a-porter',
    categoriaId: 'cat1',
    nombre: 'Vestido Otoño',
    descripcionCorta: 'Vestido largo en punto, temporada retirada.',
    imagen: '/img/ecommerce/27FW/FW27-Look01.webp',
    imagenes: ['/img/ecommerce/27FW/FW27-Look01.webp'],
    precio: '650 €',
    tallas: [
      { talla: 38, stock: 0 },
      { talla: 40, stock: 0 },
    ],
    colorIds: ['bordeaux'],
    telaIds: ['tel1'],
    estado: 'Archivado',
    coleccion: 'ss25',
    sku: 'FC-VES-OTO',
  },
  {
    id: 'p12',
    tipo: 'pret-a-porter',
    categoriaId: 'cat2',
    nombre: 'Falda Primavera',
    descripcionCorta: 'Falda plisada en popelín, próxima temporada.',
    imagen: '/img/ecommerce/27FW/FW27-Top-Look01.jpg',
    imagenes: ['/img/ecommerce/27FW/FW27-Top-Look01.jpg'],
    precio: '340 €',
    tallas: [
      { talla: 38, stock: 5 },
      { talla: 40, stock: 5 },
    ],
    colorIds: ['powder-pink'],
    telaIds: ['tel5'],
    estado: 'Programado',
    coleccion: 'ss26',
    sku: 'FC-FAL-PRI',
  },
  {
    id: 'p13',
    tipo: 'atelier',
    categoriaId: 'cat3',
    nombre: 'Vestido Alba',
    descripcionCorta: 'Vestido de novia a medida, en preparación para el lanzamiento.',
    imagen: '/img/fely-campo-web-novias-seccion-3.webp',
    imagenes: ['/img/fely-campo-web-novias-seccion-3.webp'],
    precio: 'Desde 2.100 €',
    colorIds: ['ivory'],
    telaIds: ['tel4'],
    coleccion: 'ss26',
    estado: 'Programado',
    sku: 'FC-ATL-ALB',
  },
  {
    id: 'p14',
    tipo: 'atelier',
    categoriaId: 'cat3',
    nombre: 'Vestido Perla',
    descripcionCorta: 'Vestido de novia a medida, colección retirada.',
    imagen: '/img/ecommerce/Invitada/LOOK1_2-scaled.webp',
    imagenes: ['/img/ecommerce/Invitada/LOOK1_2-scaled.webp'],
    precio: 'Desde 1.900 €',
    colorIds: ['optic-white'],
    telaIds: ['tel3'],
    coleccion: 'ss25',
    estado: 'Archivado',
    sku: 'FC-ATL-PER',
  },
  {
    id: 'p15',
    tipo: 'atelier',
    categoriaId: 'cat4',
    nombre: 'Vestido Luna',
    descripcionCorta: 'Vestido de fiesta a medida en tul bordado.',
    imagen: '/img/invitadas-sección-FelyCampo2.jpg',
    imagenes: ['/img/invitadas-sección-FelyCampo2.jpg'],
    precio: 'Desde 1.050 €',
    colorIds: ['navy'],
    telaIds: ['tel1'],
    coleccion: 'fw26',
    estado: 'Activo',
    sku: 'FC-ATL-LUN',
  },
  {
    id: 'p16',
    tipo: 'archivo',
    categoriaId: 'cat14',
    nombre: 'Look Runway 9',
    descripcionCorta: 'Look de pasarela, temporada retirada del archivo activo.',
    imagen: '/img/ecommerce/Invitada/LOOK9_1-scaled.webp',
    imagenes: ['/img/ecommerce/Invitada/LOOK9_1-scaled.webp'],
    coleccion: 'ss25',
    estado: 'Archivado',
    sku: 'FC-ARC-R09',
  },
  {
    id: 'p17',
    tipo: 'archivo',
    categoriaId: 'cat12',
    nombre: 'Colección Fiesta 26',
    descripcionCorta: 'Colección de fiesta SS26, editorial completo.',
    imagen: '/img/HERO-2.jpg',
    imagenes: ['/img/HERO-2.jpg'],
    coleccion: 'ss26',
    estado: 'Activo',
    sku: 'FC-ARC-F26',
  },
  {
    id: 'p18',
    tipo: 'archivo',
    categoriaId: 'cat13',
    nombre: 'Colección Novias 26',
    descripcionCorta: 'Colección de novias FW26, pendiente de publicar en el archivo.',
    imagen: '/img/FW27-HERO.webp',
    imagenes: ['/img/FW27-HERO.webp'],
    coleccion: 'fw26',
    estado: 'Programado',
    sku: 'FC-ARC-N26',
  },
  // p19-p23: cat7 (Tops y Camisas), cat8 (Chaquetas y Abrigos) y cat36
  // (Pantalones) no tenían ningún producto todavía — cuadrícula vacía en
  // /admin/productos/pret-a-porter para esas 3 secciones. Fotos/nombre/
  // precio/color tomados tal cual de tiendaProductos.js (catálogo real de
  // /pret-a-porter), así el panel enseña de dónde sale cada pieza.
  {
    id: 'p19',
    tipo: 'pret-a-porter',
    categoriaId: 'cat7',
    nombre: 'Top Ubud',
    descripcionCorta: 'Top Ubud de cuerpo pellizcado color rojo y negro.',
    imagen: '/img/ecommerce/tops-y-camisas/top-ubud-felycampo-front.jpg',
    imagenes: ['/img/ecommerce/tops-y-camisas/top-ubud-felycampo-front.jpg'],
    precio: '350 €',
    tallas: [
      { talla: 42, stock: 4 },
    ],
    colorIds: ['black'],
    telaIds: ['tel3'],
    estado: 'Activo',
    coleccion: 'ss26',
    sku: 'MBO2723',
  },
  {
    id: 'p20',
    tipo: 'pret-a-porter',
    categoriaId: 'cat7',
    nombre: 'Top Encaje París',
    descripcionCorta: 'Top Encaje París de encaje en diversos colores.',
    imagen: '/img/ecommerce/tops-y-camisas/top-encaje-rosa-front.jpg',
    imagenes: ['/img/ecommerce/tops-y-camisas/top-encaje-rosa-front.jpg', '/img/ecommerce/tops-y-camisas/top-encaje-rosa-back.jpg'],
    precio: '350 €',
    tallas: [
      { talla: 42, stock: 6 },
    ],
    colorIds: ['fuchsia', 'bordeaux', 'black'],
    telaIds: ['tel3'],
    estado: 'Activo',
    coleccion: 'ss26',
    sku: 'MBO2746',
  },
  {
    id: 'p21',
    tipo: 'pret-a-porter',
    categoriaId: 'cat8',
    nombre: 'Chaqueta Samarcanda',
    descripcionCorta: 'Chaqueta Samarcanda a cuadros marrón y negro.',
    imagen: '/img/ecommerce/chaquetas-y-abrigos/MBO3739-chaquetacuadros-felycampo-front.jpg',
    imagenes: ['/img/ecommerce/chaquetas-y-abrigos/MBO3739-chaquetacuadros-felycampo-front.jpg', '/img/ecommerce/chaquetas-y-abrigos/MBO3739-chaquetacuadros-felycampo-back.jpg'],
    precio: '600 €',
    tallas: [
      { talla: 38, stock: 2 },
    ],
    colorIds: ['chocolate'],
    telaIds: ['tel5'],
    estado: 'Activo',
    coleccion: 'FW27',
    sku: 'MBO3739',
  },
  {
    id: 'p22',
    tipo: 'pret-a-porter',
    categoriaId: 'cat8',
    nombre: 'Abrigo Copenhague',
    descripcionCorta: 'Abrigo Copenhague de lana color rosa palo.',
    imagen: '/img/ecommerce/chaquetas-y-abrigos/abrigo-lana-felycampo-front.jpg',
    imagenes: [
      '/img/ecommerce/chaquetas-y-abrigos/abrigo-lana-felycampo-front.jpg',
      '/img/ecommerce/chaquetas-y-abrigos/abrigo-lana-felycampo-back.jpg',
      '/img/ecommerce/chaquetas-y-abrigos/fely-campo-pret-a-porter-chaquetas-y-abrigos-abrigo-lana-model.webp',
    ],
    precio: '600 €',
    tallas: [
      { talla: 38, stock: 3 },
    ],
    colorIds: ['dusty-rose'],
    telaIds: ['tel5'],
    estado: 'Borrador',
    coleccion: 'FW27',
    sku: 'FC-CHA-COP',
  },
  {
    id: 'p23',
    tipo: 'pret-a-porter',
    categoriaId: 'cat36',
    nombre: 'Pantalón Goree',
    descripcionCorta: 'Pantalón Goree a rayas color antracita.',
    imagen: '/img/ecommerce/pantalones/MBO2724-pantalon-raya-front.jpg',
    imagenes: ['/img/ecommerce/pantalones/MBO2724-pantalon-raya-front.jpg', '/img/ecommerce/pantalones/MBO2724-pantalon-raya-back.jpg'],
    precio: '450 €',
    tallas: [
      { talla: 38, stock: 3 },
      { talla: 40, stock: 2 },
      { talla: 42, stock: 0 },
    ],
    colorIds: ['anthracite'],
    telaIds: ['tel5'],
    estado: 'Activo',
    coleccion: 'ss26',
    sku: 'MBO2724',
  },
];

// ---------- PEDIDOS (solo Prêt-à-porter) ----------

export const pedidosMock = [
  {
    id: 'FC-2031',
    cliente: 'Marta Ibáñez',
    fecha: '2026-08-01',
    total: '890 €',
    estadoPago: 'Pagado',
    estadoEnvio: 'Entregado',
    direccionEnvio: 'Calle Serrano 45, 28001 Madrid',
    tracking: 'ES394857102',
    notasInternas: 'Clienta habitual, prefiere envío a oficina.',
    items: [{ producto: 'Vestido Aurora', talla: 40, color: 'Burdeos', cantidad: 1, precio: '890 €' }],
  },
  {
    id: 'FC-2032',
    cliente: 'Laura Gómez',
    fecha: '2026-08-03',
    total: '420 €',
    estadoPago: 'Pagado',
    estadoEnvio: 'Enviado',
    direccionEnvio: 'Av. Diagonal 200, 08018 Barcelona',
    tracking: 'ES394857103',
    notasInternas: '',
    items: [{ producto: 'Falda Vera', talla: 38, color: 'Rosa empolvado', cantidad: 1, precio: '420 €' }],
  },
  {
    id: 'FC-2033',
    cliente: 'Elena Castro',
    fecha: '2026-08-04',
    total: '1.310 €',
    estadoPago: 'Pendiente',
    estadoEnvio: 'Procesando',
    direccionEnvio: 'Rúa do Franco 12, 15702 Santiago de Compostela',
    tracking: '',
    notasInternas: 'Esperando confirmación de pago por transferencia.',
    items: [
      { producto: 'Vestido Aurora', talla: 42, color: 'Azul marino', cantidad: 1, precio: '890 €' },
      { producto: 'Falda Vera', talla: 40, color: 'Blanco óptico', cantidad: 1, precio: '420 €' },
    ],
  },
  {
    id: 'FC-2034',
    cliente: 'Sara Molina',
    fecha: '2026-08-05',
    total: '420 €',
    estadoPago: 'Fallido',
    estadoEnvio: 'Procesando',
    direccionEnvio: 'Gran Vía 10, 50001 Zaragoza',
    tracking: '',
    notasInternas: 'Tarjeta rechazada, contactar con la clienta.',
    items: [{ producto: 'Falda Vera', talla: 42, color: 'Blanco óptico', cantidad: 1, precio: '420 €' }],
  },
  {
    id: 'FC-2035',
    cliente: 'Nuria Prats',
    fecha: '2026-08-06',
    total: '890 €',
    estadoPago: 'Pagado',
    estadoEnvio: 'Procesando',
    direccionEnvio: 'Calle Colón 8, 46004 Valencia',
    tracking: '',
    notasInternas: '',
    items: [{ producto: 'Vestido Aurora', talla: 38, color: 'Burdeos', cantidad: 1, precio: '890 €' }],
    nuevo: true, // placeholder de diseño — ver AdminSidebar "nuevos: 3"; sin lógica real de "visto" detrás
  },
  {
    id: 'FC-2036',
    cliente: 'Beatriz Soler',
    fecha: '2026-08-07',
    total: '840 €',
    estadoPago: 'Pagado',
    estadoEnvio: 'Enviado',
    direccionEnvio: 'Paseo de la Castellana 100, 28046 Madrid',
    tracking: 'ES394857110',
    notasInternas: '',
    items: [{ producto: 'Falda Vera', talla: 40, color: 'Rosa empolvado', cantidad: 2, precio: '840 €' }],
    nuevo: true,
  },
  {
    id: 'FC-2037',
    cliente: 'Carmen Vidal',
    fecha: '2026-08-08',
    total: '890 €',
    estadoPago: 'Pendiente',
    estadoEnvio: 'Procesando',
    direccionEnvio: 'Calle Sierpes 30, 41004 Sevilla',
    tracking: '',
    notasInternas: 'Pendiente de verificación de dirección.',
    items: [{ producto: 'Vestido Aurora', talla: 40, color: 'Azul marino', cantidad: 1, precio: '890 €' }],
    nuevo: true,
  },
];

// ---------- CONSULTAS / CITAS (Atelier + contacto general) ----------

export const consultasMock = [
  {
    id: 'c1',
    cliente: { nombre: 'Irene Salas', email: 'irene.salas@example.com' },
    tipo: 'Cita',
    asunto: 'Primera prueba vestido de novia',
    fecha: '2026-08-20',
    estado: 'Pendiente',
    productoRelacionado: 'Vestido Elena',
    mensaje: 'Nos gustaría reservar la primera cita de pruebas en el atelier de Salamanca.',
  },
  {
    id: 'c2',
    cliente: { nombre: 'Paula Reyes', email: 'paula.reyes@example.com' },
    tipo: 'Consulta',
    asunto: 'Disponibilidad vestido de fiesta a medida',
    fecha: '2026-08-15',
    estado: 'Contactado',
    productoRelacionado: 'Vestido Celeste',
    mensaje: '¿Podríais confeccionar el vestido Celeste en color verde oliva?',
  },
  {
    id: 'c3',
    cliente: { nombre: 'Cristina Ferrer', email: 'cristina.ferrer@example.com' },
    tipo: 'Cita',
    asunto: 'Cita atelier Madrid',
    fecha: '2026-08-22',
    estado: 'Pendiente',
    productoRelacionado: null,
    mensaje: 'Querría concertar una cita general para ver el atelier de Madrid.',
  },
  {
    id: 'c4',
    cliente: { nombre: 'Sofía Navarro', email: 'sofia.navarro@example.com' },
    tipo: 'Consulta',
    asunto: 'Plazos de entrega',
    fecha: '2026-08-10',
    estado: 'Cerrado',
    productoRelacionado: null,
    mensaje: '¿Cuánto tiempo de media tarda la confección de un traje de novia a medida?',
  },
  {
    id: 'c5',
    cliente: { nombre: 'Ana Belén Ruiz', email: 'anabelen.ruiz@example.com' },
    tipo: 'Cita',
    asunto: 'Prueba final vestido de fiesta',
    fecha: '2026-08-25',
    estado: 'Contactado',
    productoRelacionado: 'Vestido Celeste',
    mensaje: 'Confirmar la última prueba antes del evento del 30 de agosto.',
  },
];

// ---------- CITAS (formulario real de /visita-fely-campo/cita) ----------
// Mismos campos que envía ese formulario a /api/cita (ver route.js):
// fecha de la boda, nombre, email,
// teléfono, código postal, ciudad, mensaje, idioma y la casilla de
// privacidad/términos (aceptaLegal, obligatoria). "recibida" es cuándo
// llegó; "estado" y "notas" son solo del admin. De EJEMPLO: hoy la API
// solo envía emails, no guarda nada — cuando haya base de datos, estas
// filas saldrán de ahí.
export const ESTADOS_CITA = ['Pendiente', 'Contactada', 'Cita confirmada', 'Cerrada'];

export const citasMock = [
  // Misma forma que lo que envía el formulario de cita de la web
  // (/visita-fely-campo/cita → /api/cita): nombre completo, email,
  // teléfono, atelier elegido ("ubicacion"), fecha del evento (mes y año,
  // "2027-06"), mensaje, idioma y la casilla de privacidad. "estado" lo
  // pone el equipo.
  {
    id: 'cita-3',
    recibida: '2026-11-05T11:15',
    nombre: 'Carmen Ruiz Alonso',
    email: 'carmen.ruiz@example.com',
    telefono: '+34 611 223 344',
    ubicacion: 'oviedo',
    fechaEvento: '2027-09',
    mensaje: 'Soy madrina en septiembre y busco un vestido largo en tonos verdes.',
    locale: 'es',
    aceptaLegal: true,
    estado: 'Pendiente',
  },
  {
    id: 'cita-2',
    recibida: '2026-10-26T18:42',
    nombre: 'Lucía Hernández Prieto',
    email: 'lucia.hernandez@example.com',
    telefono: '+34 600 112 233',
    ubicacion: 'salamanca',
    fechaEvento: '2027-06',
    mensaje: 'Me caso en junio y me gustaría ver vestidos de novia de corte sencillo, con algo de espalda.',
    locale: 'es',
    aceptaLegal: true,
    estado: 'Contactada',
  },
  {
    id: 'cita-1',
    recibida: '2026-10-20T09:30',
    nombre: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    telefono: '+44 7700 900123',
    ubicacion: 'madrid',
    fechaEvento: '2027-07',
    mensaje: 'I will be in Madrid in November and would love to try on bridal dresses.',
    locale: 'en',
    aceptaLegal: true,
    estado: 'Cita confirmada',
  },
];

// ---------- CONSULTAS DE VESTIDOS ("Contacta con nosotros" → modal "Solicita información") ----------
// Mismos campos que envía ModalSolicitudAtelier.jsx a /api/consulta-vestido:
// tipo (novias|fiesta, sacado de la URL de la ficha), vestido (producto),
// su foto (imagen), color elegido (+ colorHex), ruta de la ficha, nombre,
// email, teléfono (opcional), comentario (mensaje, opcional), idioma
// (locale) y la casilla de privacidad (aceptaLegal). "recibida" es cuándo
// llegó; "estado" (los mismos que Citas, ESTADOS_CITA) y las notas son
// solo del admin. De EJEMPLO: hoy la API solo envía emails, no guarda
// nada — cuando haya base de datos, estas filas saldrán de ahí.
// Antes "Consultas de precio" (botón "Precio a consultar" + clienteId de
// clientes registrados, que el front no tiene) — sustituido a petición.

export const consultasPrecioMock = [
  {
    id: 'cv-2',
    recibida: '2026-10-26T12:15',
    tipo: 'fiesta',
    producto: 'Look 6 26_Opaline',
    imagen: '/img/collections/fiesta/primavera-verano-26/fely-campo-coleccion-fiesta-primavera-verano-26-2526-45.webp',
    color: 'Verde agua',
    colorHex: '#9FC9C1',
    ruta: '/es/atelier/fiesta/look-6-26-opaline',
    nombre: 'Carmen Ortega',
    email: 'carmen.ortega@example.com',
    telefono: '+34 611 445 566',
    mensaje: 'Soy madrina en mayo y me encanta este vestido. ¿Se puede hacer en un tono más oscuro?',
    locale: 'es',
    aceptaLegal: true,
    estado: 'Pendiente',
  },
  {
    id: 'cv-1',
    recibida: '2026-10-21T19:40',
    tipo: 'novias',
    producto: 'Look 2 - Bride 27',
    imagen: '/img/collections/novia/bride-27/fely-campo-coleccion-novia-bride-27-look-2.webp',
    color: '',
    colorHex: '',
    ruta: '/en/atelier/novias/look-2-bride-27',
    nombre: 'Sophie Clarke',
    email: 'sophie.clarke@example.com',
    telefono: '',
    mensaje: 'I am getting married in Spain next September. Could you tell me more about this dress and the fitting process?',
    locale: 'en',
    aceptaLegal: true,
    estado: 'Contactada',
  },
];

// ---------- RESEÑAS ----------
// `productoId` (FK real a productosMock) sustituye a la antigua
// `productoRelacionado` (nombre en texto libre) — misma relación frágil
// que ya se corrigió en otros sitios del panel (ver docs/ADMIN.md
// sección 7 punto 4). Con producto vinculado, la ficha/tabla puede
// enseñar SKU + foto del producto, no solo el nombre.
// `clienteId` (FK real a clientesMock) — todas las reseñas vienen de una
// clienta con cuenta, así que no existe la reseña anónima: a
// diferencia de otros mocks del panel
// (consultasPrecioMock sí admite `clienteId: null`, visitantes sin
// cuenta), aquí siempre hay un cliente real detrás.
// `nuevo: true` en r5/r6 (recién "enviadas", `estado: 'Oculta'`) — mismo
// placeholder de diseño que `cp6`/`cp7` arriba: de dónde sale una reseña
// nueva (formulario público del cliente, sección "Escribir una reseña"
// de la ficha de producto — placeholder de UI, sin lógica real detrás
// todavía) y cuándo debería publicarse es trabajo de backend pendiente.
export const resenasMock = [
  {
    id: 'r1',
    nombreCliente: 'Marta Ibáñez',
    clienteId: 'cl1',
    texto: 'El vestido Aurora es una pasada, la tela y el corte son espectaculares.',
    valoracion: 5,
    fecha: '2026-07-10',
    estado: 'Publicada',
    foto: '/img/Clientes/fely-campo-invitadas-reales-clientreview-1.webp',
    productoId: 'p1',
  },
  {
    id: 'r2',
    nombreCliente: 'Laura Gómez',
    clienteId: 'cl2',
    texto: 'Atención impecable en el atelier, el vestido de novia superó mis expectativas.',
    valoracion: 5,
    fecha: '2026-06-28',
    estado: 'Publicada',
    foto: '/img/Clientes/fely-campo-invitadas-reales-vestido-2clienta.webp',
    productoId: 'p3',
  },
  {
    id: 'r3',
    nombreCliente: 'Sara Molina',
    clienteId: 'cl4',
    texto: 'Muy buena calidad, aunque el plazo de entrega fue algo más largo de lo esperado.',
    valoracion: 4,
    fecha: '2026-06-02',
    estado: 'Oculta',
    foto: '',
    productoId: null,
  },
  {
    id: 'r4',
    nombreCliente: 'Elena Castro',
    clienteId: 'cl3',
    texto: 'La falda Vera es mi compra favorita de esta temporada, muy versátil.',
    valoracion: 5,
    fecha: '2026-05-18',
    estado: 'Publicada',
    foto: '',
    productoId: 'p2',
  },
  {
    id: 'r5',
    nombreCliente: 'Beatriz Soler',
    clienteId: 'cl6',
    texto: 'Me encantó el abrigo, calienta muchísimo y el corte es precioso, tal cual en las fotos.',
    valoracion: 5,
    fecha: '2026-08-12',
    estado: 'Oculta',
    foto: '',
    productoId: 'p7',
    nuevo: true,
  },
  {
    id: 'r6',
    nombreCliente: 'Carmen Vidal',
    clienteId: 'cl7',
    texto: 'Buena calidad pero la talla me quedó algo más justa de lo que esperaba según la guía.',
    valoracion: 3,
    fecha: '2026-08-13',
    estado: 'Oculta',
    foto: '',
    productoId: 'p1',
    nuevo: true,
  },
];

// ---------- CATEGORÍAS ----------

// "Otoño-Invierno 26/27" → "FW27" (último año del rango), "Primavera-Verano
// 26" → "SS26" — usado por `categoriasMock.archivo[].temporada` en
// ListaProductos.jsx (badge de tarjeta) y AdminSidebar.jsx (submenú de
// Runway). Vive aquí, no en un componente, porque ambos lo importan.
export function codigoTemporada(temporada) {
  if (!temporada) return '';
  const [estacion, anio] = temporada.split(' ');
  const anioFinal = anio.includes('/') ? anio.split('/')[1] : anio;
  return `${estacion === 'Otoño-Invierno' ? 'AW' : 'SS'}${anioFinal}`;
}

// (Los looks de ejemplo de Runway y Novias que había aquí ya no hacen
// falta: el menú sale de los datos reales, ver categoriasMock.)

// Función y no constante: lee el contenido de la base de datos, que el
// panel carga al abrirse (ContenidoAdmin.jsx), después de importar esto.
export const categoriasMock = () => ({
  // Las 5 categorías reales (lib/pretAPorter.js), igual que PretAPorter.jsx.
  'pret-a-porter': categoriasAdminPretAPorter(),
  atelier: [
    { id: 'cat3', nombre: 'Novias', visible: true, orden: 1 },
    { id: 'cat4', nombre: 'Fiesta', visible: true, orden: 2 },
  ],
  // Colecciones de pasarela reales (lib/runway.js), igual que Runway.jsx.
  archivo: categoriasAdminRunway(),
  // Colecciones de Novias reales (lib/catalogoNovias.js), igual que AtelierNovias.jsx.
  novia: categoriasAdminNovias(obtenerColeccionesNovias()),
  // Colecciones de Fiesta: las reales, de src/datos/atelierFiesta.js (las
  // mismas que enseña /atelier/fiesta). AtelierFiesta.jsx las mantiene al
  // día mientras se editan en /admin/colecciones/fiesta.
  fiesta: categoriasAdminFiesta(obtenerColeccionesFiesta()),
});

// ---------- STOCK ----------
// Stock general, sin desglose por ubicación (se quitó el antiguo
// stockMock/ubicacionesStock, un dataset de 7 filas aparte cubriendo solo
// 2 productos) — ahora /admin/stock lee directo de `productosMock[].tallas`,
// el mismo número que ya se edita en "Tallas y Stock" de cada producto.
// Solo Prêt-à-porter tiene tallas/stock (ver CAMPOS_TIPO en
// FormularioProducto.jsx), así que es el único tipo que aparece aquí.

// Mismo umbral en todos los sitios que muestran nivel de stock (página
// Stock, KPI "Referencias con stock bajo" del dashboard): 0 = agotado,
// menos de 5 = bajo, el resto = ok.
export function nivelStock(cantidad) {
  if (cantidad === 0) return 'agotado';
  if (cantidad < 5) return 'bajo';
  return 'ok';
}

// Una fila por talla activa de cada producto — así una prenda con 3 tallas
// ocupa 3 filas en la tabla de stock, cada una filtrable/ordenable por
// separado.
export function filasStock() {
  return productosMock
    .filter((p) => p.tallas?.length)
    .flatMap((p) => p.tallas.map((t) => ({
      id: `${p.id}-${t.talla}`,
      productoId: p.id,
      nombre: p.nombre,
      sku: p.sku,
      imagen: p.imagen,
      coleccion: p.coleccion,
      categoriaId: p.categoriaId,
      talla: t.talla,
      stock: t.stock,
    })));
}

// ---------- BLOG ----------
// Ya no hay datos de ejemplo: /admin/blog usa los reales (lib/blog.js).


// ---------- CLIENTES ----------

export const clientesMock = [
  {
    id: 'cl1', nombre: 'Marta Ibáñez', email: 'marta.ibanez@example.com', pedidos: 3, gastoTotal: '2.140 €', fechaAlta: '2025-11-02', estado: 'Activo', cumpleanos: '03-14',
  },
  {
    id: 'cl2', nombre: 'Laura Gómez', email: 'laura.gomez@example.com', pedidos: 1, gastoTotal: '420 €', fechaAlta: '2026-02-18', estado: 'Activo', cumpleanos: '07-22',
  },
  {
    id: 'cl3', nombre: 'Elena Castro', email: 'elena.castro@example.com', pedidos: 2, gastoTotal: '1.310 €', fechaAlta: '2025-09-27', estado: 'Activo', cumpleanos: '11-05',
  },
  {
    id: 'cl4', nombre: 'Sara Molina', email: 'sara.molina@example.com', pedidos: 1, gastoTotal: '420 €', fechaAlta: '2026-03-05', estado: 'Inactivo', cumpleanos: '01-30',
  },
  {
    id: 'cl5', nombre: 'Nuria Prats', email: 'nuria.prats@example.com', pedidos: 1, gastoTotal: '890 €', fechaAlta: '2026-01-14', estado: 'Activo', cumpleanos: '09-18',
  },
  {
    id: 'cl6', nombre: 'Beatriz Soler', email: 'beatriz.soler@example.com', pedidos: 4, gastoTotal: '3.360 €', fechaAlta: '2025-06-10', estado: 'Activo', cumpleanos: '05-09',
  },
  {
    id: 'cl7', nombre: 'Carmen Vidal', email: 'carmen.vidal@example.com', pedidos: 1, gastoTotal: '890 €', fechaAlta: '2026-04-22', estado: 'Inactivo', cumpleanos: '12-24',
  },
];

// ---------- NEWSLETTER ----------
// Suscriptores: clientas que han marcado "unirme a la newsletter" (origen
// "Clientes") y visitantes sin cuenta que se apuntaron desde el popup de
// la home (origen "Popup Home"). Dos orígenes, una sola lista.

export const newsletterMock = [
  {
    id: 'nl1', email: 'marta.ibanez@example.com', origen: 'Clientes', fecha: '2025-11-02',
  },
  {
    id: 'nl2', email: 'irene.salas@example.com', origen: 'Popup Home', fecha: '2025-12-14',
  },
  {
    id: 'nl3', email: 'beatriz.soler@example.com', origen: 'Clientes', fecha: '2025-06-10',
  },
  {
    id: 'nl4', email: 'paula.morales@example.com', origen: 'Popup Home', fecha: '2026-01-20',
  },
  {
    id: 'nl5', email: 'nuria.prats@example.com', origen: 'Clientes', fecha: '2026-01-14',
  },
  {
    id: 'nl6', email: 'clara.fernandez@example.com', origen: 'Popup Home', fecha: '2026-03-08',
  },
  {
    id: 'nl7', email: 'sofia.navarro@example.com', origen: 'Popup Home', fecha: '2026-05-02',
  },
  {
    id: 'nl8', email: 'carmen.vidal@example.com', origen: 'Clientes', fecha: '2026-04-22',
  },
];

// ---------- ANALÍTICAS ----------

// `clave` referencia una serie de `metricasMensualesMock` (abajo) — la usa
// el detalle de cada KPI (`/admin/metricas/kpi/:id`) para saber qué
// calcular. `formato` decide cómo se imprime esa serie ahí (`moneda` añade
// " €", `numero` no). El `valor`/`variacion` de aquí siguen siendo el
// resumen estático de "Resumen del mes en curso" — están alineados a mano
// con el mes 08 de `metricasMensualesMock['2026']` para que la tarjeta y el
// detalle no se contradigan.
export const kpisAnaliticas = [
  {
    id: 'k1', clave: 'ventas', formato: 'moneda', etiqueta: 'Ventas del mes', valor: '8.230 €', variacion: '+12%',
  },
  {
    id: 'k2', clave: 'pedidos', formato: 'numero', etiqueta: 'Pedidos', valor: '27', variacion: '+4%',
  },
  {
    id: 'k3', clave: 'clientesNuevos', formato: 'numero', etiqueta: 'Clientes nuevos', valor: '9', variacion: '+2%',
  },
  {
    id: 'k4', clave: 'ticketMedio', formato: 'moneda', etiqueta: 'Ticket medio', valor: '305 €', variacion: '-3%',
  },
];

// Serie mensual por año para los gráficos de detalle de cada KPI
// (`/admin/metricas/kpi/:id`) — una entrada por mes con datos reales
// (no se inventan meses futuros: hoy es agosto de 2026, así que solo hay
// enero-agosto). `porProducto` desglosa ventas/pedidos por tipo
// (`pret-a-porter`/`novias`/`fiesta`) para el filtro "Producto" de ese
// detalle; `ticketMedio` no se guarda, se deriva de ventas/pedidos para no
// duplicar la fuente de verdad. `clientesNuevos` no se desglosa por
// producto — un cliente nuevo no se atribuye a un tipo de prenda.
export const metricasMensualesMock = {
  2026: [
    {
      mes: '01',
      clientesNuevos: 4,
      porProducto: {
        'pret-a-porter': { ventas: 2800, pedidos: 10 },
        novias: { ventas: 900, pedidos: 3 },
        fiesta: { ventas: 500, pedidos: 2 },
      },
    },
    {
      mes: '02',
      clientesNuevos: 5,
      porProducto: {
        'pret-a-porter': { ventas: 3200, pedidos: 12 },
        novias: { ventas: 1100, pedidos: 3 },
        fiesta: { ventas: 500, pedidos: 2 },
      },
    },
    {
      mes: '03',
      clientesNuevos: 5,
      porProducto: {
        'pret-a-porter': { ventas: 3600, pedidos: 13 },
        novias: { ventas: 1300, pedidos: 4 },
        fiesta: { ventas: 500, pedidos: 2 },
      },
    },
    {
      mes: '04',
      clientesNuevos: 6,
      porProducto: {
        'pret-a-porter': { ventas: 3900, pedidos: 14 },
        novias: { ventas: 1400, pedidos: 4 },
        fiesta: { ventas: 600, pedidos: 2 },
      },
    },
    {
      mes: '05',
      clientesNuevos: 6,
      porProducto: {
        'pret-a-porter': { ventas: 4300, pedidos: 15 },
        novias: { ventas: 1600, pedidos: 5 },
        fiesta: { ventas: 600, pedidos: 2 },
      },
    },
    {
      mes: '06',
      clientesNuevos: 7,
      porProducto: {
        'pret-a-porter': { ventas: 4700, pedidos: 16 },
        novias: { ventas: 1800, pedidos: 5 },
        fiesta: { ventas: 600, pedidos: 2 },
      },
    },
    {
      mes: '07',
      clientesNuevos: 8,
      porProducto: {
        'pret-a-porter': { ventas: 5000, pedidos: 18 },
        novias: { ventas: 1900, pedidos: 5 },
        fiesta: { ventas: 700, pedidos: 2 },
      },
    },
    {
      // Ancla con el resumen estático de kpisAnaliticas: ventas 8.230 €,
      // pedidos 27, clientesNuevos 9, ticketMedio 305 € (8230/27 ≈ 304,8).
      mes: '08',
      clientesNuevos: 9,
      porProducto: {
        'pret-a-porter': { ventas: 5230, pedidos: 19 },
        novias: { ventas: 2000, pedidos: 4 },
        fiesta: { ventas: 1000, pedidos: 4 },
      },
    },
  ],
};

// Nombres de mes completos para el selector "Mes" de /admin/metricas — los
// 12 son siempre seleccionables, aunque `topProductosPorMesMock` (abajo)
// solo tenga filas para los 3 meses más recientes; el resto de combinaciones
// mes/año se resuelven a un estado vacío en la página, no a un error.
export const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Primer año con datos en `topProductosPorMesMock`. El selector "Año" de
// /admin/metricas construye el resto de opciones desde aquí hasta el año
// real actual (`new Date()`), así que un año nuevo (2027, 2028...) aparece
// solo con el paso del tiempo, sin tocar código.
export const ANIO_INICIO_METRICAS_MOCK = 2026;

// Un array por clave `AAAA-MM` para poder filtrar "Productos más vendidos"
// por mes/año en /admin/metricas — la entrada `2026-08` es la que antes era
// el único `topProductosMock`. `porTalla` (opcional) desglosa esas mismas
// unidades/ingresos por talla, para el filtro "Talla" de esa página — solo
// lo llevan los productos de Prêt-à-porter (`tallas` en `productosMock`);
// Atelier (Vestido Elena, Vestido Celeste) es a medida, sin tallas
// estándar, así que no aparece al filtrar por una talla concreta, solo en
// "Todas las tallas". Las sumas de `porTalla` cuadran con `unidadesVendidas`
// / `ingresos` de cada fila.
export const topProductosPorMesMock = {
  '2026-08': [
    {
      producto: 'Vestido Aurora',
      unidadesVendidas: 14,
      ingresos: '12.460 €',
      porTalla: [
        { talla: 38, unidadesVendidas: 4, ingresos: '3.560 €' },
        { talla: 40, unidadesVendidas: 7, ingresos: '6.230 €' },
        { talla: 42, unidadesVendidas: 3, ingresos: '2.670 €' },
      ],
    },
    {
      producto: 'Falda Vera',
      unidadesVendidas: 11,
      ingresos: '4.620 €',
      porTalla: [
        { talla: 38, unidadesVendidas: 3, ingresos: '1.260 €' },
        { talla: 40, unidadesVendidas: 5, ingresos: '2.100 €' },
        { talla: 42, unidadesVendidas: 3, ingresos: '1.260 €' },
      ],
    },
    { producto: 'Vestido Elena', unidadesVendidas: 3, ingresos: '7.200 €' },
    { producto: 'Vestido Celeste', unidadesVendidas: 2, ingresos: '1.960 €' },
  ],
  '2026-07': [
    {
      producto: 'Falda Vera',
      unidadesVendidas: 16,
      ingresos: '6.720 €',
      porTalla: [
        { talla: 38, unidadesVendidas: 5, ingresos: '2.100 €' },
        { talla: 40, unidadesVendidas: 7, ingresos: '2.940 €' },
        { talla: 42, unidadesVendidas: 4, ingresos: '1.680 €' },
      ],
    },
    {
      producto: 'Vestido Aurora',
      unidadesVendidas: 9,
      ingresos: '8.010 €',
      porTalla: [
        { talla: 38, unidadesVendidas: 2, ingresos: '1.780 €' },
        { talla: 40, unidadesVendidas: 5, ingresos: '4.450 €' },
        { talla: 42, unidadesVendidas: 2, ingresos: '1.780 €' },
      ],
    },
    { producto: 'Vestido Celeste', unidadesVendidas: 5, ingresos: '4.900 €' },
    { producto: 'Vestido Elena', unidadesVendidas: 1, ingresos: '2.400 €' },
  ],
  '2026-06': [
    { producto: 'Vestido Elena', unidadesVendidas: 7, ingresos: '16.800 €' },
    {
      producto: 'Vestido Aurora',
      unidadesVendidas: 6,
      ingresos: '5.340 €',
      porTalla: [
        { talla: 38, unidadesVendidas: 1, ingresos: '890 €' },
        { talla: 40, unidadesVendidas: 3, ingresos: '2.670 €' },
        { talla: 42, unidadesVendidas: 2, ingresos: '1.780 €' },
      ],
    },
    {
      producto: 'Falda Vera',
      unidadesVendidas: 4,
      ingresos: '1.680 €',
      porTalla: [
        { talla: 38, unidadesVendidas: 1, ingresos: '420 €' },
        { talla: 40, unidadesVendidas: 2, ingresos: '840 €' },
        { talla: 42, unidadesVendidas: 1, ingresos: '420 €' },
      ],
    },
    { producto: 'Vestido Celeste', unidadesVendidas: 3, ingresos: '2.940 €' },
  ],
};

// ---------- SETTINGS ----------

export const ajustesTiendaMock = {
  nombreTienda: 'Fely Campo',
  emailContacto: 'hola@felycampo.com',
  telefono: '+34 923 000 000',
  moneda: 'EUR',
  idiomaPredeterminado: 'Español',
};

// ---------- DISEÑO (bloques reales de la landing, en orden) ----------
// kind: 'hero' | 'text' | 'media' | 'productRow' | 'mediaSplit' | 'mediaText' | 'reviews'

export const disenoMock = [
  {
    id: 'd1',
    kind: 'hero',
    label: 'Hero — carrusel principal',
    // titulo/ctaTexto bilingües {es, en} — es el único bloque migrado a la
    // vista previa en espejo de Diseño (ver DisenoEditor.jsx), que usa un
    // selector de idioma único para toda la página en vez de uno por bloque.
    slides: [
      {
        id: 's1', src: '/img/landing/FW27-Hero3.mp4', tipo: 'video', titulo: { es: 'Prêt-à-porter', en: 'Ready-to-wear' }, ctaTexto: { es: 'Explorar', en: 'Explore' }, destino: '/pret-a-porter',
      },
      {
        id: 's2', src: '/img/hero-portada-felycampo-landing.jpg', tipo: 'imagen', titulo: { es: 'Prêt-à-porter', en: 'Ready-to-wear' }, ctaTexto: { es: 'Explorar', en: 'Explore' }, destino: '/pret-a-porter',
      },
      {
        id: 's3', src: '/img/fely-campo-web-novias-seccion-3.webp', tipo: 'imagen', titulo: { es: 'Bride 27', en: 'Bride 27' }, ctaTexto: { es: 'Ver colección', en: 'View collection' }, destino: '/atelier/novias',
      },
    ],
  },
  {
    id: 'd2',
    kind: 'text',
    label: 'Título de colección',
    // Único bloque con edición bilingüe completa en esta demo (regla
    // transversal 6) — el resto de bloques de Diseño seguirían el
    // mismo patrón (ver SelectorIdioma) cuando se conecten a datos reales.
    etiqueta: { es: 'Nueva temporada', en: 'New season' },
    titulo: { es: 'Edición mujer', en: "Women's edit" },
    descripcion: {
      es: 'Prêt-à-porter y piezas de autor pensadas para el día a día.',
      en: 'Ready-to-wear and signature pieces for everyday life.',
    },
  },
  {
    id: 'd3',
    kind: 'media',
    label: 'Banner — imagen destacada',
    src: '/img/FW27-HERO.webp',
    tipo: 'imagen',
    titulo: { es: 'Otoño Invierno 2027', en: 'Autumn Winter 2027' },
    ctaTexto: { es: 'Descubre la colección', en: 'Discover the collection' },
  },
  {
    id: 'd4',
    kind: 'productRow',
    label: 'Fila de producto — "Destacados"',
    // 4 IDs, no 2 — CuadriculaProductos.jsx reparte el ancho a partes
    // iguales entre lo que reciba (flex:1 por tarjeta, sin cuadrícula
    // fija), así que con solo 2 se veían 2 columnas anchas en vez de las
    // 4 de la home real (misma "Pensada para 4 productos" del propio
    // componente).
    productoIds: ['p1', 'p2', 'p7', 'p8'],
  },
  {
    id: 'd5',
    kind: 'mediaSplit',
    label: 'Dos imágenes — Novias / Fiesta',
    items: [
      { id: 'sm1', src: '/img/novias-sección-FelyCampo2.jpg', tipo: 'imagen', titulo: 'Novias' },
      { id: 'sm2', src: '/img/invitadas-sección-FelyCampo.jpg', tipo: 'imagen', titulo: 'Fiesta' },
    ],
  },
  {
    id: 'd7',
    kind: 'mediaText',
    label: 'Imagen + texto — "Visítanos"',
    imagen: '/img/artesany.jpg',
    titulo: 'Visita el atelier',
    texto: 'Costura a medida en Salamanca, Madrid y Oviedo. Reserva tu cita.',
    enlaceTexto: 'Reservar cita',
  },
  {
    id: 'd8',
    kind: 'reviews',
    label: 'Reseñas destacadas',
    resenaIds: ['r1', 'r2'],
    maximo: 5,
  },
];

// Páginas internas disponibles para los desplegables "destino" del CTA
// (nunca texto libre — mismo criterio que la sección web de productos).
// Páginas internas disponibles para los desplegables "destino" de Diseño
// (DisenoEditor.jsx "Destino del CTA") — cada valor es una ruta REAL de
// src/app/[locale]/ (aunque su contenido siga "pendiente de maquetar",
// la ruta ya existe y navega, ver comentarios de cada page.js). Las 5
// categorías de Prêt-à-porter son las mismas que categoriasMock['pret-a-porter']
// (sección 5); las 9 colecciones de Archivo son categoriasMock.archivo
// (sus slugs son categoriasMock.archivo[].nombre en minúsculas/con
// guiones — /archivo/colecciones/[coleccion] es una plantilla genérica
// que acepta cualquier slug, así que estos 9 ya navegan de verdad).
export const paginasInternas = [
  { valor: '/pret-a-porter', etiqueta: 'Prêt-à-porter' },
  { valor: '/pret-a-porter/tops-y-camisetas', etiqueta: 'Prêt-à-porter — Tops y Camisas' },
  { valor: '/pret-a-porter/chaquetas-y-abrigos', etiqueta: 'Prêt-à-porter — Chaquetas y Abrigos' },
  { valor: '/pret-a-porter/faldas', etiqueta: 'Prêt-à-porter — Faldas' },
  { valor: '/pret-a-porter/pantalones', etiqueta: 'Prêt-à-porter — Pantalones' },
  { valor: '/pret-a-porter/vestidos', etiqueta: 'Prêt-à-porter — Vestidos' },
  { valor: '/atelier', etiqueta: 'Atelier' },
  { valor: '/atelier/novias', etiqueta: 'Atelier — Novias' },
  { valor: '/atelier/fiesta', etiqueta: 'Atelier — Fiesta' },
  { valor: '/atelier-fiesta/madrid', etiqueta: 'Atelier Fiesta — Madrid' },
  { valor: '/atelier-fiesta/oviedo', etiqueta: 'Atelier Fiesta — Oviedo' },
  { valor: '/atelier-fiesta/salamanca', etiqueta: 'Atelier Fiesta — Salamanca' },
  { valor: '/archivo', etiqueta: 'Archivo' },
  { valor: '/colecciones-fely-campo', etiqueta: 'Archivo — Runway' },
  { valor: '/archivo/colecciones', etiqueta: 'Archivo — Colecciones' },
  { valor: '/archivo/colecciones/la-coleccion', etiqueta: 'Archivo — La Colección' },
  { valor: '/archivo/colecciones/dreaming', etiqueta: 'Archivo — Dreaming' },
  { valor: '/archivo/colecciones/self-world', etiqueta: 'Archivo — Self World' },
  { valor: '/archivo/colecciones/lei-zu', etiqueta: 'Archivo — Lei Zu' },
  { valor: '/archivo/colecciones/the-way-here', etiqueta: 'Archivo — The Way Here' },
  { valor: '/archivo/colecciones/zigurat', etiqueta: 'Archivo — Zigurat' },
  { valor: '/archivo/colecciones/tempore', etiqueta: 'Archivo — Tempore' },
  { valor: '/archivo/colecciones/nagare', etiqueta: 'Archivo — Nagare' },
  { valor: '/archivo/colecciones/diafonia', etiqueta: 'Archivo — Diafonía' },
  { valor: '/visita-fely-campo', etiqueta: 'Visítanos' },
  { valor: '/visita-fely-campo/cita', etiqueta: 'Visítanos — Cita' },
];

// Banco de vídeos ya subidos, mismo criterio que bancoImagenes.
export const bancoVideos = [
  '/img/landing/FW27-Hero3.mp4',
  '/img/artesany.mp4',
  '/img/artesany-2.mp4',
  '/img/ecommerce/27FW/27fw-video.mp4',
];

// Banco de imágenes ya subidas, para los selectores de imagen (Diseño, Blog, Contenido).
export const bancoImagenes = [
  '/img/FW27-HERO.webp',
  '/img/FW27-Hero2.jpg',
  '/img/HERO-2.jpg',
  '/img/artesany.jpg',
  '/img/novias-sección-FelyCampo.jpg',
  '/img/novias-sección-FelyCampo2.jpg',
  '/img/fely-campo-web-novias-seccion-3.webp',
  '/img/novias-sección-FelyCampo4.jpg',
  '/img/invitadas-sección-FelyCampo.jpg',
  '/img/invitadas-sección-FelyCampo2.jpg',
  '/img/punto-venta.webp',
  '/img/ecommerce/27FW/FW27-Dress-Look02.jpg',
  '/img/ecommerce/27FW/FW27-Top-Look01.jpg',
  '/img/ecommerce/27FW/FW27-Top-Look03.jpg',
  '/img/ecommerce/Invitada/LOOK1_2-scaled.webp',
  '/img/ecommerce/Invitada/LOOK9_1-scaled.webp',
  '/img/ecommerce/Invitada/LOOK12_2-scaled.webp',
  '/img/ecommerce/Invitada/LOOK18_1-scaled.webp',
];
