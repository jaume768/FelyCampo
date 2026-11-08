'use client';

/* ============================================================
   COLECCIÓN DE RUNWAY — lo que se ve, con vista previa — Fely Campo
   Hero → texto → backstage → looks → vídeo de cierre (ver page.js para
   el porqué de cada pieza). Pinta lo publicado o, con
   ?previa=runway-<slug> desde el admin, el borrador (usePrevia). Una
   colección nueva solo existe en la vista previa: sin borrador en este
   navegador, se vuelve al listado.
   "publicado": los datos de lib/runway.js (forma de datos/runway.js).
   ============================================================ */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BarraPrevia from '@/components/layout/BarraPrevia';
import HeroPagina from '@/components/layout/HeroPagina';
import RunwayBackstage from '@/components/layout/RunwayBackstage';
import RunwayDescripcion from '@/components/layout/RunwayDescripcion';
import RunwayGaleria from '@/components/layout/RunwayGaleria';
import RunwayVideoCierre from '@/components/layout/RunwayVideoCierre';
import usePrevia from '@/components/layout/usePrevia';
import { EDITOR_RUNWAY, coleccionParaWeb, idPreviaRunway } from '@/lib/runway';
import styles from './page.module.css';

// Campos que pueden quedar vacíos a propósito en un borrador.
const OPCIONALES = ['video', 'descripcion.en', 'videoEnlace.href', 'videoEnlace.imagen', 'videoEnlace.titulo', 'videoEnlace.meta.es', 'videoEnlace.meta.en'];

function RunwayContenido({
  publicado, slug, locale, subtitulo, volverHref,
}) {
  const router = useRouter();
  const { datos, enPrevia, comprobado } = usePrevia(idPreviaRunway(slug), publicado, OPCIONALES);

  useEffect(() => {
    if (comprobado && !datos) router.replace(volverHref);
  }, [comprobado, datos, router, volverHref]);

  if (!datos) return null;
  const coleccion = coleccionParaWeb(datos, locale);
  const medioHero = coleccion.medios[0];

  return (
    <>
      {medioHero && (
        <HeroPagina
          medio={medioHero}
          alt={coleccion.nombre}
          titulo={[coleccion.nombre, coleccion.temporada]}
          subtitulo={subtitulo}
        />
      )}

      <div className={styles.textoDescripcion}>
        <RunwayDescripcion texto={coleccion.descripcion} />
      </div>

      <div className="contenedor">
        <RunwayBackstage imagenes={coleccion.backstage} alt={coleccion.nombre} />
      </div>

      <div className={`${styles.galeria} contenedor`}>
        <RunwayGaleria looks={coleccion.looks} alt={coleccion.nombre} />
      </div>

      <RunwayVideoCierre src={coleccion.video} enlace={coleccion.videoEnlace} />
      {enPrevia && <BarraPrevia editor={`${EDITOR_RUNWAY}?categoria=${datos.id || 'nueva'}`} />}
    </>
  );
}

export default RunwayContenido;
