'use client';

/* ============================================================
   CAMPO DE UNA LÍNEA — Fely Campo (admin)
   Un dato que no se traduce (una fecha, una duración, la descripción de
   una foto para Google), con el mismo aspecto que CampoTexto.
   Uso:
     <CampoLinea etiqueta="Duración" valor="34 min" onChange={...}
       placeholder="34 min" ayuda="..." tipo="text|date" opcional />
   ============================================================ */

import { useId } from 'react';
import styles from './CamposEditor.module.css';

// "filas": varias líneas (un textarea), p. ej. el texto de una reseña,
// que se publica tal cual en los dos idiomas.
function CampoLinea({
  etiqueta, ayuda, valor = '', onChange, placeholder, tipo = 'text', opcional = false, filas,
}) {
  const id = useId();
  const falta = !opcional && !String(valor).trim();
  const Control = filas ? 'textarea' : 'input';

  return (
    <div className={styles.campo}>
      <div className={styles.cabecera}>
        <label htmlFor={id} className={styles.etiqueta}>{etiqueta}</label>
        {falta && <span className={styles.falta}>Falta</span>}
        {opcional && !valor && <span className={styles.ayuda}>Opcional</span>}
      </div>
      <Control
        id={id}
        type={filas ? undefined : tipo}
        rows={filas}
        className={`${styles.entrada} ${falta ? styles.entradaFalta : ''}`}
        value={valor}
        placeholder={placeholder}
        onChange={(evento) => onChange(evento.target.value)}
      />
      {ayuda && <p className={styles.ayuda}>{ayuda}</p>}
    </div>
  );
}

export default CampoLinea;
