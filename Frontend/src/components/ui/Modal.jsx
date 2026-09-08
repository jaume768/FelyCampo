'use client';

/* ============================================================
   MODAL — Fely Campo
   Diálogo centrado a pantalla completa (a diferencia de PanelLateral,
   que desliza anclado a un borde) — mismo patrón que ModalOverlay.jsx
   del panel admin (components/admin/), recreado aquí porque ese vive
   solo en el panel, no en el sitio público. Fondo oscuro como
   elemento hermano del panel (nunca el mismo nodo): así su opacidad
   no se hereda al contenido, mismo criterio que PanelLateral.
   Uso:
     <Modal abierto={abierto} onCerrar={() => setAbierto(false)}>
       contenido
     </Modal>
   ============================================================ */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

function Modal({ abierto, onCerrar, children, className, classNameContenido }) {
  // Portal a document.body — mismo motivo que PanelLateral.jsx: quien
  // invoque Modal puede vivir dentro de un ancestro con su propio
  // contexto de apilamiento (ej. .info en FichaProductoAtelier,
  // position:sticky — siempre crea uno, tenga o no z-index), y desde
  // ahí ningún z-index interno del modal puede ganarle al header
  // (Navbar.module.css): el ancestro entero queda "atrapado" por
  // debajo. El portal cuelga overlay/contenedor directo de <body>, al
  // mismo nivel que el propio Navbar, donde su z-index sí compara de
  // verdad (ver ModalSolicitudAtelier.jsx, "Solicitar información").
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (!abierto) return undefined;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(evento) {
      if (evento.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, onCerrar]);

  if (!abierto || !montado) return null;

  return createPortal(
    <>
      <div className={styles.overlay} aria-hidden="true" onClick={onCerrar} />
      <div className={styles.contenedor}>
        <div className={[styles.panel, className || styles.tamanoDefault].filter(Boolean).join(' ')} role="dialog" aria-modal="true">
          <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <X size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
          <div className={[styles.contenido, classNameContenido || styles.contenidoDefault].filter(Boolean).join(' ')}>{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default Modal;
