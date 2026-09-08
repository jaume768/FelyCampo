// CollectionTitle.jsx

'use client';

import { useTranslations } from 'next-intl';
import styles from './CollectionTitle.module.css';

/**
 * Cabecera de colección: etiqueta opcional + título + descripción
 * opcional, todo centrado. No recibe los textos directamente sino sus
 * claves de traducción (messages/{locale}.json) — así el mismo
 * componente sirve para distintas colecciones sin hardcodear nada aquí.
 * Uso:
 *   <CollectionTitle
 *     labelKey="collectionTitle.edicionMujer.label"
 *     titleKey="collectionTitle.edicionMujer.title"
 *     descriptionKey="collectionTitle.edicionMujer.description"
 *   />
 */
function CollectionTitle({ labelKey, titleKey, descriptionKey }) {
  const t = useTranslations();

  return (
    <div className={styles.bloque}>
      {labelKey && <p className={styles.etiqueta}>{t(labelKey)}</p>}
      <p className={styles.titulo}>{t(titleKey)}</p>
      {descriptionKey && <p className={styles.descripcion}>{t(descriptionKey)}</p>}
    </div>
  );
}

export default CollectionTitle;
