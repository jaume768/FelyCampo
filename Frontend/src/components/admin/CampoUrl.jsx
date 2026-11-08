'use client';

/* ============================================================
   CAMPO DE DIRECCIÓN EXTERNA — Fely Campo (admin)
   Una dirección fuera de la web (un vídeo de YouTube…). Avisa si no es
   una dirección completa (https://…) y deja abrirla para comprobarla.
   Para enlaces dentro de la web se usa SelectorEnlace (desplegable de
   páginas), no este campo.
   ============================================================ */

import { useId } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { urlValida } from '@/lib/previa';
import styles from './CamposEditor.module.css';

// "opcional": vacío no se marca como pendiente (pone «Opcional»).
function CampoUrl({
  etiqueta = 'Enlace', ayuda, valor, onChange, opcional = false,
}) {
  const id = useId();
  const valida = urlValida(valor);
  const mal = Boolean(valor) && !valida;

  return (
    <div className={styles.campo}>
      <div className={styles.cabecera}>
        <label htmlFor={id} className={styles.etiqueta}>{etiqueta}</label>
        {mal && <span className={styles.falta}>Dirección incompleta</span>}
        {opcional && !valor && <span className={styles.ayuda}>Opcional</span>}
        {valida && (
          <a href={valor} target="_blank" rel="noopener noreferrer" className={styles.abrir}>
            Abrir
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        )}
      </div>
      <input
        id={id}
        type="url"
        inputMode="url"
        className={`${styles.entrada} ${mal || (!valor && !opcional) ? styles.entradaFalta : ''}`}
        value={valor || ''}
        placeholder="https://"
        onChange={(evento) => onChange(evento.target.value.trim())}
      />
      {ayuda && <p className={styles.ayuda}>{ayuda}</p>}
    </div>
  );
}

export default CampoUrl;
