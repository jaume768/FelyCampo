// Política de privacidad — Fely Campo (español e inglés).
// Redactada a partir de lo que hace la web (noviembre de 2026), sobre la
// base del texto de la web anterior:
// - Formularios reales: cita (/visita-fely-campo/cita → api/cita) y
//   "Solicita información" de las fichas (ModalSolicitudAtelier →
//   api/consulta-vestido). Se envían por email con Resend al equipo y a la
//   clienta; no se guardan en ninguna base de datos de la web.
// - Uso de esos datos: SOLO contestar y organizar la visita al atelier,
//   sin publicidad (a petición: "con las clientas lo único que queremos es
//   ponernos en contacto y solucionar sus dudas o que vengan al atelier").
// - Newsletter: hoy simulada; se conectará con Substack
//   (docs/ADMIN.md) — ya descrita aquí.
// - WhatsApp (BotonWhatsapp.jsx), cookies (ver cookies.js).
// - Hosting sin nombre a propósito ("nuestro proveedor de hosting"): hoy
//   Netlify, pero se va a cambiar — así no hay que tocar la política.
// Formato de bloques: ver ../TextoLegal.jsx.

export const PRIVACIDAD = {
  es: {
    titulo: 'Política de Privacidad',
    actualizado: 'Última actualización: noviembre de 2026',
    bloques: [
      'Siguiendo los principios de licitud, lealtad y transparencia, en esta Política de Privacidad le explicamos qué datos personales recogemos a través de felycampo.com, para qué los usamos y qué derechos tiene.',

      { h: '¿Quién es el responsable del tratamiento de sus datos?' },
      {
        lista: [
          'FELY CAMPO S.L.',
          'CIF: B-37323573',
          'Domicilio social: Calle Vázquez Coronado 6, 37002 Salamanca (España)',
          'Email: info@felycampo.com',
          'Teléfono: +34 923 190 053',
        ],
      },

      { h: '¿Qué datos recogemos y para qué los usamos?' },
      { h3: 'Formulario de cita' },
      'Cuando pide una cita en [Pedir cita](/visita-fely-campo/cita) nos facilita su nombre y apellidos, email, teléfono, el atelier que prefiere, el mes y año de su evento y, si quiere, un mensaje. Usamos estos datos únicamente para ponernos en contacto con usted, resolver sus dudas y organizar su visita al atelier.',
      { h3: 'Solicitud de información sobre un vestido o una prenda' },
      'Cuando pulsa «Contacta con nosotros» en un vestido o una prenda nos facilita su nombre, email y, si quiere, su teléfono y un comentario, junto con el producto y el color que le interesan. Usamos estos datos únicamente para contestarle con la información que nos pide y, si lo desea, invitarle a conocer la pieza en el atelier.',
      'No usamos los datos de estos formularios para enviarle publicidad ni comunicaciones comerciales, ni para elaborar perfiles.',
      { h3: 'Newsletter' },
      'Si se suscribe a nuestra newsletter, usaremos su email para enviarle novedades, colecciones y ofertas de Fely Campo. Puede darse de baja en cualquier momento con el enlace que incluye cada envío.',
      { h3: 'WhatsApp, email y teléfono' },
      'Si nos escribe por WhatsApp o por email, o nos llama, usaremos los datos que nos facilite (su nombre, número o email y lo que nos cuente) para atenderle. Las conversaciones de WhatsApp se gestionan a través de WhatsApp, servicio de Meta, con sus propias condiciones de privacidad.',
      { h3: 'Navegación y cookies' },
      'Si las acepta, usamos cookies de análisis y de publicidad. Lo explicamos en detalle en la [Política de Cookies](/legal/cookies).',

      { h: '¿Cuál es la base legal para usar sus datos?' },
      {
        lista: [
          'Formularios de cita y de información, WhatsApp, email y teléfono: la aplicación de medidas precontractuales a petición suya (art. 6.1.b del Reglamento General de Protección de Datos, RGPD), es decir, atender la solicitud que usted nos hace. Si después nos encarga un vestido, la ejecución de ese contrato.',
          'Newsletter: su consentimiento (art. 6.1.a RGPD), que da al suscribirse y puede retirar en cualquier momento.',
          'Cookies de análisis y de publicidad: su consentimiento, que da en el aviso de cookies.',
        ],
      },
      'Los datos marcados como obligatorios en cada formulario son necesarios para poder atenderle; si no nos los facilita, no podremos contestar a su solicitud.',

      { h: '¿Durante cuánto tiempo conservamos sus datos?' },
      {
        lista: [
          'Solicitudes de cita y de información: el tiempo necesario para atenderlas y, como máximo, un año desde nuestro último contacto. Si llega a encargarnos un vestido, durante la relación comercial y, después, durante los plazos que exige la ley (por ejemplo, seis años para la documentación contable y fiscal).',
          'Newsletter: hasta que se dé de baja.',
          'Cookies: los plazos indicados en la Política de Cookies.',
        ],
      },
      'Pasados esos plazos, los datos se eliminan o se bloquean durante el tiempo en que puedan derivarse responsabilidades legales.',

      { h: '¿A quién comunicamos sus datos?' },
      'No vendemos ni cedemos sus datos a terceros para sus propios fines, salvo obligación legal. Dentro de Fely Campo, su solicitud la atiende el equipo del atelier que corresponda (Salamanca, Madrid u Oviedo).',
      'Para que la web funcione contamos con proveedores que tratan datos por cuenta nuestra, con los que hemos firmado o aceptado los correspondientes contratos de encargo del tratamiento:',
      {
        lista: [
          'Alojamiento de la web: nuestro proveedor de hosting.',
          'Envío de los emails de los formularios (aviso al equipo y confirmación a usted): Resend.',
          'Analítica y publicidad, solo si acepta esas cookies: Google (Google Ireland Limited) y Meta (Meta Platforms Ireland Limited).',
          'Newsletter: Substack, Inc.',
        ],
      },

      { h: 'Transferencias internacionales' },
      'Algunos de estos proveedores (como Resend, Substack, Google y Meta, y en su caso el proveedor de hosting) tienen su sede o sus servidores en Estados Unidos, por lo que sus datos pueden tratarse fuera del Espacio Económico Europeo. Estas transferencias se realizan con las garantías previstas en el RGPD: empresas adheridas al Marco de Privacidad de Datos UE-EE. UU. o cláusulas contractuales tipo aprobadas por la Comisión Europea.',

      { h: '¿Cuáles son sus derechos?' },
      'Puede ejercer en cualquier momento sus derechos de:',
      {
        lista: [
          'Acceso a sus datos personales.',
          'Rectificación de los datos inexactos o supresión de sus datos.',
          'Oposición al tratamiento.',
          'Limitación del tratamiento.',
          'Portabilidad de sus datos.',
          'Retirada del consentimiento, sin que ello afecte a la licitud del tratamiento anterior.',
        ],
      },
      'Para ejercerlos, escríbanos a info@felycampo.com o por correo postal a nuestro domicilio social, indicando qué derecho quiere ejercer. Solo le pediremos un documento que acredite su identidad si tenemos dudas razonables sobre ella. Le contestaremos en el plazo de un mes.',
      'Si considera que no hemos tratado sus datos correctamente, puede presentar una reclamación ante la Agencia Española de Protección de Datos ([www.aepd.es](https://www.aepd.es)). Le agradeceremos que antes nos lo cuente en info@felycampo.com para intentar solucionarlo.',

      { h: 'Seguridad y confidencialidad' },
      'Aplicamos medidas técnicas y organizativas adecuadas para proteger sus datos frente a su pérdida, alteración o acceso no autorizado. Las personas de Fely Campo que tratan sus datos lo hacen con deber de confidencialidad. Le pedimos que nos avise si sus datos cambian, para mantenerlos actualizados.',

      { h: 'Menores de edad' },
      'Los formularios de la web están dirigidos a mayores de 14 años. Si es menor de 14 años, no nos facilite sus datos sin el consentimiento de sus padres o tutores.',

      { h: 'Cambios en esta política' },
      'Podemos actualizar esta Política de Privacidad para adaptarla a cambios en la web o en la ley. La fecha de la última actualización figura al principio de la página.',
    ],
  },

  en: {
    titulo: 'Privacy Policy',
    actualizado: 'Last updated: November 2026',
    bloques: [
      'In line with the principles of lawfulness, fairness and transparency, this Privacy Policy explains what personal data we collect through felycampo.com, what we use it for and what rights you have. This English version is provided for convenience; in case of any discrepancy, the Spanish version prevails.',

      { h: 'Who is the data controller?' },
      {
        lista: [
          'FELY CAMPO S.L.',
          'Tax ID (CIF): B-37323573',
          'Registered office: Calle Vázquez Coronado 6, 37002 Salamanca (Spain)',
          'Email: info@felycampo.com',
          'Phone: +34 923 190 053',
        ],
      },

      { h: 'What data do we collect and why?' },
      { h3: 'Appointment form' },
      'When you request an appointment through [Book an appointment](/visita-fely-campo/cita) you give us your full name, email, phone number, preferred atelier, the month and year of your event and, optionally, a message. We use this data only to get in touch with you, answer your questions and arrange your visit to the atelier.',
      { h3: 'Information request about a dress or garment' },
      'When you click “Contact us” on a dress or garment you give us your name, email and, optionally, your phone number and a comment, together with the product and colour you are interested in. We use this data only to reply with the information you asked for and, if you wish, to invite you to see the piece at the atelier.',
      'We do not use the data from these forms to send you advertising or marketing communications, nor to build profiles.',
      { h3: 'Newsletter' },
      'If you subscribe to our newsletter, we will use your email to send you news, collections and offers from Fely Campo. You can unsubscribe at any time using the link included in every email.',
      { h3: 'WhatsApp, email and phone' },
      'If you write to us on WhatsApp or by email, or call us, we will use the data you give us (your name, number or email and what you tell us) to assist you. WhatsApp conversations are handled through WhatsApp, a Meta service, under its own privacy terms.',
      { h3: 'Browsing and cookies' },
      'If you accept them, we use analytics and advertising cookies. We explain this in detail in our [Cookie Policy](/legal/cookies).',

      { h: 'What is the legal basis for using your data?' },
      {
        lista: [
          'Appointment and information forms, WhatsApp, email and phone: taking steps at your request prior to entering into a contract (Art. 6(1)(b) of the General Data Protection Regulation, GDPR), that is, handling the request you make. If you then order a dress from us, the performance of that contract.',
          'Newsletter: your consent (Art. 6(1)(a) GDPR), given when you subscribe and which you can withdraw at any time.',
          'Analytics and advertising cookies: your consent, given in the cookie banner.',
        ],
      },
      'The fields marked as required in each form are necessary for us to assist you; if you do not provide them, we will not be able to reply to your request.',

      { h: 'How long do we keep your data?' },
      {
        lista: [
          'Appointment and information requests: for as long as needed to handle them and, at most, one year from our last contact. If you order a dress from us, for the duration of the business relationship and then for the periods required by law (for example, six years for accounting and tax records).',
          'Newsletter: until you unsubscribe.',
          'Cookies: the periods stated in the Cookie Policy.',
        ],
      },
      'After those periods, the data is deleted or blocked for as long as legal liabilities may arise.',

      { h: 'Who do we share your data with?' },
      'We do not sell or transfer your data to third parties for their own purposes, unless required by law. Within Fely Campo, your request is handled by the team of the relevant atelier (Salamanca, Madrid or Oviedo).',
      'To run the website we rely on providers that process data on our behalf, with whom we have signed or accepted the corresponding data processing agreements:',
      {
        lista: [
          'Website hosting: our hosting provider.',
          'Sending the form emails (notice to our team and confirmation to you): Resend.',
          'Analytics and advertising, only if you accept those cookies: Google (Google Ireland Limited) and Meta (Meta Platforms Ireland Limited).',
          'Newsletter: Substack, Inc.',
        ],
      },

      { h: 'International transfers' },
      'Some of these providers (such as Resend, Substack, Google and Meta, and where applicable the hosting provider) are based in, or have servers in, the United States, so your data may be processed outside the European Economic Area. These transfers are made with the safeguards provided for in the GDPR: companies certified under the EU-U.S. Data Privacy Framework or standard contractual clauses approved by the European Commission.',

      { h: 'What are your rights?' },
      'You may exercise at any time your rights of:',
      {
        lista: [
          'Access to your personal data.',
          'Rectification of inaccurate data or erasure of your data.',
          'Objection to processing.',
          'Restriction of processing.',
          'Data portability.',
          'Withdrawal of consent, without affecting the lawfulness of prior processing.',
        ],
      },
      'To exercise them, write to info@felycampo.com or by post to our registered office, stating which right you wish to exercise. We will only ask for proof of identity if we have reasonable doubts about it. We will reply within one month.',
      'If you believe we have not handled your data properly, you may lodge a complaint with the Spanish Data Protection Agency ([www.aepd.es](https://www.aepd.es)) or the supervisory authority of your country of residence. We would appreciate it if you told us first at info@felycampo.com so we can try to resolve it.',

      { h: 'Security and confidentiality' },
      'We apply appropriate technical and organisational measures to protect your data against loss, alteration or unauthorised access. Fely Campo staff who handle your data are bound by a duty of confidentiality. Please let us know if your data changes so we can keep it up to date.',

      { h: 'Minors' },
      'The forms on this website are intended for people aged 14 and over. If you are under 14, please do not give us your data without the consent of your parents or guardians.',

      { h: 'Changes to this policy' },
      'We may update this Privacy Policy to reflect changes to the website or the law. The date of the last update is shown at the top of the page.',
    ],
  },
};
