/* Paleta de colores del catálogo (familias + colores con nombre ES/EN y
   hex). Datos PÚBLICOS: los usan los filtros de color de la cuadrícula
   (CuadriculaProductos.jsx) y el admin (GestorColores, FormularioLook...).
   Antes vivía dentro de components/admin/mockData.js, y al importarla
   desde la cuadrícula el bundler metía TODO mockData (clientas, emails,
   pedidos de prueba) en el JavaScript público (auditoría SEO, "Gestión
   interna", 2026-11-04). mockData.js la reexporta para no tocar el admin. */

// Familias de color (grupos) — el picker de FormularioProducto.jsx/
// GestorColores.jsx/FormularioLook.jsx agrupa coloresMock bajo estas
// cabeceras, y el desplegable de "añadir color nuevo" solo permite
// encajarlo en una de estas familias existentes (no crea familias nuevas).
// `muestras`: 1-2 ids de coloresMock elegidos a mano por familia (no los
// primeros de la lista sin más) para que el par de cuadraditos junto al
// nombre del grupo sea reconocible de un vistazo — p.ej. "reds" enseña
// rojo pasión + burdeos, no dos tonos casi iguales.
export const familiasColorMock = [
  { id: 'neutrals', etiqueta: 'Neutros', muestras: ['black', 'optic-white'] },
  { id: 'browns', etiqueta: 'Marrones', muestras: ['camel', 'chocolate'] },
  { id: 'reds', etiqueta: 'Rojos y vinos', muestras: ['passion-red', 'bordeaux'] },
  { id: 'pinks', etiqueta: 'Rosas y fucsias', muestras: ['fuchsia', 'baby-pink'] },
  { id: 'oranges', etiqueta: 'Naranjas', muestras: ['orange', 'terracotta'] },
  { id: 'yellows', etiqueta: 'Amarillos y dorados', muestras: ['mustard', 'pastel-yellow'] },
  { id: 'greens', etiqueta: 'Verdes', muestras: ['emerald', 'olive-green'] },
  { id: 'blues', etiqueta: 'Azules', muestras: ['navy', 'sky-blue'] },
  { id: 'purples', etiqueta: 'Morados', muestras: ['violet', 'lilac-lavender'] },
  { id: 'coolGreys', etiqueta: 'Grises fríos', muestras: ['silver', 'ice-grey'] },
];

