'use client';

/* ============================================================
   CONFIRMAR BORRADO — Fely Campo (admin)
   Diálogo de confirmación para acciones de borrar, sobre ModalOverlay —
   sustituye a `window.confirm()` (el diálogo nativo del navegador, sin
   estilo, distinto en cada SO) en todos los flujos de borrado del panel.
   Uso:
     const [porBorrar, setPorBorrar] = useState(null); // o un id/índice
     <ConfirmarBorrado
       abierto={!!porBorrar}
       titulo={`¿Borrar "${porBorrar?.nombre}"?`}
       onConfirmar={() => { borrar(porBorrar); setPorBorrar(null); }}
       onCancelar={() => setPorBorrar(null)}
     />
   ============================================================ */

import { AlertTriangle } from 'lucide-react';
import ModalOverlay from './ModalOverlay';
import { Boton } from '@/components/ui';
import styles from './ConfirmarBorrado.module.css';

function ConfirmarBorrado({
  abierto, titulo = '¿Borrar esto?', mensaje = 'Esta acción no se puede deshacer.', textoConfirmar = 'Borrar', onConfirmar, onCancelar,
}) {
  return (
    <ModalOverlay abierto={abierto} onCerrar={onCancelar}>
      <div className={styles.contenido}>
        <AlertTriangle size={28} strokeWidth={1.5} className={styles.icono} aria-hidden="true" />
        <p className={styles.titulo}>{titulo}</p>
        <p className={styles.mensaje}>{mensaje}</p>
        <div className={styles.acciones}>
          <Boton variante="contorno" onClick={onCancelar}>Cancelar</Boton>
          <Boton variante="solido" className={styles.borrar} onClick={onConfirmar}>{textoConfirmar}</Boton>
        </div>
      </div>
    </ModalOverlay>
  );
}

export default ConfirmarBorrado;
