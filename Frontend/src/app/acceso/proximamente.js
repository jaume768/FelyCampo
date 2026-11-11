// Pantalla «Muy pronto» del prelanzamiento: la que ve el público en
// cualquier URL hasta la fecha de lanzamiento (src/lib/sesionEquipo.js).
// La sirve /acceso (route.js) con un 503; el diseño es el de
// `proximamente-felycampo` (logo, cuenta atrás y newsletter sobre la foto
// del hero desenfocada). Las imágenes están en public/proximamente/.
//
// Diferencias con el original, que estaba hecho para Netlify:
//   - la newsletter va a /api/newsletter (se guarda en el panel, origen
//     «proximamente») en vez de a Netlify Forms, y después este navegador
//     da de alta el email en Substack;
//   - la cuenta atrás cuenta con la hora del SERVIDOR (no con el reloj del
//     móvil de la visitante) y al llegar a cero recarga: la web ya está
//     abierta;
//   - sin @import de Google Fonts (Helvetica / Arial bastan y no hay
//     peticiones a terceros);
//   - español e inglés, y el acceso del equipo plegado abajo.

export const TEXTOS_PROXIMAMENTE = {
  es: {
    titulo: 'Fely Campo · Muy pronto',
    descripcion: 'Muy pronto, la nueva web de Fely Campo. Apúntate a la newsletter y sé la primera en verla.',
    contador: 'Cuenta atrás para el lanzamiento',
    unidades: ['Días', 'Horas', 'Min', 'Seg'],
    placeholder: 'nombre@email.com',
    suscribirse: 'Suscribirse',
    consentimiento: 'Acepto recibir la newsletter de Fely Campo.',
    enviando: 'Enviando…',
    gracias: '¡Gracias! Ya estás suscrita.',
    error: 'Algo ha ido mal. Inténtalo de nuevo.',
    errorRitmo: 'Demasiados intentos. Inténtalo dentro de un rato.',
  },
  en: {
    titulo: 'Fely Campo · Coming soon',
    descripcion: 'The new Fely Campo website is coming soon. Join the newsletter and be the first to see it.',
    contador: 'Countdown to launch',
    unidades: ['Days', 'Hours', 'Min', 'Sec'],
    placeholder: 'name@email.com',
    suscribirse: 'Subscribe',
    consentimiento: 'I agree to receive the Fely Campo newsletter.',
    enviando: 'Sending…',
    gracias: 'Thank you! You are now subscribed.',
    error: 'Something went wrong. Please try again.',
    errorRitmo: 'Too many attempts. Please try again later.',
  },
};

