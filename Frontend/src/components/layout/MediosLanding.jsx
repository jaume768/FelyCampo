// MediosLanding.jsx

'use client';

/* ============================================================
   CONTENIDO EDITABLE DE LA LANDING — Fely Campo
   El carrusel de portada (HeroCarousel), el bloque Atelier (SplitMedia
   Novias | Fiesta) y "Descubre a Fely", con las fotos, el vídeo, los
   textos y los enlaces de lib/landing.js (los que se editan en
   /admin/landing), en el idioma de la página.
   VISTA PREVIA (como en WordPress): si la URL lleva ?previa=landing, se
   pintan los cambios sin publicar que el admin dejó en localStorage, con
   una barra que avisa de que es un simulacro. Si el editor sigue
   abierto, la vista previa se actualiza sola al pulsar de nuevo
   "Vista previa". Los visitantes nunca ven esto: sin el parámetro y sin
   el borrador en su propio navegador, se ve lo publicado.
   Los estilos de "Descubre a Fely" siguen en app/[locale]/page.module.css
   y llegan por "estilosDescubre".
   ============================================================ */

import { Fragment } from 'react';
import {
  OPCIONALES_LANDING, PARAMETRO_PREVIA_LANDING, enlaceEn, slidesHeroLanding, textoEn,
} from '@/lib/landing';
import { Boton, EnVista } from '@/components/ui';
import HeroCarousel from './HeroCarousel';
import SplitMedia from './SplitMedia';
import usePrevia from './usePrevia';
import BarraPrevia from './BarraPrevia';
import { atributosImagen } from '@/lib/imagenes';

// "*texto*" → <em>texto</em> (la cita de Fely lleva partes en cursiva).
function conCursivas(texto) {
  return texto.split(/\*([^*]+)\*/g).map((parte, indice) => (
    // eslint-disable-next-line react/no-array-index-key
    indice % 2 === 1 ? <em key={indice}>{parte}</em> : <Fragment key={indice}>{parte}</Fragment>
  ));
}

function MediosLanding({
  landing, locale, claseSeccion, estilosDescubre: d,
}) {
  const { datos, enPrevia } = usePrevia(PARAMETRO_PREVIA_LANDING, landing, OPCIONALES_LANDING);

  const { atelier, descubre } = datos;
  const pieza = (bloque) => ({
    src: bloque.imagen,
    tipo: 'imagen',
    titulo: textoEn(bloque.titulo, locale),
    cta: textoEn(bloque.boton, locale),
    href: enlaceEn(bloque.enlace, locale),
  });

  return (
    <>
      {/* key: al cambiar de foto o vídeo, el carrusel empieza de cero. */}
      <HeroCarousel key={JSON.stringify(datos.hero)} slides={slidesHeroLanding(datos, locale)} />

      <section className={claseSeccion}>
        <SplitMedia variante="landing" items={[pieza(atelier.novias), pieza(atelier.fiesta)]} />
      </section>

      {/* "Descubre a Fely" — misma estructura y estilos que las tarjetas de
          /visita-fely-campo: a la izquierda la foto de Fely, a la derecha
          el título, la cita y el botón. Aparece con scroll (<EnVista>). */}
      <section className={d.descubreFely}>
        <EnVista as="article" className={d.descubreFelyTarjeta}>
          <div className={d.descubreFelyGaleria}>
            <img {...atributosImagen(descubre.imagen, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt="Fely Campo" className={d.descubreFelyImagen} />
          </div>

          <div className={d.descubreFelyFila}>
            <div className={d.descubreFelyBloque}>
              <div className={d.descubreFelyInfo}>
                <p className={d.descubreFelyTitulo}>{textoEn(descubre.titulo, locale)}</p>
                <blockquote className={d.descubreFelyCita}>
                  <p>{conCursivas(textoEn(descubre.cita, locale))}</p>
                </blockquote>
              </div>

              <div className={d.descubreFelyAcciones}>
                <Boton variante="texto" href={enlaceEn(descubre.enlace, locale)}>{textoEn(descubre.boton, locale)}</Boton>
              </div>
            </div>
          </div>
        </EnVista>
      </section>

      {enPrevia && <BarraPrevia editor="/admin/landing" />}
    </>
  );
}

export default MediosLanding;
