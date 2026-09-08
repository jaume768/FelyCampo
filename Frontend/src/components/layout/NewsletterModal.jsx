// NewsletterModal.jsx

'use client';

/* ============================================================
   POPUP NEWSLETTER — Fely Campo
   Modal de captación (ver ui/Modal.jsx), distinto del formulario de
   newsletter que ya vive en el pie de página (ver Footer.jsx,
   t('footer.newsletter.*')) — este es la variante "popup" a pantalla
   completa, con foto de marca a la izquierda. Mismo mecanismo de
   placeholder que el resto del sitio sin backend real (ver
   ModalSolicitudAtelier.jsx): "Apúntate" cierra el popup, no manda el
   email a ningún sitio todavía.
   Uso:
     <NewsletterModal abierto={abierto} onCerrar={() => setAbierto(false)} />
   ============================================================ */

import { useTranslations } from 'next-intl';
import { Modal, Boton } from '../ui';
import styles from './NewsletterModal.module.css';

function NewsletterModal({ abierto, onCerrar, imagen = '/img/styleguide/prod-tarjeta.webp' }) {
  const t = useTranslations('newsletterPopup');

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} className={styles.panel} classNameContenido={styles.contenidoModal}>
      <div className={styles.contenido}>
        <div className={styles.columnaImagen}>
          <img src={imagen} alt="" className={styles.imagen} />
        </div>
        <div className={styles.columnaTexto}>
          <h2 className={styles.titulo}>{t('titulo')}</h2>
          <div className={styles.filaInferior}>
            <Boton variante="solido" tamano="m" onClick={onCerrar} className={styles.boton}>
              {t('boton')}
            </Boton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default NewsletterModal;
