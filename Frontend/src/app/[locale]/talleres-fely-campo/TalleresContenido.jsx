// TalleresContenido.jsx

'use client';

/* ============================================================
   CONTENIDO DE /talleres-fely-campo — Fely Campo
   Hero común (HeroPagina — título + el lema de subtítulo) +
   ListadoTalleres: entradilla (lema de título, intro de texto, filtros
   "Ver todo" + uno por taller) y la lista de talleres, cada uno con su
   carrusel de fotos/vídeo (CarruselImagenes) y su texto.
   Los datos llegan de page.js (lib/talleres.js, editables en
   /admin/paginas/talleres). Componente cliente solo por la vista previa
   del admin (usePrevia): sin ?previa=talleres, pinta lo publicado.
   ============================================================ */

import HeroPagina from '@/components/layout/HeroPagina';
import usePrevia from '@/components/layout/usePrevia';
import BarraPrevia from '@/components/layout/BarraPrevia';
import { CarruselImagenes } from '@/components/ui';
import { parrafosEn, textoEn } from '@/lib/previa';
import {
  EDITOR_TALLERES, ID_PAGINA_TALLERES, esVideoTaller, opcionalesTalleres,
} from '@/lib/talleres';
import ListadoTalleres from './ListadoTalleres';
import styles from './page.module.css';
import { srcSetDe } from '@/lib/imagenes';
import VideoDiferido from '@/components/ui/VideoDiferido';

function TalleresContenido({ publicado, locale, etiquetaTodo }) {
  const { datos, enPrevia } = usePrevia(ID_PAGINA_TALLERES, publicado, opcionalesTalleres(publicado));
  const { hero } = datos;
  const lema = textoEn(hero.lema, locale);

  // Un taller por fila (ver .grid): el carrusel arriba y .info debajo.
  // loading="lazy" en todas las fotos salvo la primera del primer taller
  // (ya visible al cargar), para no descargar todos los carruseles de golpe.
  const talleres = datos.talleres.map((taller, indiceTaller) => {
    const nombre = textoEn(taller.nombre, locale);
    const responsable = textoEn(taller.responsable, locale);
    return {
      id: taller.id,
      etiqueta: nombre,
      contenido: (
        <li className={styles.taller}>
          {/* Sin fotos: un único bloque gris en vez del carrusel. */}
          {taller.medios.length > 0 ? (
            <CarruselImagenes className={styles.imagenes}>
              {taller.medios.map((src, indiceMedio) => (
                <div key={src} className={styles.marco}>
                  {esVideoTaller(src) ? (
                    <VideoDiferido src={src} className={styles.imagen} />
                  ) : (
                    <img
                      src={src} srcSet={srcSetDe(src)} sizes="(max-width: 768px) 100vw, 50vw"
                      alt=""
                      className={styles.imagen}
                      loading={indiceTaller === 0 && indiceMedio === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  )}
                </div>
              ))}
            </CarruselImagenes>
          ) : (
            <div className={styles.imagenes}>
              <div className={styles.marcoVacio} aria-hidden="true" />
            </div>
          )}

          <div className={styles.info}>
            <div className={styles.infoContenido}>
              <div className={styles.meta}>
                <p>{nombre}</p>
                <p>{textoEn(taller.ubicacion, locale)}</p>
                {responsable && <p>{responsable}</p>}
              </div>

              <div className={styles.texto}>
                {parrafosEn(taller.parrafos, locale).map((parrafo) => (
                  <p key={parrafo}>{parrafo}</p>
                ))}
              </div>
            </div>
          </div>
        </li>
      ),
    };
  });

  return (
    <section className="seccion">
      <HeroPagina
        imagen={hero.imagen}
        alt={textoEn(hero.titulo, locale)}
        titulo={textoEn(hero.titulo, locale)}
        subtitulo={lema}
      />

      {/* Entradilla (mismo esquema que /blog: título = el lema, texto = la
          intro, filtros "Ver todo" + uno por taller) y la lista de
          talleres — ver ListadoTalleres.jsx. */}
      <ListadoTalleres
        titulo={lema}
        texto={parrafosEn(hero.intro, locale).join('\n\n')}
        etiquetaTodo={etiquetaTodo}
        talleres={talleres}
      />

      {enPrevia && <BarraPrevia editor={EDITOR_TALLERES} />}
    </section>
  );
}

export default TalleresContenido;
