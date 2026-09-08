'use client';

/* ============================================================
   CONSULTAS / CITAS — listado (spec sección 5). Atelier (Novias,
   Fiesta) + formularios de contacto general.
   ============================================================ */

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader, TablaAdmin, EstadoBadge, FiltroBar, FiltroSelector } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { consultasMock } from '@/components/admin/mockData';
import styles from './page.module.css';

function ConsultasContenido() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('estado') || 'Todos');

  const filtradas = useMemo(() => consultasMock.filter((c) => {
    if (filtroTipo !== 'Todos' && c.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'Todos' && c.estado !== filtroEstado) return false;
    if (query && !c.cliente.nombre.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [filtroTipo, filtroEstado, query]);

  const hayFiltros = filtroTipo !== 'Todos' || filtroEstado !== 'Todos' || query !== '';

  function limpiarFiltros() {
    setQuery('');
    setFiltroTipo('Todos');
    setFiltroEstado('Todos');
  }

  return (
    <div>
      <PageHeader titulo="Consultas / Citas" subtitulo={`${filtradas.length} registros`} />

      <FiltroBar onLimpiar={hayFiltros ? limpiarFiltros : undefined}>
        <Input etiqueta="Buscar" placeholder="Nombre del cliente" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector
          etiqueta="Tipo"
          valor={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          opciones={[{ valor: 'Todos', etiqueta: 'Todos' }, { valor: 'Consulta', etiqueta: 'Consulta' }, { valor: 'Cita', etiqueta: 'Cita' }]}
        />
        <FiltroSelector
          etiqueta="Estado"
          valor={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          opciones={[{ valor: 'Todos', etiqueta: 'Todos' }, { valor: 'Pendiente', etiqueta: 'Pendiente' }, { valor: 'Contactado', etiqueta: 'Contactado' }, { valor: 'Cerrado', etiqueta: 'Cerrado' }]}
        />
      </FiltroBar>

      <TablaAdmin
        columnas={[
          { clave: 'cliente', etiqueta: 'Cliente', render: (c) => (
            <div>
              <div>{c.cliente.nombre}</div>
              <div className={styles.clienteEmail}>{c.cliente.email}</div>
            </div>
          ) },
          { clave: 'tipo', etiqueta: 'Tipo' },
          { clave: 'asunto', etiqueta: 'Asunto' },
          { clave: 'fecha', etiqueta: 'Fecha solicitada' },
          { clave: 'estado', etiqueta: 'Estado', render: (c) => <EstadoBadge estado={c.estado} /> },
        ]}
        filas={filtradas}
        hrefFila={(c) => `/admin/consultas/${c.id}`}
        renderAcciones={(c) => <Boton variante="texto" href={`/admin/consultas/${c.id}`}>Ver</Boton>}
      />
    </div>
  );
}

export default function ConsultasPage() {
  return (
    <Suspense fallback={null}>
      <ConsultasContenido />
    </Suspense>
  );
}
