'use client';

/* ============================================================
   MÉTRICAS (antes "Analíticas") — placeholder de ejemplo. KPIs y
   ranking de productos con datos 100% estáticos (kpisAnaliticas,
   topProductosPorMesMock).
   ============================================================ */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { List, LayoutGrid } from 'lucide-react';
import {
  PageHeader, TablaAdmin, FiltroBar, FiltroSelector,
} from '@/components/admin';
import {
  kpisAnaliticas, topProductosPorMesMock, productosMock,
  NOMBRES_MES, ANIO_INICIO_METRICAS_MOCK, tallasEstandar,
} from '@/components/admin/mockData';
import styles from './page.module.css';

const HOY = new Date();
const ANIO_DEFECTO = String(HOY.getFullYear());
const MES_DEFECTO = String(HOY.getMonth() + 1).padStart(2, '0');

const OPCIONES_ORDEN = [
  { valor: 'masVendido', etiqueta: 'Ventas: Más vendido' },
  { valor: 'menosVendido', etiqueta: 'Ventas: Menos vendido' },
];

const OPCIONES_MES = NOMBRES_MES.map((nombre, indice) => ({
  valor: String(indice + 1).padStart(2, '0'),
  etiqueta: nombre,
}));

const OPCIONES_TALLA = [
  { valor: '', etiqueta: 'Todas las tallas' },
  ...tallasEstandar.map((talla) => ({ valor: talla, etiqueta: talla })),
];

const ETIQUETAS_PRODUCTO = {
  'pret-a-porter': 'Pret-a-porter',
  novias: 'Novias',
  fiesta: 'Fiesta',
};

const OPCIONES_PRODUCTO = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'pret-a-porter', etiqueta: ETIQUETAS_PRODUCTO['pret-a-porter'] },
  { valor: 'novias', etiqueta: ETIQUETAS_PRODUCTO.novias },
  { valor: 'fiesta', etiqueta: ETIQUETAS_PRODUCTO.fiesta },
];

// Del año actual hacia atrás hasta ANIO_INICIO_METRICAS_MOCK — un año nuevo
// entra solo en cuanto HOY.getFullYear() lo alcanza, sin editar esta lista.
const OPCIONES_ANIO = [];
for (let anio = HOY.getFullYear(); anio >= ANIO_INICIO_METRICAS_MOCK; anio -= 1) {
  OPCIONES_ANIO.push({ valor: String(anio), etiqueta: String(anio) });
}

function productoPorNombre(nombre) {
  return productosMock.find((p) => p.nombre === nombre);
}

function imagenProducto(nombre) {
  return productoPorNombre(nombre)?.imagen || '';
}

function hrefProducto(nombre) {
  const producto = productoPorNombre(nombre);
  return producto ? `/admin/metricas/${producto.id}` : undefined;
}

// Mismo criterio que OrigenProductoBadge (cat4 → Fiesta, cualquier otra
// categoría de Atelier → Novias), con Pret-a-porter como tercera rama.
function tipoProductoDe(nombre) {
  const producto = productoPorNombre(nombre);
  if (!producto) return undefined;
  if (producto.tipo === 'pret-a-porter') return 'pret-a-porter';
  return producto.categoriaId === 'cat4' ? 'fiesta' : 'novias';
}

