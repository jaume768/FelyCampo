/* Ruta DINÁMICA: una plantilla para TODOS los productos.
   /pret-a-porter/falda-basilea... El parámetro llega en params.producto
   — el slug de "nombre" (ver src/lib/slugify.js), mismo algoritmo que
   usa TarjetaProducto para enlazar aquí. Busca en los productos de
   Prêt-à-porter (lib/pretAPorter.js, los mismos que edita
   /admin/productos/pret-a-porter); si la URL es la antigua de un producto
   renombrado, redirige (301) a la nueva.

   Sin precio ni tallas (a petición explícita, mismo criterio que
   Atelier): ni "producto.precio" ni "producto.tallas"/"agotadas" se
   pasan ya a GaleriaProducto/FichaProductoAcciones — ver el detalle
   completo en FichaProductoAcciones.jsx.

   Lo que se ve lo pinta FichaTiendaCuerpo.jsx. Con
   ?previa=pret-a-porter-producto se pinta el borrador del admin
   (PreviaFichaTienda.jsx); sin indexar. */

import dynamic from 'next/dynamic';
import { permanentRedirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { tiendaProductos } from '@/components/layout/tiendaProductos';
import { JsonLd } from '@/components/ui';
import { producto as productoJsonLd, migas } from '@/lib/datosEstructurados';
import { ID_PREVIA_PRODUCTO, buscarProductoPretAPorter } from '@/lib/pretAPorter';
import { PARAMETRO_PREVIA } from '@/lib/previa';
import { metadataPagina, recortar } from '@/lib/seo';
import FichaTiendaCuerpo from './FichaTiendaCuerpo';

// Solo se carga al abrir la vista previa (no pesa en las fichas normales).
const PreviaFichaTienda = dynamic(() => import('./PreviaFichaTienda'));

// Páginas de listado reales (Prêt-à-porter + categorías, Atelier + sus
// 3 secciones) — mismo criterio que RUTAS_CON_PRODUCT_HERO en
// src/app/[locale]/layout.js, para reconocer desde qué categoría llegó
// la visita (ver "Sigue explorando" más abajo) a partir del Referer.
const RUTAS_TIENDA = ['/pret-a-porter'];
const RUTAS_ATELIER = ['/atelier', '/atelier/novias', '/atelier/fiesta', '/atelier/vosotras'];

const enPrevia = async (searchParams) => (await searchParams)?.[PARAMETRO_PREVIA] === ID_PREVIA_PRODUCTO;

export async function generateMetadata({ params, searchParams }) {
  const { locale, producto: slug } = await params;
  setRequestLocale(locale);
  if (await enPrevia(searchParams)) return { robots: { index: false, follow: false } };
  const { producto } = buscarProductoPretAPorter(slug, tiendaProductos);
  if (!producto) return {};

  const esEs = locale === 'es';
  // Productos sin "descripcion": base generada con nombre + color en vez
  // de concatenar "undefined" (auditoría SEO B3) — así la meta sigue
  // siendo única por ficha.
  const color = producto.colores?.[0]?.nombre;
  const descripcion = esEs ? producto.descripcion : (producto.descripcionEn || producto.descripcion);
  const base = descripcion || (esEs
    ? `${producto.nombre}${color ? ` en color ${color.toLowerCase()}` : ''}, de la colección de prêt-à-porter de Fely Campo.`
    // En inglés sin color: los nombres de color del catálogo solo
    // existen en español ("negro", "ciruela"...).
    : `${producto.nombre}, from the Fely Campo ready-to-wear collection.`);
  return metadataPagina({
    locale,
    ruta: `/pret-a-porter/${slug}`,
    titulo: `${producto.nombre} | ${esEs ? 'Prêt-à-porter' : 'Ready-to-wear'} Fely Campo`,
    descripcion: recortar(`${base} ${esEs ? 'Diseñada y confeccionada en Salamanca. Pide información en Fely Campo.' : 'Designed and made in Salamanca. Ask Fely Campo about it.'}`),
    imagen: producto.imagen,
    tipo: 'website',
  });
}

export default async function FichaProducto({ params, searchParams }) {
  const { locale, producto: slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('producto');

  // "Sigue explorando" (debajo de ProductosRecomendados): vuelve a la
  // categoría de la que vino la visita, leyendo el Referer del navegador
  // — más fiable que "producto.categoria" (llevaría a la categoría real
  // del producto, no a la página de la que vino de verdad la visita: pudo
  // llegar aquí desde /pret-a-porter, un enlace externo, o buscador). Sin
  // Referer reconocible (visita directa, marcador, fuera del sitio), cae
  // a /pret-a-porter como categoría por defecto.
  const referer = (await headers()).get('referer') || '';
  let rutaOrigen = null;
  try {
    rutaOrigen = new URL(referer).pathname.replace(new RegExp(`^/${locale}`), '') || '/';
  } catch {
    rutaOrigen = null;
  }
  const esOrigenAtelier = rutaOrigen && RUTAS_ATELIER.includes(rutaOrigen);
  const esOrigenTienda = rutaOrigen && RUTAS_TIENDA.includes(rutaOrigen);
  const hrefSeguirExplorando = esOrigenAtelier || esOrigenTienda ? `/${locale}${rutaOrigen}` : `/${locale}/pret-a-porter`;
  const keySeguirExplorando = esOrigenAtelier ? 'seguirExplorandoAtelier' : 'seguirExplorandoTienda';

  // Textos generales del desplegable «Composición»: los usa la ficha
  // cuando el producto no trae los suyos (FichaTiendaCuerpo.jsx).
  // ("Envíos y devoluciones" quitado a petición, 2026-11-04: no habrá
  // envíos ni devoluciones.)
  const textos = {
    composicion: {
      titulo: t('composicion'),
      texto: t('composicionTexto'),
      disenado: t('origenDisenado'),
      // "nuestros talleres" enlaza a /talleres-fely-campo (a petición).
      fabricado: t.rich('origenFabricado', { talleres: (chunks) => <a href={`/${locale}/talleres-fely-campo`} className="enlace-texto">{chunks}</a> }),
      etiquetaDisenado: t('etiquetaDisenado'),
      etiquetaFabricado: t('etiquetaFabricado'),
    },
    seguirExplorando: t(keySeguirExplorando),
  };

  if (await enPrevia(searchParams)) {
    return <PreviaFichaTienda locale={locale} textos={textos} publicados={tiendaProductos} hrefSeguirExplorando={hrefSeguirExplorando} />;
  }

  const { producto, redirigirA } = buscarProductoPretAPorter(slug, tiendaProductos);
  if (redirigirA) permanentRedirect(`/${locale}/pret-a-porter/${redirigirA}`);
  if (!producto) permanentRedirect(`/${locale}/pret-a-porter`); // slug inexistente: al listado (ninguna URL en 404)

  // Mismo catálogo, excluyendo el producto actual — hasta 10, la misma
  // cantidad que espera ProductosRecomendados en su carrusel.
  const relacionados = tiendaProductos.filter((candidato) => candidato.nombre !== producto.nombre).slice(0, 10);
  const descripcion = locale === 'en' && producto.descripcionEn ? producto.descripcionEn : producto.descripcion;

  return (
    <FichaTiendaCuerpo
      producto={producto}
      descripcion={descripcion}
      locale={locale}
      relacionados={relacionados}
      textos={textos}
      hrefSeguirExplorando={hrefSeguirExplorando}
      antes={(
        // Product (sin precio: la web no muestra precios) + BreadcrumbList
        // — auditoría SEO M2, ver lib/datosEstructurados.js.
        <JsonLd
          datos={[
            productoJsonLd({
              nombre: producto.nombre,
              descripcion,
              imagenes: producto.imagenes || [producto.imagen],
              sku: producto.sku,
              url: `/${locale}/pret-a-porter/${slug}`,
            }),
            migas([
              { nombre: 'Fely Campo', ruta: `/${locale}` },
              { nombre: 'Prêt-à-porter', ruta: `/${locale}/pret-a-porter` },
              { nombre: producto.nombre },
            ]),
          ]}
        />
      )}
    />
  );
}
