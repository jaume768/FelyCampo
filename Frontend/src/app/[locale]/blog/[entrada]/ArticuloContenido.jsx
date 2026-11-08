'use client';

/* ============================================================
   ARTÍCULO DEL BLOG — contenido con vista previa — Fely Campo
   Pinta un artículo (BlogArticulo) con lo publicado o, si viene del
   admin con ?previa=blog-<slug>, con el borrador (usePrevia). Un
   artículo nuevo, sin publicar todavía, solo existe en la vista previa:
   sin borrador en este navegador, se vuelve al listado del blog.
   ============================================================ */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogArticulo } from '@/components/layout';
import BarraPrevia from '@/components/layout/BarraPrevia';
import usePrevia from '@/components/layout/usePrevia';
import { EDITOR_BLOG, idPreviaArticulo } from '@/lib/blog';

function ArticuloContenido({
  publicado, slug, locale, volverHref, volverTexto,
}) {
  const router = useRouter();
  const { datos, enPrevia, comprobado } = usePrevia(idPreviaArticulo(slug), publicado);

  useEffect(() => {
    if (comprobado && !datos) router.replace(volverHref);
  }, [comprobado, datos, router, volverHref]);

  if (!datos) return null;

  return (
    <>
      <BlogArticulo entrada={datos} locale={locale} volverHref={volverHref} volverTexto={volverTexto} />
      {enPrevia && <BarraPrevia editor={`${EDITOR_BLOG}?articulo=${slug}`} />}
    </>
  );
}

export default ArticuloContenido;
