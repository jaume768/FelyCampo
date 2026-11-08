// Analitica.jsx

/* ============================================================
   ANALÍTICA — Google Tag Manager + píxel de Meta, con consentimiento.
   Vive en el layout raíz (src/app/[locale]/layout.js), en todas las
   páginas. No pinta nada si no hay IDs configurados:
     NEXT_PUBLIC_GTM_ID           ej. GTM-XXXXXXX
     NEXT_PUBLIC_META_PIXEL_ID    ej. 123456789012345
   (ver .env.example).

   Consentimiento (RGPD/AEPD) — enlazado con CookieConsent.jsx, que
   guarda {analiticas, marketing} en localStorage "fc_cookies_consent":
   - GTM carga siempre, pero con Google Consent Mode v2 en "denied" por
     defecto: sin consentimiento, las etiquetas de Google no guardan
     cookies (solo pings anónimos). Se actualiza a "granted" según lo
     que la usuaria acepte.
   - El píxel de Meta NO se carga hasta que acepta "Marketing".
   Un único punto de entrada, window.fcAplicarConsentimiento(prefs):
   lo llama este mismo script al arrancar (con lo ya guardado) y
   CookieConsent.jsx cada vez que la usuaria guarda una elección, así
   el cambio aplica en el momento, sin recargar.

   Conversiones: ver src/lib/analitica.js (evento "cita_enviada" al
   enviar el formulario de cita).
   ============================================================ */

import Script from 'next/script';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function scriptInicial() {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});

var PIXEL_ID = ${JSON.stringify(META_PIXEL_ID || '')};
var pixelCargado = false;

function cargarPixel() {
  if (!PIXEL_ID || pixelCargado) return;
  pixelCargado = true;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
}

window.fcAplicarConsentimiento = function (prefs) {
  prefs = prefs || {};
  var analiticas = prefs.analiticas ? 'granted' : 'denied';
  var marketing = prefs.marketing ? 'granted' : 'denied';
  gtag('consent', 'update', {
    analytics_storage: analiticas,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing
  });
  if (prefs.marketing) {
    cargarPixel();
    if (window.fbq) fbq('consent', 'grant');
  } else if (window.fbq) {
    fbq('consent', 'revoke');
  }
};

try {
  var guardado = window.localStorage.getItem('fc_cookies_consent');
  if (guardado) window.fcAplicarConsentimiento(JSON.parse(guardado));
} catch (e) {}

${GTM_ID ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(GTM_ID)});` : ''}
`;
}

function Analitica() {
  if (!GTM_ID && !META_PIXEL_ID) return null;

  return (
    <>
      <Script id="fc-analitica" strategy="afterInteractive">
        {scriptInicial()}
      </Script>
      {GTM_ID && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
      )}
    </>
  );
}

export default Analitica;
