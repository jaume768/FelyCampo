'use client';

/* ============================================================
   VENTAS DE UN PRODUCTO — Fely Campo (admin)
   Detalle al que lleva cada tarjeta de /admin/metricas: quién compró
   este producto, cuándo y en qué color. Reconstruye ese historial
   recorriendo `pedidosMock` y quedándose con los `items` que coinciden
   con el nombre del producto (misma relación por nombre, no por id,
   que el resto del panel — ver docs/adminpanel.md).
   Los productos de Atelier (Novias/Fiesta) no generan pedidos —
   generan Consultas de precio en su lugar (spec sección 5) — así que
   para esos el historial siempre estará vacío; se explica en vez de
   dejar una tabla en blanco sin contexto.
   ============================================================ */

import { use } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader, TablaAdmin, BotonVolver } from '@/components/admin';
import { productosMock, pedidosMock, coloresMock } from '@/components/admin/mockData';
import styles from './page.module.css';

function colorHex(nombre) {
  return coloresMock.find((c) => c.nombre.es === nombre)?.hex || '';
}

function comprasDe(nombreProducto) {
  return pedidosMock.flatMap((pedido) => (pedido.items || [])
    .filter((item) => item.producto === nombreProducto)
    .map((item) => ({
      ...item,
      pedidoId: pedido.id,
      cliente: pedido.cliente,
      fecha: pedido.fecha,
    })));
}

export default function VentasProductoPage({ params }) {
  const { id } = use(params);
  const producto = productosMock.find((p) => p.id === id);

  if (!producto) notFound();

  const compras = comprasDe(producto.nombre).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const unidadesTotales = compras.reduce((total, c) => total + c.cantidad, 0);
  const colores = compras.reduce((acc, c) => {
    acc[c.color] = (acc[c.color] || 0) + c.cantidad;
    return acc;
  }, {});

  return (
    <div>
      <BotonVolver href="/admin/metricas" />
      <PageHeader titulo={producto.nombre} subtitulo={`${unidadesTotales} unidad${unidadesTotales === 1 ? '' : 'es'} vendida${unidadesTotales === 1 ? '' : 's'} en total`} />

      {Object.keys(colores).length > 0 && (
        <div className={styles.bloque}>
          <p className={styles.bloqueTitulo}>Colores vendidos</p>
          <div className={styles.coloresFila}>
            {Object.entries(colores).map(([nombre, cantidad]) => (
              <span key={nombre} className={styles.colorChip}>
                {colorHex(nombre) && <span className={styles.colorPunto} style={{ background: colorHex(nombre) }} aria-hidden="true" />}
                {`${nombre} · ${cantidad}`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Compras</p>
        {compras.length === 0 ? (
          <p className={styles.vacio}>
            {producto.tipo === 'atelier'
              ? 'Sin compras registradas — es un producto de Atelier, no genera pedidos directos, genera Consultas de precio en su lugar.'
              : 'Sin compras registradas todavía.'}
          </p>
        ) : (
          <TablaAdmin
            columnas={[
              { clave: 'cliente', etiqueta: 'Cliente' },
              { clave: 'fecha', etiqueta: 'Fecha' },
              {
                clave: 'color',
                etiqueta: 'Color',
                render: (c) => (
                  <span className={styles.colorFila}>
                    {colorHex(c.color) && <span className={styles.colorPunto} style={{ background: colorHex(c.color) }} aria-hidden="true" />}
                    {c.color}
                  </span>
                ),
              },
              { clave: 'talla', etiqueta: 'Talla' },
              { clave: 'cantidad', etiqueta: 'Cantidad' },
              { clave: 'precio', etiqueta: 'Precio' },
            ]}
            filas={compras}
            claveFila={(c) => `${c.pedidoId}-${c.talla}-${c.color}`}
            hrefFila={(c) => `/admin/pedidos/${c.pedidoId}`}
          />
        )}
      </div>
    </div>
  );
}
