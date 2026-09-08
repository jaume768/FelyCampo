'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { BotonVolver } from '@/components/admin';
import { productosMock, rutaTipoProducto } from '@/components/admin/mockData';
import FormularioProducto from '@/components/admin/FormularioProducto';

export default function EditarProductoPage({ params }) {
  const { id } = use(params);
  const producto = productosMock.find((p) => p.id === id);

  if (!producto) notFound();

  return (
    <div>
      <BotonVolver href={rutaTipoProducto(producto.tipo)} />
      <FormularioProducto productoExistente={producto} />
    </div>
  );
}
