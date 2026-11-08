// FichaProductoAtelier.jsx

/* ============================================================
   FICHA DE PRODUCTO — ATELIER (Novias/Fiesta) — Fely Campo
   Plantilla propia para /atelier/novias/[producto] y
   /atelier/fiesta/[producto] — a propósito NO es la misma que
   /pret-a-porter/[producto]/page.js: estas piezas no se compran online
   (sin precio de catálogo, a presupuesto/cita) así que no llevan
   precio ni FichaProductoAcciones (talla + "añadir a la cesta"). En su
   lugar, InfoAtelier.jsx (color + CTA "Contacta con nosotros", ver ahí).
   GaleriaProducto también lleva "esAtelier" (mismo CTA en el panel de
   compra rápida del lightbox, ver GaleriaProductoLightbox.jsx) — sin
   precio ni "tallas" ahí, solo nombre/colores.
   TarjetaProducto enlaza aquí vía su prop "hrefBase"
   ('atelier/novias'/'atelier/fiesta' en vez de 'pret-a-porter', ver
   CuadriculaProductos.jsx) — mismo slug que /lib/slugify.js.
   Acordeon: "Composición" (mismos textos generales que
   pret-a-porter/[producto]/page.js). Sin "Envíos y devoluciones" ni
   "Producto por Encargo (PRE-ORDER)" (quitado el 2026-11-07): la web es
   de atelier, sin compra online, encargos ni devoluciones.
   "relacionados" (ProductosRecomendados, debajo de la ficha): mismo
   PLACEHOLDER que pret-a-porter/[producto]/page.js — catálogo de
   ejemplo compartido (productosEjemplo.js), sin backend real todavía
   que cruce productos por colección/categoría de verdad. Enlaza a esta
   misma ficha (hrefBase) y sin precio (ocultarPrecio), no a
   Prêt-à-porter.
   Fiesta y Novias son la excepción: buscan y enseñan relacionados
   dentro de su propio catálogo real (fiestaProductos.js /
   noviaProductos.js), no del placeholder genérico.
   Sin "Categorías" (la lista de tags debajo del Acordeon) — quitada a
   petición de todas las fichas de producto.
   Uso:
     <FichaProductoAtelier slug="vestido-aurora" seccion="novias" />
   ============================================================ */

