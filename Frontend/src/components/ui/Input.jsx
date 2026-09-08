'use client';

/* ============================================================
   INPUT — Fely Campo
   Uso: <Input etiqueta="Email" tipo="email" placeholder="nombre@email.com" />
   ============================================================ */

import styles from './Input.module.css';

/**
 * Campo de formulario estándar. Borde recto, sin radio.
 */
/**
 * "error": mensaje de validación de ESTE campo, normalmente el que devuelve el backend
 * en `ApiError.details[campo]`. Se pinta debajo del input y se enlaza con
 * aria-describedby para que un lector de pantalla lo anuncie al enfocar el campo.
 * Opcional: los formularios que no validan no pasan nada y se comportan igual que antes.
 */
function Input({ etiqueta, tipo = 'text', placeholder, valor, onChange, nombre, tabIndex, error, autoComplete }) {
  const idError = error && nombre ? `${nombre}-error` : undefined;

  return (
    <label className={styles.campo}>
      {etiqueta && <span className={styles.etiqueta}>{etiqueta}</span>}
      <input
        type={tipo}
        name={nombre}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        tabIndex={tabIndex}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={idError}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && (
        <span id={idError} className={styles.error} role="alert">{error}</span>
      )}
    </label>
  );
}

export default Input;
