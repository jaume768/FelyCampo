'use client';

/* ============================================================
   CONSULTAS DE VESTIDOS — listado. Lo que llega del modal "Solicita
   información" (botón "Contacta con nosotros" de las fichas de Novias y
   Fiesta, ModalSolicitudAtelier.jsx → /api/consulta-vestido), con los
   mismos campos que envía (ver consultasPrecioMock en mockData.js), de
   la más reciente a la más antigua. Mismo esquema que Citas
   (/admin/consultas): "Recibida" en dos líneas (en rosa si lleva 4+ días
   pendiente), bajo el nombre el teléfono o, si no lo dejó, el email,
   bandera del idioma, los mismos estados (ESTADOS_CITA) y filtros por
   Novias/Fiesta, estado e idioma + búsqueda. Vista de tabla o rejilla.
   Antes "Consultas de precio" / "Solicitudes de atelier", con clientes
   registrados (la web no tiene cuentas) — sustituido a petición.
   Datos de EJEMPLO hasta que /api/consulta-vestido guarde las consultas.
   ============================================================ */

import { useMemo, useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import {
  PageHeader, TablaAdmin, GridConsultasPrecio, EstadoBadge, OrigenProductoBadge, FiltroBar, FiltroSelector, TabsFiltro,
} from '@/components/admin';
import { BotonFila } from '@/components/admin/ListadoAdmin';
import { Input } from '@/components/ui';
import { consultasPrecioMock, ESTADOS_CITA } from '@/components/admin/mockData';
import { CONFIG_ORIGEN_PRODUCTO } from '@/components/admin/OrigenProductoBadge';
import { fechaCorta, IDIOMAS_CITA } from '../consultas/citasFormato';
import BanderaIdioma from '../consultas/BanderaIdioma';
import styles from './page.module.css';

const TODOS = 'Todos';

const OPCIONES_ESTADO = [
  { valor: TODOS, etiqueta: 'Todas' },
  ...ESTADOS_CITA.map((estado) => ({ valor: estado, etiqueta: estado })),
];

// Colores del <option> — mismos tokens que OrigenProductoBadge.module.css.
const ESTILO_TIPO = {
  novias: { backgroundColor: 'var(--color-azul-velo)', color: 'var(--color-azul-oscuro)' },
  fiesta: { backgroundColor: 'var(--color-naranja-velo)', color: 'var(--color-naranja-oscuro)' },
};

const OPCIONES_TIPO = [
  { valor: TODOS, etiqueta: 'Todos' },
  ...Object.entries(CONFIG_ORIGEN_PRODUCTO).map(([valor, cfg]) => ({ valor, etiqueta: cfg.etiqueta, estilo: ESTILO_TIPO[valor] })),
];

const OPCIONES_ORDEN = [
  { valor: 'reciente', etiqueta: 'Más reciente' },
  { valor: 'antigua', etiqueta: 'Más antigua' },
];

function calcularDias(recibida) {
  const inicio = new Date(`${recibida.slice(0, 10)}T00:00:00`);
  return Math.floor((Date.now() - inicio.getTime()) / (1000 * 60 * 60 * 24));
}

function etiquetaDias(dias) {
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Hace 1 día';
  return `Hace ${dias} días`;
}

function esUrgente(c) {
  return calcularDias(c.recibida) >= 4 && c.estado === 'Pendiente';
}

export default function ConsultasVestidosPage() {
  const [query, setQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(TODOS);
  const [filtroTipo, setFiltroTipo] = useState(TODOS);
  const [filtroIdioma, setFiltroIdioma] = useState(TODOS);
  const [orden, setOrden] = useState('reciente');
  const [vista, setVista] = useState('tabla');

  const filtradas = useMemo(() => {
    const texto = query.trim().toLowerCase();
    return consultasPrecioMock
      .filter((c) => {
        if (filtroEstado !== TODOS && c.estado !== filtroEstado) return false;
        if (filtroTipo !== TODOS && c.tipo !== filtroTipo) return false;
        if (filtroIdioma !== TODOS && c.locale !== filtroIdioma) return false;
        if (texto && ![c.nombre, c.telefono, c.email, c.producto].some((campo) => campo?.toLowerCase().includes(texto))) return false;
        return true;
      })
      .sort((a, b) => (orden === 'antigua' ? a.recibida.localeCompare(b.recibida) : b.recibida.localeCompare(a.recibida)));
  }, [filtroEstado, filtroTipo, filtroIdioma, orden, query]);

  const pendientes = consultasPrecioMock.filter((c) => c.estado === 'Pendiente').length;
  const hayFiltros = orden !== 'reciente' || filtroTipo !== TODOS || filtroIdioma !== TODOS || query !== '';

  function limpiarFiltros() {
    setQuery('');
    setOrden('reciente');
    setFiltroTipo(TODOS);
    setFiltroIdioma(TODOS);
  }

  return (
    <div>
      <PageHeader
        titulo="Consultas de vestidos"
        subtitulo={`${filtradas.length} consultas · ${pendientes} pendientes · «Contacta con nosotros» de las fichas de Novias y Fiesta`}
      >
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
        <Input etiqueta="Buscar" placeholder="Nombre, teléfono, email o vestido" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector etiqueta="Ordenar por" valor={orden} onChange={(e) => setOrden(e.target.value)} opciones={OPCIONES_ORDEN} />
        <FiltroSelector etiqueta="Novias / Fiesta" valor={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} opciones={OPCIONES_TIPO} />
        <FiltroSelector
          etiqueta="Idioma"
          valor={filtroIdioma}
          onChange={(e) => setFiltroIdioma(e.target.value)}
          opciones={[{ valor: TODOS, etiqueta: 'Todos' }, ...IDIOMAS_CITA]}
        />
      </FiltroBar>

      <TabsFiltro opciones={OPCIONES_ESTADO} valor={filtroEstado} onChange={setFiltroEstado} />

      {vista === 'tabla' ? (
        <TablaAdmin
          columnas={[
            {
              clave: 'recibida',
              etiqueta: 'Recibida',
              render: (c) => {
                const [fecha, hora] = c.recibida.split('T');
                return (
                  <div className={styles.recibida}>
                    <span className={esUrgente(c) ? styles.recibidaUrgente : undefined}>{fechaCorta(fecha)}</span>
                    <span className={styles.secundario}>{hora} · {etiquetaDias(calcularDias(c.recibida))}</span>
                  </div>
                );
              },
            },
            {
              clave: 'nombre',
              etiqueta: 'Clienta',
              render: (c) => (
                <div>
                  <div>{c.nombre}</div>
                  <div className={styles.secundario}>{c.telefono || c.email}</div>
                </div>
              ),
            },
            {
              clave: 'producto',
              etiqueta: 'Vestido',
              render: (c) => (
                <div className={styles.productoFila}>
                  {c.imagen ? <img src={c.imagen} alt="" className={styles.miniatura} /> : <span className={styles.miniatura} />}
                  <div>
                    <div className={styles.origenFila}><OrigenProductoBadge tipo={c.tipo} /></div>
                    <div>{c.producto}</div>
                    {c.color && (
                      <div className={`${styles.secundario} ${styles.colorFila}`}>
                        {c.colorHex && <span className={styles.colorPunto} style={{ background: c.colorHex }} aria-hidden="true" />}
                        {c.color}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            { clave: 'locale', etiqueta: 'Idioma', render: (c) => <BanderaIdioma locale={c.locale} /> },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => <EstadoBadge estado={c.estado} /> },
          ]}
          filas={filtradas}
          resaltarFila={esUrgente}
          hrefFila={(c) => `/admin/consultas-precio/${c.id}`}
          renderAcciones={(c) => <BotonFila href={`/admin/consultas-precio/${c.id}`}>Ver</BotonFila>}
        />
      ) : (
        <GridConsultasPrecio
          filas={filtradas}
          hrefFila={(c) => `/admin/consultas-precio/${c.id}`}
          esUrgente={esUrgente}
          etiquetaRecibida={(c) => etiquetaDias(calcularDias(c.recibida))}
          porPagina={12}
        />
      )}
    </div>
  );
}
