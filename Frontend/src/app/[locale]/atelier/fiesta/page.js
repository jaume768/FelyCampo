/* Ruta: /atelier/fiesta — catálogo real de las 11 colecciones de Fiesta
   (ver fiestaProductos.js): Primavera Verano 2027 (SS27), Primavera
   Verano 2026, Primavera Verano 2025, Prêt-à-porter, En Madrid, A
   Walk, Bambú, Savia, Miscelanea y Furisode (Essentielle eliminada), cada una con
   sus looks reales. Mismo criterio que atelier/novias/page.js.

   Hero + título: mismo patrón que la ficha de colección de Runway (ver
   /runways/[coleccion]/page.js — .hero con RunwayMediaLateral,
   data-navbar-hero para que el Navbar se vuelva sólido al salir de él,
   + .textoDescripcion con .textoRow) en vez del ProductHero sin título
   que llevaba antes — mismo cambio que atelier/novias/page.js (ver ahí
   el detalle completo). "nombre"/"temporada" son "Atelier"/"Fiesta", el
   mismo par que ya usa CuadriculaProductos como subtítulo/título antes
   de la cuadrícula (tituloKey/coleccionKey más abajo).

   Bajo el hero, intro con pestañas (FiestaIntro.jsx → IntroSeccion,
   mismo esquema que /blog): título "Atelier Fiesta", el texto de
   descripción y dos pestañas, "Así trabajamos" (dos BloqueSeccion en
   zigzag + RunwayBackstage, contenido en fiestaEditorial.js) y
   "Colección fiesta" (la cuadrícula). Por defecto, sin pestaña elegida,
   se ve todo seguido en una sola columna (también en mobile): primero
   "Así trabajamos" y justo debajo la colección. Pulsar una pestaña
   enseña solo esa parte (ver FiestaIntro.jsx).

   Cuadrícula de looks (CuadriculaProductos) al final, visible — a
   petición explícita (a diferencia de atelier/novias/page.js, aquí NO
   se comenta). "Prêt-à-porter" se quita de COLECCIONES_FIESTA (no
   pertenece a este listado de colecciones de Fiesta) — fiestaProductos.js
   NO se toca (sigue con las 11 completas: catálogo real que también
   alimenta /admin/colecciones/fiesta), aquí solo se excluye de lo que
   se enseña en esta página.

   La parte editorial (portada, introducción, pestañas, bloques y galería)
   sale de lib/atelierEditorial.js, editable en el admin (Colección Fiesta ›
   Página de la web), y la pinta FiestaContenido.jsx, que admite la vista
   previa del admin; la cuadrícula se le pasa ya hecha. */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CuadriculaProductos } from '@/components/layout';
import { obtenerEditorialFiesta } from '@/lib/atelierEditorial';
import { coleccionesVisiblesFiesta, productosListadoFiesta } from '@/lib/catalogoFiesta';
import FiestaContenido from './FiestaContenido';
import { metadataPagina } from '@/lib/seo';

// Colecciones visibles (de la más reciente a la más antigua) y sus looks
// publicados: salen de los datos que edita /admin/colecciones/fiesta
// (ver src/lib/catalogoFiesta.js). Ocultas hoy: Eclat y Prêt-à-porter.
const COLECCIONES_FIESTA = coleccionesVisiblesFiesta();
const PRODUCTOS_FIESTA = productosListadoFiesta();

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return metadataPagina({ locale, ruta: '/atelier/fiesta' });
}

export default async function Pagina({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // "?coleccion=" (ver comentario de novias/page.js): solo se
  // preselecciona si coincide exacto con una de las colecciones reales.
  const { coleccion } = await searchParams;
  const coleccionActiva = COLECCIONES_FIESTA.includes(coleccion) ? coleccion : null;
  const t = await getTranslations();

  return (
    <section className="seccion">
      <FiestaContenido
        publicado={obtenerEditorialFiesta()}
        locale={locale}
        titulo={[t('nav.links.atelier'), t('nav.submenus.atelier.fiesta')]}
        tituloIntro={`${t('nav.links.atelier')} ${t('nav.submenus.atelier.fiesta')}`}
        alt={t('nav.submenus.atelier.fiesta')}
        colecciones={(
          // 2. Colección fiesta, justo debajo
          <CuadriculaProductos
            productos={PRODUCTOS_FIESTA}
            disposicion="grid"
            // Cabecera (CabeceraSeccion) comentada a petición, igual que en
            // pret-a-porter/page.js: sin "tituloKey" CuadriculaProductos no la
            // pinta (ni el botón de filtros ni el cambio de columnas, que van dentro).
            // tituloKey="nav.links.atelier"
            // coleccionKey="nav.submenus.atelier.fiesta"
            // descriptionKey="cuadriculaTabs.descripcion"
            ocultarPrecio
            colecciones={COLECCIONES_FIESTA}
            coleccionActiva={coleccionActiva}
            hrefBase="atelier/fiesta"
            estiloYSilueta
            esFiesta
          />
        )}
      />
    </section>
  );
}
