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
import {
  AdminSidebar, AdminMarca, AdminTopbar, AdminContenido, ToastProvider, CategoriasProvider, AdminAuthGate,
} from '@/components/admin';
import styles from './layout.module.css';

export const metadata = {
  title: 'Admin Panel - Fely Campo',
  description: 'Gestión interna de producto, pedidos, diseño de landing y contenido de Fely Campo.',
  icons: {
    icon: '/img/logo/favicon-felycampo-admin.jpg',
  },
};

export default function AdminLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AdminAuthGate>
        <CategoriasProvider>
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
        </CategoriasProvider>
        </AdminAuthGate>
      </body>
    </html>
  );
}
