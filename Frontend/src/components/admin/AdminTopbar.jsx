import styles from './AdminTopbar.module.css';

/**
 * Cabecera fija del panel — sin lógica de sesión real, "Jaume" es un
 * placeholder del usuario admin conectado.
 */
function AdminTopbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.usuario}>
        <div className={styles.usuarioInfo}>
          <span className={styles.usuarioNombre}>Miriam Reina</span>
          <span className={styles.usuarioRol}>Frontend Developer</span>
        </div>
        <span className={styles.avatar}>MR</span>
      </div>
    </header>
  );
}

export default AdminTopbar;
