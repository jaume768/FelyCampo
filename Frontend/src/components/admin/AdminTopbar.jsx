'use client';

import { useEffect, useState } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useSesionAdmin } from './SesionAdmin';
import styles from './AdminTopbar.module.css';

// Misma clave que lee el script de app/admin/layout.js antes de pintar
// (así no hay parpadeo al cargar con el tema claro guardado).
export const CLAVE_TEMA_ADMIN = 'fc_admin_tema';

/**
 * Cabecera fija del panel.
 * - Quién ha entrado: nombre (o email) de la cuenta de staff, de
 *   GET /api/v1/admin/me/ (ver SesionAdmin.jsx). Mientras carga, el
 *   genérico "Equipo Fely Campo".
 * - Botón de tema (sol/luna), en el sitio del antiguo cuadrado "FC":
 *   cambia la barra de arriba y el menú lateral entre oscuro (por
 *   defecto) y claro — el espacio de trabajo es siempre blanco. Pone
 *   data-admin-tema="claro" en <html> (ver los colores en
 *   app/admin/layout.module.css) y lo recuerda en este navegador.
 * - "Cerrar sesión", a la derecha del todo: cierra la sesión de Django y
 *   la cookie de equipo, y vuelve a /acceso.
 */
function AdminTopbar() {
  const { usuario, cerrarSesion } = useSesionAdmin();
  const [tema, setTema] = useState('oscuro');

  // Al montar, lee el tema que ya aplicó el script del layout.
  useEffect(() => {
    if (document.documentElement.dataset.adminTema === 'claro') setTema('claro');
  }, []);

  const cambiarTema = () => {
    const nuevo = tema === 'oscuro' ? 'claro' : 'oscuro';
    setTema(nuevo);
    if (nuevo === 'claro') document.documentElement.dataset.adminTema = 'claro';
    else delete document.documentElement.dataset.adminTema;
    try {
      localStorage.setItem(CLAVE_TEMA_ADMIN, nuevo);
    } catch {
      // Sin localStorage (modo privado...): el cambio vale solo para esta visita.
    }
  };

  const etiquetaTema = tema === 'oscuro' ? 'Cambiar a panel claro' : 'Cambiar a panel oscuro';
  const IconoTema = tema === 'oscuro' ? Sun : Moon;

  return (
    <header className={styles.topbar}>
      <div className={styles.usuario}>
        <div className={styles.usuarioInfo}>
          <span className={styles.usuarioNombre}>
            {usuario?.full_name?.trim() || usuario?.email || 'Equipo Fely Campo'}
          </span>
          <span className={styles.usuarioRol}>
            {usuario?.full_name?.trim() ? usuario.email : 'Administración'}
          </span>
        </div>
        <button
          type="button"
          className={styles.tema}
          onClick={cambiarTema}
          aria-label={etiquetaTema}
          title={etiquetaTema}
        >
          <IconoTema className={styles.temaIcono} strokeWidth={1.5} />
        </button>
      </div>

      <button
        type="button"
        className={styles.cerrarSesion}
        onClick={cerrarSesion}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut className={styles.cerrarSesionIcono} strokeWidth={1.5} />
      </button>
    </header>
  );
}

export default AdminTopbar;
