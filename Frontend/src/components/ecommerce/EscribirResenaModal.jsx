// EscribirResenaModal.jsx

'use client';

/* ============================================================
   ESCRIBIR RESEÑA — Fely Campo
   Modal que abre "Escribir reseña" en cada producto de un pedido
   (ver PanelCliente, atelier/mi-cuenta/panel/page.js) — mismo diseño
   que ModalSolicitudAtelier.jsx (resumen del producto + formulario +
   pantalla de confirmación tras "enviar"), pero pidiendo una
   valoración (estrellas) + comentario en vez de talla + contacto.

   PLACEHOLDER a propósito, a petición: solo diseño, sin lógica real —
   "enviar" no manda la reseña a ningún sitio (ni a resenasMock ni a
   ninguna ficha de producto), solo pasa a la pantalla de confirmación,
   mismo criterio que ModalSolicitudAtelier.jsx.
   Uso:
     <EscribirResenaModal abierto={abierto} onCerrar={...}
       producto={{ imagen: '...', nombre: 'Vestido Aurora' }} />
   ============================================================ */

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Modal, Boton } from '../ui';
import styles from './EscribirResenaModal.module.css';

function EscribirResenaModal({ abierto, onCerrar, producto, onEnviado }) {
  const t = useTranslations('escribirResena');
  const [valoracion, setValoracion] = useState(0);
  const [valoracionHover, setValoracionHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [avisoValoracion, setAvisoValoracion] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const alEnviar = (evento) => {
    evento.preventDefault();
    if (valoracion === 0) {
      setAvisoValoracion(true);
      return;
    }
    // Placeholder — ver comentario de arriba. "onEnviado" es solo
    // estado de UI (ej. PanelCliente marca ese producto como "ya
    // reseñado"), no persiste nada tampoco.
    setEnviado(true);
    onEnviado?.();
  };

  // Cada apertura empieza de cero — mismo criterio que
  // ModalSolicitudAtelier/GaleriaProductoLightbox al reabrir.
  const alCerrar = () => {
    onCerrar();
    setTimeout(() => {
      setValoracion(0);
      setComentario('');
      setAvisoValoracion(false);
      setEnviado(false);
    }, 300);
  };

  return (
    <Modal abierto={abierto} onCerrar={alCerrar}>
      {enviado ? (
        <div className={styles.confirmacion}>
          <h2 className={styles.titulo}>{t('confirmacionTitulo')}</h2>
          <p>{t('confirmacionTexto')}</p>
          <Boton variante="solido" tamano="full" onClick={alCerrar}>{t('cerrar')}</Boton>
        </div>
      ) : (
        <form className={styles.form} onSubmit={alEnviar}>
          <h2 className={styles.titulo}>{t('titulo')}</h2>
          <p className={styles.subtitulo}>{t('subtitulo')}</p>

          {producto && (
            <div className={styles.resumen}>
              {producto.imagen && <img src={producto.imagen} alt="" className={styles.resumenImagen} />}
              <p className={styles.resumenNombre}>{producto.nombre}</p>
            </div>
          )}

          <div className={styles.campo}>
            <span className={styles.etiqueta}>{t('valoracion')}</span>
            <div className={styles.estrellas} onMouseLeave={() => setValoracionHover(0)}>
              {[1, 2, 3, 4, 5].map((numero) => (
                <button
                  key={numero}
                  type="button"
                  className={styles.estrellaBtn}
                  onClick={() => { setValoracion(numero); setAvisoValoracion(false); }}
                  onMouseEnter={() => setValoracionHover(numero)}
                  aria-label={`${numero} / 5`}
                  aria-pressed={numero <= valoracion}
                >
                  <Star
                    size={24}
                    strokeWidth={1.5}
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    fill={numero <= (valoracionHover || valoracion) ? 'currentColor' : 'none'}
                    className={styles.estrellaIcono}
                  />
                </button>
              ))}
            </div>
            {avisoValoracion && <p className={styles.aviso}>{t('avisoValoracion')}</p>}
          </div>

          <label className={styles.campo}>
            <span className={styles.etiqueta}>{t('comentario')}</span>
            <textarea
              className={styles.textarea}
              value={comentario}
              onChange={(evento) => setComentario(evento.target.value)}
              placeholder={t('comentarioPlaceholder')}
              rows={4}
            />
          </label>

          <Boton variante="solido" tamano="full" type="submit">{t('enviar')}</Boton>
        </form>
      )}
    </Modal>
  );
}

export default EscribirResenaModal;
