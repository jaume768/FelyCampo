'use client';

/* ============================================================
   MODAL OVERLAY — Fely Campo (admin)
   Diálogo centrado a pantalla completa (a diferencia de PickerDrawer,
   que reutiliza PanelLateral anclado al borde). Se usa para flujos
   largos que deben quedarse "encima" de la pantalla desde la que se
   abrieron — p.ej. crear un producto nuevo sin abandonar la lista.
   Fondo oscuro como elemento hermano del panel (nunca el mismo nodo):
   así su opacidad no se hereda al contenido, mismo criterio que
   PanelLateral.
   ============================================================ */

import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ModalOverlay.module.css';

function ModalOverlay({ abierto, onCerrar, children }) {
  useEffect(() => {
    if (!abierto) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.contenedor} onClick={onCerrar}>
        <div className={styles.panel} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <X />
          </button>
          <div className={styles.contenido}>{children}</div>
        </div>
      </div>
    </>
  );
}

export default ModalOverlay;
