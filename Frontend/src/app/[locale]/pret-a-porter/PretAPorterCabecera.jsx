'use client';

/* ============================================================
   /pret-a-porter — la parte de arriba, con vista previa — Fely Campo
   Portada (carrusel infinito de fotos de pasarela), título «Prêt-à-porter»
   y descripción. Pinta lo publicado o, con ?previa=pret-a-porter-pagina
   desde el admin (Prêt-à-porter › Página de la web), el borrador
   (usePrevia). Datos: lib/atelierEditorial.js. La cuadrícula de productos
   sigue en page.js, debajo.
   ============================================================ */

import BarraPrevia from '@/components/layout/BarraPrevia';
import CarruselInfinito from '@/components/layout/CarruselInfinito';
import HeroPagina from '@/components/layout/HeroPagina';
import RunwayDescripcion from '@/components/layout/RunwayDescripcion';
import usePrevia from '@/components/layout/usePrevia';
import { CabeceraSeccion } from '@/components/ui';
import { ID_PAGINA_PRET_A_PORTER } from '@/lib/atelierEditorial';
import { parrafosEn } from '@/lib/previa';
import styles from './page.module.css';

function PretAPorterCabecera({ publicado, locale, alt }) {
  const { datos, enPrevia } = usePrevia(ID_PAGINA_PRET_A_PORTER, publicado);

  return (
    <>
      {/* Solo en esta página (a petición): hero sin velo ni texto encima
          (solo el carrusel), Navbar transparente en oscuro (ver
          "esPretAPorter" en [locale]/layout.js). El título va debajo,
          centrado, con la misma cabecera que las páginas de categoría
          de Atelier (CabeceraSeccion enCuadricula + alinear="start"). */}
      <HeroPagina tono="oscuro" className={styles.heroCarrusel}>
        <CarruselInfinito imagenes={datos.portada} alt={alt} />
      </HeroPagina>

      <CabeceraSeccion
        titleKey="catalogo.tituloTienda"
        alinear="start"
        enCuadricula
        className={styles.cabecera}
      />

      <div className={styles.textoDescripcion}>
        <RunwayDescripcion texto={parrafosEn(datos.descripcion, locale)} />
      </div>

      {enPrevia && <BarraPrevia editor="/admin/productos/pret-a-porter" />}
    </>
  );
}

export default PretAPorterCabecera;
