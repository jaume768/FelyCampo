// BlogArticulo.jsx

/* ============================================================
   ARTÍCULO DE BLOG — Fely Campo
   Ficha de un artículo en /blog/[entrada] (ver ese page.js), en dos
   mitades:
   1) Cabecera calcada de la ficha de colección de Runway
      (HeroPagina con "imagenCubierta", título y fecha; data-navbar-hero
      para que el Navbar transparente se vuelva sólido al salir de él —
      ver "esHeroBlog" en app/[locale]/layout.js). El enlace de
      "volver" va sobre el hero (solo icono). Sin categoría ni autor, a
      propósito.
   2) El cuerpo: una secuencia de bloques en el orden en que se escriben
      en el admin (/admin/blog). El texto siempre a --max-texto; las
      fotos, hasta --max-contenido, con su propio ancho sin recortar.

   ---------- Bloques ----------
   La forma exacta de cada uno está en src/datos/blog.js:
     texto      { tipo, texto: { es: [párrafos], en: [párrafos] } }
     subtitulo  { tipo, texto: { es, en } }
     foto       { tipo, src, alt, pie: { es, en } }
     fotos      { tipo, fotos: [{ src, alt, pie }] }  (2 a 4 columnas)
     cita       { tipo, texto: { es, en }, autor: { es, en } }
   Los textos respetan los saltos de línea y los espacios escritos en el
   admin (white-space: pre-wrap en el CSS).

   ---------- Uso ----------
     <BlogArticulo entrada={articulo} locale={locale} volverHref="/es/blog" volverTexto="Volver al blog" />
   ============================================================ */

import { altFoto } from '@/lib/blog';
import { parrafosEn, textoEn } from '@/lib/previa';
import HeroPagina from './HeroPagina';
import styles from './BlogArticulo.module.css';
import { atributosImagen } from '@/lib/imagenes';

// Agrupa cada tramo seguido de bloques "subtitulo"/"texto" en un único
// <div> (.seccion): un subtítulo y sus párrafos forman una sección de
// texto. El resto ("foto", "fotos", "cita") cierra la sección abierta y
// queda suelto, tal cual.
function agruparEnSecciones(bloques) {
  const items = [];
  let seccionActual = null;

  bloques.forEach((bloque) => {
    if (bloque.tipo === 'subtitulo' || bloque.tipo === 'texto') {
      if (!seccionActual) {
        seccionActual = { seccion: true, bloques: [] };
        items.push(seccionActual);
      }
      seccionActual.bloques.push(bloque);
    } else {
      seccionActual = null;
      items.push(bloque);
    }
  });

  return items;
}

// Un bloque "texto" son uno o varios párrafos.
function BloqueTexto({ bloque, locale }) {
  return parrafosEn(bloque.texto, locale).map((parrafo, indice) => (
    // eslint-disable-next-line react/no-array-index-key
    <p key={indice} className={styles.parrafo}>{parrafo}</p>
  ));
}

// Un subtítulo o una cita todavía vacíos (vista previa del admin) no se pintan.
function BloqueSubtitulo({ bloque, locale }) {
  const texto = textoEn(bloque.texto, locale);
  return texto ? <h2 className={styles.tituloSeccion}>{texto}</h2> : null;
}

function BloqueCita({ bloque, locale }) {
  const autor = textoEn(bloque.autor, locale);
  if (!textoEn(bloque.texto, locale)) return null;
  return (
    <blockquote className={styles.cita}>
      <p>{textoEn(bloque.texto, locale)}</p>
      {autor && <cite className={styles.citaAutor}>{autor}</cite>}
    </blockquote>
  );
}

function Pie({ foto, locale }) {
  const pie = textoEn(foto.pie, locale);
  return pie ? <figcaption className={styles.imagenCaption}>{pie}</figcaption> : null;
}

// Una foto sin subir todavía (vista previa del admin) no se pinta.
function BloqueFoto({ bloque, locale }) {
  if (!bloque.src) return null;
  return (
    <figure className={styles.imagenBloque}>
      <img {...atributosImagen(bloque.src, { sizes: '(max-width: 768px) 100vw, 70vw' })} alt={altFoto(bloque, locale)} />
      <Pie foto={bloque} locale={locale} />
    </figure>
  );
}

// Fotos una al lado de otra: tantas columnas como fotos (2 a 4).
function BloqueFotos({ bloque, locale }) {
  const fotos = bloque.fotos.filter((foto) => foto.src);
  if (fotos.length === 0) return null;
  const claseColumnas = styles[`galeria${fotos.length}`] || styles.galeria3;

  return (
    <div className={`${styles.galeria} ${claseColumnas}`}>
      {fotos.map((foto, indice) => (
        // eslint-disable-next-line react/no-array-index-key
        <figure key={indice} className={styles.galeriaItem}>
          <img {...atributosImagen(foto.src, { sizes: '(max-width: 768px) 100vw, 70vw' })} alt={altFoto(foto, locale)} />
          <Pie foto={foto} locale={locale} />
        </figure>
      ))}
    </div>
  );
}

function BlogArticulo({ entrada, locale, volverHref, volverTexto }) {
  const { imagenCubierta, titulo, fecha, bloques } = entrada;

  const fechaLegible = new Date(fecha).toLocaleDateString(locale === 'en' ? 'en-GB' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className={styles.pagina}>
      <HeroPagina
        imagen={imagenCubierta}
        alt={textoEn(titulo, locale)}
        titulo={textoEn(titulo, locale)}
        subtitulo={fechaLegible}
        extra={(
          <a href={volverHref} className={styles.volver} aria-label={volverTexto}>
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
              <path d="M8 1L1 8L8 15M1 8H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </a>
        )}
      />

      <div className={`${styles.cuerpo} contenedor`}>
        {agruparEnSecciones(bloques).map((item, indice) => {
          if (item.seccion) {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={indice} className={styles.seccion}>
                {item.bloques.map((bloque, i) => (
                  bloque.tipo === 'subtitulo'
                    ? <BloqueSubtitulo key={bloque.id || i} bloque={bloque} locale={locale} />
                    : <BloqueTexto key={bloque.id || i} bloque={bloque} locale={locale} />
                ))}
              </div>
            );
          }

          switch (item.tipo) {
            case 'cita':
              return <BloqueCita key={item.id || indice} bloque={item} locale={locale} />;
            case 'foto':
              return <BloqueFoto key={item.id || indice} bloque={item} locale={locale} />;
            case 'fotos':
              return <BloqueFotos key={item.id || indice} bloque={item} locale={locale} />;
            default:
              return null;
          }
        })}
      </div>
    </article>
  );
}

export default BlogArticulo;
