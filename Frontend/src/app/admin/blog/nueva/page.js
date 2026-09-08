'use client';

import { BotonVolver } from '@/components/admin';
import FormularioBlog from '@/components/admin/FormularioBlog';

export default function NuevaEntradaBlogPage() {
  return (
    <div>
      <BotonVolver href="/admin/blog" />
      <FormularioBlog />
    </div>
  );
}
