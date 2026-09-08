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
import { newsletterMock } from '@/components/admin/mockData';

export default function NewsletterPage() {
  const [query, setQuery] = useState('');
  const [filtroOrigen, setFiltroOrigen] = useState('Todos');

  const filtrados = useMemo(() => newsletterMock
    .filter((s) => {
      if (filtroOrigen !== 'Todos' && s.origen !== filtroOrigen) return false;
      if (query && !s.email.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha)), [filtroOrigen, query]);

  const hayFiltros = filtroOrigen !== 'Todos' || query !== '';

  function limpiarFiltros() {
    setQuery('');
    setFiltroOrigen('Todos');
  }

  return (
    <div>
      <PageHeader titulo="Newsletter" subtitulo={`${filtrados.length} suscriptores`} />

      <FiltroBar onLimpiar={hayFiltros ? limpiarFiltros : undefined}>
        <Input etiqueta="Buscar" placeholder="Email" valor={query} onChange={(e) => setQuery(e.target.value)} />
        <FiltroSelector
          etiqueta="Origen"
          valor={filtroOrigen}
          onChange={(e) => setFiltroOrigen(e.target.value)}
          opciones={[{ valor: 'Todos', etiqueta: 'Todos' }, { valor: 'Popup Home', etiqueta: 'Popup Home' }, { valor: 'Clientes', etiqueta: 'Clientes' }]}
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
