'use client';

/* ============================================================
   PEDIDOS — listado (spec sección 4). Solo Prêt-à-porter: Atelier
   genera consultas/citas (sección 5), Archivo no genera transacciones.
   ============================================================ */

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { StickyNote, List, LayoutGrid } from 'lucide-react';
import {
  PageHeader, TablaAdmin, GridPedidos, EstadoBadge, EstadoPedidoBadge, FiltroBar, FiltroSelector, TabsFiltro,
} from '@/components/admin';
import { BotonFila } from '@/components/admin/ListadoAdmin';
import { Input } from '@/components/ui';
import { pedidosMock, productosMock } from '@/components/admin/mockData';
import { CONFIG_ESTADO_PEDIDO } from '@/components/admin/EstadoPedidoBadge';
import styles from './page.module.css';

const OPCIONES_ESTADO_PEDIDO = [
  { valor: 'Todos', etiqueta: 'Todos' },
  ...Object.entries(CONFIG_ESTADO_PEDIDO).map(([valor, cfg]) => ({ valor, etiqueta: cfg.etiqueta, clase: cfg.clase })),
];

function imagenesPedido(pedido) {
  return (pedido.items || [])
    .map((item) => productosMock.find((p) => p.nombre === item.producto)?.imagen)
    .filter(Boolean);
}

function totalNumero(total) {
  return Number(total.replace(/[^\d]/g, ''));
}

function calcularHoras(fecha) {
  const inicio = new Date(`${fecha}T00:00:00`);
  return Math.floor((Date.now() - inicio.getTime()) / (1000 * 60 * 60));
}

function etiquetaRecibido(fecha) {
  const horas = calcularHoras(fecha);
  if (horas < 24) return horas <= 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
}

// "No enviado a las 2 semanas" — mismo protocolo que esUrgente en
// consultas-precio (fila destacada en rosa-velo vía resaltarFila).
function esRetrasado(p) {
  return calcularHoras(p.fecha) >= 24 * 14 && p.estadoEnvio === 'Procesando';
}

