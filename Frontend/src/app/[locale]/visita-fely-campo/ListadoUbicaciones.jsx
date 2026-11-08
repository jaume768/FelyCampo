// ListadoUbicaciones.jsx

'use client';

/* ============================================================
   LISTADO DE UBICACIONES — VISÍTENOS — Fely Campo
   Client Component aparte de page.js (Server Component) solo porque
   necesitaba estado para el filtro de ciudad — ya sin él (solo 3
   ubicaciones, una por ciudad, ver src/datos/ateliers.js), sigue siendo
   Client Component por si vuelve a necesitarlo, pero de momento es
   un listado sin más.
   CabeceraSeccion vive aquí (no en page.js) por si en el futuro vuelve
   a necesitar pasarle contenido como "children" (chips, filtros...).
   Cada tarjeta abre con una mini-galería de 2-3 fotos propias de la
   sede (ver .galeria en page.module.css y FOTOS_POR_CIUDAD/fotosDe más
   abajo) que ciclan con cross-fade al hover — CarruselFotos, ui/,
   mismo componente que GaleriaVosotras — en vez de una
   sola foto fija. Cada tarjeta aparece con scroll (<EnVista>,
   @/components/ui) — no se llama useEnVista a mano aquí porque el hook
   no puede invocarse dentro del .map de abajo. */

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { CabeceraSeccion, CarruselFotos, EnVista } from '@/components/ui';
import { enlaceMapa, obtenerUbicaciones } from '@/lib/ateliers';
import styles from './page.module.css';
import { useTextoCabecera } from '@/components/layout/CabeceraPagina';
import { atributosImagen } from '@/lib/imagenes';

// Fotos de cada sede: "fotos" de su contacto (src/datos/ateliers.js,
// editables en el admin). Ciclan con cross-fade al hover vía
// CarruselFotos (ui/) — ver .galeria/.marco en page.module.css.

function ListadoUbicaciones({ locale }) {
  // Título y texto de entrada: lib/cabeceras.js (con vista previa).
  const textoCabecera = useTextoCabecera('visitanos');
  const t = useTranslations('visitenos');

  return (
    <>
      <CabeceraSeccion
        title={textoCabecera('introTitulo')}
        description={textoCabecera('introTexto')}
        alinear="start"
        enCuadricula
        className={styles.cabeceraColumna}
      />

      <ul className={styles.lista}>
        {obtenerUbicaciones().map((ubicacion) => {
          // Un solo teléfono → "Telf"; dos → "Telf" (fijo) y "Móvil" —
          // cada uno en su propia línea. WhatsApp va aparte (ver
          // .whatsapp más abajo): es un enlace real a wa.me, no texto
          // plano como los teléfonos.
          const etiquetasTelefono = [t('telf'), t('movil')];
          // Cada teléfono es un enlace tel: en formato internacional
          // (auditoría SEO M10), con aspecto de texto plano (.tel en el
          // CSS). "\n" entre ellos: .telefono lleva white-space: pre-line.
          const lineaContacto = ubicacion.telefonos.map((telefono, indiceTelefono) => (
            <Fragment key={telefono}>
              {indiceTelefono > 0 && '\n'}
              {`${etiquetasTelefono[indiceTelefono] || t('telf')}: `}
              <a href={`tel:${telefono.replace(/[^+\d]/g, '')}`} className={styles.tel}>{telefono}</a>
            </Fragment>
          ));
          const whatsappHref = `https://wa.me/${ubicacion.whatsapp.replace(/\D/g, '')}`;

          return (
            <li key={ubicacion.id}>
              <EnVista as="article" className={styles.tarjeta}>
                <div className={styles.galeria}>
                  <div className={styles.marco}>
                    <CarruselFotos fotos={ubicacion.fotos} />
                  </div>

                  {/* Mobile/tablet (ver media query en page.module.css):
                      tira con swipe nativo en vez del cross-fade al
                      hover de arriba, que no tiene mucho sentido en
                      táctil puro. */}
                  <div className={styles.galeriaMovil}>
                    {ubicacion.fotos.map((foto) => (
                      <img key={foto} {...atributosImagen(foto, { sizes: '100vw' })} alt="" className={styles.fotoMovil} />
                    ))}
                  </div>
                </div>

                <div className={styles.fila}>
                  {/* Datos y botón juntos en un mismo bloque, centrado en vertical
                      en la columna (ver .bloque en page.module.css). */}
                  <div className={styles.bloque}>
                    <div className={styles.info}>
                      <p className={styles.nombre}>{ubicacion.nombre}</p>

                      <address className={styles.direccionWrap}>
                        <a href={enlaceMapa(ubicacion)} target="_blank" rel="noopener noreferrer" className={styles.direccion}>
                          {ubicacion.direccion.join('\n')}
                        </a>
                      </address>

                      {/* Justo debajo de la dirección (no al final, tras
                          teléfono/WhatsApp) — a petición, para que el
                          horario se lea junto a dónde está la sede. */}
                      <p className={styles.horario}>
                        {ubicacion.horario ? ubicacion.horario[locale] : t('showroomNota')}
                      </p>

                      <p className={styles.telefono}>{lineaContacto}</p>

                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.whatsapp}
                      >
                        {t('whatsapp')}: {ubicacion.whatsapp}
                      </a>

                      <p className={styles.descripcion}>
                        {ubicacion.descripcion[locale]}{' '}
                        <a href={`/${locale}/atelier-fiesta/${ubicacion.ciudad.toLowerCase()}`} className={styles.conoceMas}>
                          {t('conoceMas')}
                        </a>
                      </p>
                    </div>

                    <div className={styles.acciones}>
                      <a
                        href={`/${locale}/visita-fely-campo/cita?ubicacion=${ubicacion.id}`}
                        className={styles.accionBtn}
                      >
                        {t('pedirCita')}
                      </a>
                    </div>
                  </div>
                </div>
              </EnVista>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default ListadoUbicaciones;
