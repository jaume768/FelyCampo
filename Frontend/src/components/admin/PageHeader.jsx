import styles from './PageHeader.module.css';

/**
 * Cabecera estándar de cada pantalla del panel: título + subtítulo
 * opcional a la izquierda, acciones (botones) a la derecha.
 */
function PageHeader({ titulo, subtitulo, children }) {
  return (
    <div className={styles.cabecera}>
      <div>
        <h1 className={styles.titulo}>{titulo}</h1>
        {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
      </div>
      {children && <div className={styles.acciones}>{children}</div>}
    </div>
  );
}

export default PageHeader;
