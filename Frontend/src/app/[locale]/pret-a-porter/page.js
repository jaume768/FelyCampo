/* Ruta: /pret-a-porter — catálogo real (ver tiendaProductos.js), todas las
   categorías juntas sin filtrar (cada una tiene su propia página, ver
   tienda/{categoria}/page.js).

   Hero + título: mismo patrón que atelier/novias/page.js y
   atelier/fiesta/page.js (ver ahí el detalle completo) — .hero con
   RunwayMediaLateral, data-navbar-hero, + .textoDescripcion con
   .textoRow, en vez del ProductHero sin título que llevaba antes.
   "nombre"/"temporada" son "Fely Campo"/"Prêt-à-porter"
   (catalogo.subtituloFelyCampo/tituloTienda), el mismo par que ya usa
   CuadriculaProductos como subtítulo/título antes de la cuadrícula.

   Antes de la cuadrícula, mismo patrón editorial que esas dos páginas:
   RunwayDescripcion dentro de .textoDescripcion + dos BloqueSeccion en
   zigzag + RunwayBackstage (antes en pretAPorterEditorial.js; hoy la
   portada y la descripción salen de lib/atelierEditorial.js) —
   ahora los BloqueSeccion están comentados y RunwayBackstage quitado
   (a petición), solo queda la descripción. A
   diferencia de Novias/Fiesta, aquí la cuadrícula de producto NO se
   comenta — sigue al final de la página, sin tocar (a petición
   explícita: "todas las imágenes de producto al final").

   "ocultarPrecio" (a petición explícita): Prêt-à-porter deja de
   enseñar precio de catálogo, mismo criterio que Atelier (Novias/
   Fiesta) — ver comentario de esa prop en CuadriculaProductos.jsx.
   La ficha de producto (ver FichaProductoAcciones.jsx) tampoco lo
   enseña ya. */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CuadriculaProductos } from '@/components/layout';
import { tiendaProductos } from '@/components/layout/tiendaProductos';
import { obtenerEditorialPretAPorter } from '@/lib/atelierEditorial';
import PretAPorterCabecera from './PretAPorterCabecera';
import styles from './page.module.css';
import { metadataPagina, textosSeo } from '@/lib/seo';
import { cargarContenido } from '@/lib/contenidoServidor';

// Foto de pasarela FW27 junto a su producto en la cuadrícula (ver
// "imagenEditorial" en CuadriculaProductos.jsx): misma ficha al hacer
// clic. Cada producto lleva la suya (o ninguna) en sus datos
// ("fotoPasarela" en datos/pretAPorter.js, editable en el admin), con
// "antes" si va delante del producto en vez de detrás — así decide en qué
// columna cae cada foto. El orden de la cuadrícula es el de los datos
// (se cambia arrastrando en /admin/productos/pret-a-porter).
const productosConPasarela = () => tiendaProductos().map((producto) => (producto.fotoPasarela
  ? { ...producto, imagenEditorial: producto.fotoPasarela.src, imagenEditorialAntes: Boolean(producto.fotoPasarela.antes) }
  : producto));

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/pret-a-porter' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const t = await getTranslations();

  return (
    <section className="seccion">
      <h1 className="sr-only">{textosSeo('/pret-a-porter', locale).h1}</h1>
      {/* Portada (carrusel), título y descripción: editables en el admin
          (Prêt-à-porter › Página de la web), con vista previa. */}
      <PretAPorterCabecera publicado={obtenerEditorialPretAPorter()} locale={locale} alt={t('catalogo.tituloTienda')} />

      {/* Los dos bloques de foto + texto que había aquí están quitados a
          petición (no visibles). */}

      <CuadriculaProductos
        productos={productosConPasarela()}
        disposicion="grid"
        // Cabecera (CabeceraSeccion) comentada a petición: sin "tituloKey"
        // CuadriculaProductos no la pinta (ni el botón de filtros, que va
        // dentro de ella).
        // tituloKey="catalogo.subtituloFelyCampo"
        // coleccionKey="catalogo.tituloTienda"
        // descriptionKey="cuadriculaProductos.novedadesDescripcion"
        ocultarSubtitulo
        ocultarPrecio
      />
    </section>
  );
}
