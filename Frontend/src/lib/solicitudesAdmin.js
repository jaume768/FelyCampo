// solicitudesAdmin.js — citas, consultas de vestidos y suscriptoras desde la
// API, con la MISMA forma que tenían los datos de ejemplo de las bandejas
// (citasMock, consultasPrecioMock, newsletterMock en mockData.js): así las
// pantallas de Miriam solo cambian de dónde sacan los datos.
//
// API: /api/v1/admin/{citas,consultas,suscriptores}/ (backend/apps/appointments).

import { apiFetch } from './api';

// Estado: código en la base de datos ↔ texto en el panel (ESTADOS_CITA).
const ETIQUETA_ESTADO = {
  pendiente: 'Pendiente',
  contactada: 'Contactada',
  confirmada: 'Cita confirmada',
  cerrada: 'Cerrada',
};
const CODIGO_ESTADO = Object.fromEntries(Object.entries(ETIQUETA_ESTADO).map(([c, e]) => [e, c]));

const ORIGEN_NEWSLETTER = { pie: 'Pie de página', ventana: 'Ventana de la home', proximamente: 'Muy pronto (prelanzamiento)' };

// "2026-11-05T11:15" en hora de Madrid (lo que esperan las pantallas).
const FORMATO_MADRID = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
});
export function fechaLocal(iso) {
  if (!iso) return '';
  return FORMATO_MADRID.format(new Date(iso)).replace(' ', 'T');
}

function historial(lista = []) {
  return lista.map((h) => ({ estado: ETIQUETA_ESTADO[h.estado] || h.estado, fecha: fechaLocal(h.fecha), por: h.por }));
}

function comunes(s) {
  return {
    id: s.id,
    recibida: fechaLocal(s.created_at),
    nombre: s.nombre,
    email: s.email,
    telefono: s.telefono,
    mensaje: s.mensaje,
    locale: s.idioma,
    aceptaLegal: s.acepta_legal,
    estado: ETIQUETA_ESTADO[s.estado] || s.estado,
    notas: s.notas,
    historial: historial(s.historial),
  };
}

export const RECURSOS = {
  citas: {
    ruta: '/admin/citas/',
    adaptar: (s) => ({
      ...comunes(s), tipo: s.tipo, ubicacion: s.atelier, fechaEvento: s.fecha_evento, asignado: s.asignado,
    }),
  },
  consultas: {
    ruta: '/admin/consultas/',
    adaptar: (s) => ({
      ...comunes(s), tipo: s.tipo, producto: s.producto, color: s.color, colorHex: s.color_hex, ruta: s.ruta, imagen: s.imagen,
    }),
  },
  suscriptores: {
    ruta: '/admin/suscriptores/',
    adaptar: (s) => ({
      id: s.id, email: s.email, idioma: s.idioma, activo: s.activo,
      origen: ORIGEN_NEWSLETTER[s.origen] || s.origen || '—',
      fecha: fechaLocal(s.created_at).slice(0, 10),
    }),
  },
};

// Todas las páginas de un listado (las bandejas filtran en el navegador).
export async function listarTodo(recurso) {
  const { ruta, adaptar } = RECURSOS[recurso];
  const items = [];
  let pagina = 1;
  for (;;) {
    const datos = await apiFetch(`${ruta}?page_size=100&page=${pagina}`);
    items.push(...datos.results.map(adaptar));
    if (!datos.next) return items;
    pagina += 1;
  }
}

export async function obtenerUna(recurso, id) {
  const { ruta, adaptar } = RECURSOS[recurso];
  return adaptar(await apiFetch(`${ruta}${id}/`));
}

// cambios: { estado: 'Contactada' | …, notas, asignado } (en el formato del panel).
export async function actualizar(recurso, id, cambios) {
  const { ruta, adaptar } = RECURSOS[recurso];
  const cuerpo = { ...cambios };
  if (cuerpo.estado) cuerpo.estado = CODIGO_ESTADO[cuerpo.estado] || cuerpo.estado;
  return adaptar(await apiFetch(`${ruta}${id}/`, { method: 'PATCH', body: cuerpo }));
}

export async function borrar(recurso, id) {
  await apiFetch(`${RECURSOS[recurso].ruta}${id}/`, { method: 'DELETE' });
}

export const obtenerResumen = () => apiFetch('/admin/resumen/');
