'use client';

/* ============================================================
   PEDIDOS — listado. DATOS REALES: /api/v1/admin/orders/.

   UN SOLO ESTADO, ocho valores. Antes había dos filtros —«pago» y
   «envío»— que no existen en el modelo: `Order.status` es uno solo.
   Ese desdoblamiento dejaba fuera `refunded` y `partially_refunded`
   (un pedido reembolsado no se podía ver) e inventaba un «pago
   fallido» que el backend no tiene.

   Búsqueda, filtro y paginación en SERVIDOR.
   ============================================================ */

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { StickyNote, List, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';

import {
  PageHeader, TablaAdmin, GridPedidos, EstadoPedidoBadge, FiltroBar, FiltroSelector, TabsFiltro,
} from '@/components/admin';
import { Input } from '@/components/ui';
import {
  listarPedidos, adaptarPedidoAdmin, filtrosPedidosAdmin, OPCIONES_ESTADO_PEDIDO,
} from '@/lib/api/adminOrders';
import { ApiError } from '@/lib/api/errors';
import styles from './page.module.css';

const POR_PAGINA = 20;

/** Fecha ISO → "Hace 3 horas" / "Hace 2 días". */
function etiquetaRecibido(iso) {
  if (!iso) return '—';
  const horas = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (horas < 1) return 'Hace menos de 1 hora';
  if (horas < 24) return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
}

function PedidosContenido() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('status') || 'Todos');
  const [pagina, setPagina] = useState(1);
  const [vista, setVista] = useState('tabla');

  const [pedidos, setPedidos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const pag = await listarPedidos(
        filtrosPedidosAdmin({ busqueda: query, status: filtroEstado, pagina, porPagina: POR_PAGINA })
      );
      setPedidos((pag.results || []).map(adaptarPedidoAdmin));
      setTotal(pag.count ?? 0);
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      setError(fallo);
      setPedidos([]);
      setTotal(0);
    } finally {
      setCargando(false);
    }
  }, [query, filtroEstado, pagina]);

  useEffect(() => {
    // Pequeño retardo al teclear para no lanzar una petición por tecla.
    const t = setTimeout(cargar, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [cargar, query]);

  useEffect(() => {
    setPagina(1);
  }, [query, filtroEstado]);

  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div>
      <div className={styles.cabeceraFila}>
        <div className={styles.vistaToggle}>
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
            className={`${styles.vistaBoton} ${vista === 'rejilla' ? styles.vistaBotonActiva : ''}`}
            aria-pressed={vista === 'rejilla'}
            aria-label="Vista de rejilla"
            onClick={() => setVista('rejilla')}
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <PageHeader
        titulo="Pedidos"
        subtitulo={cargando ? 'Cargando…' : `${total} pedido${total === 1 ? '' : 's'}`}
      />

      <FiltroBar>
        <Input
          etiqueta="Buscar"
          placeholder="Referencia, correo o cliente"
          valor={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FiltroSelector
          etiqueta="Estado"
          valor={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          opciones={OPCIONES_ESTADO_PEDIDO}
        />
      </FiltroBar>

      {/* Los ocho estados reales, incluidos los reembolsos, que antes no tenían sitio. */}
      <TabsFiltro opciones={OPCIONES_ESTADO_PEDIDO} valor={filtroEstado} onChange={setFiltroEstado} />

      {error && (
        <div className={styles.aviso} role="alert">
          {error.isNetworkError
            ? 'No hemos podido conectar con el servidor.'
            : error.status === 401 || error.status === 403
              ? 'Tu sesión no tiene acceso al panel. Vuelve a entrar.'
              : error.message}
        </div>
      )}

      {!error && cargando && <p className={styles.estado} role="status">Cargando pedidos…</p>}

      {!error && !cargando && pedidos.length === 0 && (
        <p className={styles.estado}>No hay pedidos que coincidan con los filtros.</p>
      )}

      {vista === 'tabla' ? (
        <TablaAdmin
          columnas={[
            { clave: 'referencia', etiqueta: 'Referencia', render: (p) => p.referencia },
            { clave: 'cliente', etiqueta: 'Cliente', render: (p) => (
              <span className={styles.clienteCelda}>
                {p.cliente}
                {p.esInvitado && <span className={styles.invitado}>invitado</span>}
              </span>
            ) },
            { clave: 'recibido', etiqueta: 'Recibido', render: (p) => etiquetaRecibido(p.creadoEn) },
            { clave: 'total', etiqueta: 'Total', render: (p) => p.totales.total },
            { clave: 'estado', etiqueta: 'Estado', render: (p) => <EstadoPedidoBadge status={p.status} /> },
            { clave: 'nota', etiqueta: '', render: (p) => (p.notaCliente ? <StickyNote size={14} aria-label="Con nota del cliente" /> : null) },
          ]}
          filas={pedidos}
          hrefFila={(p) => `/admin/pedidos/${p.id}`}
          // El backend calcula el retraso; no se recalcula por fecha en el cliente.
          resaltarFila={(p) => p.conRetraso}
        />
      ) : (
        <GridPedidos filas={pedidos} hrefFila={(p) => `/admin/pedidos/${p.id}`} />
      )}

      {paginas > 1 && (
        <div className={styles.paginacion}>
          <button
            type="button"
            className={styles.paginaBoton}
            onClick={() => setPagina((n) => Math.max(1, n - 1))}
            disabled={pagina <= 1 || cargando}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className={styles.paginaTexto}>Página {pagina} de {paginas}</span>
          <button
            type="button"
            className={styles.paginaBoton}
            onClick={() => setPagina((n) => Math.min(paginas, n + 1))}
            disabled={pagina >= paginas || cargando}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
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
