// CabeceraSeccion.jsx

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './CabeceraSeccion.module.css';
import collectionTitleStyles from './CollectionTitle.module.css';

/**
 * Cabecera de sección: grupo título (subtítulo pequeño opcional +
 * título grande + descripción opcional, apilados) seguido de
 * contenido libre vía children, p.ej. un <Boton variante="flecha">.
 * Todo centrado en columna. No pinta nada de children si no hay.
 *
 * Reutilizada por CuadriculaProductos (children = Boton "Ver más" +
 * toggle de densidad) — antes tenía su propia copia de este layout.
 *
 * "alinear" ('end' por defecto): alineación vertical — 'end' pega
 * todo a la base, 'start' lo pega arriba (ej. páginas de catálogo de
 * Tienda/Atelier, con el toggle de densidad de CuadriculaProductos).
 *
 * "enCuadricula": usa la clase .cabeceraProductos (mismo CSS que
 * .cabecera) en vez de .cabecera — la pasa CuadriculaProductos, único
 * consumidor que la necesita distinguida en el DOM. Combinada con
 * alinear="start" (única combinación que usa CuadriculaProductos en
 * "grid"), la cabecera pasa a ser una fila de 3: "before", el grupo
 * título (70% de ancho en escritorio) y "children" — ver
 * .cabeceraProductos.cabeceraInicio en CabeceraSeccion.module.css.
 *
 * "before" (opcional): contenido libre ANTES del grupo título — solo
 * lo usa CuadriculaProductos en "grid" (el botón "Filtros").
 *
 * "breadcrumbItems" (opcional, array de {key, href}): sustituye el
 * subtítulo por una miga de pan real ("Atelier / Novias", cada tramo
 * un <Link> a "href") en vez de texto suelto — usado por
 * CuadriculaProductos cuando la página se sirve para una categoría
 * concreta (prop "categoriaActiva" ahí, resuelta en el Server
 * Component de la página a partir de la URL, no en el cliente: así la
 * miga de pan sale ya en el HTML servido, no solo tras hidratar —
 * importa para que un buscador la vea), momento en el que "titleKey"
 * pasa a ser el nombre de esa categoría en vez del título normal de la
 * colección. Semántica real (<nav>/<ol>), no solo visual: cada tramo
 * es un enlace salvo que sea el único elemento. Ignora "subtitleKey"
 * si está presente.
 *
 * "margenSuperiorAmplio" (opcional, false por defecto): margin-top
 * var(--spacing-6) en vez del var(--spacing-4) normal de .cabecera —
 * la pasa /atelier/vosotras/page.js, único consumidor (sin
 * ProductHero encima que ya aporte separación propia, a diferencia de
 * Novias/Fiesta).
 *
 * Uso:
 *   <CabeceraSeccion titleKey="cuadriculaProductos.novedades">
 *     <Boton variante="flecha" href="/coleccion">Ver colección</Boton>
 *   </CabeceraSeccion>
 */
function CabeceraSeccion({ subtitleKey, titleKey, descriptionKey, breadcrumbItems, children, before, alinear = 'end', enCuadricula = false, margenSuperiorAmplio = false }) {
  const t = useTranslations();

  const claseCabecera = enCuadricula ? styles.cabeceraProductos : styles.cabecera;

  return (
    <div className={`${claseCabecera} ${alinear === 'start' ? styles.cabeceraInicio : ''} ${margenSuperiorAmplio ? styles.margenSuperiorAmplio : ''}`}>
      {before}
      <div className={styles.tituloGrupo}>
        {breadcrumbItems ? (
          <nav aria-label={t('breadcrumb.ariaLabel')} className={styles.subtitle}>
            <ol className={styles.migaLista}>
              {breadcrumbItems.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href}>{t(key)}</Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          subtitleKey && <h2 className={styles.subtitle}>{t(subtitleKey)}</h2>
        )}
        <p className={collectionTitleStyles.titulo}>{t(titleKey)}</p>
        {descriptionKey && <p className={styles.descripcion}>{t(descriptionKey)}</p>}
      </div>
      {children}
    </div>
  );
}

export default CabeceraSeccion;
