/* Ruta DINÁMICA: ficha de cada colección de Runway.
   URL pública: /runways-diafonia, /runways-self-world,
   /runways-la-coleccion... (antes /colecciones-fely-campo/[slug]-
   [temporada] — renombrada a petición directa del usuario). Next.js no
   admite una carpeta "runways-[coleccion]" (segmento dinámico con
   prefijo literal pegado — solo admite "[param]" a secas), así que
   esta carpeta vive en /runways/[coleccion] (ruta normal, con barra) y
   un rewrite en next.config.mjs traduce /runways-:coleccion a
   /runways/:coleccion por debajo — la URL que ve el usuario nunca
   lleva la barra. El slug es "coleccion.slug" tal cual (ya no lleva la
   temporada al final, a diferencia del esquema anterior) — se busca
   ahí la colección para poder mostrar su nombre/temporada/medios/looks
   reales en vez de derivarlos del slug.

   Diseño: hero a 80vh a ancho completo (RunwayMediaLateral: el medio
   principal de la colección, vídeo o imagen, ahora a 100% de ancho —
   marcado data-navbar-hero para que el Navbar blanco/transparente de
   arriba se vuelva sólido al salir de él, igual que ProductHero en
   Tienda/Atelier) → .textoRow (nombre y temporada a tamaño h1, en fila
   y separados) + RunwayDescripcion (texto editorial), ambos dentro de
   un contenedor común a todo el ancho → RunwayBackstage (cuadrícula
   editorial de fotos de backstage, opcional — solo si la colección
   trae "backstage" en colecciones.js) → cuadrícula de looks
   (RunwayGaleria.jsx: rejilla + lightbox con miniaturas y productos
   vinculados al look activo, si hay) → RunwayVideoCierre (el vídeo de
   la colección, si existe — arranca solo al llegar a su punto en la
   página, sonido opcional). Todo eso lo pinta RunwayContenido.jsx,
   que además admite la vista previa del admin (?previa=runway-<slug>).
   Datos: lib/runway.js (datos/runway.js), los mismos que edita
   /admin/colecciones/runway. */

import { permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/ui';
import { migas } from '@/lib/datosEstructurados';
import { PARAMETRO_PREVIA } from '@/lib/previa';
import { coleccionRunwayPorSlug, idPreviaRunway } from '@/lib/runway';
import { metadataPagina, recortar } from '@/lib/seo';
import RunwayContenido from './RunwayContenido';
import { cargarContenido } from '@/lib/contenidoServidor';

// Dinámica a propósito: lee la URL (?previa= de la vista previa del admin,
// ?coleccion=…). Las páginas no se generan en el build (layout.js), así que
// Next ya no lo descubre solo y, sin esto, fallaba en producción con
// DYNAMIC_SERVER_USAGE. Sigue siendo rápida: el contenido sale de la caché
// de datos (cargarContenido), solo se renderiza en cada visita.
export const dynamic = 'force-dynamic';

// Canonical = URL pública /runways-{slug} (la del rewrite de
// next.config.mjs), no la interna /runways/{slug}.
export async function generateMetadata({ params, searchParams }) {
  const { locale, coleccion: slug } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  if ((await searchParams)?.[PARAMETRO_PREVIA] === idPreviaRunway(slug)) {
    return { robots: { index: false, follow: false } };
  }
  const coleccion = coleccionRunwayPorSlug(slug);
  if (!coleccion) return {};

  const esEs = locale === 'es';
  const descripcionEn = (coleccion.descripcion?.en || '').trim();
  return metadataPagina({
    locale,
    ruta: `/runways-${slug}`,
    titulo: `${coleccion.nombre} ${coleccion.temporada} | ${esEs ? 'Colección de pasarela' : 'Runway collection'} Fely Campo`,
    // En inglés, si la colección no tiene su texto traducido, una meta
    // generada con nombre + temporada (auditoría SEO B4) en vez de servir
    // la española, duplicada entre idiomas.
    descripcion: esEs
      ? recortar(coleccion.descripcion.es)
      : (descripcionEn ? recortar(descripcionEn) : `${coleccion.nombre} (${coleccion.temporada}), a luxury ready-to-wear runway collection by Spanish designer Fely Campo. Explore every look, its fabrics and the show.`),
    imagen: coleccion.portada,
  });
}

export default async function Coleccion({ params, searchParams }) {
  const { locale, coleccion: slug } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const coleccion = coleccionRunwayPorSlug(slug);
  const enPrevia = (await searchParams)?.[PARAMETRO_PREVIA] === idPreviaRunway(slug);
  const volverHref = `/${locale}/colecciones-fely-campo`;
  if (!coleccion && !enPrevia) permanentRedirect(volverHref); // slug inexistente: al listado (ninguna URL en 404)

  const t = await getTranslations('heroPagina');

  return (
    <section>
      {/* BreadcrumbList (auditoría SEO M2): Inicio › Colecciones › colección. */}
      {coleccion && (
        <JsonLd
          datos={migas([
            { nombre: 'Fely Campo', ruta: `/${locale}` },
            { nombre: locale === 'es' ? 'Colecciones' : 'Collections', ruta: volverHref },
            { nombre: `${coleccion.nombre} ${coleccion.temporada}` },
          ])}
        />
      )}
      <RunwayContenido publicado={coleccion || null} slug={slug} locale={locale} subtitulo={t('runway')} volverHref={volverHref} />
    </section>
  );
}
