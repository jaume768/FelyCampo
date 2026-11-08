/* Ruta: /atelier/novias — antes enseñaba el catálogo completo de las 6
   colecciones de Novia (ver noviaProductos.js: Introspección, Inside,
   Savia Novia, Bambú Novia, ME y Bride 27). A petición explícita, la
   página deja de listar esas 6 y muestra solo la última, Bride 27 —
   noviaProductos.js NO se toca (sigue con las 6 completas: catálogo
   real que también alimenta /admin/colecciones/novia y las fichas
   individuales en [producto]/page.js), aquí solo se filtra lo que se
   enseña en esta página.

   Antes de la cuadrícula, una sección editorial (ver noviaEditorial.js)
   cuenta cómo se trabaja con cada novia en el atelier — dos
   BloqueSeccion en zigzag (mismo patrón que /atelier-fiesta/salamanca)
   y un RunwayBackstage con fotos fuertes de Bride 27 (misma cuadrícula
   editorial que ya usa La Colección en /runways-la-coleccion), en vez
   de ir directa a la cuadrícula de looks como antes.

   Hero + título: mismo patrón que la ficha de colección de Runway (ver
   /runways/[coleccion]/page.js — .hero con RunwayMediaLateral,
   data-navbar-hero para que el Navbar se vuelva sólido al salir de él,
   + .textoDescripcion con .textoRow) en vez del ProductHero sin título
   que llevaba antes. "nombre"/"temporada" son "Atelier"/"Novias" — el
   mismo par que ya usa CuadriculaProductos como subtítulo/título antes
   de la cuadrícula (tituloKey/coleccionKey más abajo), aquí grande en
   el propio hero. RunwayDescripcion (editorial de arriba) pasa a vivir
   dentro de ese mismo .textoDescripcion, debajo de la fila de título.

   Cuadrícula de looks (CuadriculaProductos) comentada a petición — no
   se usa por el momento, la página se queda en la parte editorial de
   arriba (hero + storytelling + RunwayBackstage). noviaProductos.js
   sigue intacto (ver comentario del principio), solo se deja de
   pintar aquí.

   Fotos y textos (portada, introducción, bloques y galería): de
   lib/atelierEditorial.js, editables en el admin (Colección Novias ›
   Página de la web). Los pinta NoviasContenido.jsx, que admite la vista
   previa del admin. */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { metadataPagina } from '@/lib/seo';
import { obtenerEditorialNovias } from '@/lib/atelierEditorial';
import NoviasContenido from './NoviasContenido';
import { cargarContenido } from '@/lib/contenidoServidor';
// Cuadrícula de looks comentada a petición (ver arriba):
// import { CuadriculaProductos } from '@/components/layout';
// import { noviaProductos } from '@/components/layout/noviaProductos';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/atelier/novias' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const t = await getTranslations();

  return (
    <section className="seccion">
      <NoviasContenido
        publicado={obtenerEditorialNovias()}
        locale={locale}
        titulo={[t('nav.links.atelier'), t('nav.submenus.atelier.novias')]}
        alt={t('nav.submenus.atelier.novias')}
      />

      {/* Comentado a petición — sin cuadrícula de looks por el momento.
      <CuadriculaProductos
        productos={noviaProductos}
        disposicion="grid"
        tituloKey="nav.links.atelier"
        coleccionKey="nav.submenus.atelier.novias"
        descriptionKey="cuadriculaTabs.descripcion"
        ocultarPrecio
        hrefBase="atelier/novias"
        estiloYSilueta
      />
      */}
    </section>
  );
}
