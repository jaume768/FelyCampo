'use client';

/* ============================================================
   STOCK — Fely Campo (admin)
   Stock general por producto+talla, sin desglose por ubicación (ese
   antiguo dataset de 7 filas cubriendo 2 productos se quitó — ver
   mockData.js `filasStock()`). Solo lectura por ahora, igual que antes:
   el número real se edita en "Tallas y Stock" de cada producto
   (FormularioProducto.jsx), aquí solo se hojea/filtra.
   'use client': TablaAdmin recibe columnas con funciones render, que
   no pueden cruzar el límite servidor→cliente.
   ============================================================ */

import { useMemo, useState } from 'react';
import {
  PageHeader, TablaAdmin, FiltroBar, FiltroSelector, TabsFiltro, useCategorias,
} from '@/components/admin';
import { Input } from '@/components/ui';
import { filasStock, nivelStock, tallasEstandar, coleccionesMock } from '@/components/admin/mockData';
import styles from './page.module.css';

// "Stock ok" no decía nada — "Disponible" empareja mejor con "Agotado"
// (el mismo par que ya usa el resto del sitio) y dice lo que de verdad
// importa: hay unidades para vender.
const ETIQUETA_NIVEL = {
  ok: 'Disponible',
  bajo: 'Stock bajo',
  agotado: 'Agotado',
};

const CLASE_NIVEL = {
  ok: 'nivelOk',
  bajo: 'nivelBajo',
  agotado: 'nivelAgotado',
};

const OPCIONES_NIVEL = [
  { valor: 'Todos', etiqueta: 'Todos' },
  { valor: 'ok', etiqueta: 'Disponible' },
  { valor: 'bajo', etiqueta: 'Stock bajo' },
  { valor: 'agotado', etiqueta: 'Agotado' },
];

const OPCIONES_ORDEN = [
  { valor: 'stockAsc', etiqueta: 'Stock: Menor a mayor' },
  { valor: 'stockDesc', etiqueta: 'Stock: Mayor a menor' },
  { valor: 'nombre', etiqueta: 'Nombre: A-Z' },
];