const ESTILOS = `
  :root { color-scheme: dark; --blanco:#FFFFFF; --negro:#101010; --rosa:#E92174; --tracking:0.02rem; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { min-height: 100svh; display: flex; flex-direction: column; font-family: Helvetica, Inter, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: var(--blanco); background: var(--negro); -webkit-font-smoothing: antialiased; }

  .fondo { position: fixed; inset: 0; z-index: -1; overflow: hidden; background: var(--negro); }
  .fondo::before { content: ""; position: absolute; inset: -10%; background: url("/proximamente/fondo-movil.webp") center / cover no-repeat; filter: blur(36px) saturate(1.1); transform: scale(1.15); }
  .fondo::after { content: ""; position: absolute; inset: 0; background: rgba(16, 16, 16, 0.35); }
  @media (max-width: 768px) { .fondo::before { filter: blur(33px) saturate(1.1); } }

  .contenido { flex: 1; width: 100%; max-width: 460px; margin: 0 auto; padding: 64px 16px 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .logo img { display: block; width: clamp(180px, 50vw, 260px); height: auto; }

  .contador { display: flex; justify-content: center; margin-top: 40px; }
  .unidad { min-width: 64px; padding: 0 14px; display: flex; flex-direction: column; align-items: center; }
  .unidad span { font-size: 28px; font-weight: 300; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .unidad small { margin-top: 4px; font-size: 10px; letter-spacing: var(--tracking); opacity: 0.75; }

  .newsletter { width: 100%; margin-top: 56px; }
  .fila { display: flex; border-bottom: 1px solid var(--blanco); }
  .fila input, .equipo input { flex: 1; min-width: 0; height: 44px; border: 0; border-radius: 0; background: transparent; color: var(--blanco); font: inherit; font-size: 16px; outline: none; }
  .fila input::placeholder { color: rgba(255, 255, 255, 0.6); }
  .fila button { flex-shrink: 0; height: 44px; padding: 0 4px 0 16px; border: 0; border-radius: 0; background: transparent; color: var(--blanco); font: inherit; font-size: 12px; font-weight: 500; letter-spacing: var(--tracking); cursor: pointer; transition: color .2s; }
  .fila button:hover { color: var(--rosa); }
  .fila button:disabled { opacity: .5; cursor: default; }

  .consentimiento { display: flex; gap: 10px; align-items: flex-start; margin-top: 16px; text-align: left; font-size: 11px; line-height: 1.45; cursor: pointer; }
  .consentimiento input { appearance: none; flex-shrink: 0; width: 14px; height: 14px; margin-top: 1px; border: 1px solid var(--blanco); border-radius: 0; background: transparent; cursor: pointer; }
  .consentimiento input:checked { background: var(--blanco) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 6.2l2.3 2.3 4.7-5' fill='none' stroke='%23101010' stroke-width='1.6'/%3E%3C/svg%3E") center / 10px no-repeat; }
  .consentimiento input:focus-visible, .fila input:focus-visible, .fila button:focus-visible, .equipo input:focus-visible, .equipo button:focus-visible, .equipo summary:focus-visible { outline: 1px solid var(--blanco); outline-offset: 3px; }

  .estado { min-height: 1.5em; margin-top: 12px; font-size: 12px; }
  .newsletter.enviado .fila, .newsletter.enviado .consentimiento { display: none; }
  .newsletter.enviado .estado { font-size: 14px; }

  .pie { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; padding: 20px 16px calc(20px + env(safe-area-inset-bottom)); font-size: 11px; letter-spacing: var(--tracking); opacity: 0.8; }
  .pie a { color: inherit; text-decoration: none; }
  .pie a:hover { text-decoration: underline; }

  /* Acceso del equipo: discreto, plegado debajo de la newsletter. */
  .equipo { width: 100%; margin-top: 40px; font-size: 11px; text-align: left; }
  .equipo summary { cursor: pointer; list-style: none; text-align: center; opacity: .6; letter-spacing: var(--tracking); }
  .equipo summary::-webkit-details-marker { display: none; }
  .equipo[open] summary { opacity: .9; }
  .equipo form { display: grid; gap: 12px; margin-top: 16px; }
  .equipo label { display: grid; gap: 2px; opacity: .85; }
  .equipo input { border-bottom: 1px solid var(--linea, rgba(255,255,255,.45)); font-size: 16px; }
  .equipo .boton { justify-self: start; display: inline-flex; align-items: center; min-height: 40px; padding: 0 20px; border: 1px solid var(--blanco); border-radius: 0; background: transparent; color: var(--blanco); font: inherit; font-size: 12px; text-decoration: none; cursor: pointer; }
  .equipo .boton:hover { background: var(--blanco); color: var(--negro); }
  .equipo .boton[disabled] { opacity: .6; cursor: wait; }
  .equipo .acciones { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 12px; }
  .equipo .enlace { background: none; border: 0; padding: 0; font: inherit; color: inherit; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
  .equipo .error { color: #FFB3C9; }
  .equipo .sesion { text-align: center; }
  .equipo .sesion .acciones { justify-content: center; }

  .oculto { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  @media (min-width: 769px) {
    .unidad { min-width: 84px; padding: 0 20px; }
    .unidad span { font-size: 36px; }
  }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;

/**
 * @param {object} o
 * @param {'es'|'en'} o.idioma
 * @param {number} o.restanteMs   lo que falta para abrir, según el reloj del servidor
 * @param {string} o.textoEquipo  rótulo del acceso del equipo
 * @param {string} o.bloqueSesion formulario de login, o el bloque «has iniciado sesión»
 * @param {boolean} o.abrirEquipo el acceso del equipo desplegado (viene de /admin)
 * @param {string} o.otroIdioma   texto del enlace al otro idioma
 * @param {string} o.scriptLogin  el JS del login (route.js)
 */
export function paginaProximamente({ idioma, restanteMs, textoEquipo, bloqueSesion, abrirEquipo, otroIdioma, scriptLogin }) {
  const t = TEXTOS_PROXIMAMENTE[idioma];
  const codigoOtro = idioma === 'es' ? 'en' : 'es';
  const unidades = ['d', 'h', 'm', 's']
    .map((u, i) => `<div class="unidad"><span data-u="${u}">00</span><small>${t.unidades[i]}</small></div>`)
    .join('');

  return `<!doctype html>
