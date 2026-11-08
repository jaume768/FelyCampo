'use client';

/* ============================================================
   CLIENTES — placeholder de ejemplo. Datos 100% estáticos
   (clientesMock), sin API/BBDD detrás.
   ============================================================ */

import { useMemo, useState } from 'react';
import { PageHeader, TablaAdmin, EstadoPedidoBadge, FiltroBar, FiltroSelector } from '@/components/admin';
import { BotonFila } from '@/components/admin/ListadoAdmin';
import { Input } from '@/components/ui';
import { clientesMock, pedidosMock } from '@/components/admin/mockData';
import { CONFIG_ESTADO_PEDIDO } from '@/components/admin/EstadoPedidoBadge';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const OPCIONES_ORDEN = [
  { valor: 'ninguno', etiqueta: 'Sin ordenar' },
  { valor: 'clienteMasReciente', etiqueta: 'Cliente desde: Más reciente' },
  { valor: 'clienteMasAntiguo', etiqueta: 'Cliente desde: Más antiguo' },
  { valor: 'gastado', etiqueta: 'Gasto: Mayor a menor' },
  { valor: 'pedidos', etiqueta: 'Pedidos: Mayor a menor' },
];

const OPCIONES_ULTIMO_PEDIDO = [
  { valor: 'Todos', etiqueta: 'Todos' },
  ...Object.entries(CONFIG_ESTADO_PEDIDO).map(([valor, cfg]) => ({ valor, etiqueta: cfg.etiqueta })),
  { valor: 'Sin pedidos', etiqueta: 'Sin pedidos' },
];

function formatCumpleanos(cumpleanos) {
  if (!cumpleanos) return '—';
  const [mes, dia] = cumpleanos.split('-').map(Number);
  return `${dia} de ${MESES[mes - 1]}`;
}

function gastoNumero(gastoTotal) {
  return Number(gastoTotal.replace(/[^\d]/g, ''));
}

function ultimoPedido(cliente) {
  const pedidos = pedidosMock.filter((p) => p.cliente === cliente.nombre);
  if (!pedidos.length) return null;
  return [...pedidos].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
}

export default function ClientesPage() {
  const [query, setQuery] = useState('');
  const [filtroUltimoPedido, setFiltroUltimoPedido] = useState('Todos');
  const [orden, setOrden] = useState('ninguno');

  const filtrados = useMemo(() => {
    const lista = clientesMock.filter((c) => {
      if (filtroUltimoPedido !== 'Todos') {
        const pedido = ultimoPedido(c);
        if (filtroUltimoPedido === 'Sin pedidos') {
          if (pedido) return false;
        } else if (pedido?.estadoEnvio !== filtroUltimoPedido) return false;
      }
      if (query && !c.nombre.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    if (orden === 'clienteMasReciente') return [...lista].sort((a, b) => b.fechaAlta.localeCompare(a.fechaAlta));
    if (orden === 'clienteMasAntiguo') return [...lista].sort((a, b) => a.fechaAlta.localeCompare(b.fechaAlta));
    if (orden === 'gastado') return [...lista].sort((a, b) => gastoNumero(b.gastoTotal) - gastoNumero(a.gastoTotal));
    if (orden === 'pedidos') return [...lista].sort((a, b) => b.pedidos - a.pedidos);
    return lista;
  }, [filtroUltimoPedido, query, orden]);

  const hayFiltros = filtroUltimoPedido !== 'Todos' || orden !== 'ninguno' || query !== '';

  function limpiarFiltros() {
    setQuery('');
    setFiltroUltimoPedido('Todos');
    setOrden('ninguno');
  }

  return (
    <div>
      <PageHeader titulo="Clientes" subtitulo={`${filtrados.length} registros`} />

      <FiltroBar onLimpiar={hayFiltros ? limpiarFiltros : undefined}>
        <Input etiqueta="Buscar" placeholder="Nombre del cliente" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector
          etiqueta="Último pedido"
          valor={filtroUltimoPedido}
          onChange={(e) => setFiltroUltimoPedido(e.target.value)}
          opciones={OPCIONES_ULTIMO_PEDIDO}
        />
        <FiltroSelector
          etiqueta="Ordenar por"
          valor={orden}
          onChange={(e) => setOrden(e.target.value)}
          opciones={OPCIONES_ORDEN}
        />
      </FiltroBar>

      <TablaAdmin
        columnas={[
          { clave: 'nombre', etiqueta: 'Nombre' },
          { clave: 'email', etiqueta: 'Email' },
          { clave: 'cumpleanos', etiqueta: 'Cumpleaños', render: (c) => formatCumpleanos(c.cumpleanos) },
          { clave: 'pedidos', etiqueta: 'Pedidos' },
          { clave: 'gastoTotal', etiqueta: 'Gasto total' },
          { clave: 'fechaAlta', etiqueta: 'Cliente desde' },
          {
            clave: 'ultimoPedido',
            etiqueta: 'Último pedido',
            render: (c) => {
              const pedido = ultimoPedido(c);
              return pedido ? <EstadoPedidoBadge estado={pedido.estadoEnvio} /> : '—';
            },
          },
        ]}
        filas={filtrados}
        hrefFila={(c) => `/admin/clientes/${c.id}`}
        renderAcciones={(c) => <BotonFila href={`/admin/clientes/${c.id}`}>Ver</BotonFila>}
      />
    </div>
  );
}
