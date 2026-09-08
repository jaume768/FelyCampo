import styles from './FormSeccion.module.css';

/**
 * Sección numerada de un formulario largo (crear/editar producto,
 * páginas de Contenido...). Solo maquetación — cada padre decide qué
 * campos mete dentro.
 */
function FormSeccion({
  numero, titulo, descripcion, accion, children,
}) {
  return (
    <section className={styles.seccion}>
      <div className={styles.cabecera}>
        <span className={styles.numero}>{numero}</span>
        <div>
          <p className={styles.titulo}>{titulo}</p>
          {descripcion && <p className={styles.descripcion}>{descripcion}</p>}
        </div>
        {accion && <div className={styles.accion}>{accion}</div>}
      </div>
      <div className={styles.campos}>{children}</div>
    </section>
  );
}

export default FormSeccion;
