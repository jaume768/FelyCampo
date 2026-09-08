'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, TablaAdmin, EstadoBadge, useToast } from '@/components/admin';
import { Boton } from '@/components/ui';
import { blogMock } from '@/components/admin/mockData';

export default function BlogPage() {
  const { mostrarToast } = useToast();
  const [entradas, setEntradas] = useState(blogMock);

  function alternarPublicado(id) {
    setEntradas((actual) => actual.map((e) => (e.id === id ? { ...e, estado: e.estado === 'Publicado' ? 'Borrador' : 'Publicado' } : e)));
    mostrarToast('Estado actualizado (demo)');
  }

  return (
    <div>
      <PageHeader titulo="Blog" subtitulo={`${entradas.length} entradas`}>
        <Boton variante="solido" href="/admin/blog/nueva"><Plus size={14} /> Nueva entrada</Boton>
      </PageHeader>

      <TablaAdmin
        columnas={[
          { clave: 'titulo', etiqueta: 'Título' },
          { clave: 'categoria', etiqueta: 'Categoría' },
          { clave: 'fecha', etiqueta: 'Fecha' },
          { clave: 'estado', etiqueta: 'Estado', render: (e) => <EstadoBadge estado={e.estado} /> },
        ]}
        filas={entradas}
        hrefFila={(e) => `/admin/blog/${e.id}/editar`}
        renderAcciones={(e) => (
          <>
            <Boton variante="texto" href={`/admin/blog/${e.id}/editar`}>Editar</Boton>{' '}
            <Boton variante="texto" onClick={() => alternarPublicado(e.id)}>{e.estado === 'Publicado' ? 'Despublicar' : 'Publicar'}</Boton>
          </>
        )}
      />
    </div>
  );
}
