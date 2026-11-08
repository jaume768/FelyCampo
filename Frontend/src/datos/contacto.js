// contacto.js
//
// Los datos de contacto generales de Fely Campo y sus redes sociales: un
// único sitio para toda la web. Lo edita «Contacto y redes» en el admin.
// Lectura y reglas: src/lib/contacto.js. Ver docs/ADMIN.md.
// Migrado de donde estaban repartidos: el número de BotonWhatsapp.jsx, las
// redes de Footer.jsx y lib/datosEstructurados.js, el email de la antigua
// /ayuda/atencion-cliente y el mensaje de WhatsApp de messages/*.json
// (whatsappFlotante.mensaje). El teléfono y el horario generales se
// quitaron con Atención al cliente (2026-11-07): cada atelier tiene los suyos.
// (Los datos de cada atelier, con su dirección y teléfonos, están aparte:
// src/datos/ateliers.js.)
//
//   email            el email de contacto (avisos de error de los
//                    formularios de cita y de consulta de vestido).
//   whatsapp         el número del botón flotante de WhatsApp.
//   mensajeWhatsapp  el texto con el que se abre la conversación.
//   redes            el enlace de cada red ('' = no sale en el pie).

export const CONTACTO = {
  email: 'info@felycampo.com',
  whatsapp: '+34 659 00 62 57',
  mensajeWhatsapp: {
    es: 'Hola, me gustaría recibir información sobre Fely Campo.',
    en: 'Hello, I would like some information about Fely Campo.',
  },
  redes: {
    instagram: 'https://www.instagram.com/felycampo/',
    facebook: 'https://www.facebook.com/fely.campo',
    youtube: 'https://www.youtube.com/channel/UCQeHEIrbwpFjAYtoGfzRUaA',
    tiktok: '',
    pinterest: '',
    linkedin: '',
  },
};
