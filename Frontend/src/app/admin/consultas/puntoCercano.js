// puntoCercano.js
//
// Los ateliers y boutiques que se pueden asignar a una cita (la misma
// lista del mapa de puntos de venta, lib/puntosVenta.js). El formulario de
// cita de la web pregunta directamente el atelier (Salamanca, Madrid u
// Oviedo): la cita empieza asignada a ese atelier y el equipo puede
// pasarla a otro atelier o a una boutique. (La antigua sugerencia del
// "punto más cercano" por código postal se quitó: el formulario ya no lo
// pregunta.)

import { esAtelierPropio, obtenerPuntosVenta } from '@/lib/puntosVenta';

const PUNTOS_VENTA = () => obtenerPuntosVenta();

export const ateliersPropios = () => PUNTOS_VENTA().filter(esAtelierPropio);
const boutiques = () => PUNTOS_VENTA().filter((p) => !esAtelierPropio(p));

// Boutiques agrupadas por país (para los <optgroup> de "Atelier asignado"),
// España primero y el resto por orden alfabético.
export function boutiquesPorPais() {
  const grupos = {};
  for (const b of boutiques()) (grupos[b.pais] ||= []).push(b);
  return Object.entries(grupos).sort(([a], [b]) => (a === 'España' ? -1 : b === 'España' ? 1 : a.localeCompare(b, 'es')));
}

export function puntoPorId(id) {
  return PUNTOS_VENTA().find((p) => p.id === id);
}

// El punto del mapa del atelier que eligió la clienta (salamanca…).
export function puntoDeSede(ubicacion) {
  return PUNTOS_VENTA().find((p) => p.sede === ubicacion);
}
