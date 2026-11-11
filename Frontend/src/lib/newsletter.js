// newsletter.js — suscribirse desde el navegador (pie de página y ventana
// de la home). Lanza un error si no se ha podido: los dos formularios ya
// enseñan su estado de error en ese caso, nunca un «gracias» falso.
//
// 1. /api/newsletter guarda el email en la base de datos (panel).
// 2. Si responde con la URL de Substack, este navegador da de alta el
//    email allí (ver enviarASubstack). La pantalla «Muy pronto»
//    (app/acceso/proximamente.js) hace lo mismo en su propio script.

export async function suscribirNewsletter(email, { locale = 'es', origen = '' } = {}) {
  const respuesta = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, locale, origen }),
  });
  const resultado = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok || !resultado.ok) {
    throw new Error(resultado.error || `newsletter ${respuesta.status}`);
  }
  if (resultado.substack) enviarASubstack(resultado.substack, email);
}

// Alta en Substack desde el navegador de quien se suscribe: la misma
// petición que hace el formulario de suscripción de Substack cuando no hay
// JavaScript (POST /api/v1/free?nojs=true, como formulario). Desde el
// servidor no se puede: Substack bloquea su IP (api/newsletter/route.js).
//
// `no-cors`: Substack no permite leer su respuesta desde otro dominio, así
// que no se sabe si la ha aceptado; la copia del panel es la que cuenta.
// `keepalive`: la petición sigue aunque la persona cierre la página justo
// después. Sin cookies (`omit`): no hacen falta.
export function enviarASubstack(base, email) {
  try {
    const pagina = window.location.href;
    fetch(`${base}/api/v1/free?nojs=true`, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
      keepalive: true,
      body: new URLSearchParams({
        email,
        first_url: pagina,
        first_referrer: document.referrer || '',
        current_url: pagina,
        current_referrer: document.referrer || '',
        referral_code: '',
        source: 'embed',
      }),
    }).catch(() => {});
  } catch {
    // Nunca rompe la suscripción: ya está guardada en el panel.
  }
}
