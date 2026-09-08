'use client';

/* ============================================================
   RESEÑAS — listado (spec sección 6)
   Contenido independiente: no aparece en ningún sitio automáticamente,
   se selecciona luego a mano desde el bloque "Reseñas destacadas" en
   Diseño. Aquí solo se gestiona el contenido en sí.
   Producto reseñado por `productoId` (FK real, ver mockData.js) en vez
   de nombre en texto libre — permite mostrar SKU + foto del producto,
   no solo su nombre. Toggle tabla/rejilla igual que Pedidos/Consultas de
   precio/Producto: `List`/`LayoutGrid` en PageHeader, TablaAdmin o
   GridResenas debajo según `vista`.
   ============================================================ */

import { useMemo, useState } from 'react';
import { List, LayoutGrid, Plus } from 'lucide-react';
import {
  PageHeader, TablaAdmin, GridResenas, FiltroBar, FiltroSelector, ModalOverlay, useToast,
} from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { resenasMock, productosMock } from '@/components/admin/mockData';
import FormularioResena from '@/components/admin/FormularioResena';
import styles from './page.module.css';

function productoDe(productoId) {
  return productosMock.find((p) => p.id === productoId);
}

export default function ResenasPage() {
  const { mostrarToast } = useToast();
  const [resenas, setResenas] = useState(resenasMock);
  const [vista, setVista] = useState('tabla');
  const [query, setQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  // Nueva/Editar viven en un ModalOverlay, igual que el alta/edición de
  // producto en ListaProductos.jsx — ya no son páginas propias (ver
  // FormularioResena.jsx).
  const [nuevaAbierta, setNuevaAbierta] = useState(false);
  const [resenaEnEdicion, setResenaEnEdicion] = useState(null);

  // Más recientes primero (mismo criterio por defecto que Consultas de
  // precio) — sin esto, una reseña recién "enviada" (`nuevo: true`, ver
  // mockData.js) podía acabar enterrada al final de la tabla si el resto
  // del mock tenía fechas más antiguas insertadas antes en el array,
  // dejando el punto rosa de "nuevo" fuera de la vista sin hacer scroll.
  const filtradas = useMemo(() => resenas
    .filter((r) => {
      if (filtroEstado !== 'Todas' && r.estado !== filtroEstado) return false;
      if (query && !r.nombreCliente.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha)), [resenas, filtroEstado, query]);

  const hayFiltros = filtroEstado !== 'Todas' || query !== '';

  function limpiarFiltros() {
    setQuery('');
    setFiltroEstado('Todas');
  }

  function alternarEstado(id) {
    setResenas((actual) => actual.map((r) => (r.id === id ? { ...r, estado: r.estado === 'Publicada' ? 'Oculta' : 'Publicada' } : r)));
    mostrarToast('Estado actualizado (demo)');
  }

  function crearResena(nueva) {
    setResenas((actual) => [nueva, ...actual]);
    setNuevaAbierta(false);
  }

  function guardarEdicionResena(resena) {
    setResenas((actual) => actual.map((r) => (r.id === resena.id ? resena : r)));
    setResenaEnEdicion(null);
  }

  return (
    <div>
      <PageHeader titulo="Reseñas" subtitulo={`${filtradas.length} reseñas`}>
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
            className={`${styles.vistaBoton} ${vista === 'rejilla' ? styles.vistaBotonActiva : ''}`}
            aria-pressed={vista === 'rejilla'}
            aria-label="Vista de rejilla"
            onClick={() => setVista('rejilla')}
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
        </div>
        <Boton variante="solido" onClick={() => setNuevaAbierta(true)}><Plus size={14} /> Nueva reseña</Boton>
      </PageHeader>

      <FiltroBar onLimpiar={hayFiltros ? limpiarFiltros : undefined}>
        <Input etiqueta="Buscar" placeholder="Nombre del cliente" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector
          etiqueta="Estado"
          valor={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          opciones={[{ valor: 'Todas', etiqueta: 'Todas' }, { valor: 'Publicada', etiqueta: 'Publicada' }, { valor: 'Oculta', etiqueta: 'Oculta' }]}
          activo={filtroEstado !== 'Todas'}
        />
      </FiltroBar>

      {vista === 'tabla' ? (
        <TablaAdmin
          columnas={[
            {
              clave: 'imagen',
              etiqueta: '',
              render: (r) => (productoDe(r.productoId)?.imagen
                ? <img src={productoDe(r.productoId).imagen} alt="" className={styles.miniatura} />
                : <span className={styles.miniatura} />),
            },
            { clave: 'nombreCliente', etiqueta: 'Cliente' },
            { clave: 'sku', etiqueta: 'SKU', render: (r) => productoDe(r.productoId)?.sku || '—' },
            {
              clave: 'texto',
              etiqueta: 'Texto',
              // `texto` es string en reseñas antiguas del mock y {es, en}
              // en las creadas/editadas desde FormularioResena.jsx.
              render: (r) => <span className={styles.textoExtracto}>{typeof r.texto === 'string' ? r.texto : r.texto.es}</span>,
            },
            { clave: 'fecha', etiqueta: 'Fecha' },
          ]}
          filas={filtradas}
          filaNueva={(r) => Boolean(r.nuevo)}
          onClickFila={(r) => setResenaEnEdicion(r)}
          renderAcciones={(r) => (
            <>
              <Boton variante="texto" onClick={() => setResenaEnEdicion(r)}>Editar</Boton>{' '}
              <Boton variante="texto" onClick={() => alternarEstado(r.id)}>{r.estado === 'Publicada' ? 'Ocultar' : 'Publicar'}</Boton>
            </>
          )}
        />
      ) : (
        <GridResenas filas={filtradas} onClickFila={(r) => setResenaEnEdicion(r)} porPagina={12} />
      )}

      <ModalOverlay abierto={nuevaAbierta} onCerrar={() => setNuevaAbierta(false)}>
        <FormularioResena onGuardado={crearResena} />
      </ModalOverlay>

      <ModalOverlay abierto={!!resenaEnEdicion} onCerrar={() => setResenaEnEdicion(null)}>
        <FormularioResena resenaExistente={resenaEnEdicion} onGuardado={guardarEdicionResena} />
      </ModalOverlay>
    </div>
  );
}
