/* Ruta DINÁMICA: un artículo del blog, /blog/<slug>.
   Los artículos vienen de lib/blog.js (datos/blog.js), los mismos que
   edita /admin/blog. Se pintan con BlogArticulo (vía ArticuloContenido,
   que añade la vista previa del admin).
   Sin ficha propia (todas llevan al listado, nunca un 404):
     · un slug que no existe o un artículo oculto;
     · los episodios de podcast (quitada a petición, 2026-11-04: su
       tarjeta del listado enlaza a YouTube).
   Excepción: con ?previa=blog-<slug> se pinta el borrador del admin,
   aunque el artículo aún no esté publicado (ArticuloContenido). */

import { permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { articuloPorSlug, articulosVisibles, idPreviaArticulo } from '@/lib/blog';
import { JsonLd } from '@/components/ui';
import { articuloBlog, migas } from '@/lib/datosEstructurados';
import { PARAMETRO_PREVIA } from '@/lib/previa';
import { metadataPagina, recortar } from '@/lib/seo';
import ArticuloContenido from './ArticuloContenido';
import { cargarContenido } from '@/lib/contenidoServidor';

// Dinámica a propósito: lee la URL (?previa= de la vista previa del admin,
// ?coleccion=…). Las páginas no se generan en el build (layout.js), así que
// Next ya no lo descubre solo y, sin esto, fallaba en producción con
// DYNAMIC_SERVER_USAGE. Sigue siendo rápida: el contenido sale de la caché
// de datos (cargarContenido), solo se renderiza en cada visita.
export const dynamic = 'force-dynamic';

const articuloPublicado = (slug) => articuloPorSlug(slug, articulosVisibles());

export async function generateMetadata({ params }) {
  const { locale, entrada: slug } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const entrada = articuloPublicado(slug);
  if (!entrada) return {};

  const titulo = entrada.titulo?.[locale] || entrada.titulo?.es;
  return metadataPagina({
    locale,
    ruta: `/blog/${slug}`,
    titulo: `${titulo} | Blog Fely Campo`,
    descripcion: recortar(entrada.resumen?.[locale] || entrada.resumen?.es),
    imagen: entrada.imagenCubierta,
    tipo: 'article',
  });
}

export default async function Entrada({ params, searchParams }) {
  const { locale, entrada: slug } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const consulta = await searchParams;
  const entrada = articuloPublicado(slug);
  const enPrevia = consulta?.[PARAMETRO_PREVIA] === idPreviaArticulo(slug);
  const volverHref = `/${locale}/blog`;

  if (!entrada) {
    // La vista previa de un artículo nuevo u oculto: temporal, sin 301.
    if (enPrevia) {
      const t = await getTranslations('blog');
      return <ArticuloContenido publicado={null} slug={slug} locale={locale} volverHref={volverHref} volverTexto={t('volver')} />;
    }
    permanentRedirect(volverHref);
  }

  const t = await getTranslations('blog');
  const titulo = entrada.titulo[locale] || entrada.titulo.es;
  const ruta = `/${locale}/blog/${slug}`;
  return (
    <>
      {/* Datos estructurados: artículo (BlogPosting) y migas Inicio › Blog › artículo. */}
      <JsonLd
        datos={[
          articuloBlog({
            titulo,
            resumen: entrada.resumen[locale] || entrada.resumen.es,
            imagen: entrada.imagenCubierta,
            fecha: entrada.fecha,
            url: ruta,
            locale,
          }),
          migas([
            { nombre: 'Fely Campo', ruta: `/${locale}` },
            { nombre: 'Blog & Podcast', ruta: volverHref },
            { nombre: titulo },
          ]),
        ]}
      />
      <ArticuloContenido publicado={entrada} slug={slug} locale={locale} volverHref={volverHref} volverTexto={t('volver')} />
    </>
  );
}
