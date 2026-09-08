// NewsletterModalGlobal.jsx

'use client';

/* ============================================================
   POPUP NEWSLETTER — disparo automático — Fely Campo
   Envoltorio que abre NewsletterModal.jsx solo al llegar a la web,
   mismo criterio de montaje global que CarritoPanel/MiCuentaModal
   (ver Navbar.jsx) pero con estado propio en vez de un Context — nada
   más lo abre desde fuera. Vive en el layout raíz (ver
   src/app/[locale]/layout.js), montado solo en home ("isHome") — es
   un placeholder de captación, no un popup a repetir en cada página.
   ============================================================ */

import { useState } from 'react';
import NewsletterModal from './NewsletterModal';

function NewsletterModalGlobal() {
  const [abierto, setAbierto] = useState(true);

  return <NewsletterModal abierto={abierto} onCerrar={() => setAbierto(false)} />;
}

export default NewsletterModalGlobal;
