/* ============================================================
   VISÍTENOS — Fely Campo. Ruta: /visita-fely-campo (namespace de
   traducciones "visitenos", sin cambiar — solo la URL es distinta).
   Listado de los 4 ateliers/showroom (ver ubicaciones.js) — Server
   Component, contenido 100% estático por locale (nombre/dirección
   compartidos, horario/descripción bilingües en el propio dato).
   Botón "Pedir cita" en pestaña nueva porque enlaza a la reserva
   propia de cada sede (?ubicacion=id en /visita-fely-campo/cita,
   todavía sin maquetar) — mismo criterio que un enlace externo de
   verdad (ver .flecha del Maps de atencion-cliente/page.js), aquí
   interno pero pensado como salida de la página actual, no
   navegación dentro de ella. "Ver mapa"/"WhatsApp" van con href="#"
   a propósito — enlaces reales pendientes (Maps/WhatsApp por sede).

   ProductHero + CabeceraSeccion (enCuadricula + alinear="start"):
   misma cabecera que Tienda/Atelier (ver tienda/page.js), no una
   propia — así el Navbar hace el mismo tránsito transparente→sólido
   sobre la foto (data-navbar-hero, ver ProductHero.jsx y "isHome ||
   tieneProductHero..." en layout.js, que necesita
   "/visita-fely-campo" en RUTAS_CON_PRODUCT_HERO para activarlo en
   esta ruta).
   ============================================================ */

import { getTranslations } from 'next-intl/server';
import { ProductHero } from '@/components/layout';
import { CabeceraSeccion } from '@/components/ui';
import { UBICACIONES } from './ubicaciones';
import styles from './page.module.css';

export default async function Pagina({ params }) {
  const { locale } = await params;
  const t = await getTranslations('visitenos');

  return (
    <section className="seccion">
      <ProductHero imagen="/img/punto-venta.webp" />

      <div className="contenedor">
        <CabeceraSeccion
          subtitleKey="visitenos.eyebrow"
          titleKey="visitenos.titulo"
          descriptionKey="visitenos.intro"
          alinear="start"
          enCuadricula
        />

        <ul className={styles.lista}>
          {UBICACIONES.map((ubicacion) => (
            <li key={ubicacion.id}>
              <article className={styles.tarjeta}>
                <img src={ubicacion.imagen} alt="" className={styles.imagen} />

                <div className={styles.fila}>
                  <div className={styles.info}>
                    <address className={styles.direccion}>
                      <span className={styles.nombre}>{ubicacion.nombre}</span>
                      {'\n'}
                      {ubicacion.direccion.join('\n')}
                      {'\n'}
                      {ubicacion.telefonos.map((telefono) => `Tel. ${telefono}`).join('\n')}
                      {'\n'}
                      {`WhatsApp ${ubicacion.whatsapp}`}
                    </address>

                    <p className={styles.horario}>
                      {ubicacion.horario ? ubicacion.horario[locale] : t('showroomNota')}
                    </p>

                    <p className={styles.descripcion}>{ubicacion.descripcion[locale]}</p>
                  </div>

                  <div className={styles.acciones}>
                    <a
                      href={`/${locale}/visita-fely-campo/cita?ubicacion=${ubicacion.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.accionBtn}
                    >
                      {t('pedirCita')}
                    </a>
                    {/* href="#" — a la espera de los enlaces reales (Maps/WhatsApp por sede). */}
                    <a href="#" target="_blank" rel="noopener noreferrer" className={styles.accionBtnContorno}>
                      {t('verMapa')}
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer" className={styles.accionBtnContorno}>
                      {t('whatsapp')}
                    </a>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
