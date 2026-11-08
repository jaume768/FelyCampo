'use client';

/* ============================================================
   /atelier/novias — lo que se ve, con vista previa — Fely Campo
   Portada, introducción, bloques de foto + texto en zigzag y galería
   editorial final. Pinta lo publicado o, con ?previa=atelier-novias desde
   el admin (Colección Novias › Página de la web), el borrador
   (usePrevia). Datos: lib/atelierEditorial.js.
   ============================================================ */

import BarraPrevia from '@/components/layout/BarraPrevia';
import BloqueSeccion from '@/components/layout/BloqueSeccion';
import HeroPagina from '@/components/layout/HeroPagina';
import RunwayBackstage from '@/components/layout/RunwayBackstage';
import RunwayDescripcion from '@/components/layout/RunwayDescripcion';
import usePrevia from '@/components/layout/usePrevia';
import { ID_PAGINA_NOVIAS, galeriaParaWeb } from '@/lib/atelierEditorial';
import { parrafosEn, textoEn } from '@/lib/previa';
import styles from './page.module.css';

// "titulo": [Atelier, Novias] (fijo, de messages). "alt": nombre de la sección.
function NoviasContenido({
  publicado, locale, titulo, alt,
}) {
  const { datos, enPrevia } = usePrevia(ID_PAGINA_NOVIAS, publicado);

  return (
    <>
      <HeroPagina
        imagen={datos.hero.imagen}
        alt={alt}
        titulo={titulo}
        subtitulo={textoEn(datos.hero.subtitulo, locale)}
      />

      <div className={styles.textoDescripcion}>
        <RunwayDescripcion texto={parrafosEn(datos.descripcion, locale)} />
      </div>

      {datos.bloques.map((bloque, indice) => (
        <BloqueSeccion
          key={bloque.src}
          imagen={bloque.src}
          tipo={bloque.tipo}
          titulo={textoEn(bloque.titulo, locale)}
          texto={textoEn(bloque.texto, locale)}
          invertido={indice % 2 === 1}
        />
      ))}

      <div className="contenedor">
        <RunwayBackstage imagenes={galeriaParaWeb(datos.backstage)} alt={alt} />
      </div>

      {enPrevia && <BarraPrevia editor="/admin/colecciones/novia" />}
    </>
  );
}

export default NoviasContenido;