export default function MetricasPage() {
  const [vista, setVista] = useState('grid');
  const [orden, setOrden] = useState('masVendido');
  const [anio, setAnio] = useState(ANIO_DEFECTO);
  const [mes, setMes] = useState(MES_DEFECTO);
  const [talla, setTalla] = useState('');
  const [tipoProducto, setTipoProducto] = useState('todos');

  const productosDelMes = topProductosPorMesMock[`${anio}-${mes}`] || [];

  const productos = useMemo(() => {
    let filas = productosDelMes;
    if (tipoProducto !== 'todos') {
      filas = filas.filter((fila) => tipoProductoDe(fila.producto) === tipoProducto);
    }
    if (talla) {
      filas = filas
        .filter((fila) => fila.porTalla?.some((t) => t.talla === talla))
        .map((fila) => {
          const enTalla = fila.porTalla.find((t) => t.talla === talla);
          return { producto: fila.producto, unidadesVendidas: enTalla.unidadesVendidas, ingresos: enTalla.ingresos };
        });
    }
    return [...filas].sort((a, b) => (orden === 'masVendido' ? b.unidadesVendidas - a.unidadesVendidas : a.unidadesVendidas - b.unidadesVendidas));
  }, [productosDelMes, orden, talla, tipoProducto]);

  const hayFiltros = orden !== 'masVendido' || anio !== ANIO_DEFECTO || mes !== MES_DEFECTO
    || talla !== '' || tipoProducto !== 'todos';

  function limpiarFiltros() {
    setOrden('masVendido');
    setAnio(ANIO_DEFECTO);
    setMes(MES_DEFECTO);
    setTalla('');
    setTipoProducto('todos');
  }

  const nombreMes = NOMBRES_MES[Number(mes) - 1];
  const tituloLista = `${orden === 'masVendido' ? 'Productos más vendidos' : 'Productos menos vendidos'} en ${nombreMes} ${anio}`
    + `${tipoProducto !== 'todos' ? ` ${ETIQUETAS_PRODUCTO[tipoProducto]}` : ''}${talla ? ` Talla ${talla}` : ''}`;

  const mensajeVacio = (talla || tipoProducto !== 'todos') && productosDelMes.length > 0
    ? 'Sin ventas registradas con estos filtros.'
    : 'Sin datos de ventas para este mes.';

  return (
    <div>
      <PageHeader titulo="Métricas" subtitulo="Resumen del mes en curso" />

      <div className={styles.kpis}>
        {kpisAnaliticas.map((kpi) => (
          <Link
            key={kpi.id}
            href={`/admin/metricas/kpi/${kpi.id}?anio=${anio}&mes=${mes}&producto=${tipoProducto}`}
            className={styles.kpiTarjeta}
          >
            <p className={styles.kpiEtiqueta}>{kpi.etiqueta}</p>
            <p className={styles.kpiValor}>{kpi.valor}</p>
            <p className={`${styles.kpiVariacion} ${kpi.variacion.startsWith('-') ? styles.kpiNegativa : ''}`}>
              {kpi.variacion} vs. mes anterior
            </p>
          </Link>
        ))}
      </div>

      <FiltroBar onLimpiar={hayFiltros ? limpiarFiltros : undefined}>
        <FiltroSelector
          etiqueta="Ordenar por"
          valor={orden}
          onChange={(e) => setOrden(e.target.value)}
          opciones={OPCIONES_ORDEN}
          activo={orden !== 'masVendido'}
        />
        <FiltroSelector
          etiqueta="Producto"
          valor={tipoProducto}
          onChange={(e) => setTipoProducto(e.target.value)}
          opciones={OPCIONES_PRODUCTO}
          activo={tipoProducto !== 'todos'}
        />
        <FiltroSelector
          etiqueta="Talla"
          valor={talla}
          onChange={(e) => setTalla(e.target.value)}
          opciones={OPCIONES_TALLA}
          compacta
          activo={talla !== ''}
        />
        <FiltroSelector
          etiqueta="Mes"
          valor={mes}
          onChange={(e) => setMes(e.target.value)}
          opciones={OPCIONES_MES}
          activo={mes !== MES_DEFECTO}
        />
        <FiltroSelector
          etiqueta="Año"
          valor={anio}
          onChange={(e) => setAnio(e.target.value)}
          opciones={OPCIONES_ANIO}
          compacta
          activo={anio !== ANIO_DEFECTO}
        />
      </FiltroBar>

      <div className={styles.subtituloFila}>
        <h2 className={styles.subtitulo}>{tituloLista}</h2>
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
      </div>

      {productos.length === 0 ? (
        <p className={styles.vacio}>{mensajeVacio}</p>
      ) : vista === 'tabla' ? (
        <TablaAdmin
          columnas={[
            {
              clave: 'imagen',
              etiqueta: '',
              render: (fila) => (imagenProducto(fila.producto)
                ? <img src={imagenProducto(fila.producto)} alt="" className={styles.miniatura} />
                : <span className={styles.miniatura} />),
            },
            { clave: 'producto', etiqueta: 'Producto' },
            { clave: 'sku', etiqueta: 'SKU', render: (fila) => productoPorNombre(fila.producto)?.sku || '—' },
            { clave: 'unidadesVendidas', etiqueta: 'Unidades vendidas' },
            { clave: 'ingresos', etiqueta: 'Ingresos' },
          ]}
          filas={productos}
          claveFila={(fila) => fila.producto}
          hrefFila={(fila) => hrefProducto(fila.producto)}
        />
      ) : (
        <div className={styles.grid}>
          {productos.map((fila, indice) => {
            const rango = indice + 1;
            const esMasVendido = rango === 1 && orden === 'masVendido';
            return (
              <Link key={fila.producto} href={hrefProducto(fila.producto)} className={styles.tarjeta}>
                <div className={styles.imagenWrap}>
                  {imagenProducto(fila.producto) ? (
                    <img src={imagenProducto(fila.producto)} alt="" className={styles.imagen} />
                  ) : <div className={styles.imagenVacia} />}
                  <span className={`${styles.rangoEsquina} ${esMasVendido ? styles.rangoEsquinaTop : ''}`}>{rango}</span>
                </div>
                <div className={styles.info}>
                  <p className={styles.producto}>{fila.producto}</p>
                  <p className={styles.detalle}>{`${fila.unidadesVendidas} unidades vendidas`}</p>
                  <p className={styles.ingresos}>{fila.ingresos}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
