'use client';

/* ============================================================
   FICHA DE ATELIER, con vista previa — Fely Campo
   El cuerpo de /atelier-fiesta/salamanca, /madrid y /oviedo (ver
   AtelierDetalle.jsx, que pone además los datos para Google). Pinta lo
   publicado o, con ?previa=sede-<id> desde el admin (Atelier Salamanca…),
   el borrador (usePrevia). Datos: lib/ateliers.js.

   Orden fijo, igual en las 3 fichas:
   1. Portada (foto o vídeo, HeroPagina) con la etiqueta («Atelier») y la
      ciudad, y
      debajo la descripción (RunwayDescripcion).
   2. La foto o el vídeo grande (90vh, 16/9; "ajustarAlto" enseña entera
      una foto vertical, ver .videoAjusteAlto en page.module.css).
   3. Las secciones: foto + título + texto, alternando de lado.
   4. Dirección + teléfonos + WhatsApp + «Pedir cita».
   5. Las fotos y vídeos del final: en escritorio, una fila (hasta 5) o
      filas de 3 a 5 (ver .imagenes); carrusel horizontal en móvil
      (CarruselImagenes).
   Los pasos 2-5 aparecen con scroll (<EnVista>).
   ============================================================ */

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import BarraPrevia from '@/components/layout/BarraPrevia';
import HeroPagina from '@/components/layout/HeroPagina';
import RunwayDescripcion from '@/components/layout/RunwayDescripcion';
import usePrevia from '@/components/layout/usePrevia';
import { CarruselImagenes, Boton, EnVista } from '@/components/ui';
import {
  OPCIONALES_SEDE, editorSede, enlaceMapa, esVideoSede, idPaginaSede, medioParaWeb, ubicacionDe,
} from '@/lib/ateliers';
import { parrafosEn, textoEn } from '@/lib/previa';
import styles from './page.module.css';
import { atributosImagen } from '@/lib/imagenes';
import VideoDiferido from '@/components/ui/VideoDiferido';

function AtelierContenido({ publicado, locale }) {
  const { datos, enPrevia } = usePrevia(idPaginaSede(publicado.id), publicado, OPCIONALES_SEDE);
  const tVisitenos = useTranslations('visitenos');
  const nombreCiudad = textoEn(datos.nombreCiudad, locale);
  const ubicacion = ubicacionDe(datos);
  const heroMedio = medioParaWeb(datos.heroMedio);
  const medioSuperior = medioParaWeb(datos.medioSuperior);

  // Un solo teléfono → "Telf"; dos → "Telf" (fijo) y "Móvil", cada uno en
  // su línea. Cada teléfono es un enlace tel: en formato internacional,
  // con aspecto de texto plano (ver .tel). "\n" entre ellos:
  // .telefonoCita lleva white-space: pre-line.
  const etiquetasTelefono = [tVisitenos('telf'), tVisitenos('movil')];
  const lineaContacto = ubicacion.telefonos.map((telefono, indiceTelefono) => (
    <Fragment key={telefono}>
      {indiceTelefono > 0 && '\n'}
      {`${etiquetasTelefono[indiceTelefono] || tVisitenos('telf')}: `}
      <a href={`tel:${telefono.replace(/[^+\d]/g, '')}`} className={styles.tel}>{telefono}</a>
    </Fragment>
  ));
  const whatsappHref = `https://wa.me/${ubicacion.whatsapp.replace(/\D/g, '')}`;

  return (
    <>
      <HeroPagina
        medio={heroMedio}
        alt={nombreCiudad}
        titulo={[textoEn(datos.etiqueta, locale), nombreCiudad]}
        subtitulo={textoEn(datos.subtitulo, locale)}
        className={heroMedio.encuadre === 'arriba' ? 'hero-arriba' : undefined}
      />

      <div className={styles.textoDescripcion}>

        <RunwayDescripcion texto={parrafosEn(datos.descripcion, locale)} />
      </div>

      <div className="contenedor">
        {medioSuperior.tipo === 'video' ? (
          <video
            src={medioSuperior.src}
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <EnVista
            as="img"
            src={medioSuperior.src}
            alt=""
            className={`${styles.video} ${medioSuperior.ajustarAlto ? styles.videoAjusteAlto : ''}`}
          />
        )}

        {datos.secciones.map((seccion, indice) => (
          <EnVista
            key={seccion.id}
            className={`${styles.seccion} ${indice % 2 === 1 ? styles.seccionInvertida : ''}`}
          >
            <div className={styles.bloqueImagen}>
              {/* Una sección recién añadida en el admin puede no tener foto todavía. */}
              {seccion.imagen && <img {...atributosImagen(seccion.imagen, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt="" className={styles.bloqueImg} />}
            </div>
            <div className={styles.seccionTexto}>
              <p className={styles.seccionTitulo}>{seccion.titulo[locale] || seccion.titulo.es}</p>
              {parrafosEn(seccion.texto, locale).map((parrafo, indiceParrafo) => (
                <p key={indiceParrafo}>{parrafo}</p>
              ))}
            </div>
          </EnVista>
        ))}

        <EnVista className={styles.cita}>
          <a href={enlaceMapa(ubicacion)} target="_blank" rel="noopener noreferrer" className={styles.direccionCita}>
            {ubicacion.direccion.join(', ')}
          </a>
          <p className={styles.telefonoCita}>{lineaContacto}</p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.whatsappCita}>
            {tVisitenos('whatsapp')}: {ubicacion.whatsapp}
          </a>
          <Boton
            href={`/${locale}/visita-fely-campo/cita?ubicacion=${ubicacion.id}`}
            variante="solido"
            tamano="m"
            className={styles.botonCita}
          >
            {tVisitenos('pedirCita')}
          </Boton>
        </EnVista>

        <CarruselImagenes className={styles.imagenes}>
          {/* Solo los medios reales de la ficha: .imagenes ajusta sus
              columnas al número real. */}
          {datos.imagenesTira.map((src, indice) => (
            <EnVista key={indice} className={styles.marco}>
              {esVideoSede(src) ? (
                <VideoDiferido src={src} className={styles.imagen} />
              ) : (
                <img {...atributosImagen(src, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt="" className={styles.imagen} />
              )}
            </EnVista>
          ))}
        </CarruselImagenes>
      </div>

      {enPrevia && <BarraPrevia editor={editorSede(datos.id)} />}
    </>
  );
}

export default AtelierContenido;
