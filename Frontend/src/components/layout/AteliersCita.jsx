// AteliersCita.jsx
//
// Tres columnas pegadas (Salamanca, Madrid, Oviedo) justo encima de la
// banda PedirCita (que va pegada al footer): cada una con la foto de su atelier, velo oscuro en
// degradado y el rótulo "Atelier {ciudad} & Showroom" arriba con
// "Conoce más" abajo. Toda la pieza es un único <a> a la ficha de su
// atelier (Boton sin href = <span>). Lo pinta [locale]/layout.js solo
// donde hay intención de visitar un atelier (ver conAteliersCitaEn).

import { getLocale } from 'next-intl/server';
import { obtenerPiezasComunes } from '@/lib/piezasComunes';
import { Boton, EnVista } from '../ui';
import { obtenerSede } from '@/lib/ateliers';
import { textoEn } from '@/lib/previa';
import styles from './AteliersCita.module.css';
import { atributosImagen } from '@/lib/imagenes';

// Foto = la del hero de su propia ficha (/atelier-fiesta/[id], ver
// src/datos/ateliers.js) salvo que la entrada traiga la suya (Madrid, a
// petición: su hero es vídeo).
// La foto de cada una: la de lib/piezasComunes.js (editable en el admin) o,
// si está vacía, la de portada de su atelier.
const ATELIERES_CITA = () => ['salamanca', 'madrid', 'oviedo'].map((id) => ({
  id,
  imagen: obtenerPiezasComunes().ateliersCita[id] || obtenerSede(id).heroMedio.src,
}));

// "separado" (opcional): más aire en blanco encima (ver .separado en el
// CSS) — en /atelier, para separar la sección de las fotos de arriba.
export default async function AteliersCita({ separado = false }) {
  const locale = await getLocale();

  return (
    <section className={`${styles.ateliersCita} ${separado ? styles.separado : ''}`}>
      {ATELIERES_CITA().map(({ id, imagen }) => (
        <EnVista
          key={id}
          as="a"
          href={`/${locale}/atelier-fiesta/${id}`}
          className={styles.atelierCita}
        >
          <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 100vw, 33vw' })} alt="" className={styles.atelierCitaImagen} />
          <div className={styles.atelierCitaContenido}>
            <p className={styles.atelierCitaTitulo}>
              Atelier {textoEn(obtenerSede(id).nombreCiudad, locale)}
              {/* Salto solo en mobile — en escritorio el título va en una línea (ver .saltoMovil). */}
              {' '}<br className={styles.saltoMovil} />
              &amp; Showroom
            </p>
            <Boton variante="texto" className={styles.atelierCitaCta}>{textoEn(obtenerPiezasComunes().ateliersCita.boton, locale)}</Boton>
          </div>
        </EnVista>
      ))}
    </section>
  );
}
