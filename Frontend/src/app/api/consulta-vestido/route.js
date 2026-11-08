// POST /api/consulta-vestido — "Solicita información" (ModalSolicitudAtelier,
// botón "Contacta con nosotros" de las fichas de /atelier/novias y
// /atelier/fiesta). Valida los datos y envía dos emails vía Resend, igual
// que /api/cita (ver lib/emailFormularios.js):
//   1. Aviso al equipo, con el vestido, el color y los datos de la
//      clienta, y "Responder" apuntando a ella.
//   2. Confirmación a la clienta, en su idioma.
// Si falla el aviso al equipo, responde error y el modal lo enseña; si
// falla solo la confirmación, se da por buena (ver final de POST).

import {
  EMAIL_VALIDO, destinatariosEquipo, enviarEmail, escapar, faltaConfiguracion, tabla, texto,
} from '@/lib/emailFormularios';
import { guardarEnBackend } from '@/lib/backendInterno';

const ORIGEN = 'api/consulta-vestido';
const TIPOS = { novias: 'Novias', fiesta: 'Fiesta', pretaporter: 'Prêt-à-porter' };
const URL_WEB = 'https://felycampo.com';

const TEXTOS_CLIENTA = {
  es: {
    asunto: (producto) => `Hemos recibido tu consulta sobre ${producto} — Fely Campo`,
    saludo: (nombre) => `Hola ${nombre},`,
    cuerpo: (producto) => `Gracias por tu interés en ${producto}. Nuestro equipo te escribirá en breve con toda la información.`,
    resumen: 'Estos son los datos que nos has enviado:',
    firma: 'Un abrazo,<br>El equipo de Fely Campo',
    etiquetas: { vestido: 'Vestido', color: 'Color', telefono: 'Teléfono', mensaje: 'Comentario' },
  },
  en: {
    asunto: (producto) => `We have received your enquiry about ${producto} — Fely Campo`,
    saludo: (nombre) => `Hello ${nombre},`,
    cuerpo: (producto) => `Thank you for your interest in ${producto}. Our team will be in touch shortly with all the details.`,
    resumen: 'These are the details you sent us:',
    firma: 'Warm regards,<br>The Fely Campo team',
    etiquetas: { vestido: 'Dress', color: 'Colour', telefono: 'Phone', mensaje: 'Comment' },
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

  // Campo trampa para bots (oculto en el modal): si viene relleno, se
  // responde OK sin enviar nada.
  if (texto(datos.web)) return Response.json({ ok: true });

  const locale = datos.locale === 'en' ? 'en' : 'es';
  const ruta = texto(datos.ruta, 300);
  const consulta = {
    tipo: TIPOS[datos.tipo] ? datos.tipo : null,
    producto: texto(datos.producto, 160),
    color: texto(datos.color, 80),
    // Solo rutas de la propia web (empiezan por "/"), nunca una URL de fuera.
    ruta: ruta.startsWith('/') && !ruta.startsWith('//') ? ruta : '',
    nombre: texto(datos.nombre, 120),
    email: texto(datos.email, 160),
    telefono: texto(datos.telefono, 40),
    mensaje: texto(datos.comentario, 2000),
  };

  const valido = consulta.producto && consulta.nombre && EMAIL_VALIDO.test(consulta.email) && datos.aceptaLegal === true;
  if (!valido) return Response.json({ ok: false, error: 'datos' }, { status: 422 });

  // Se guarda para la bandeja del panel (/admin/consultas-precio) ANTES de
  // los emails: si hay demasiados envíos desde esta IP, no se manda nada.
  const imagen = texto(datos.imagen, 300);
  const colorHex = texto(datos.colorHex, 9);
  const guardado = await guardarEnBackend('consultas', {
    nombre: consulta.nombre,
    email: consulta.email,
    telefono: consulta.telefono,
    mensaje: consulta.mensaje,
    idioma: locale,
    acepta_legal: true,
    tipo: consulta.tipo || '',
    producto: consulta.producto,
    color: consulta.color,
    color_hex: /^#[0-9a-f]{3,8}$/i.test(colorHex) ? colorHex : '',
    ruta: consulta.ruta,
    imagen: imagen.startsWith('/') && !imagen.startsWith('//') ? imagen : '',
  }, request);
  if (guardado.status === 429) return Response.json({ ok: false, error: 'ritmo' }, { status: 429 });

  const t = TEXTOS_CLIENTA[locale];
  const emailClienta = {
    to: [consulta.email],
    subject: t.asunto(consulta.producto),
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
<p>${escapar(t.saludo(consulta.nombre))}</p>
<p>${escapar(t.cuerpo(consulta.producto))}</p>
<p>${escapar(t.resumen)}</p>${tabla([
      [t.etiquetas.vestido, consulta.producto],
      ...(consulta.color ? [[t.etiquetas.color, consulta.color]] : []),
      ...(consulta.telefono ? [[t.etiquetas.telefono, consulta.telefono]] : []),
      ...(consulta.mensaje ? [[t.etiquetas.mensaje, consulta.mensaje]] : []),
    ])}
<p>${t.firma}</p></div>`,
  };

  const tipoEs = consulta.tipo ? TIPOS[consulta.tipo].toUpperCase() : '';
  const emailEquipo = {
    to: destinatariosEquipo(),
    reply_to: consulta.email,
    subject: `Nueva consulta ${tipoEs ? `${tipoEs} ` : ''}— ${consulta.producto} — ${consulta.nombre}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
<p>Nueva consulta de vestido desde felycampo.com («Contacta con nosotros»). Responde a este email para escribir directamente a la clienta.</p>${tabla([
      ...(tipoEs ? [['Tipo', tipoEs]] : []),
      ['Vestido', consulta.producto],
      ['Color', consulta.color || '—'],
      ...(consulta.ruta ? [['Ficha', `${URL_WEB}${consulta.ruta}`]] : []),
      ['Nombre', consulta.nombre],
      ['Email', consulta.email],
      ['Teléfono', consulta.telefono || '—'],
      ['Idioma', locale.toUpperCase()],
      ['Comentario', consulta.mensaje || '—'],
    ])}</div>`,
  };

  // Primero el aviso al equipo: es el que no se puede perder (mismo
  // criterio que /api/cita).
  try {
    await enviarEmail(emailEquipo, ORIGEN);
  } catch (error) {
    console.error(`[${ORIGEN}] Error enviando el aviso al equipo:`, error);
    // Si está guardada, el equipo la verá en el panel: para la clienta,
    // enviada. Solo es un error si no ha llegado por ninguno de los dos.
    if (!guardado.ok) return Response.json({ ok: false, error: 'envio' }, { status: 502 });
  }

  try {
    await enviarEmail(emailClienta, ORIGEN);
  } catch (error) {
    console.error(`[${ORIGEN}] Aviso al equipo enviado, pero falló la confirmación a la clienta:`, error);
  }

  return Response.json({ ok: true });
}