// Cada color pertenece a una familia (`familia`, id de familiasColorMock)
// y lleva nombre bilingüe — se usa `nombre.es` en el nombre de archivo de
// imagen (ver nombreArchivoImagen en FormularioProducto.jsx) y ambos en el
// chip del picker.
export const coloresMock = [
  // Neutros
  { id: 'black', familia: 'neutrals', nombre: { es: 'Negro', en: 'Black' }, hex: '#111111' },
  { id: 'optic-white', familia: 'neutrals', nombre: { es: 'Blanco óptico', en: 'Optic White' }, hex: '#FAFAF7' },
  { id: 'ivory', familia: 'neutrals', nombre: { es: 'Marfil', en: 'Ivory' }, hex: '#F3EDE1' },
  { id: 'ecru', familia: 'neutrals', nombre: { es: 'Crudo', en: 'Ecru' }, hex: '#EDE7DA' },
  { id: 'pearl-grey', familia: 'neutrals', nombre: { es: 'Gris perla', en: 'Pearl Grey' }, hex: '#CFCCC6' },
  { id: 'stone-grey', familia: 'neutrals', nombre: { es: 'Gris piedra', en: 'Stone Grey' }, hex: '#A8A29A' },
  { id: 'taupe', familia: 'neutrals', nombre: { es: 'Topo', en: 'Taupe' }, hex: '#8E7F6E' },
  { id: 'anthracite', familia: 'neutrals', nombre: { es: 'Antracita', en: 'Anthracite' }, hex: '#4A4A48' },
  // Marrones
  { id: 'sand', familia: 'browns', nombre: { es: 'Arena', en: 'Sand' }, hex: '#D8CBB4' },
  { id: 'beige', familia: 'browns', nombre: { es: 'Beige', en: 'Beige' }, hex: '#D9C7A9' },
  { id: 'nude', familia: 'browns', nombre: { es: 'Nude', en: 'Nude' }, hex: '#E3C4A8' },
  { id: 'camel', familia: 'browns', nombre: { es: 'Camel', en: 'Camel' }, hex: '#C19A6B' },
  { id: 'bronze', familia: 'browns', nombre: { es: 'Bronce', en: 'Bronze' }, hex: '#8C6A3F' },
  { id: 'chocolate', familia: 'browns', nombre: { es: 'Chocolate', en: 'Chocolate' }, hex: '#4B3621' },
  // Rojos y vinos
  { id: 'coral', familia: 'reds', nombre: { es: 'Coral', en: 'Coral' }, hex: '#E0715A' },
  { id: 'brick', familia: 'reds', nombre: { es: 'Teja', en: 'Brick' }, hex: '#A34A2A' },
  { id: 'passion-red', familia: 'reds', nombre: { es: 'Rojo pasión', en: 'Passion Red' }, hex: '#B21F2D' },
  { id: 'bordeaux', familia: 'reds', nombre: { es: 'Burdeos', en: 'Bordeaux' }, hex: '#6E1E2B' },
  { id: 'wine', familia: 'reds', nombre: { es: 'Vino', en: 'Wine' }, hex: '#4A0E1E' },
  // Rosas y fucsias
  { id: 'baby-pink', familia: 'pinks', nombre: { es: 'Rosa baby', en: 'Baby Pink' }, hex: '#F7D6DE' },
  { id: 'quartz-pink', familia: 'pinks', nombre: { es: 'Rosa cuarzo', en: 'Quartz Pink' }, hex: '#F0C4CC' },
  { id: 'dusty-rose', familia: 'pinks', nombre: { es: 'Rosa palo', en: 'Dusty Rose' }, hex: '#D9B8B2' },
  { id: 'powder-pink', familia: 'pinks', nombre: { es: 'Rosa empolvado', en: 'Powder Pink' }, hex: '#E7C6CC' },
  { id: 'bubblegum-pink', familia: 'pinks', nombre: { es: 'Rosa chicle', en: 'Bubblegum Pink' }, hex: '#E8749A' },
  { id: 'fuchsia', familia: 'pinks', nombre: { es: 'Fucsia', en: 'Fuchsia' }, hex: '#B03060' },
  { id: 'plum', familia: 'pinks', nombre: { es: 'Ciruela', en: 'Plum' }, hex: '#5A2A4A' },
  // Naranjas
  { id: 'peach', familia: 'oranges', nombre: { es: 'Melocotón', en: 'Peach' }, hex: '#F6C8A8' },
  { id: 'terracotta', familia: 'oranges', nombre: { es: 'Terracota', en: 'Terracotta' }, hex: '#B5623C' },
  { id: 'orange', familia: 'oranges', nombre: { es: 'Naranja', en: 'Orange' }, hex: '#E0722F' },
  { id: 'rust', familia: 'oranges', nombre: { es: 'Óxido', en: 'Rust' }, hex: '#9E4A24' },
  // Amarillos y dorados
  { id: 'pastel-yellow', familia: 'yellows', nombre: { es: 'Amarillo pastel', en: 'Pastel Yellow' }, hex: '#F3E6A8' },
  { id: 'vanilla', familia: 'yellows', nombre: { es: 'Vainilla', en: 'Vanilla' }, hex: '#EFE3B0' },
  { id: 'mustard', familia: 'yellows', nombre: { es: 'Mostaza', en: 'Mustard' }, hex: '#C99A2E' },
  { id: 'gold-champagne', familia: 'yellows', nombre: { es: 'Oro / Champán', en: 'Gold / Champagne' }, hex: '#C6A664' },
  // Verdes
  { id: 'mint-green', familia: 'greens', nombre: { es: 'Verde menta', en: 'Mint Green' }, hex: '#C6E6D4' },
  { id: 'pistachio-green', familia: 'greens', nombre: { es: 'Verde pistacho', en: 'Pistachio Green' }, hex: '#BCCB8E' },
  { id: 'sage-green', familia: 'greens', nombre: { es: 'Verde salvia', en: 'Sage Green' }, hex: '#9DA88C' },
  { id: 'khaki', familia: 'greens', nombre: { es: 'Caqui', en: 'Khaki' }, hex: '#7C7A53' },
  { id: 'olive-green', familia: 'greens', nombre: { es: 'Verde oliva', en: 'Olive Green' }, hex: '#6B6A3A' },
  { id: 'emerald', familia: 'greens', nombre: { es: 'Esmeralda', en: 'Emerald' }, hex: '#0F5C43' },
  { id: 'petrol', familia: 'greens', nombre: { es: 'Petróleo', en: 'Petrol' }, hex: '#1E4D4A' },
  { id: 'bottle-green', familia: 'greens', nombre: { es: 'Verde botella', en: 'Bottle Green' }, hex: '#14342B' },
  // Azules
  { id: 'baby-blue', familia: 'blues', nombre: { es: 'Azul baby', en: 'Baby Blue' }, hex: '#CFE3F2' },
  { id: 'sky-blue', familia: 'blues', nombre: { es: 'Azul cielo', en: 'Sky Blue' }, hex: '#A9CFE8' },
  { id: 'light-blue', familia: 'blues', nombre: { es: 'Azul celeste', en: 'Light Blue' }, hex: '#7FB3D8' },
  { id: 'denim', familia: 'blues', nombre: { es: 'Denim', en: 'Denim' }, hex: '#4A6B8A' },
  { id: 'klein-blue', familia: 'blues', nombre: { es: 'Azul klein', en: 'Klein Blue' }, hex: '#1B2A78' },
  { id: 'navy', familia: 'blues', nombre: { es: 'Azul marino', en: 'Navy' }, hex: '#1F2A44' },
  // Morados
  { id: 'lilac-lavender', familia: 'purples', nombre: { es: 'Lila / Lavanda', en: 'Lilac / Lavender' }, hex: '#D6C8E8' },
  { id: 'mauve', familia: 'purples', nombre: { es: 'Malva', en: 'Mauve' }, hex: '#8E7C93' },
  { id: 'violet', familia: 'purples', nombre: { es: 'Violeta', en: 'Violet' }, hex: '#6A4B8C' },
  { id: 'aubergine', familia: 'purples', nombre: { es: 'Berenjena', en: 'Aubergine' }, hex: '#3E2A44' },
  // Grises fríos
  { id: 'ice-grey', familia: 'coolGreys', nombre: { es: 'Gris hielo', en: 'Ice Grey' }, hex: '#E2E6EA' },
  { id: 'blue-grey', familia: 'coolGreys', nombre: { es: 'Azul grisáceo', en: 'Blue Grey' }, hex: '#B9C4CC' },
  { id: 'silver', familia: 'coolGreys', nombre: { es: 'Plata', en: 'Silver' }, hex: '#C4C7CC' },
];
