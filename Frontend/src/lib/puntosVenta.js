// puntosVenta.js
//
// Los puntos de venta del mapa: los lee la web (MapaPuntosVenta.jsx, en
// /puntos-de-venta-fely-campo y /visita-fely-campo), el reparto de citas
// (admin/consultas/puntoCercano.js) y el admin (/admin/puntos-de-venta).
//
// PARA EL PROGRAMADOR: al conectar la base de datos, solo hay que cambiar
// obtenerPuntosVenta(). Ver docs/ADMIN.md.

import { contenido } from './contenido';
import { obtenerSede, ubicacionDe } from './ateliers';
import { slugify } from './slugify';

export const ID_PREVIA_PUNTOS = 'puntos-venta';
export const RUTA_WEB_PUNTOS = '/puntos-de-venta-fely-campo';
export const EDITOR_PUNTOS = '/admin/puntos-de-venta';

// Un atelier propio («sede») toma la dirección y el teléfono de su página
// de atelier. "sedes": (id) => la sede (por defecto, lo publicado; el admin
// pasa lo que tiene publicado en memoria).
export function conDatosDeSede(punto, sedes = obtenerSede) {
  const sede = punto.sede && sedes(punto.sede);
  if (!sede) return punto;
  const ubicacion = ubicacionDe(sede);
  return { ...punto, direccion: ubicacion.direccion, telefono: ubicacion.telefonos[0] || null };
}

// Tal como se guardan (el admin los edita así).
export function puntosGuardados() {
  return contenido('puntos-venta');
}

// Todos, también los ocultos, con los datos de los ateliers al día (la web
// y el reparto de citas).
export function obtenerPuntosVenta() {
  return contenido('puntos-venta').map((punto) => conDatosDeSede(punto));
}

// Los que salen en el mapa de la web (y con su sitio marcado: uno a
// medio crear, en la vista previa, todavía puede no tenerlo).
export const tieneUbicacion = (punto) => typeof punto.lat === 'number' && typeof punto.lng === 'number';

export function puntosPublicados(puntos = contenido('puntos-venta')) {
  return puntos.filter((punto) => punto.publicado && tieneUbicacion(punto));
}

// Los ateliers propios también están en el mapa, pero no se pueden
// borrar desde aquí (el reparto de citas cuenta con ellos), y su dirección
// y su teléfono se cambian en su página de atelier.
export const esAtelierPropio = (punto) => Boolean(punto.sede) || punto.id.startsWith('fely-campo');

// España primero y luego el resto, de más a menos puntos.
export function paisesDe(puntos) {
  const cuenta = new Map();
  puntos.forEach((punto) => cuenta.set(punto.pais, (cuenta.get(punto.pais) || 0) + 1));
  return [...cuenta.entries()]
    .sort(([a, na], [b, nb]) => {
      if (a === 'España') return -1;
      if (b === 'España') return 1;
      return nb - na || a.localeCompare(b, 'es');
    })
    .map(([pais, numero]) => ({ pais, numero }));
}

export function nuevoPunto() {
  return {
    id: '', nombre: '', direccion: ['', ''], pais: 'España', telefono: '', email: '', lat: null, lng: null, foto: '', publicado: true,
  };
}

// La dirección (id) de un punto nuevo, a partir de su nombre.
export function slugPunto(nombre, existentes) {
  const base = slugify(nombre) || 'punto-de-venta';
  let slug = base;
  for (let n = 2; existentes.includes(slug); n += 1) slug = `${base}-${n}`;
  return slug;
}

// Como se guarda: sin espacios de más, y teléfono o email vacíos = null
// (igual que en los datos).
export function limpiarPunto(punto) {
  const opcional = (texto) => (String(texto || '').trim() ? String(texto).trim() : null);
  return {
    ...punto,
    nombre: punto.nombre.trim(),
    pais: punto.pais.trim(),
    direccion: punto.direccion.map((linea) => linea.trim()).filter(Boolean),
    telefono: opcional(punto.telefono),
    email: opcional(punto.email),
  };
}

export function camposPunto(punto) {
  return [
    {
      bloque: 'datos', nombre: 'el nombre', tipo: 'linea', valor: punto.nombre, requerido: true,
    },
    {
      bloque: 'datos', nombre: 'el país', tipo: 'linea', valor: punto.pais, requerido: true,
    },
    {
      bloque: 'datos', nombre: 'la dirección (calle)', tipo: 'linea', valor: punto.direccion[0], requerido: true,
    },
    {
      bloque: 'datos', nombre: 'la dirección (código postal y ciudad)', tipo: 'linea', valor: punto.direccion[1], requerido: true,
    },
  ];
}

// Lo que no es «falta un campo»: el sitio en el mapa, el email y un
// nombre repetido.
export function validarExtraPunto(punto, puntos) {
  const errores = [];
  if (!tieneUbicacion(punto)) {
    errores.push('Marca dónde está en el mapa: pulsa «Buscar la dirección en el mapa» o pincha en el mapa.');
  }
  if (punto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(punto.email).trim())) {
    errores.push('Revisa el email: tiene que ser como nombre@tienda.com.');
  }
  const nombre = punto.nombre.trim().toLowerCase();
  const repetido = nombre && puntos.find((otro) => otro.id !== punto.id && otro.nombre.trim().toLowerCase() === nombre);
  if (repetido) errores.push(`Ya hay otro punto de venta que se llama «${repetido.nombre}».`);
  return errores;
}
