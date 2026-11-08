// citasFormato.js
//
// Formato compartido por el listado y el detalle de Citas
// (/admin/consultas): fechas en español, idioma y el atelier que eligió
// la clienta en el formulario (lib/citaAtelier.js, ATELIERES_CITA).

import { ATELIERES_CITA } from '@/lib/citaAtelier';

export function nombreAtelier(ubicacion) {
  const atelier = ATELIERES_CITA.find((a) => a.id === ubicacion);
  return atelier ? `Atelier ${atelier.nombre}` : 'Sin elegir';
}

// La fecha del evento: el formulario pide mes y año. "2027-06" → "junio de 2027"
export function mesAnio(fecha) {
  if (!fecha) return '—';
  const [anio, mes] = fecha.split('-');
  if (!mes) return anio;
  return new Date(Number(anio), Number(mes) - 1, 15).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

// Idioma de la web desde la que se envió el formulario (locale).
export const IDIOMAS_CITA = [
  { valor: 'es', etiqueta: 'Español' },
  { valor: 'en', etiqueta: 'Inglés' },
];

export function nombreIdioma(locale) {
  return IDIOMAS_CITA.find((i) => i.valor === locale)?.etiqueta ?? locale;
}

// "2027-06-12" → "12 jun 2027"
export function fechaCorta(fecha) {
  if (!fecha) return '—';
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

// "2026-10-26T18:42" → "26 oct 2026, 18:42"
export function fechaHora(fechaHoraIso) {
  const [fecha, hora] = fechaHoraIso.split('T');
  return `${fechaCorta(fecha)}, ${hora}`;
}
