'use client';

/* ============================================================
   DASHBOARD — Fely Campo (admin)
   Solo lectura: resumen + accesos rápidos a listas ya filtradas.
   No hay edición posible desde aquí (spec sección 1).
   'use client': TablaAdmin acepta props función (render/renderAcciones)
   y es Client Component (usa checkboxes con onChange) — esas props no
   pueden cruzar el límite servidor→cliente, así que quien la usa
   también debe ser cliente. Mismo criterio en el resto de páginas del
   panel que usan TablaAdmin/DragList/PickerDrawer.
   ============================================================ */

import Link from 'next/link';
import { PageHeader, TablaAdmin, EstadoBadge } from '@/components/admin';
import { Boton } from '@/components/ui';
import {
  pedidosMock, productosMock, consultasMock, filasStock, nivelStock,
} from '@/components/admin/mockData';
import styles from './page.module.css';

export default function AdminDashboard() {
  const pedidosPendientes = pedidosMock.filter((p) => p.estadoEnvio === 'Procesando').length;
  const productosActivos = productosMock.filter((p) => p.estado === 'Activo').length;
  const consultasPendientes = consultasMock.filter((c) => c.estado === 'Pendiente').length;
  const stockBajo = filasStock().filter((f) => nivelStock(f.stock) === 'bajo').length;

  const ultimosPedidos = pedidosMock.slice(0, 6);

  return (
    <div>
      <PageHeader titulo="Dashboard" subtitulo="Resumen general de la tienda" />

      <div className={styles.widgets}>
        <div className={styles.widget}>
          <p className={styles.widgetValor}>{pedidosMock.length}</p>
          <p className={styles.widgetLabel}>Pedidos totales</p>
        </div>
        <div className={styles.widget}>
          <p className={styles.widgetValor}>{pedidosPendientes}</p>
          <p className={styles.widgetLabel}>Pedidos sin enviar</p>
        </div>
        <div className={styles.widget}>
          <p className={styles.widgetValor}>{productosActivos}</p>
          <p className={styles.widgetLabel}>Productos activos</p>
        </div>
        <div className={styles.widget}>
          <p className={styles.widgetValor}>{consultasPendientes}</p>
          <p className={styles.widgetLabel}>Consultas sin responder</p>
        </div>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Accesos rápidos</p>
        <div className={styles.accesos}>
          <Link href="/admin/consultas?estado=Pendiente" className={styles.acceso}>
            <p className={styles.accesoValor}>{consultasPendientes}</p>
            <p className={styles.accesoLabel}>Consultas/citas pendientes</p>
          </Link>
          <Link href="/admin/stock" className={styles.acceso}>
            <p className={styles.accesoValor}>{stockBajo}</p>
            <p className={styles.accesoLabel}>Referencias con stock bajo</p>
          </Link>
          <Link href="/admin/pedidos?estadoEnvio=Procesando" className={styles.acceso}>
            <p className={styles.accesoValor}>{pedidosPendientes}</p>
            <p className={styles.accesoLabel}>Pedidos sin enviar</p>
          </Link>
        </div>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Últimos pedidos</p>
        <TablaAdmin
          columnas={[
            { clave: 'id', etiqueta: 'Pedido' },
            { clave: 'cliente', etiqueta: 'Cliente' },
            { clave: 'fecha', etiqueta: 'Fecha' },
            { clave: 'total', etiqueta: 'Total' },
            { clave: 'estadoEnvio', etiqueta: 'Envío', render: (fila) => <EstadoBadge estado={fila.estadoEnvio} /> },
          ]}
          filas={ultimosPedidos}
          hrefFila={(fila) => `/admin/pedidos/${fila.id}`}
          renderAcciones={(fila) => <Boton variante="texto" href={`/admin/pedidos/${fila.id}`}>Ver</Boton>}
        />
      </div>
    </div>
  );
}
