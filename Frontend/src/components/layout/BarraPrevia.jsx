// BarraPrevia.jsx

/* ============================================================
   BARRA DE VISTA PREVIA — Fely Campo
   Barra negra fija abajo que avisa de que la página se está viendo con
   cambios sin publicar del admin (ver usePrevia.js), con el enlace de
   vuelta al editor. Solo la ve quien abre la vista previa desde el admin.
   ============================================================ */

import styles from './BarraPrevia.module.css';

function BarraPrevia({ editor }) {
  return (
    <div className={styles.barraPrevia} role="status">
      <span className={styles.punto} aria-hidden="true" />
      <span className={styles.texto}>
        <strong>Vista previa</strong>
        {' '}
        · Así se verá esta página. Los cambios aún no están publicados.
      </span>
      <a href={editor} className={styles.volver}>Volver al editor</a>
    </div>
  );
}

export default BarraPrevia;
