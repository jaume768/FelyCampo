/* Ficha de producto — datos REALES de GET /api/v1/catalog/products/{slug}/.
   `params.producto` es el slug que da la API (`vestido-aria-ve-770`), no el
   derivado del nombre: TarjetaProducto lo enlaza con el slug real.

   Server Component: SEO y velocidad, por la red interna de Docker. */

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { ProductosRecomendados, ResenasClientes, ListadoError } from '@/components/layout';
import { RESENAS_EJEMPLO } from '@/components/layout/resenasEjemplo';
import { FichaProductoAcciones, GaleriaProducto, LookPasarela } from '@/components/ecommerce';
import { Acordeon, FilaAcordeon, Boton } from '@/components/ui';

import { catalog } from '@/lib/api/endpoints';
import { adaptarProductoFicha, adaptarPaginaProductos } from '@/lib/api/adapters';
import { ApiError } from '@/lib/api/errors';
import { conValorPorDefecto } from '@/lib/api/client';

import styles from './page.module.css';

// Páginas de listado reales — mismo criterio que RUTAS_CON_PRODUCT_HERO en
// src/app/[locale]/layout.js, para reconocer desde qué categoría llegó la visita.
const RUTAS_TIENDA = ['/tienda', '/tienda/tops-y-camisetas', '/tienda/chaquetas-y-abrigos', '/tienda/faldas', '/tienda/vestidos', '/tienda/zapatos', '/tienda/accesorios'];
const RUTAS_ATELIER = ['/atelier', '/atelier/novias', '/atelier/fiesta', '/atelier/vosotras'];

export async function generateMetadata({ params }) {
  const { locale, producto: slug } = await params;
  try {
    const datos = await catalog.obtenerProducto(slug, { next: { revalidate: 60 } });
    const ficha = adaptarProductoFicha(datos, locale);
    return { title: ficha.nombre, description: ficha.descripcion || undefined };
  } catch {
    // Sin metadatos no se rompe la página: el 404 lo decide el propio componente.
    return {};
  }
}

