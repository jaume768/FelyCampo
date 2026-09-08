/* Datos de los 4 ateliers/showroom — ver page.js. Nombre, dirección y
   teléfonos no llevan traducción (mismo texto en cualquier idioma);
   horario y descripción sí ({es, en}, mismo criterio bilingüe que
   disenoMock en components/admin/mockData.js). "horario: null" (Madrid)
   se resuelve en page.js con la nota "showroomNota" en su lugar. */

export const UBICACIONES = [
  {
    id: 'salamanca-novias',
    imagen: '/img/atelier/ateliernovia-lamedida-felycampo-3.webp',
    nombre: 'Atelier Novias Salamanca',
    direccion: ['C/ Laguna Negra 17-19', '37008 Salamanca'],
    telefonos: ['+34 923 000 000', '+34 683 703 644'],
    whatsapp: '+34 683 703 644',
    horario: { es: 'Lun - Vie: 09:30 - 17:30', en: 'Mon - Fri: 9:30am - 5:30pm' },
    descripcion: {
      es: 'Atelier de novia: pruebas, patronaje y confección a medida.',
      en: 'Bridal atelier: fittings, pattern-making and made-to-measure gowns.',
    },
  },
  {
    id: 'salamanca-fiesta',
    imagen: '/img/collections/fiesta/pretaporter-cover.webp',
    nombre: 'Atelier Fiesta Salamanca',
    direccion: ['C/ Toro 32', '37002 Salamanca'],
    telefonos: ['+34 923 111 222'],
    whatsapp: '+34 611 222 333',
    horario: { es: 'Lun - Vie: 09:30 - 17:30', en: 'Mon - Fri: 9:30am - 5:30pm' },
    descripcion: {
      es: 'Atelier de fiesta y ceremonia: piezas de autor para ocasiones especiales.',
      en: 'Eveningwear atelier: statement pieces for special occasions.',
    },
  },
  {
    id: 'oviedo',
    imagen: '/img/punto-venta.webp',
    nombre: 'Atelier Oviedo',
    direccion: ['C/ Uría 12', '33003 Oviedo'],
    telefonos: ['+34 985 000 000'],
    whatsapp: '+34 622 333 444',
    horario: { es: 'Lun - Sáb: 10:30 - 14:00 y 17:00 - 20:30', en: 'Mon - Sat: 10:30am - 2pm & 5pm - 8:30pm' },
    descripcion: {
      es: 'Punto de venta y atelier en el centro de Oviedo: prêt-à-porter y encargos a medida.',
      en: 'Boutique and atelier in central Oviedo: ready-to-wear and made-to-order pieces.',
    },
  },
  {
    id: 'madrid',
    imagen: '/img/collections/fiesta/Madrid-cover.webp',
    nombre: 'Showroom Madrid',
    direccion: ['C/ Jorge Juan 12', '28001 Madrid'],
    telefonos: ['+34 910 000 000'],
    whatsapp: '+34 633 444 555',
    horario: null,
    descripcion: {
      es: 'Descubre la colección completa en un espacio íntimo, junto a la Milla de Oro.',
      en: 'Discover the full collection in an intimate space, in the heart of the Golden Mile.',
    },
  },
];
