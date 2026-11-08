/* ============================================================
   LAYOUT RAÍZ DEL PANEL ADMIN — Fely Campo
   "admin" es un segmento hermano de "[locale]", no un hijo — así que
   es su propio root layout independiente (define <html>/<body> igual
   que [locale]/layout.js), en vez de heredar el next-intl provider,
   Navbar y Footer del sitio público. Patrón soportado por Next.js:
   "multiple root layouts" cuando no hay app/layout.js compartido.
   Solo Español — sin next-intl, sin prefijo de idioma en la URL.
   ============================================================ */

import { Suspense } from 'react';
import '@/styles/global.css';
import { clasesFuentes } from '@/styles/fuentes';
import {
  AdminSidebar, AdminMarca, AdminTopbar, AdminContenido, ToastProvider, CategoriasProvider, AtelierFiestaProvider, PaginasProvider,
  BlogProvider, VosotrasProvider, AtelierNoviasProvider, RunwayProvider, PretAPorterProvider, PuntosVentaProvider,
  SesionAdminProvider,
} from '@/components/admin';
import styles from './layout.module.css';

export const metadata = {
  title: 'Admin Panel - Fely Campo',
  robots: { index: false, follow: false },
  description: 'Gestión interna de producto, pedidos, diseño de landing y contenido de Fely Campo.',
  icons: {
    icon: '/img/logo/favicon-felycampo-admin.jpg',
  },
};

// Aplica el tema claro del panel (si se eligió con el botón sol/luna de
// AdminTopbar.jsx) antes de pintar, para que no parpadee en oscuro al
// cargar. Misma clave que CLAVE_TEMA_ADMIN de AdminTopbar.jsx.
const SCRIPT_TEMA = `try{if(localStorage.getItem('fc_admin_tema')==='claro')document.documentElement.dataset.adminTema='claro'}catch(e){}`;

export default function AdminLayout({ children }) {
  return (
    // suppressHydrationWarning: el script de arriba puede añadir
    // data-admin-tema a <html> antes de que React hidrate.
    <html lang="es" className={clasesFuentes} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className={styles.admin}>
        {/* Sesión: quién ha entrado y cerrar sesión. El proxy ya exige la
            cookie de equipo para llegar aquí (src/proxy.js). */}
        <SesionAdminProvider>
        <CategoriasProvider>
          {/* Dentro de CategoriasProvider: mantiene al día el submenú
              "Fiesta" del menú lateral (ver AtelierFiesta.jsx). */}
          <AtelierFiestaProvider>
          <AtelierNoviasProvider>
          <RunwayProvider>
          <PretAPorterProvider>
          <PaginasProvider>
          <BlogProvider>
          <VosotrasProvider>
          <PuntosVentaProvider>
          <ToastProvider>
            <div className={styles.shell}>
              <div className={styles.topRow}>
                <AdminMarca />
                <AdminTopbar />
              </div>
              <div className={styles.body}>
                <Suspense fallback={null}>
                  <AdminSidebar />
                </Suspense>
                <AdminContenido className={styles.contenido}>{children}</AdminContenido>
              </div>
            </div>
          </ToastProvider>
          </PuntosVentaProvider>
          </VosotrasProvider>
          </BlogProvider>
          </PaginasProvider>
          </PretAPorterProvider>
          </RunwayProvider>
          </AtelierNoviasProvider>
          </AtelierFiestaProvider>
        </CategoriasProvider>
        </SesionAdminProvider>
      </body>
    </html>
  );
}
