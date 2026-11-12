// emailFormularios.js
//
// Piezas comunes de las APIs que reciben formularios del front y avisan
// por email: /api/cita y /api/consulta-vestido. Solo servidor.
//
// El envío lo hace Django por SMTP (POST interno a
// /api/v1/formularios/email/, ver backend/apps/appointments/views.py): el
// servidor SMTP, la cuenta y el remitente (DEFAULT_FROM_EMAIL) se
// configuran en backend/.env.prod, no aquí. En desarrollo Django escribe
// los emails en su consola (`docker compose logs backend`) y no envía nada.
//
// Variable de entorno de este lado (ver .env.example):
//   CITA_EMAIL_EQUIPO       destinatario(s) de los avisos al equipo, separados
//                           por comas (por defecto info@felycampo.com) — el
//                           mismo para citas y consultas de vestidos.

import { llamarBackendInterno } from '@/lib/backendInterno';

export const EMAIL_POR_DEFECTO = 'info@felycampo.com';
export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function destinatariosEquipo() {
  const valor = process.env.CITA_EMAIL_EQUIPO || EMAIL_POR_DEFECTO;
  return valor.split(',').map((email) => email.trim()).filter(Boolean);
}

export function escapar(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function texto(valor, max = 200) {
  return typeof valor === 'string' ? valor.trim().slice(0, max) : '';
}

export function tabla(filas) {
  return `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${filas
    .map(([k, v]) => `<tr><td style="color:#777;vertical-align:top">${escapar(k)}</td><td style="color:#111">${escapar(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table>`;
}

// Lanza si el backend no ha podido enviarlo (quien llama decide qué hacer).
// `email`: { to: [...], subject, html, reply_to? }.
export async function enviarEmail(email, origen) {
  const respuesta = await llamarBackendInterno('email', email);
  if (!respuesta.ok) {
    throw new Error(`[${origen}] El backend no envió el email (${respuesta.status}): ${await respuesta.text()}`);
  }
}