export default async function FichaProducto({ params }) {
  const { locale, producto: slug } = await params;
  const t = await getTranslations('producto');

  const tErrores = await getTranslations('errores');

  let datos;
  try {
    datos = await catalog.obtenerProducto(slug, { next: { revalidate: 60 } });
  } catch (error) {
    // 404 REAL de Next cuando el slug no existe, no una página vacía: así el buscador
    // recibe el código correcto y el usuario ve la página de "no encontrado" del sitio.
    if (error instanceof ApiError && error.isNotFound) notFound();

    // El resto de fallos (backend caído) se pintan AQUÍ, no en un error.js de segmento:
    // un límite de error captura también la excepción de `notFound()`, y entonces un slug
    // inexistente respondía 200 con "no hemos podido cargar" en vez del 404 que toca.
    if (error instanceof ApiError) {
      return (
        <section className="seccion contenedor">
          <ListadoError titulo={tErrores('catalogoTitulo')} mensaje={tErrores('catalogoTexto')} />
        </section>
      );
    }
    throw error;
  }

  const producto = adaptarProductoFicha(datos, locale);

  // Relacionados: misma familia, excluyendo el actual. Es un bloque secundario, así que
  // si la API falla se queda vacío en vez de tumbar la ficha entera.
  const paginaRelacionados = await conValorPorDefecto(
    catalog.listarProductos(
      { family: producto.familia?.slug, page_size: 11, line: producto.line },
      { next: { revalidate: 60 } }
    ),
    { results: [], count: 0, next: null }
  );
  const relacionados = adaptarPaginaProductos(paginaRelacionados, locale)
    .productos.filter((candidato) => candidato.slug !== producto.slug)
    .slice(0, 10);

  // "Sigue explorando": vuelve a la categoría de la que vino la visita, leyendo el
  // Referer. Con datos reales ya hay `familia`, pero el Referer sigue siendo la única
  // forma de distinguir si llegó desde Tienda o desde Atelier.
  const referer = (await headers()).get('referer') || '';
  let rutaOrigen = null;
  try {
    rutaOrigen = new URL(referer).pathname.replace(new RegExp(`^/${locale}`), '') || '/';
  } catch {
    rutaOrigen = null;
  }
  const esOrigenAtelier = rutaOrigen && RUTAS_ATELIER.includes(rutaOrigen);
  const esOrigenTienda = rutaOrigen && RUTAS_TIENDA.includes(rutaOrigen);
  const hrefSeguirExplorando = esOrigenAtelier || esOrigenTienda ? `/${locale}${rutaOrigen}` : `/${locale}/tienda`;
  const keySeguirExplorando = esOrigenAtelier ? 'seguirExplorandoAtelier' : 'seguirExplorandoTienda';

  return (
    <section className="seccion contenedor">
      <div className={styles.ficha}>
        <GaleriaProducto
          imagenes={producto.imagenes}
          alt={producto.alt}
          nombre={producto.nombre}
          precio={producto.precio}
          colores={producto.colores}
          tallas={producto.tallas}
          esAtelier={producto.soloConsulta}
        />

        <div className={styles.info}>
          <div className={styles.cabecera}>
            <h1 className={styles.nombre}>{producto.nombre}</h1>
            {/* Las piezas de solo consulta no muestran precio: van por consulta, no por
                carrito (sale_mode: "on_request"). */}
            {!producto.soloConsulta && <p className={styles.precio}>{producto.precio}</p>}
            <p className={styles.descripcion}>{producto.descripcion}</p>
          </div>

          <FichaProductoAcciones
            nombre={producto.nombre}
            precio={producto.precio}
            imagen={producto.imagen}
            colores={producto.colores}
            tallas={producto.tallas}
            tallasAgotadas={producto.tallasAgotadas}
            colorways={producto.colorways}
            soloConsulta={producto.soloConsulta}
            productoId={producto.id}
          />

          <Acordeon>
            <FilaAcordeon titulo={t('composicion')}>
              {/* Composición y cuidados reales del producto; el texto genérico solo
                  cuando el producto no los trae rellenos. */}
              <p>{producto.composicion || t('composicionTexto')}</p>
              {producto.cuidados && <p>{producto.cuidados}</p>}
              <div>
                <p>{t('origenDisenado')}</p>
                <p>{t('origenFabricado')}</p>
                <p>{t('origenTintura')}</p>
                <p>{t('origenTejido')}</p>
              </div>
            </FilaAcordeon>
            <FilaAcordeon titulo={t('envios')}>
              <div>
                <p>{t('enviosSubtitulo')}</p>
                <p>{t('entregaEstimada')}</p>
              </div>
              <div>
                <p>{t('devolucionesSubtitulo')}</p>
                <p>
                  {t.rich('devolucionesTexto', {
                    email: (chunks) => <a href="mailto:info@felycampo.com" className="enlace-texto">{chunks}</a>,
                    telefono: (chunks) => <a href="tel:+34683703644" className="enlace-texto">{chunks}</a>,
                    atencion: (chunks) => <a href={`/${locale}/ayuda/atencion-cliente`} className="enlace-texto">{chunks}</a>,
                  })}
                </p>
              </div>
            </FilaAcordeon>
          </Acordeon>

          {/* PLACEHOLDER a propósito, ver LookPasarela.jsx — imagen fija, sin lógica de
              selección: no existe el modelo `Look` en el backend (docs/CONTRATO.md, C-3). */}
          <LookPasarela
            titulo={t('runwayLook')}
            imagen="/img/collections/runway/fw27-lacoleccion/FelyCampo_01.webp"
            alt={t('runwayLook')}
          />
        </div>
      </div>

      <div className={styles.debajoFicha}>
        {/* DATOS DE EJEMPLO: no existe modelo `Review` en el backend (docs/CONTRATO.md, C-1). */}
        <ResenasClientes resenas={RESENAS_EJEMPLO} />

        {relacionados.length > 0 && (
          <>
            <ProductosRecomendados productos={relacionados} />
            <div className={styles.seguirExplorando}>
              <Boton variante="solido" href={hrefSeguirExplorando}>{t(keySeguirExplorando)}</Boton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
