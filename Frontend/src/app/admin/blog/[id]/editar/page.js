'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { BotonVolver } from '@/components/admin';
import { blogMock } from '@/components/admin/mockData';
import FormularioBlog from '@/components/admin/FormularioBlog';

export default function EditarEntradaBlogPage({ params }) {
  const { id } = use(params);
  const entrada = blogMock.find((e) => e.id === id);

  if (!entrada) notFound();

  return (
    <div>
      <BotonVolver href="/admin/blog" />
      <FormularioBlog entradaExistente={entrada} />
    </div>
  );
}
