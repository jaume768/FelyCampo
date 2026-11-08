// NewsletterModal.jsx

'use client';

/* ============================================================
   POPUP NEWSLETTER — Fely Campo
   Modal de captación (ver ui/Modal.jsx), distinto del formulario de
   newsletter que ya vive en el pie de página (ver Footer.jsx,
   t('footer.newsletter.*')) — este es la variante "popup" a pantalla
   completa, con foto horizontal de marca a la izquierda. Título +
   subtítulo (namespace propio "newsletterPopup") + el mismo
   input/botón/estado de éxito-error que el footer (traducciones
   "footer.newsletter.*", mismo mecanismo de placeholder sin backend
   real: suscribirNewsletter simula la llamada, ver Footer.jsx) +
   consentimiento (texto plano, sin enlace a política de privacidad
   — a diferencia del footer) + "No, gracias" (mismo onCerrar que la X
   del propio Modal, una segunda salida explícita junto al formulario).
   Uso:
     <NewsletterModal abierto={abierto} onCerrar={() => setAbierto(false)} />
   ============================================================ */

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { obtenerPiezasComunes } from '@/lib/piezasComunes';
import { textoEn } from '@/lib/previa';
import { Modal, Boton } from '../ui';
import styles from './NewsletterModal.module.css';
import { atributosImagen } from '@/lib/imagenes';
import { suscribirNewsletter } from '@/lib/newsletter';


// Foto, título y texto: lib/piezasComunes.js (editables en el admin).
function NewsletterModal({ abierto, onCerrar, imagen = obtenerPiezasComunes().newsletter.imagen }) {
  const t = useTranslations('newsletterPopup');
  const locale = useLocale();
  const tFooter = useTranslations('footer');

  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState(null); // null | 'cargando' | 'exito' | 'error'

  const enviarNewsletter = async () => {
    setEstado('cargando');
    try {
      await suscribirNewsletter(email, { locale, origen: 'ventana' });
      setEstado('exito');
      setEmail('');
    } catch {
      setEstado('error');
    }
  };

  const handleSubmitNewsletter = (evento) => {
    evento.preventDefault();
    enviarNewsletter();
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} className={styles.panel} classNameContenido={styles.contenidoModal}>
      <div className={styles.contenido}>
        <div className={styles.columnaImagen}>
          <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 100vw, 40vw' })} alt="" className={styles.imagen} />
        </div>
        <div className={styles.columnaTexto}>
          <h2 className={styles.titulo}>{textoEn(obtenerPiezasComunes().newsletter.titulo, locale)}</h2>
          <p className={styles.subtitulo}>{textoEn(obtenerPiezasComunes().newsletter.subtitulo, locale)}</p>
          <div className={styles.filaNewsletterWrap}>
            <div className={styles.filaNewsletter}>
              <form className={styles.formNewsletter} onSubmit={handleSubmitNewsletter}>
                <input
                  type="email"
                  placeholder="nombre@email.com"
                  className={styles.input}
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  required
                />
              </form>
              <Boton
                variante="solido"
                tamano="s"
                type="button"
                onClick={enviarNewsletter}
                desactivado={estado === 'cargando' || email.trim().length === 0}
                className={styles.botonEnviar}
              >
                {tFooter('newsletter.enviar')}
              </Boton>
              <p className={styles.consentimiento}>{t('consentimiento')}</p>
            </div>
            {estado === 'exito' && (
              <p className={`${styles.estado} ${styles.estadoExito}`} role="status">
                {tFooter('newsletter.exito')}
              </p>
            )}
            {estado === 'error' && (
              <p className={`${styles.estado} ${styles.estadoError}`} role="alert">
                {tFooter('newsletter.error')}
              </p>
            )}
          </div>
          <div className={styles.pie}>
            <button type="button" className={styles.noGracias} onClick={onCerrar}>
              {t('noGracias')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default NewsletterModal;
