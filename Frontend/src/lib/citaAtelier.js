// citaAtelier.js
//
// Datos compartidos del formulario de cita (/visita-fely-campo/cita) entre
// la página (cliente) y la API que lo procesa (src/app/api/cita/route.js):
// ateliers que se pueden elegir (obligatorio, vuelve a preguntarse a
// petición), tipos de cita y página de confirmación. Los ids coinciden con
// los de obtenerUbicaciones() (lib/ateliers.js), así que los
// enlaces "Pedir cita" de cada atelier pueden mandar ?ubicacion=<id> para
// dejarlo ya elegido. El email que recibe los avisos NO vive aquí (este
// archivo llega al navegador) — lo lee la API de variables de entorno, ver
// .env.example.

export const ATELIERES_CITA = [
  { id: 'salamanca', nombre: 'Salamanca' },
  { id: 'madrid', nombre: 'Madrid' },
  { id: 'oviedo', nombre: 'Oviedo' },
];

export const TIPOS_CITA = ['novia', 'invitada'];

// Página de confirmación tras enviar el formulario. Sin tipo (el
// formulario ya no lo pregunta), la genérica; con tipo, las antiguas de
// novia/invitada, que se mantienen para enlaces ya existentes.
export function rutaConfirmacionCita(tipo) {
  return tipo ? `/visita-fely-campo/cita/confirmacion-${tipo}` : '/visita-fely-campo/cita/confirmacion';
}
