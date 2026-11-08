'use client';

/* ============================================================
   CAMPO DE TEXTO TRADUCIBLE — Fely Campo (admin)
   Un texto de la web en el idioma que se está editando (selector
   Español | English de la barra del editor). Si falta en ese idioma, lo
   avisa y enseña el del otro idioma como referencia. El contador solo
   se ve al escribir o si el texto pasa del largo recomendado (avisa,
   no bloquea).
   Textos de varios párrafos (parrafos): el valor es una lista por idioma
   ({ es: [...], en: [...] }); en el campo, un párrafo por bloque, separados
   por una línea en blanco.
   Uso:
     <CampoTexto etiqueta="Título" idioma="es" valor={{ es, en }}
       onChange={...} largoRecomendado={40} multilinea ayuda="..." />
   ============================================================ */

import { useId } from 'react';
import styles from './CamposEditor.module.css';

const OTRO = { es: 'en', en: 'es' };

// Lista de párrafos ↔ texto con líneas en blanco (exactamente inversas,
// así escribir un salto de línea no se pierde por el camino).
const SEPARADOR = '\n\n';
const aTexto = (valor) => (Array.isArray(valor) ? valor.join(SEPARADOR) : valor || '');

function CampoTexto({
  etiqueta, ayuda, idioma, valor = {}, onChange, largoRecomendado, multilinea = false, parrafos = false, filas, opcional = false,
}) {
  const id = useId();
  const Control = multilinea || parrafos ? 'textarea' : 'input';
  const texto = aTexto(valor[idioma]);
  const referencia = aTexto(valor[OTRO[idioma]]);
  // Opcional: solo falta si el otro idioma sí lo tiene (falta traducirlo).
  const falta = !texto.trim() && (!opcional || Boolean(referencia.trim()));
  const largoDeMas = largoRecomendado && texto.length > largoRecomendado;

  return (
    <div className={styles.campo}>
      <div className={styles.cabecera}>
        <label htmlFor={id} className={styles.etiqueta}>{etiqueta}</label>
        {opcional && !texto.trim() && !falta && <span className={styles.ayuda}>Opcional</span>}
        {falta ? (
          <span className={styles.falta}>{idioma === 'en' ? 'Falta en inglés' : 'Falta en español'}</span>
        ) : largoRecomendado && (
          <span className={`${styles.contador} ${largoDeMas ? styles.contadorAviso : ''}`}>
            {largoDeMas && 'Largo para el diseño · '}
            {texto.length}
            {' / '}
            {largoRecomendado}
          </span>
        )}
      </div>
      <Control
        id={id}
        className={`${styles.entrada} ${falta ? styles.entradaFalta : ''} ${largoDeMas ? styles.entradaAviso : ''}`}
        value={texto}
        rows={Control === 'textarea' ? filas || (parrafos ? 8 : 4) : undefined}
        placeholder={referencia ? `${idioma === 'en' ? 'En español' : 'En inglés'}: ${referencia}` : ''}
        onChange={(evento) => {
          const nuevo = evento.target.value;
          onChange({ ...valor, [idioma]: parrafos ? nuevo.split(SEPARADOR) : nuevo });
        }}
      />
      {(ayuda || parrafos) && (
        <p className={styles.ayuda}>
          {[ayuda, parrafos && 'Los saltos de línea y los espacios se respetan tal cual. Una línea en blanco empieza un párrafo nuevo.'].filter(Boolean).join(' ')}
        </p>
      )}
    </div>
  );
}

export default CampoTexto;
