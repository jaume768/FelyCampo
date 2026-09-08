'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import {
  PageHeader, TablaAdmin, EstadoBadge, EstadoPedidoBadge, EstadoContactoBadge, BotonVolver,
} from '@/components/admin';
import {
  clientesMock, pedidosMock, resenasMock, consultasMock, consultasPrecioMock, productosMock,
} from '@/components/admin/mockData';
import styles from './page.module.css';

function imagenesPedido(pedido) {
  return (pedido.items || [])
    .map((item) => productosMock.find((p) => p.nombre === item.producto)?.imagen)
    .filter(Boolean);
}

export default function DetalleClientePage({ params }) {
  const { id } = use(params);
  const cliente = clientesMock.find((c) => c.id === id);

  if (!cliente) notFound();

  const pedidos = pedidosMock.filter((p) => p.cliente === cliente.nombre);
  const resenas = resenasMock.filter((r) => r.nombreCliente === cliente.nombre);
  const consultas = consultasMock.filter((c) => c.cliente.nombre === cliente.nombre);
  const consultasPrecio = consultasPrecioMock.filter((c) => c.clienteId === cliente.id);

  return (
    <div>
      <BotonVolver href="/admin/clientes" />
      <PageHeader titulo={cliente.nombre} subtitulo={cliente.email} />

      <div className={styles.resumen}>
        <div>
          <p className={styles.resumenLabel}>Estado</p>
          <EstadoBadge estado={cliente.estado} />
        </div>
        <div>
          <p className={styles.resumenLabel}>Pedidos</p>
          <p className={styles.resumenValor}>{cliente.pedidos}</p>
        </div>
        <div>
          <p className={styles.resumenLabel}>Gasto total</p>
          <p className={styles.resumenValor}>{cliente.gastoTotal}</p>
        </div>
        <div>
          <p className={styles.resumenLabel}>Cliente desde</p>
          <p className={styles.resumenValor}>{cliente.fechaAlta}</p>
        </div>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Pedidos</p>
        <TablaAdmin
          columnas={[
            { clave: 'id', etiqueta: 'Pedido' },
            {
              clave: 'imagen',
              etiqueta: '',
              render: (p) => {
                const imagenes = imagenesPedido(p);
                return imagenes.length > 0 ? (
                  <span className={styles.miniaturaFila}>
                    <img src={imagenes[0]} alt="" className={styles.miniatura} />
                    {imagenes.length > 1 && <span className={styles.miniaturaExtra}>{`+${imagenes.length - 1}`}</span>}
                  </span>
                ) : <span className={styles.miniatura} />;
              },
            },
            { clave: 'fecha', etiqueta: 'Fecha' },
            { clave: 'total', etiqueta: 'Total' },
            { clave: 'estadoPago', etiqueta: 'Pago', render: (p) => <EstadoBadge estado={p.estadoPago} /> },
            { clave: 'estadoEnvio', etiqueta: 'Estado', render: (p) => <EstadoPedidoBadge estado={p.estadoEnvio} /> },
          ]}
          filas={pedidos}
          hrefFila={(p) => `/admin/pedidos/${p.id}`}
          vacio="Sin pedidos todavía."
        />
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Reseñas</p>
        <TablaAdmin
          columnas={[
            {
              clave: 'texto',
              etiqueta: 'Texto',
              // `texto` es string en reseñas antiguas del mock y {es, en}
              // en las creadas/editadas desde FormularioResena.jsx.
              render: (r) => <span className={styles.textoExtracto}>{typeof r.texto === 'string' ? r.texto : r.texto.es}</span>,
            },
            { clave: 'fecha', etiqueta: 'Fecha' },
            { clave: 'estado', etiqueta: 'Estado', render: (r) => <EstadoBadge estado={r.estado} /> },
          ]}
          filas={resenas}
          claveFila={(r) => r.id}
          vacio="Sin reseñas todavía."
        />
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Consultas/Citas</p>
        <TablaAdmin
          columnas={[
            { clave: 'asunto', etiqueta: 'Asunto' },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'fecha', etiqueta: 'Fecha' },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => <EstadoBadge estado={c.estado} /> },
          ]}
          filas={consultas}
          hrefFila={(c) => `/admin/consultas/${c.id}`}
          vacio="Sin consultas ni citas todavía."
        />
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Consultas de precio</p>
        <TablaAdmin
          columnas={[
            { clave: 'producto', etiqueta: 'Producto' },
            { clave: 'fecha', etiqueta: 'Fecha' },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => <EstadoContactoBadge estado={c.estado} /> },
          ]}
          filas={consultasPrecio}
          claveFila={(c) => c.id}
          hrefFila={(c) => `/admin/consultas-precio/${c.id}`}
          vacio="Sin consultas de precio todavía."
        />
      </div>
    </div>
  );
}
