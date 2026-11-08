'use client';

/* Debajo del mapa de /puntos-de-venta-fely-campo: el título «presencia
   internacional» y la tarjeta del Showroom de Milán (foto 50% + texto 50%,
   mismo diseño que las sedes de visita-fely-campo/ListadoUbicaciones.jsx).
   Datos: lib/cabeceras.js (Puntos de venta), editables en el admin, con
   vista previa (va dentro de <CabeceraPagina id="puntos-de-venta">). */

import { CabeceraSeccion, EnVista } from '@/components/ui';
import { useCabecera, useTextoCabecera } from '@/components/layout/CabeceraPagina';
import styles from './page.module.css';
import { srcSetDe } from '@/lib/imagenes';

function PresenciaInternacional() {
  const datos = useCabecera('puntos-de-venta');
  const texto = useTextoCabecera('puntos-de-venta');

  return (
    <section className={`seccion ${styles.seccionMilan}`}>
      <CabeceraSeccion title={texto('internacionalTitulo')} alinear="start" />

      <EnVista as="article" className={styles.tarjeta}>
        <div className={styles.galeria}>
          <img
            src={datos.showroom.imagen} srcSet={srcSetDe(datos.showroom.imagen)} sizes="(max-width: 768px) 50vw, 25vw"
            alt={texto('showroom.nombre')}
            className={styles.foto}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className={styles.fila}>
          <p className={styles.nombre}>{texto('showroom.nombre')}</p>
          <p className={styles.textoRelleno}>{texto('showroom.texto')}</p>
        </div>
      </EnVista>
    </section>
  );
}

export default PresenciaInternacional;
