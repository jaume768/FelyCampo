'use client';

/* ============================================================
   SELECTOR DE ENLACE — Fely Campo (admin)
   A qué página de la web lleva un botón. Solo se puede elegir entre
   páginas que existen (paginasEnlaceLanding de lib/landing.js), así no
   hay enlaces rotos ni direcciones mal escritas. La web le pone delante
   el idioma de quien la visita (/es o /en).
   ============================================================ */

import { useId } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { paginasEnlaceLanding } from '@/lib/landing';
import styles from './CamposEditor.module.css';

function SelectorEnlace({ etiqueta = 'Enlace del botón', valor, onChange }) {
  const id = useId();
  const grupos = paginasEnlaceLanding();

  return (
    <div className={styles.campo}>
      <div className={styles.cabecera}>
        <label htmlFor={id} className={styles.etiqueta}>{etiqueta}</label>
        {valor && (
          <a href={`/es${valor}`} target="_blank" rel="noopener noreferrer" className={styles.abrir}>
            Abrir página
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        )}
      </div>
      <div className={styles.selectMarco}>
        <select id={id} className={styles.select} value={valor || ''} onChange={(evento) => onChange(evento.target.value)}>
          <option value="" disabled>Elige una página…</option>
          {grupos.map(({ grupo, opciones }) => (
            <optgroup key={grupo} label={grupo}>
              {opciones.map((opcion) => <option key={opcion.ruta} value={opcion.ruta}>{opcion.nombre}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SelectorEnlace;