export default function StockPage() {
  const { categorias } = useCategorias();
  const filas = useMemo(() => filasStock(), []);

  // Solo Prêt-à-porter tiene tallas/stock (ver CAMPOS_TIPO en
  // FormularioProducto.jsx), así que el filtro de Categoría solo necesita
  // ofrecer las categorías de ese tipo — vía CategoriasProvider (no el
  // import estático) para que una categoría renombrada/creada desde
  // /admin/categorias se refleje aquí sin recargar.
  const opcionesCategoria = useMemo(() => [
    { valor: 'Todas', etiqueta: 'Todas' },
    ...(categorias['pret-a-porter'] || []).filter((c) => c.visible).map((c) => ({ valor: c.id, etiqueta: c.nombre })),
  ], [categorias]);

  const [query, setQuery] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroColeccion, setFiltroColeccion] = useState('Todas');
  const [filtroTalla, setFiltroTalla] = useState('Todas');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [orden, setOrden] = useState('stockAsc');

  const totalReferencias = filas.length;
  const totalBajo = filas.filter((f) => nivelStock(f.stock) === 'bajo').length;
  const totalAgotado = filas.filter((f) => nivelStock(f.stock) === 'agotado').length;

  const filtradas = useMemo(() => {
    let resultado = filas.filter((f) => {
      if (filtroCategoria !== 'Todas' && f.categoriaId !== filtroCategoria) return false;
      if (filtroColeccion !== 'Todas' && f.coleccion !== filtroColeccion) return false;
      if (filtroTalla !== 'Todas' && f.talla !== filtroTalla) return false;
      if (filtroNivel !== 'Todos' && nivelStock(f.stock) !== filtroNivel) return false;
      if (query && !`${f.nombre} ${f.sku}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    resultado = [...resultado].sort((a, b) => {
      if (orden === 'stockAsc') return a.stock - b.stock;
      if (orden === 'stockDesc') return b.stock - a.stock;
      return a.nombre.localeCompare(b.nombre);
    });
    return resultado;
  }, [filas, query, filtroCategoria, filtroColeccion, filtroTalla, filtroNivel, orden]);

  const hayFiltros = query !== '' || filtroCategoria !== 'Todas' || filtroColeccion !== 'Todas'
    || filtroTalla !== 'Todas' || filtroNivel !== 'Todos' || orden !== 'stockAsc';

  function limpiarFiltros() {
    setQuery('');
    setFiltroCategoria('Todas');
    setFiltroColeccion('Todas');
    setFiltroTalla('Todas');
    setFiltroNivel('Todos');
    setOrden('stockAsc');
  }

  return (
    <div>
      <PageHeader titulo="Stock" subtitulo="Stock general por producto y talla" />

      <div className={styles.kpis}>
        <button type="button" className={styles.kpiTarjeta} onClick={() => setFiltroNivel('Todos')}>
          <p className={styles.kpiValor}>{totalReferencias}</p>
          <p className={styles.kpiEtiqueta}>Referencias</p>
        </button>
        <button type="button" className={`${styles.kpiTarjeta} ${styles.kpiBajo}`} onClick={() => setFiltroNivel('bajo')}>
          <p className={styles.kpiValor}>{totalBajo}</p>
          <p className={styles.kpiEtiqueta}>Stock bajo</p>
        </button>
        <button type="button" className={`${styles.kpiTarjeta} ${styles.kpiAgotado}`} onClick={() => setFiltroNivel('agotado')}>
          <p className={styles.kpiValor}>{totalAgotado}</p>
          <p className={styles.kpiEtiqueta}>Agotadas</p>
        </button>
      </div>

      <FiltroBar onLimpiar={hayFiltros ? limpiarFiltros : undefined}>
        <Input etiqueta="Buscar" placeholder="Nombre o SKU" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector
          etiqueta="Categoría"
          valor={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          opciones={opcionesCategoria}
          activo={filtroCategoria !== 'Todas'}
        />
        <FiltroSelector
          etiqueta="Colección"
          valor={filtroColeccion}
          onChange={(e) => setFiltroColeccion(e.target.value)}
          opciones={[{ valor: 'Todas', etiqueta: 'Todas' }, ...coleccionesMock]}
          activo={filtroColeccion !== 'Todas'}
        />
        <FiltroSelector
          etiqueta="Talla"
          valor={filtroTalla}
          onChange={(e) => setFiltroTalla(e.target.value)}
          opciones={[{ valor: 'Todas', etiqueta: 'Todas' }, ...tallasEstandar.map((t) => ({ valor: t, etiqueta: t }))]}
          compacta
          activo={filtroTalla !== 'Todas'}
        />
        <FiltroSelector
          etiqueta="Ordenar por"
          valor={orden}
          onChange={(e) => setOrden(e.target.value)}
          opciones={OPCIONES_ORDEN}
          activo={orden !== 'stockAsc'}
        />
      </FiltroBar>

      <TabsFiltro opciones={OPCIONES_NIVEL} valor={filtroNivel} onChange={setFiltroNivel} />

      <TablaAdmin
        columnas={[
          { clave: 'imagen', etiqueta: '', render: (f) => (f.imagen ? <img src={f.imagen} alt="" className={styles.miniatura} /> : <span className={styles.miniatura} />) },
          { clave: 'nombre', etiqueta: 'Producto' },
          { clave: 'sku', etiqueta: 'SKU', render: (f) => f.sku || '—' },
          { clave: 'talla', etiqueta: 'Talla' },
          { clave: 'stock', etiqueta: 'Stock' },
          {
            clave: 'nivel',
            etiqueta: 'Nivel',
            render: (f) => {
              const nivel = nivelStock(f.stock);
              return <span className={`${styles.nivel} ${styles[CLASE_NIVEL[nivel]]}`}>{ETIQUETA_NIVEL[nivel]}</span>;
            },
          },
        ]}
        filas={filtradas}
        claveFila={(f) => f.id}
        hrefFila={(f) => `/admin/productos/${f.productoId}`}
        porPagina={20}
      />
    </div>
  );
}
