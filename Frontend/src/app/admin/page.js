'use client';

/* ============================================================
   DASHBOARD — Fely Campo (admin)
   Solo lectura: resumen + accesos rápidos a listas ya filtradas.
   No hay edición posible desde aquí (spec sección 1).
   Adaptado a lo que usa el front (2026-10-27): citas del formulario
   de /visita-fely-campo/cita, consultas de vestidos ("Contacta con
   nosotros" en las fichas de Novias/Fiesta), suscriptoras de la
   newsletter y fotos/reseñas de /atelier/vosotras. El resumen de la
   tienda (pedidos, productos, stock) queda oculto con ella — ver
   GRUPOS_OCULTOS en AdminSidebar.jsx.
   'use client': TablaAdmin acepta props función (render/renderAcciones)
   y es Client Component (usa checkboxes con onChange) — esas props no
   pueden cruzar el límite servidor→cliente, así que quien la usa
   también debe ser cliente. Mismo criterio en el resto de páginas del
   panel que usan TablaAdmin/DragList/PickerDrawer.
   ============================================================ */

import Link from 'next/link';
import { PageHeader, TablaAdmin, EstadoBadge } from '@/components/admin';
import { Boton } from '@/components/ui';
import { citasMock, consultasPrecioMock, newsletterMock } from '@/components/admin/mockData';
import { FOTOS_INVITADAS, FOTOS_NOVIAS, RESENAS_INTERCALADAS } from '@/components/layout/vosotrasFotos';
import { fechaHora, mesAnio, nombreAtelier } from './consultas/citasFormato';
import BanderaIdioma from './consultas/BanderaIdioma';
import styles from './page.module.css';

export default function AdminDashboard() {
  const citasPendientes = citasMock.filter((c) => c.estado === 'Pendiente').length;
  const solicitudesPendientes = consultasPrecioMock.filter((c) => c.estado === 'Pendiente').length;
  const gruposVosotras = FOTOS_INVITADAS.length + FOTOS_NOVIAS.length;

  const ultimasCitas = [...citasMock].sort((a, b) => b.recibida.localeCompare(a.recibida)).slice(0, 5);

  return (
    <div>
      <PageHeader titulo="Dashboard" subtitulo="Resumen de contactos y contenido de la web" />

      <div className={styles.widgets}>
        <div className={styles.widget}>
          <p className={styles.widgetValor}>{citasMock.length}</p>
          <p className={styles.widgetLabel}>Solicitudes de cita</p>
        </div>
        <div className={styles.widget}>
          <p className={styles.widgetValor}>{consultasPrecioMock.length}</p>
          <p className={styles.widgetLabel}>Consultas de vestidos</p>
        </div>
        <div className={styles.widget}>
          <p className={styles.widgetValor}>{newsletterMock.length}</p>
          <p className={styles.widgetLabel}>Suscriptoras newsletter</p>
        </div>
        <div className={styles.widget}>
          <p className={styles.widgetValor}>{gruposVosotras}</p>
          <p className={styles.widgetLabel}>Grupos de fotos en Vosotras</p>
        </div>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Accesos rápidos</p>
        <div className={styles.accesos}>
          <Link href="/admin/consultas?estado=Pendiente" className={styles.acceso}>
            <p className={styles.accesoValor}>{citasPendientes}</p>
            <p className={styles.accesoLabel}>Citas pendientes</p>
          </Link>
          <Link href="/admin/consultas-precio" className={styles.acceso}>
            <p className={styles.accesoValor}>{solicitudesPendientes}</p>
            <p className={styles.accesoLabel}>Consultas de vestidos pendientes</p>
          </Link>
          <Link href="/admin/vosotras" className={styles.acceso}>
            <p className={styles.accesoValor}>{RESENAS_INTERCALADAS.length}</p>
            <p className={styles.accesoLabel}>Reseñas en Vosotras</p>
          </Link>
        </div>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Últimas citas</p>
        <TablaAdmin
          columnas={[
            { clave: 'recibida', etiqueta: 'Recibida', render: (c) => fechaHora(c.recibida) },
            { clave: 'nombre', etiqueta: 'Clienta' },
            { clave: 'locale', etiqueta: 'Idioma', render: (c) => <BanderaIdioma locale={c.locale} /> },
            { clave: 'ubicacion', etiqueta: 'Atelier', render: (c) => nombreAtelier(c.ubicacion) },
            { clave: 'fechaEvento', etiqueta: 'Fecha del evento', render: (c) => mesAnio(c.fechaEvento) },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => <EstadoBadge estado={c.estado} /> },
          ]}
          filas={ultimasCitas}
          hrefFila={(c) => `/admin/consultas/${c.id}`}
          renderAcciones={(c) => <Boton variante="texto" href={`/admin/consultas/${c.id}`}>Ver</Boton>}
        />
      </div>
    </div>
  );
}
