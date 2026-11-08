// POST /api/cita — solicitud de cita en atelier (formulario de
// /visita-fely-campo/cita). Valida los datos y envía dos emails vía
// Resend (API REST, sin dependencias):
//   1. Confirmación a la clienta, en su idioma.
//   2. Aviso al equipo (un único email, CITA_EMAIL_EQUIPO, para los tres
//      ateliers — el atelier elegido va en el asunto y en la tabla), con
//      "Responder" apuntando a la clienta.
// Si falla el aviso al equipo, responde error y el formulario lo enseña
// (no se registra la conversión) — ver el detalle al final de POST.
// Envío, variables de entorno y modo sin clave: ver lib/emailFormularios.js
// (compartido con /api/consulta-vestido).

import { ATELIERES_CITA, TIPOS_CITA } from '@/lib/citaAtelier';
import {
  EMAIL_VALIDO, destinatariosEquipo, enviarEmail, escapar, faltaConfiguracion, tabla, texto,
} from '@/lib/emailFormularios';

const ORIGEN = 'api/cita';

// Fecha del evento "AAAA-MM" (solo mes y año) válida y no pasada — el
// mes actual cuenta como válido.
function fechaValida(fecha) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(fecha)) return false;
  return fecha >= new Date().toISOString().slice(0, 7);
}

// "junio de 2027" / "June 2027".
function fechaLegible(fecha, locale) {
  return new Date(`${fecha}-15T12:00:00Z`).toLocaleDateString(locale === 'en' ? 'en-GB' : 'es-ES', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

const TEXTOS_CLIENTA = {
  es: {
    asunto: 'Hemos recibido tu solicitud de cita — Fely Campo',
    saludo: (nombre) => `Hola ${nombre},`,
    cuerpo: (tipo, atelier) => `Gracias por pedir tu cita${tipo ? ` de ${tipo === 'novia' ? 'novia' : 'invitada'}` : ''} en Fely Campo ${atelier}. Nuestro equipo te escribirá en breve para concretar el día y la hora.`,
    resumen: 'Estos son los datos que nos has enviado:',
    firma: 'Un abrazo,<br>El equipo de Fely Campo',
    etiquetas: { tipo: 'Tipo de cita', atelier: 'Atelier', fecha: 'Fecha del evento', telefono: 'Teléfono', mensaje: 'Mensaje' },
    tipos: { novia: 'Novia', invitada: 'Invitada' },
  },
  en: {
    asunto: 'We have received your appointment request — Fely Campo',
    saludo: (nombre) => `Hello ${nombre},`,
    cuerpo: (tipo, atelier) => `Thank you for requesting ${tipo ? `a ${tipo === 'novia' ? 'bridal' : 'guest'} appointment` : 'an appointment'} at Fely Campo ${atelier}. Our team will be in touch shortly to arrange the day and time.`,
    resumen: 'These are the details you sent us:',
    firma: 'Warm regards,<br>The Fely Campo team',
    etiquetas: { tipo: 'Appointment type', atelier: 'Atelier', fecha: 'Event date', telefono: 'Phone', mensaje: 'Message' },
    tipos: { novia: 'Bride', invitada: 'Guest' },
  },
};

export async function POST(request) {
  const sinConfigurar = faltaConfiguracion(ORIGEN);
  if (sinConfigurar) return sinConfigurar;

  let datos;
  try {
    datos = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'json' }, { status: 400 });
  }

  // Campo trampa para bots (oculto en el formulario): si viene relleno,
  // se responde OK sin enviar nada.
  if (texto(datos.web)) return Response.json({ ok: true });

  const locale = datos.locale === 'en' ? 'en' : 'es';
  const solicitud = {
    // Opcional: el formulario ya no pregunta si es de novia o invitada.
    tipo: TIPOS_CITA.includes(datos.tipo) ? datos.tipo : null,
    atelier: ATELIERES_CITA.find((atelier) => atelier.id === datos.ubicacion)?.nombre || '',
    fechaEvento: texto(datos.fechaEvento, 7),
    nombre: texto(datos.nombreCompleto, 120),
    email: texto(datos.email, 160),
    telefono: texto(datos.telefono, 40),
    mensaje: texto(datos.mensaje, 2000),
  };

  const valido = solicitud.atelier && fechaValida(solicitud.fechaEvento)
    && solicitud.nombre && EMAIL_VALIDO.test(solicitud.email) && solicitud.telefono && datos.aceptaLegal === true;
  if (!valido) return Response.json({ ok: false, error: 'datos' }, { status: 422 });

  const t = TEXTOS_CLIENTA[locale];
  const filasResumen = [
    ...(solicitud.tipo ? [[t.etiquetas.tipo, t.tipos[solicitud.tipo]]] : []),
    [t.etiquetas.atelier, solicitud.atelier],
    [t.etiquetas.fecha, fechaLegible(solicitud.fechaEvento, locale)],
    [t.etiquetas.telefono, solicitud.telefono],
    ...(solicitud.mensaje ? [[t.etiquetas.mensaje, solicitud.mensaje]] : []),
  ];

  const emailClienta = {
    to: [solicitud.email],
    subject: t.asunto,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
<p>${escapar(t.saludo(solicitud.nombre))}</p>
<p>${escapar(t.cuerpo(solicitud.tipo, solicitud.atelier))}</p>
<p>${escapar(t.resumen)}</p>${tabla(filasResumen)}
<p>${t.firma}</p></div>`,
  };

  const tipoEs = solicitud.tipo ? (solicitud.tipo === 'novia' ? 'NOVIA' : 'INVITADA') : '';
  const emailEquipo = {
    to: destinatariosEquipo(),
    reply_to: solicitud.email,
    subject: `Nueva cita ${tipoEs ? `${tipoEs} ` : ''}${solicitud.atelier} — ${solicitud.nombre} (evento ${fechaLegible(solicitud.fechaEvento, 'es')})`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
<p>Nueva solicitud de cita desde felycampo.com. Responde a este email para escribir directamente a la clienta.</p>${tabla([
      ...(tipoEs ? [['Tipo', tipoEs]] : []),
      ['Atelier', solicitud.atelier],
      ['Fecha del evento', fechaLegible(solicitud.fechaEvento, 'es')],
      ['Nombre', solicitud.nombre],
      ['Email', solicitud.email],
      ['Teléfono', solicitud.telefono],
      ['Idioma', locale.toUpperCase()],
      ['Mensaje', solicitud.mensaje || '—'],
    ])}</div>`,
  };

  // Primero el aviso al equipo: es el que no se puede perder. Si falla,
  // error y la clienta puede reintentar. Si falla solo la confirmación a
  // la clienta, la solicitud ya está en manos del equipo — se da por
  // buena (reintentar duplicaría el aviso) y queda en el log.
  try {
    await enviarEmail(emailEquipo, ORIGEN);
  } catch (error) {
    console.error('[api/cita] Error enviando el aviso al equipo:', error);
    return Response.json({ ok: false, error: 'envio' }, { status: 502 });
  }

  try {
    await enviarEmail(emailClienta, ORIGEN);
  } catch (error) {
    console.error('[api/cita] Aviso al equipo enviado, pero falló la confirmación a la clienta:', error);
  }

  return Response.json({ ok: true });
}
