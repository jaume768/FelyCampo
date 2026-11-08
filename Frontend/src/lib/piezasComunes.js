// piezasComunes.js
//
// Fotos del menú, banda «Pedir cita», tarjetas «Atelier … & Showroom» y
// ventana de la newsletter: los leen Navbar.jsx, PedirCita.jsx,
// AteliersCita.jsx y NewsletterModal.jsx; los edita el admin
// («Menú, Pedir cita y newsletter»).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerPiezasComunes() (ojo: el menú y la newsletter son componentes de
// cliente). Ver docs/ADMIN.md.

import { contenido } from './contenido';

export const ID_PAGINA_PIEZAS = 'piezas-comunes';

export function obtenerPiezasComunes() {
  return contenido('piezas-comunes');
}

// Los desplegables del menú y sus enlaces, con el nombre con que salen en
// la web (para el admin).
export const DESPLEGABLES_MENU = [
  {
    id: 'elMundoDeFely',
    nombre: 'Sobre Fely',
    enlaces: [['historia', 'Historia'], ['podcast', 'Blog & Podcast'], ['talleres', 'Nuestros talleres']],
  },
  {
    id: 'atelier',
    nombre: 'Atelier',
    enlaces: [['salamanca', 'Salamanca'], ['madrid', 'Madrid'], ['oviedo', 'Oviedo'], ['vosotras', 'Vosotras']],
  },
  {
    id: 'colecciones',
    nombre: 'Colecciones',
    enlaces: [['fiesta', 'Fiesta'], ['novias', 'Novias'], ['pretaporter', 'Prêt-à-porter'], ['runway', 'Runway']],
  },
  {
    id: 'puntosDeVenta',
    nombre: 'Dónde encontrar Fely Campo',
    enlaces: [['propios', 'Nuestros ateliers'], ['externos', 'Puntos de venta']],
  },
];

export function camposPiezasComunes(datos) {
  const campos = [];
  DESPLEGABLES_MENU.forEach(({ id, nombre, enlaces }) => {
    campos.push({
      bloque: 'menu', nombre: `la foto grande de «${nombre}»`, tipo: 'medio', valor: datos.menu[id].portada, requerido: true,
    });
    enlaces.forEach(([clave, texto]) => campos.push({
      bloque: 'menu', nombre: `la foto de «${nombre} › ${texto}»`, tipo: 'medio', valor: datos.menu[id][clave], requerido: true,
    }));
  });
  campos.push(
    {
      bloque: 'menu', nombre: 'la foto del menú del móvil', tipo: 'medio', valor: datos.menu.movil, requerido: true,
    },
    {
      bloque: 'pedirCita', nombre: 'la foto de la banda «Pedir cita»', tipo: 'medio', valor: datos.pedirCita.imagen, requerido: true,
    },
    {
      bloque: 'pedirCita', nombre: 'el título de la banda «Pedir cita»', tipo: 'texto', valor: datos.pedirCita.titulo, requerido: true,
    },
    {
      bloque: 'pedirCita', nombre: 'el botón de la banda «Pedir cita»', tipo: 'texto', valor: datos.pedirCita.boton, requerido: true,
    },
    {
      bloque: 'ateliersCita', nombre: 'el botón de las tarjetas de los ateliers', tipo: 'texto', valor: datos.ateliersCita.boton, requerido: true,
    },
    {
      bloque: 'newsletter', nombre: 'la foto de la newsletter', tipo: 'medio', valor: datos.newsletter.imagen, requerido: true,
    },
    {
      bloque: 'newsletter', nombre: 'el título de la newsletter', tipo: 'texto', valor: datos.newsletter.titulo, requerido: true,
    },
    {
      bloque: 'newsletter', nombre: 'el texto de la newsletter', tipo: 'texto', valor: datos.newsletter.subtitulo, requerido: true,
    },
  );
  return campos;
}
