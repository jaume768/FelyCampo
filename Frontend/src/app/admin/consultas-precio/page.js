'use client';

/* ============================================================
   CONSULTAS DE PRECIO — listado. Atelier no lleva precio visible en
   la ficha pública: en su lugar hay un botón "Precio a consultar"
   que deja estos datos de contacto. Mismo patrón que /admin/consultas
   (spec sección 5), pero separado porque el origen es otro (el botón
   de precio, no el formulario de cita/consulta general) y porque no
   todo el que pregunta es cliente registrado.
   ============================================================ */

import { useMemo, useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import {
  PageHeader, TablaAdmin, GridConsultasPrecio, EstadoContactoBadge, OrigenProductoBadge, FiltroBar, FiltroSelector, TabsFiltro,
} from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { consultasPrecioMock, productosMock } from '@/components/admin/mockData';
import { CONFIG_ESTADO_CONTACTO, calcularEstadoContacto } from '@/components/admin/EstadoContactoBadge';
import { CONFIG_ORIGEN_PRODUCTO, calcularOrigenProducto } from '@/components/admin/OrigenProductoBadge';
import styles from './page.module.css';

const OPCIONES_CONTACTO = [
  { valor: 'Todos', etiqueta: 'Todos' },
  ...Object.entries(CONFIG_ESTADO_CONTACTO).map(([valor, cfg]) => ({ valor, etiqueta: cfg.etiqueta, clase: cfg.clase })),
];

// Colores del <option> — mismos tokens que OrigenProductoBadge.module.css.
const ESTILO_PROYECTO = {
  novias: { backgroundColor: 'var(--color-azul-velo)', color: 'var(--color-azul-oscuro)' },
  fiesta: { backgroundColor: 'var(--color-naranja-velo)', color: 'var(--color-naranja-oscuro)' },
};

const OPCIONES_PROYECTO = [
  { valor: 'Todos', etiqueta: 'Todos' },
  ...Object.entries(CONFIG_ORIGEN_PRODUCTO).map(([valor, cfg]) => ({ valor, etiqueta: cfg.etiqueta, estilo: ESTILO_PROYECTO[valor] })),
];

const OPCIONES_ORDEN = [
  { valor: 'clienteRegistrado', etiqueta: 'Cliente: Registrado' },
  { valor: 'clienteNoRegistrado', etiqueta: 'Cliente: No registrado' },
  { valor: 'fechaReciente', etiqueta: 'Fecha: Más reciente' },
  { valor: 'fechaAntiguo', etiqueta: 'Fecha: Más antiguo' },
];

function calcularDias(fecha) {
  const inicio = new Date(`${fecha}T00:00:00`);
  return Math.floor((Date.now() - inicio.getTime()) / (1000 * 60 * 60 * 24));
}

function etiquetaDias(dias) {
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Hace 1 día';
  return `Hace ${dias} días`;
}

function esUrgente(c) {
  return calcularDias(c.fecha) >= 4 && calcularEstadoContacto(c.estado) === 'pendiente';
}

function imagenProducto(nombre) {
  return productosMock.find((p) => p.nombre === nombre)?.imagen || '';
}

export default function ConsultasPrecioPage() {
  const [query, setQuery] = useState('');
  const [filtroContacto, setFiltroContacto] = useState('Todos');
  const [orden, setOrden] = useState('fechaReciente');
  const [filtroProyecto, setFiltroProyecto] = useState('Todos');
  const [vista, setVista] = useState('tabla');

  const filtradas = useMemo(() => consultasPrecioMock
    .filter((c) => {
      if (filtroContacto !== 'Todos' && calcularEstadoContacto(c.estado) !== filtroContacto) return false;
      if (orden === 'clienteRegistrado' && !c.clienteId) return false;
      if (orden === 'clienteNoRegistrado' && c.clienteId) return false;
      if (filtroProyecto !== 'Todos' && calcularOrigenProducto(c.producto) !== filtroProyecto) return false;
      if (query && !`${c.nombre} ${c.producto}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (orden === 'fechaAntiguo' ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha))),
  [filtroContacto, orden, filtroProyecto, query]);

  const hayFiltros = orden !== 'fechaReciente' || filtroProyecto !== 'Todos' || query !== '';

  function limpiarFiltros() {
    setQuery('');
    setOrden('fechaReciente');
    setFiltroProyecto('Todos');
  }

  return (
    <div>
      <PageHeader titulo="Consultas de precio" subtitulo={`${filtradas.length} registros`}>
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
        <Input etiqueta="Buscar" placeholder="Nombre o producto" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector
          etiqueta="Ordenar por"
          valor={orden}
          onChange={(e) => setOrden(e.target.value)}
          opciones={OPCIONES_ORDEN}
        />
        <FiltroSelector
          etiqueta="Tipo de producto"
          valor={filtroProyecto}
          onChange={(e) => setFiltroProyecto(e.target.value)}
          opciones={OPCIONES_PROYECTO}
        />
      </FiltroBar>

      <TabsFiltro opciones={OPCIONES_CONTACTO} valor={filtroContacto} onChange={setFiltroContacto} />

      {vista === 'tabla' ? (
        <TablaAdmin
          columnas={[
            {
              clave: 'nombre',
              etiqueta: 'Nombre',
              render: (c) => (
                <span className={styles.nombreFila}>
                  {c.nombre}
                  {c.clienteId && <span className={styles.etiquetaCliente}>Cliente</span>}
                </span>
              ),
            },
            {
              clave: 'producto',
              etiqueta: 'Producto',
              render: (c) => (
                <div className={styles.productoFila}>
                  {imagenProducto(c.producto) ? (
                    <img src={imagenProducto(c.producto)} alt="" className={styles.miniatura} />
                  ) : <span className={styles.miniatura} />}
                  <div>
                    <div className={styles.origenFila}><OrigenProductoBadge producto={c.producto} /></div>
                    <div>{c.producto}</div>
                  </div>
                </div>
              ),
            },
            {
              clave: 'contacto',
              etiqueta: 'Contacto',
              render: (c) => (
                <div>
                  <div>{c.email}</div>
                  <div className={styles.telefono}>{c.telefono}</div>
                </div>
              ),
            },
            {
              clave: 'antiguedad',
              etiqueta: 'Recibida',
              render: (c) => (
                <div className={styles.fechaColumna}>
                  <span className={esUrgente(c) ? styles.recibidaUrgente : undefined}>{etiquetaDias(calcularDias(c.fecha))}</span>
                  <span className={styles.fechaSecundaria}>{c.fecha}</span>
                </div>
              ),
            },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => <EstadoContactoBadge estado={c.estado} /> },
          ]}
          filas={filtradas}
          filaNueva={(c) => c.nuevo}
          resaltarFila={esUrgente}
          resaltarFilaVerde={(c) => calcularEstadoContacto(c.estado) === 'contactado'}
          hrefFila={(c) => `/admin/consultas-precio/${c.id}`}
          renderAcciones={(c) => <Boton variante="texto" href={`/admin/consultas-precio/${c.id}`}>Ver</Boton>}
        />
      ) : (
        <GridConsultasPrecio
          filas={filtradas}
          hrefFila={(c) => `/admin/consultas-precio/${c.id}`}
          esUrgente={esUrgente}
          etiquetaRecibida={(c) => etiquetaDias(calcularDias(c.fecha))}
          porPagina={12}
        />
      )}
    </div>
  );
}