<html lang="${idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t.titulo}</title>
<meta name="description" content="${t.descripcion}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#101010">
<link rel="icon" href="/proximamente/favicon.png" type="image/png">
<link rel="preload" as="image" href="/proximamente/fondo-movil.webp" fetchpriority="high">
<style>${ESTILOS}</style>
</head>
<body>
<div class="fondo" aria-hidden="true"></div>

<main class="contenido">
  <h1 class="logo"><img src="/proximamente/logo.webp" alt="Fely Campo" width="260"></h1>

  <div class="contador" id="contador" role="timer" aria-label="${t.contador}">${unidades}</div>

  <form class="newsletter" id="newsletter">
    <p class="oculto"><label>No rellenar: <input name="web" tabindex="-1" autocomplete="off"></label></p>
    <div class="fila">
      <label for="email" class="oculto">Email</label>
      <input type="email" id="email" name="email" placeholder="${t.placeholder}" autocomplete="email" required>
      <button type="submit">${t.suscribirse}</button>
    </div>
    <label class="consentimiento">
      <input type="checkbox" name="consentimiento" value="si" required>
      <span>${t.consentimiento}</span>
    </label>
    <p class="estado" id="estado" role="status" aria-live="polite"></p>
  </form>

  <details class="equipo"${abrirEquipo ? ' open' : ''}>
    <summary>${textoEquipo}</summary>
    ${bloqueSesion}
  </details>
</main>

<footer class="pie">
  <a href="https://www.instagram.com/felycampo/" target="_blank" rel="noopener">Instagram</a>
  <span>·</span>
  <a href="https://www.youtube.com/channel/UCQeHEIrbwpFjAYtoGfzRUaA" target="_blank" rel="noopener">YouTube</a>
  <span>·</span>
  <a href="?lang=${codigoOtro}" hreflang="${codigoOtro}" lang="${codigoOtro}">${otroIdioma}</a>
</footer>

<script>
(() => {
  // Cuenta atrás con la hora del servidor: el final se fija sobre el reloj
  // de este navegador sumándole lo que falta, así un móvil con la hora mal
  // no adelanta ni retrasa nada.
  const el = document.getElementById('contador');
  const fin = Date.now() + ${Math.max(0, Math.round(restanteMs))};
  const u = {};
  el.querySelectorAll('[data-u]').forEach((s) => { u[s.dataset.u] = s; });
  const dos = (n) => String(n).padStart(2, '0');
  let t;
  function tick() {
    const r = Math.max(0, fin - Date.now());
    u.d.textContent = dos(Math.floor(r / 864e5));
    u.h.textContent = dos(Math.floor(r / 36e5) % 24);
    u.m.textContent = dos(Math.floor(r / 6e4) % 60);
    u.s.textContent = dos(Math.floor(r / 1e3) % 60);
    if (r === 0) {
      clearInterval(t);
      // La web ya está abierta: recargar (con 2-6 s al azar, para que no
      // lleguen todas las visitas en el mismo segundo).
      setTimeout(() => location.reload(), 2000 + Math.random() * 4000);
    }
  }
  t = setInterval(tick, 1000);
  tick();

  // Newsletter: se guarda en el panel (/admin/newsletter).
  const T = ${JSON.stringify({ enviando: t.enviando, gracias: t.gracias, error: t.error, errorRitmo: t.errorRitmo })};
  const form = document.getElementById('newsletter');
  const estado = document.getElementById('estado');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = form.querySelector('button');
    boton.disabled = true;
    estado.textContent = T.enviando;
    const datos = new FormData(form);
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: datos.get('email'), web: datos.get('web'), locale: ${JSON.stringify(idioma)}, origen: 'proximamente' }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 429) throw new Error('ritmo');
      if (!r.ok || !j.ok) throw new Error();
      // Alta en Substack desde este navegador (igual que lib/newsletter.js
      // → enviarASubstack; desde el servidor Substack lo bloquea).
      if (j.substack) {
        try {
          fetch(j.substack + '/api/v1/free?nojs=true', {
            method: 'POST', mode: 'no-cors', credentials: 'omit', keepalive: true,
            body: new URLSearchParams({
              email: datos.get('email').trim().toLowerCase(),
              first_url: location.href, first_referrer: document.referrer || '',
              current_url: location.href, current_referrer: document.referrer || '',
              referral_code: '', source: 'embed',
            }),
          }).catch(() => {});
        } catch {}
      }
      form.reset();
      form.classList.add('enviado');
      estado.textContent = T.gracias;
    } catch (err) {
      estado.textContent = err.message === 'ritmo' ? T.errorRitmo : T.error;
    } finally {
      boton.disabled = false;
    }
  });
})();
</script>
${scriptLogin}
</body>
</html>`;
}
