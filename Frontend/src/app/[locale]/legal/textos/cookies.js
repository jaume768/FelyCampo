// Política de cookies — Fely Campo (español e inglés).
// Redactada a partir de lo que hace la web (noviembre de 2026):
// - Aviso de cookies con tres categorías (CookieConsent.jsx): Necesarias,
//   Analíticas y Marketing; la elección se guarda en localStorage
//   "fc_cookies_consent".
// - Analitica.jsx: Google Tag Manager con Consent Mode v2 ("denied" por
//   defecto) y píxel de Meta que solo se carga si se acepta Marketing.
// - Otros almacenamientos propios: "fc_newsletter_popup_visto" (no volver
//   a enseñar la ventana de newsletter), "fely-campo-carrito" (cesta,
//   vacía: no hay venta online) y la cookie de idioma NEXT_LOCALE de
//   next-intl (de sesión) — comprobado en el navegador.
// Si se añade alguna herramienta nueva en GTM, hay que añadirla aquí.
// Formato de bloques: ver ../TextoLegal.jsx.

export const COOKIES = {
  es: {
    titulo: 'Política de Cookies',
    actualizado: 'Última actualización: noviembre de 2026',
    bloques: [
      { h: '¿Qué es una cookie?' },
      'Una cookie es un pequeño archivo que una página web guarda en su navegador cuando la visita. Sirve, por ejemplo, para que la web funcione correctamente, recuerde sus preferencias o nos permita saber cómo se usa. En esta política incluimos también tecnologías similares, como el almacenamiento local del navegador (localStorage) o los píxeles.',

      { h: '¿Quién utiliza las cookies?' },
      'Las cookies propias las gestiona FELY CAMPO S.L., responsable de felycampo.com. Las cookies de terceros las gestionan otras empresas que nos prestan servicios de análisis y de publicidad: Google y Meta.',

      { h: 'Cómo pedimos su consentimiento' },
      'Al entrar por primera vez en la web le mostramos un aviso de cookies en el que puede aceptarlas todas, rechazarlas todas o elegir, con el botón «Personalizar», qué categorías permite. Hasta que no las acepta, no instalamos cookies de análisis ni de publicidad: solo las necesarias para que la web funcione.',

      { h: 'Cookies que utilizamos' },
      { h3: 'Necesarias' },
      'Son imprescindibles para que la web funcione y no requieren su consentimiento:',
      {
        lista: [
          'fc_cookies_consent (propia, almacenamiento local): guarda su elección en el aviso de cookies. Permanece hasta que borre los datos del navegador.',
          'fc_newsletter_popup_visto (propia, almacenamiento local): recuerda que ya ha visto la ventana de la newsletter para no volver a mostrársela. Permanece hasta que borre los datos del navegador.',
          'NEXT_LOCALE (propia): recuerda el idioma en el que navega. Se borra al cerrar el navegador.',
          'fely-campo-carrito (propia, almacenamiento local): técnica, reservada para la cesta de la compra. Como en la Web no se vende online, está vacía y no guarda ningún dato personal.',
        ],
      },
      { h3: 'Analíticas' },
      'Nos permiten saber cuántas personas visitan la web y cómo la usan, para mejorarla. Solo se instalan si las acepta. Las gestionamos con Google Tag Manager y Google Analytics, de Google Ireland Limited:',
      {
        lista: [
          '_ga (tercero, Google): distingue a usuarios de forma anónima. Dura 2 años.',
          '_ga_<ID> (tercero, Google): guarda el estado de la sesión. Dura 2 años.',
        ],
      },
      'Si no acepta las cookies analíticas, Google solo recibe avisos anónimos sin cookies (modo de consentimiento de Google).',
      { h3: 'Marketing' },
      'Nos permiten medir nuestras campañas y mostrarle publicidad de Fely Campo en Facebook e Instagram. Solo se instalan si las acepta. Usamos el píxel de Meta, de Meta Platforms Ireland Limited:',
      {
        lista: [
          '_fbp (tercero, Meta): identifica el navegador para medir y mostrar anuncios. Dura 3 meses.',
          '_fbc (tercero, Meta): guarda el anuncio desde el que ha llegado, si es el caso. Dura 3 meses.',
        ],
      },
      'Google y Meta pueden tratar estos datos en Estados Unidos, con las garantías que explicamos en la [Política de Privacidad](/legal/privacidad). Puede consultar cómo usan los datos en sus propias políticas: [Google](https://policies.google.com/privacy) y [Meta](https://www.facebook.com/privacy/policy/).',

      { h: 'Cómo cambiar o retirar su consentimiento' },
      'Puede cambiar su elección en cualquier momento borrando las cookies y los datos de este sitio en su navegador: el aviso de cookies volverá a aparecer en su siguiente visita. También puede bloquear o eliminar las cookies desde la configuración de su navegador, aunque si bloquea las necesarias algunas partes de la web pueden no funcionar bien:',
      {
        lista: [
          '[Chrome](https://support.google.com/chrome/answer/95647)',
          '[Edge](https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)',
          '[Firefox](https://support.mozilla.org/es/kb/Borrar%20cookies)',
          '[Safari](https://support.apple.com/es-es/guide/safari/sfri11471/mac)',
        ],
      },

      { h: 'Contacto' },
      'Si tiene dudas sobre esta Política de Cookies, puede escribirnos a info@felycampo.com.',
    ],
  },

  en: {
    titulo: 'Cookie Policy',
    actualizado: 'Last updated: November 2026',
    bloques: [
      'This English version is provided for convenience; in case of any discrepancy, the Spanish version prevails.',

      { h: 'What is a cookie?' },
      'A cookie is a small file that a website stores in your browser when you visit it. It is used, for example, to make the website work properly, remember your preferences or let us know how it is used. This policy also covers similar technologies, such as the browser’s local storage (localStorage) or pixels.',

      { h: 'Who uses cookies?' },
      'First-party cookies are managed by FELY CAMPO S.L., which runs felycampo.com. Third-party cookies are managed by other companies that provide us with analytics and advertising services: Google and Meta.',

      { h: 'How we ask for your consent' },
      'When you first visit the website we show you a cookie banner where you can accept all cookies, reject them all or choose, with the “Customise” button, which categories you allow. Until you accept them, we do not set any analytics or advertising cookies: only those necessary for the website to work.',

      { h: 'Cookies we use' },
      { h3: 'Necessary' },
      'These are essential for the website to work and do not require your consent:',
      {
        lista: [
          'fc_cookies_consent (first-party, local storage): stores your choice in the cookie banner. Kept until you clear your browser data.',
          'fc_newsletter_popup_visto (first-party, local storage): remembers that you have already seen the newsletter window so it is not shown again. Kept until you clear your browser data.',
          'NEXT_LOCALE (first-party): remembers the language you browse in. Deleted when you close the browser.',
          'fely-campo-carrito (first-party, local storage): technical, reserved for the shopping bag. As nothing is sold online on the Website, it is empty and stores no personal data.',
        ],
      },
      { h3: 'Analytics' },
      'These let us know how many people visit the website and how they use it, so we can improve it. They are only set if you accept them. We manage them with Google Tag Manager and Google Analytics, from Google Ireland Limited:',
      {
        lista: [
          '_ga (third-party, Google): distinguishes users anonymously. Lasts 2 years.',
          '_ga_<ID> (third-party, Google): stores the session state. Lasts 2 years.',
        ],
      },
      'If you do not accept analytics cookies, Google only receives anonymous, cookieless pings (Google consent mode).',
      { h3: 'Marketing' },
      'These let us measure our campaigns and show you Fely Campo advertising on Facebook and Instagram. They are only set if you accept them. We use the Meta pixel, from Meta Platforms Ireland Limited:',
      {
        lista: [
          '_fbp (third-party, Meta): identifies the browser to measure and show ads. Lasts 3 months.',
          '_fbc (third-party, Meta): stores the ad you arrived from, if any. Lasts 3 months.',
        ],
      },
      'Google and Meta may process this data in the United States, with the safeguards explained in our [Privacy Policy](/legal/privacidad). You can see how they use data in their own policies: [Google](https://policies.google.com/privacy) and [Meta](https://www.facebook.com/privacy/policy/).',

      { h: 'How to change or withdraw your consent' },
      'You can change your choice at any time by clearing the cookies and site data for this website in your browser: the cookie banner will appear again on your next visit. You can also block or delete cookies in your browser settings, although if you block the necessary ones some parts of the website may not work properly:',
      {
        lista: [
          '[Chrome](https://support.google.com/chrome/answer/95647)',
          '[Edge](https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)',
          '[Firefox](https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox)',
          '[Safari](https://support.apple.com/en-gb/guide/safari/sfri11471/mac)',
        ],
      },

      { h: 'Contact' },
      'If you have any questions about this Cookie Policy, you can write to us at info@felycampo.com.',
    ],
  },
};