import { permanentRedirect, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { productosEjemplo } from '@/components/layout/productosEjemplo';
import { fiestaProductos } from '@/components/layout/fiestaProductos';
import { noviaProductos } from '@/components/layout/noviaProductos';
import FichaAtelierCuerpo from './FichaAtelierCuerpo';
import { FilaAcordeon, JsonLd } from '@/components/ui';
import { producto as productoJsonLd, migas } from '@/lib/datosEstructurados';
import { slugify } from '@/lib/slugify';
import { buscarProductoFiesta } from '@/lib/catalogoFiesta';
import { buscarProductoNovia } from '@/lib/catalogoNovias';
import { sinNumeroColeccion } from '@/lib/nombreColeccion';

const CATALOGOS_REALES = { fiesta: fiestaProductos, novias: noviaProductos };

// Textos ya traducidos que pinta FichaAtelierCuerpo (también los usa la
// vista previa del admin, ver atelier/fiesta/[producto]/page.js).
export async function textosFichaAtelier(locale) {
  const tProducto = await getTranslations({ locale, namespace: 'producto' });
  return {
    acordeon: (
      <>
        <FilaAcordeon titulo={tProducto('composicion')}>
          <p>{tProducto('composicionTexto')}</p>
          <div>
            <p>{tProducto('origenDisenado')}</p>
            {/* "nuestros talleres" enlaza a /talleres-fely-campo (a petición). */}
            <p>{tProducto.rich('origenFabricado', { talleres: (chunks) => <a href={`/${locale}/talleres-fely-campo`} className="enlace-texto">{chunks}</a> })}</p>
          </div>
        </FilaAcordeon>
      </>
    ),
    seguirExplorando: tProducto('seguirExplorandoAtelier'),
  };
}

async function FichaProductoAtelier({ slug, seccion, locale }) {
  const textos = await textosFichaAtelier(locale);

  // Fiesta y Novias ya tienen catálogo real (ver CATALOGOS_REALES) — el
  // resto de Atelier sigue con el placeholder genérico.
  const catalogo = CATALOGOS_REALES[seccion]?.() || productosEjemplo;

  // Fiesta: búsqueda con redirección — si el look se renombró desde el
  // admin, su URL antigua redirige (301) a la nueva (ver
  // buscarProductoFiesta en lib/catalogoFiesta.js).
  let producto;
  // Novias, igual (lib/catalogoNovias.js).
  if (seccion === 'fiesta' || seccion === 'novias') {
    const resultado = (seccion === 'fiesta' ? buscarProductoFiesta : buscarProductoNovia)(slug);
    // Look de una colección oculta (hoy, todas las de Novias): al listado,
    // con redirección TEMPORAL — puede volver a enseñarse.
    if (resultado.oculto) redirect(`/${locale}/atelier/${seccion}`);
    if (resultado.redirigirA) permanentRedirect(`/${locale}/atelier/${seccion}/${resultado.redirigirA}`);
    producto = resultado.producto;
  } else {
    producto = catalogo.find((candidato) => slugify(candidato.nombre) === slug);
  }
  if (!producto) permanentRedirect(`/${locale}/atelier/${seccion}`); // slug inexistente: al listado (ninguna URL en 404)

  // Descripción en inglés si el look la tiene (se escribe en el admin);
  // si no, la de siempre en español.
  const descripcion = locale === 'en' && producto.descripcionEn ? producto.descripcionEn : producto.descripcion;

  // Mismo catálogo que "producto", excluyendo el actual — hasta 10, la
  // misma cantidad que espera ProductosRecomendados en su carrusel (ver
  // pret-a-porter/[producto]/page.js).
  // Por nombre, no por objeto: Fiesta y Novias buscan el look con su
  // propia función, que devuelve otra copia (antes el look salía entre
  // sus propios relacionados).
  const relacionados = catalogo.filter((candidato) => candidato.nombre !== producto.nombre).slice(0, 10);

  // Product (sin precio) + BreadcrumbList — auditoría SEO M2, ver
  // lib/datosEstructurados.js.
  const nombreSeccion = seccion === 'fiesta' ? (locale === 'es' ? 'Atelier Fiesta' : 'Eveningwear atelier') : (locale === 'es' ? 'Atelier Novias' : 'Bridal atelier');
  // Nombre para enseñar: sin el número de temporada de la colección
  // ("Look 27 26_Opaline" -> "Look 27 Opaline", ver lib/nombreColeccion.js).
  // producto.nombre completo sigue dando el slug de la URL.
  const nombreVisible = sinNumeroColeccion(producto.nombre);

  const jsonLd = [
    productoJsonLd({
      nombre: nombreVisible,
      descripcion,
      imagenes: producto.imagenes?.length ? producto.imagenes : [producto.imagen],
      sku: producto.sku,
      url: `/${locale}/atelier/${seccion}/${slug}`,
    }),
    migas([
      { nombre: 'Fely Campo', ruta: `/${locale}` },
      { nombre: 'Atelier', ruta: `/${locale}/atelier` },
      { nombre: nombreSeccion, ruta: `/${locale}/atelier/${seccion}` },
      { nombre: nombreVisible },
    ]),
  ];

  return (
    <FichaAtelierCuerpo
      producto={producto}
      nombreVisible={nombreVisible}
      descripcion={descripcion}
      relacionados={relacionados}
      seccion={seccion}
      locale={locale}
      textos={textos}
      antes={<JsonLd datos={jsonLd} />}
    />
  );
}

export default FichaProductoAtelier;
