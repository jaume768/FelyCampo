// newsletter.js — suscribirse desde el navegador (pie de página y ventana
// de la home). Lanza un error si no se ha podido: los dos formularios ya
// enseñan su estado de error en ese caso, nunca un «gracias» falso.

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
}
