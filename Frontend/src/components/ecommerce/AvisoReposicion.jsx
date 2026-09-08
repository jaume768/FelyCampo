'use client';

/* ============================================================
   AVISO DE REPOSICIÓN
   "Avísame cuando vuelva a haber" para una talla agotada, contra
   POST /api/v1/catalog/stock-notifications/.

   No hace falta cuenta: solo el correo y la variante. El backend lo
   limita a 20/hora (`stock_notification`) porque dispara correos.

   Aparece solo cuando la talla elegida existe pero NO tiene stock —
   distinto de que la combinación no exista, que no se puede reponer.
   ============================================================ */

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { catalog } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { Boton } from '../ui';
import styles from './AvisoReposicion.module.css';

/**
 * @param {object} props
 * @param {string} props.variantId UUID de la variante agotada.
 * @param {string} [props.talla] Solo para el texto.
 */
function AvisoReposicion({ variantId, talla }) {
  const t = useTranslations('avisoReposicion');
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!email.trim()) {
      setError(t('faltaEmail'));
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await catalog.avisarmeDeStock({ variant: variantId, email: email.trim() });
      setEnviado(true);
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      // Campo a campo cuando el backend lo detalla; texto propio para los casos que
      // sabemos nombrar mejor que él.
      if (fallo.status === 429) setError(t('demasiados'));
      else if (fallo.isNetworkError) setError(t('errorRed'));
      else setError(fallo.firstDetail ?? t('error'));
    } finally {
      setEnviando(false);
    }
  };

  if (!variantId) return null;

  if (enviado) {
    return <p className={styles.confirmacion} role="status">{t('confirmado')}</p>;
  }

  if (!abierto) {
    return (
      <button type="button" className={styles.abrir} onClick={() => setAbierto(true)}>
        {talla ? t('abrirConTalla', { talla }) : t('abrir')}
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={enviar}>
      <label className={styles.etiqueta} htmlFor="aviso-reposicion-email">
        {t('etiqueta')}
      </label>
      <div className={styles.fila}>
        <input
          id="aviso-reposicion-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          placeholder={t('placeholder')}
          autoComplete="email"
        />
        <Boton variante="solido" type="submit" disabled={enviando}>
          {enviando ? t('enviando') : t('enviar')}
        </Boton>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );
}

export default AvisoReposicion;
