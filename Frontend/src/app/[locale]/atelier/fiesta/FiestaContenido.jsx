'use client';

/* ============================================================
   /atelier/fiesta — la parte editorial, con vista previa — Fely Campo
   Portada + FiestaIntro (introducción y sus dos pestañas: «Así
   trabajamos», con los bloques y la galería, y «Colección fiesta», con la
   cuadrícula de looks que le pasa page.js ya hecha). Pinta lo publicado o,
   con ?previa=atelier-fiesta desde el admin (Colección Fiesta › Página de
   la web), el borrador (usePrevia). Datos: lib/atelierEditorial.js.
   ============================================================ */

import BarraPrevia from '@/components/layout/BarraPrevia';
import BloqueSeccion from '@/components/layout/BloqueSeccion';
import HeroPagina from '@/components/layout/HeroPagina';
import RunwayBackstage from '@/components/layout/RunwayBackstage';
import usePrevia from '@/components/layout/usePrevia';
import { ID_PAGINA_FIESTA, galeriaParaWeb } from '@/lib/atelierEditorial';
import { parrafosEn, textoEn } from '@/lib/previa';
import FiestaIntro from './FiestaIntro';

// "titulo": [Atelier, Fiesta] (fijo); "tituloIntro": «Atelier Fiesta»;
// "alt": nombre de la sección; "colecciones": la cuadrícula de looks.
function FiestaContenido({
  publicado, locale, titulo, tituloIntro, alt, colecciones,
}) {
  const { datos, enPrevia } = usePrevia(ID_PAGINA_FIESTA, publicado);

  return (
    <>
      <HeroPagina
        imagen={datos.hero.imagen}
        alt={alt}
        titulo={titulo}
        subtitulo={textoEn(datos.hero.subtitulo, locale)}
      />

      <FiestaIntro
        titulo={tituloIntro}
        texto={parrafosEn(datos.descripcion, locale).join(' ')}
        etiquetas={{ atelier: textoEn(datos.pestanas.atelier, locale), colecciones: textoEn(datos.pestanas.colecciones, locale) }}
        editorial={(
          <>
            {/* 1. Así trabajamos */}
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
          </>
        )}
        colecciones={colecciones}
      />

      {enPrevia && <BarraPrevia editor="/admin/colecciones/fiesta" />}
    </>
  );
}

export default FiestaContenido;
