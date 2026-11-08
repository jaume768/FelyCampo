// analitica.js
//
// Eventos de conversión — los recogen GTM (vía dataLayer) y el píxel de
// Meta (si la usuaria aceptó Marketing, ver components/layout/Analitica.jsx).
// Llamar SOLO desde el cliente y solo después de que el envío haya ido
// bien en el servidor, para no contar conversiones fallidas.
//
// En GTM: crear un activador "Evento personalizado" = cita_enviada.
// Alternativa equivalente: activador por URL de la página de
// confirmación (/visita-fely-campo/cita/confirmacion).
// El formulario ya no pregunta si la cita es de novia o de invitada ni
// el atelier, así que ya no se envían tipo_cita ni atelier.

export function registrarConversionCita() {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'cita_enviada' });

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Schedule');
  }
}
