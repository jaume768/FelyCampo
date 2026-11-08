// contacto.js
//
// Los datos de contacto generales y las redes sociales: los leen el botón
// de WhatsApp, el pie de página, los avisos de los formularios y los
// datos para Google; los edita «Contacto y redes» en el
// admin (/admin/contacto).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerContacto(). Ver docs/ADMIN.md.

import { CONTACTO } from '@/datos/contacto';

export const ID_PAGINA_CONTACTO = 'contacto';

export function obtenerContacto() {
  return CONTACTO;
}

// Las redes que puede tener el pie, en este orden.
export const REDES_SOCIALES = [
  { clave: 'instagram', nombre: 'Instagram', ejemplo: 'https://www.instagram.com/felycampo/' },
  { clave: 'facebook', nombre: 'Facebook', ejemplo: 'https://www.facebook.com/fely.campo' },
  { clave: 'youtube', nombre: 'YouTube', ejemplo: 'https://www.youtube.com/@felycampo' },
  { clave: 'tiktok', nombre: 'TikTok', ejemplo: 'https://www.tiktok.com/@felycampo' },
  { clave: 'pinterest', nombre: 'Pinterest', ejemplo: 'https://www.pinterest.es/felycampo/' },
  { clave: 'linkedin', nombre: 'LinkedIn', ejemplo: 'https://www.linkedin.com/company/felycampo/' },
];

// Las que tienen enlace: [{ clave, nombre, url }].
export function redesConEnlace(contacto = CONTACTO) {
  return REDES_SOCIALES
    .filter(({ clave }) => String(contacto.redes[clave] || '').trim())
    .map(({ clave, nombre }) => ({ clave, nombre, url: contacto.redes[clave].trim() }));
}

// El botón de WhatsApp: el número sin + ni espacios, con el mensaje.
export function enlaceWhatsapp(numero, mensaje) {
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
  return `https://wa.me/${String(numero).replace(/\D/g, '')}${texto}`;
}

// Un teléfono con prefijo internacional (+34…) y al menos 9 cifras.
export const telefonoValido = (telefono) => /^\+\d[\d\s]{7,}$/.test(String(telefono || '').trim());
const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

export function camposContacto(datos) {
  return [
    {
      bloque: 'contacto', nombre: 'el email', tipo: 'linea', valor: datos.email, requerido: true,
    },
    {
      bloque: 'whatsapp', nombre: 'el número de WhatsApp', tipo: 'linea', valor: datos.whatsapp, requerido: true,
    },
    {
      bloque: 'whatsapp', nombre: 'el mensaje de WhatsApp', tipo: 'texto', valor: datos.mensajeWhatsapp, requerido: true,
    },
    ...REDES_SOCIALES.map(({ clave, nombre }) => ({
      bloque: 'redes', nombre: `el enlace de ${nombre}`, tipo: 'url', valor: datos.redes[clave], requerido: false,
    })),
  ];
}

// Lo que no es «falta un campo»: que el email y el WhatsApp estén bien
// escritos (un número mal puesto deja el botón de WhatsApp sin funcionar).
// Los enlaces de las redes ya los revisa camposPagina (tipo 'url').
export function validarExtraContacto(datos) {
  const errores = [];
  if (datos.email && !emailValido(datos.email)) errores.push('Revisa el email: tiene que ser como nombre@felycampo.com.');
  if (datos.whatsapp && !telefonoValido(datos.whatsapp)) errores.push('Revisa el número de WhatsApp: empieza por el prefijo del país, por ejemplo +34 659 00 62 57.');
  return errores;
}
