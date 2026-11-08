// SobreFelyContenido.jsx

'use client';

/* ============================================================
   CONTENIDO DE /sobre-fely — Fely Campo
   "Una vida entre telas": hero (HeroPagina) → capítulos de biografía
   (título + subtítulo + texto y sus fotos, sobre el grid de 24 columnas
   de Descubre a Fely, foto alternando de lado) → cierre → tarjeta del
   documental (TarjetaEnlaceExterno).
   Los datos llegan de page.js (lib/sobreFely.js, editables en
   /admin/paginas/sobre-fely). Componente cliente solo por la vista
   previa del admin (usePrevia): sin ?previa=sobre-fely, pinta lo
   publicado, igual que antes. Cada bloque aparece con scroll (<EnVista>).
   ============================================================ */

import HeroPagina from '@/components/layout/HeroPagina';
import TarjetaEnlaceExterno from '@/components/layout/TarjetaEnlaceExterno';
import usePrevia from '@/components/layout/usePrevia';
import BarraPrevia from '@/components/layout/BarraPrevia';
import { EnVista } from '@/components/ui';
import { parrafosEn, textoEn } from '@/lib/previa';
import { EDITOR_SOBRE_FELY, ID_PAGINA_SOBRE_FELY, opcionalesSobreFely } from '@/lib/sobreFely';
import styles from './page.module.css';
import { srcSetDe } from '@/lib/imagenes';

// Foto + pie de imagen propio (si lo trae). .marco es el recuadro de la
// foto; el pie va fuera de él, debajo.
function Figura({ foto, alt, locale }) {
  const pie = textoEn(foto.pie, locale);
  return (
    <EnVista as="figure" className={styles.figura}>
      <div className={styles.marco}>
        <img src={foto.src} srcSet={srcSetDe(foto.src)} sizes="(max-width: 768px) 100vw, 50vw" alt={pie || alt} className={styles.imagen} loading="lazy" decoding="async" />
      </div>
      {pie && <figcaption className={styles.pie}>{pie}</figcaption>}
    </EnVista>
  );
}

// Capítulo sobre el grid de 24 columnas: foto principal en una mitad y
// texto en la otra, alternando de lado ("invertido" en los pares). Fotos
// extra: una sola va debajo del texto, en su misma columna; dos o más, en
// filas de dos debajo (una por mitad; si sobra una, centrada).
function Capitulo({ capitulo, indice, locale }) {
  const etiqueta = textoEn(capitulo.etiqueta, locale);
  const alt = `Fely Campo — ${etiqueta}`;
  const [principal, ...extras] = capitulo.imagenes;
  const extraJuntoAlTexto = extras.length === 1 ? extras[0] : null;
  const extrasEnFila = extras.length >= 2 ? extras : [];

  return (
    <article
      id={capitulo.id}
      className={`${styles.capitulo} ${indice % 2 === 1 ? styles.invertido : ''}`}
    >
      <div className={styles.principal}>
        {principal && <Figura foto={principal} alt={alt} locale={locale} />}
      </div>

      <div className={styles.lado}>
        <EnVista className={styles.texto}>
          <h2 className={styles.titulo}>{etiqueta}</h2>
          <p className={styles.subtitulo}>{textoEn(capitulo.titulo, locale)}</p>
          {parrafosEn(capitulo.parrafos, locale).map((parrafo) => (
            <p key={parrafo} className={styles.parrafo}>{parrafo}</p>
          ))}
        </EnVista>

        {extraJuntoAlTexto && (
          <div className={styles.extraTexto}>
            <Figura foto={extraJuntoAlTexto} alt={alt} locale={locale} />
          </div>
        )}
      </div>

      {extrasEnFila.length > 0 && (
        <div className={styles.pareja}>
          {extrasEnFila.map((foto) => (
            <Figura key={foto.src} foto={foto} alt={alt} locale={locale} />
          ))}
        </div>
      )}
    </article>
  );
}

function SobreFelyContenido({ publicado, locale }) {
  const { datos, enPrevia } = usePrevia(ID_PAGINA_SOBRE_FELY, publicado, opcionalesSobreFely(publicado));
  const {
    hero, capitulos, cierre, documental,
  } = datos;

  return (
    <section>
      {/* fijarEnMobile: efecto "pin" en mobile (ver HeroPagina.jsx) — el
          .contenido que sigue lleva fondo opaco para taparla.
          heroEncuadre: en mobile centra el recorte en Fely (ver
          page.module.css). */}
      <HeroPagina
        imagen={hero.imagen}
        alt="Fely Campo"
        titulo={textoEn(hero.titulo, locale)}
        subtitulo={textoEn(hero.subtitulo, locale)}
        fijarEnMobile
        className={styles.heroEncuadre}
      />

      <div className={styles.contenido}>
        <div className={`contenedor ${styles.capitulos}`}>
          {capitulos.map((capitulo, indice) => (
            <Capitulo key={capitulo.id} capitulo={capitulo} indice={indice} locale={locale} />
          ))}
        </div>

        <EnVista className={styles.cierre}>
          <h2 className={styles.cierreTitulo}>{textoEn(cierre.titulo, locale)}</h2>
          {parrafosEn(cierre.parrafos, locale).map((parrafo) => (
            <p key={parrafo} className={styles.cierreParrafo}>{parrafo}</p>
          ))}
        </EnVista>

        <div className="contenedor">
          <div className={styles.enlacesExternos}>
            <div className={styles.enlaceExternoDestacado}>
              <TarjetaEnlaceExterno
                href={documental.enlace}
                titulo={textoEn(documental.titulo, locale)}
                meta={textoEn(documental.texto, locale)}
                imagen={documental.imagen}
                alt={textoEn(documental.titulo, locale)}
              />
            </div>
          </div>
        </div>
      </div>

      {enPrevia && <BarraPrevia editor={EDITOR_SOBRE_FELY} />}
    </section>
  );
}

export default SobreFelyContenido;