function PedidosContenido() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [filtroPago, setFiltroPago] = useState('Todos');
  const [filtroEnvio, setFiltroEnvio] = useState(searchParams.get('estadoEnvio') || 'Todos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [orden, setOrden] = useState('reciente');
  const [vista, setVista] = useState('tabla');

  const filtrados = useMemo(() => pedidosMock
    .filter((p) => {
      if (filtroPago !== 'Todos' && p.estadoPago !== filtroPago) return false;
      if (filtroEnvio !== 'Todos' && p.estadoEnvio !== filtroEnvio) return false;
      if (desde && p.fecha < desde) return false;
      if (hasta && p.fecha > hasta) return false;
      if (query && !`${p.id} ${p.cliente}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (orden === 'reciente') return b.fecha.localeCompare(a.fecha);
      if (orden === 'antiguo') return a.fecha.localeCompare(b.fecha);
      if (orden === 'precioAsc') return totalNumero(a.total) - totalNumero(b.total);
      return totalNumero(b.total) - totalNumero(a.total);
    }),
  [filtroPago, filtroEnvio, desde, hasta, query, orden]);

  const hayFiltros = filtroPago !== 'Todos' || desde !== '' || hasta !== '' || orden !== 'reciente' || query !== '';

  function limpiarFiltros() {
    setQuery('');
    setFiltroPago('Todos');
    setDesde('');
    setHasta('');
    setOrden('reciente');
  }

  return (
    <div>
      <PageHeader titulo="Pedidos" subtitulo={`${filtrados.length} pedidos`}>
        <div className={styles.vistaToggle} role="group" aria-label="Cambiar vista">
          <button
            type="button"
            className={`${styles.vistaBoton} ${vista === 'tabla' ? styles.vistaBotonActiva : ''}`}
            aria-pressed={vista === 'tabla'}
            aria-label="Vista de tabla"
            onClick={() => setVista('tabla')}
          >
            <List size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.vistaBoton} ${vista === 'grid' ? styles.vistaBotonActiva : ''}`}
            aria-pressed={vista === 'grid'}
            aria-label="Vista de rejilla"
            onClick={() => setVista('grid')}
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
        </div>
      </PageHeader>

      <FiltroBar onLimpiar={hayFiltros ? limpiarFiltros : undefined}>
        <Input etiqueta="Buscar" placeholder="Pedido o cliente" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector
          etiqueta="Pago"
          valor={filtroPago}
          onChange={(e) => setFiltroPago(e.target.value)}
          opciones={[{ valor: 'Todos', etiqueta: 'Todos' }, { valor: 'Pendiente', etiqueta: 'Pendiente' }, { valor: 'Pagado', etiqueta: 'Pagado' }, { valor: 'Fallido', etiqueta: 'Fallido' }]}
        />
        <FiltroSelector
          etiqueta="Ordenar por"
          valor={orden}
          onChange={(e) => setOrden(e.target.value)}
          opciones={[
            { valor: 'reciente', etiqueta: 'Fecha: Más reciente' },
            { valor: 'antiguo', etiqueta: 'Fecha: Más antiguo' },
            { valor: 'precioAsc', etiqueta: 'Precio: Menor a mayor' },
            { valor: 'precioDesc', etiqueta: 'Precio: Mayor a menor' },
          ]}
        />
        <Input etiqueta="Desde" tipo="date" valor={desde} onChange={(e) => setDesde(e.target.value)} />
        <Input etiqueta="Hasta" tipo="date" valor={hasta} onChange={(e) => setHasta(e.target.value)} />
      </FiltroBar>

      <TabsFiltro opciones={OPCIONES_ESTADO_PEDIDO} valor={filtroEnvio} onChange={setFiltroEnvio} />

      {vista === 'tabla' ? (
        <TablaAdmin
          columnas={[
            {
              clave: 'id',
              etiqueta: 'Pedido',
              render: (p) => (
                <span className={styles.idFila}>
                  {p.id}
                  {p.notasInternas && (
                    <span className={styles.notaIcono} tabIndex={0} aria-label={`Nota interna: ${p.notasInternas}`}>
                      <StickyNote size={14} aria-hidden="true" />
                      <span className={styles.notaTooltip} role="tooltip">{p.notasInternas}</span>
                    </span>
                  )}
                </span>
              ),
            },
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
            { clave: 'cliente', etiqueta: 'Cliente' },
            {
              clave: 'recibido',
              etiqueta: 'Recibido',
              render: (p) => (
                <div className={styles.fechaColumna}>
                  <span className={esRetrasado(p) ? styles.recibidoRetrasado : undefined}>{etiquetaRecibido(p.fecha)}</span>
                  <span className={styles.fechaSecundaria}>{p.fecha}</span>
                </div>
              ),
            },
            { clave: 'total', etiqueta: 'Total' },
            { clave: 'estadoPago', etiqueta: 'Pago', render: (p) => <EstadoBadge estado={p.estadoPago} /> },
            { clave: 'estadoEnvio', etiqueta: 'Estado', render: (p) => <EstadoPedidoBadge estado={p.estadoEnvio} /> },
          ]}
          filas={filtrados}
          filaNueva={(p) => p.nuevo}
          resaltarFila={esRetrasado}
          resaltarFilaVerde={(p) => p.estadoEnvio === 'Entregado'}
          porPagina={15}
          hrefFila={(p) => `/admin/pedidos/${p.id}`}
          renderAcciones={(p) => <BotonFila href={`/admin/pedidos/${p.id}`}>Ver</BotonFila>}
        />
      ) : (
        <GridPedidos
          filas={filtrados}
          hrefFila={(p) => `/admin/pedidos/${p.id}`}
          porPagina={12}
        />
      )}
    </div>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={null}>
      <PedidosContenido />
    </Suspense>
  );
}
