'use client';

/* ============================================================
   NEWSLETTER — placeholder de ejemplo. Datos 100% estáticos
   (newsletterMock), sin API/BBDD detrás. Junta dos orígenes en una
   sola lista: clientas que se apuntaron desde su cuenta ("Clientes")
   y visitantes sin cuenta que se apuntaron desde el popup de la home
   ("Popup Home") — no todo suscriptor es cliente.
   ============================================================ */

import { useMemo, useState } from 'react';
import { PageHeader, TablaAdmin, FiltroBar, FiltroSelector } from '@/components/admin';
import { Input } from '@/components/ui';
import { useBandeja } from '@/components/admin/useBandeja';
import { urlApi } from '@/lib/api';

export default function NewsletterPage() {
  // De la base de datos: el pie de página y la ventana de la home guardan
  // aquí cada suscripción (/api/newsletter).
  const { items: suscriptores, cargando, error } = useBandeja('suscriptores');
  const [query, setQuery] = useState('');
  const [filtroOrigen, setFiltroOrigen] = useState('Todos');

  const filtrados = useMemo(() => suscriptores
    .filter((s) => {
      if (filtroOrigen !== 'Todos' && s.origen !== filtroOrigen) return false;
      if (query && !s.email.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha)), [suscriptores, filtroOrigen, query]);

  const hayFiltros = filtroOrigen !== 'Todos' || query !== '';

  function limpiarFiltros() {
    setQuery('');
    setFiltroOrigen('Todos');
  }

  return (
    <div>
      <PageHeader
        titulo="Newsletter"
        subtitulo={cargando ? 'Cargando…' : error ? `No se ha podido cargar: ${error}` : `${filtrados.length} suscriptoras`}
      />
      {/* Toda la lista en CSV (para Substack u otra herramienta). */}
      <p style={{ margin: '0 0 24px' }}>
        <a href={urlApi('/admin/suscriptores/csv/')} download>Descargar la lista (CSV)</a>
      </p>

      <FiltroBar onLimpiar={hayFiltros ? limpiarFiltros : undefined}>
        <Input etiqueta="Buscar" placeholder="Email" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector
          etiqueta="Origen"
          valor={filtroOrigen}
          onChange={(e) => setFiltroOrigen(e.target.value)}
          opciones={[{ valor: 'Todos', etiqueta: 'Todos' }, { valor: 'Pie de página', etiqueta: 'Pie de página' }, { valor: 'Ventana de la home', etiqueta: 'Ventana de la home' }, { valor: 'Muy pronto (prelanzamiento)', etiqueta: 'Muy pronto (prelanzamiento)' }]}
        />
      </FiltroBar>

      <TablaAdmin
        columnas={[
          { clave: 'email', etiqueta: 'Email' },
          { clave: 'origen', etiqueta: 'Se unió desde' },
          { clave: 'fecha', etiqueta: 'Fecha de alta' },
        ]}
        filas={filtrados}
        claveFila={(s) => s.id}
      />
    </div>
  );
}
