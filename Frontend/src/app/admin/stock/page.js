'use client';

/* ============================================================
   STOCK — Fely Campo (admin). DATOS REALES: /api/v1/admin/stock/.

   Una fila por VARIANTE (producto × color × talla), que es donde vive
   el stock de verdad. Tres cifras que conviene no confundir:
     físico      unidades en almacén
     reservado   comprometidas por checkouts en curso
     disponible  = físico − reservado, lo que se puede vender

   «Disponible» es la cifra principal porque es la que decide si una
   talla sale agotada en la tienda.

   Ya NO es solo lectura: se puede ajustar, y **todo ajuste exige
   motivo** — el backend lo audita creando un `StockMovement`. No hay
   forma de mover stock sin dejar rastro, y es a propósito.
   ============================================================ */

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PageHeader, TablaAdmin, FiltroBar, FiltroSelector, useToast } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import {
  listarVariantes, adaptarVarianteStock, nivelStock,
  listarUbicaciones, adaptarUbicacion,
} from '@/lib/api/adminStock';
import { ApiError } from '@/lib/api/errors';
import DetalleStockModal from '@/components/admin/DetalleStockModal';
import styles from './page.module.css';

const POR_PAGINA = 20;

const ETIQUETA_NIVEL = { ok: 'Disponible', bajo: 'Stock bajo', agotado: 'Agotado' };
const CLASE_NIVEL = { ok: 'nivelOk', bajo: 'nivelBajo', agotado: 'nivelAgotado' };

const OPCIONES_DISPONIBILIDAD = [
  { valor: 'Todos', etiqueta: 'Todos' },
  { valor: 'true', etiqueta: 'Con stock' },
  { valor: 'false', etiqueta: 'Sin stock' },
];

export default function StockPage() {
  const { mostrarToast } = useToast();

  const [query, setQuery] = useState('');
  const [filtroStock, setFiltroStock] = useState('Todos');
  const [pagina, setPagina] = useState(1);

  const [filas, setFilas] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [varianteAbierta, setVarianteAbierta] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = { page: pagina, page_size: POR_PAGINA };
      if (query) params.search = query;
      if (filtroStock !== 'Todos') params.in_stock = filtroStock;

      const pag = await listarVariantes(params);
      setFilas((pag.results || []).map(adaptarVarianteStock));
      setTotal(pag.count ?? 0);
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      setError(fallo);
      setFilas([]);
      setTotal(0);
    } finally {
      setCargando(false);
    }
  }, [query, filtroStock, pagina]);

  useEffect(() => {
    const t = setTimeout(cargar, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [cargar, query]);

  useEffect(() => {
    setPagina(1);
  }, [query, filtroStock]);

  // Ubicaciones: hacen falta para poder ajustar (el backend exige a cuál).
  useEffect(() => {
    listarUbicaciones()
      .then((pag) => setUbicaciones((pag.results || pag || []).map(adaptarUbicacion)))
      .catch(() => setUbicaciones([]));
  }, []);

  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div>
      <PageHeader
        titulo="Stock"
        subtitulo={cargando ? 'Cargando…' : `${total} variante${total === 1 ? '' : 's'}`}
      />

      <FiltroBar>
        <Input
          etiqueta="Buscar"
          placeholder="Producto o SKU"
          valor={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FiltroSelector
          etiqueta="Disponibilidad"
          valor={filtroStock}
          onChange={(e) => setFiltroStock(e.target.value)}
          opciones={OPCIONES_DISPONIBILIDAD}
        />
      </FiltroBar>

      {/* Con una sola ubicación creada el desglose queda inerte: se avisa en vez de
          enseñar una columna que siempre dice lo mismo. */}
      {ubicaciones.length === 1 && (
        <p className={styles.avisoUbicaciones}>
          Solo hay una ubicación («{ubicaciones[0].nombre}»), así que el desglose por
          ubicación coincide con el total. Crea más ubicaciones si repartís el almacén.
        </p>
      )}

      {error && (
        <div className={styles.aviso} role="alert">
          {error.isNetworkError
            ? 'No hemos podido conectar con el servidor.'
            : error.status === 401 || error.status === 403
              ? 'Tu sesión no tiene acceso al panel. Vuelve a entrar.'
              : error.message}
        </div>
      )}

      {!error && cargando && <p className={styles.estado} role="status">Cargando stock…</p>}

      {!error && !cargando && filas.length === 0 && (
        <p className={styles.estado}>No hay variantes que coincidan con los filtros.</p>
      )}

      <TablaAdmin
        columnas={[
          { clave: 'producto', etiqueta: 'Producto', render: (f) => f.producto },
          { clave: 'sku', etiqueta: 'SKU', render: (f) => f.sku },
          { clave: 'color', etiqueta: 'Color', render: (f) => f.color },
          { clave: 'talla', etiqueta: 'Talla', render: (f) => f.talla },
          { clave: 'fisico', etiqueta: 'Físico', render: (f) => f.fisico },
          // Comprometido por checkouts en curso: no es vendible aunque esté en almacén.
          { clave: 'reservado', etiqueta: 'Reservado', render: (f) => f.reservado },
          {
            clave: 'disponible',
            etiqueta: 'Disponible',
            render: (f) => {
              const nivel = nivelStock(f.disponible);
              return (
                <span className={`${styles.nivel} ${styles[CLASE_NIVEL[nivel]]}`}>
                  {f.disponible} · {ETIQUETA_NIVEL[nivel]}
                </span>
              );
            },
          },
        ]}
        filas={filas}
        onClickFila={(f) => setVarianteAbierta(f)}
        renderAcciones={(f) => (
          <Boton variante="texto" onClick={() => setVarianteAbierta(f)}>Ajustar</Boton>
        )}
      />

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

      <DetalleStockModal
        variante={varianteAbierta}
        ubicaciones={ubicaciones}
        onCerrar={() => setVarianteAbierta(null)}
        onGuardado={() => {
          cargar();
          mostrarToast('Stock actualizado');
        }}
      />
    </div>
  );
}
