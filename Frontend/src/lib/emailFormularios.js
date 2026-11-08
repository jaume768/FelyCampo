// emailFormularios.js
//
// Piezas comunes de las APIs que reciben formularios del front y avisan
// por email vía Resend (API REST, sin dependencias): /api/cita y
// /api/consulta-vestido. Solo servidor (lee variables de entorno).
//
// Variables de entorno (ver .env.example):
//   RESEND_API_KEY          clave de Resend (dominio felycampo.com verificado allí)
//   CITA_EMAIL_REMITENTE    remitente, ej. "Fely Campo <citas@felycampo.com>"
//   CITA_EMAIL_EQUIPO       destinatario(s) de los avisos al equipo, separados
//                           por comas (por defecto info@felycampo.com) — el
//                           mismo para citas y consultas de vestidos.
// Sin RESEND_API_KEY: en desarrollo (next dev) no se envía nada, los emails
// se escriben en la consola del servidor y se da por bueno, para poder
// probar el flujo completo; en producción las APIs responden 503.

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

// null si se puede enviar; si no, la Response 503 que debe devolver la API.
export function faltaConfiguracion(origen) {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
    console.error(`[${origen}] Falta RESEND_API_KEY en producción.`);
    return Response.json({ ok: false, error: 'no-configurado' }, { status: 503 });
  }
  return null;
}

export async function enviarEmail(email, origen) {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) {
    console.info(`[${origen}] RESEND_API_KEY sin configurar — email NO enviado:\n`, JSON.stringify({ ...email, html: '(html omitido)' }, null, 2));
    return;
  }
  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.CITA_EMAIL_REMITENTE || `Fely Campo <${EMAIL_POR_DEFECTO}>`, ...email }),
  });
  if (!respuesta.ok) {
    throw new Error(`Resend ${respuesta.status}: ${await respuesta.text()}`);
  }
}
