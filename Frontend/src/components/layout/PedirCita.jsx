// PedirCita.jsx
//
// Banda con la foto del atelier de Madrid de fondo (velo negro al 30%)
// justo antes del footer (y debajo de AteliersCita donde lo haya): título
// centrado y CTA subrayado (Boton "texto") al formulario de cita, ambos en blanco. La
// pinta [locale]/layout.js en todas las páginas salvo el propio
// formulario de cita y sus confirmaciones.

import { getLocale } from 'next-intl/server';
import { obtenerPiezasComunes } from '@/lib/piezasComunes';
import { textoEn } from '@/lib/previa';
import { Boton, EnVista } from '../ui';
import PedirCitaFondo from './PedirCitaFondo';
import styles from './PedirCita.module.css';

// "separado" (opcional): margen en blanco encima (ver .separado en el
// CSS) — en las fichas de atelier, para separar la banda de las fotos
// del final de la página.
export default async function PedirCita({ separado = false }) {
  const locale = await getLocale();
  // Foto, título y botón: lib/piezasComunes.js (editables en el admin).
  const { pedirCita } = obtenerPiezasComunes();
  const titulo = textoEn(pedirCita.titulo, locale);
  // Corte de las dos filas: tras el primer punto (o coma, si la
  // traducción no lleva punto).
  const punto = titulo.indexOf('.');
  const corte = punto >= 0 ? punto : titulo.indexOf(',');

  return (
    <section className={`${styles.pedirCita} ${separado ? styles.separado : ''}`}>
      {/* Foto de fondo con parallax en escritorio (ver PedirCitaFondo.jsx). */}
      <PedirCitaFondo imagen={pedirCita.imagen} />
      <EnVista className={styles.pedirCitaContenido}>
        {/* Si lleva punto (o coma), el título se parte en dos filas tras él (la
            segunda parte va en un span con display:block). */}
        <p className={styles.pedirCitaTitulo}>
          {titulo.slice(0, corte + 1)}
          {corte >= 0 && ' '}
          <span className={styles.pedirCitaTituloLinea}>{titulo.slice(corte + 1).trim()}</span>
        </p>
        <Boton variante="texto" href={`/${locale}/visita-fely-campo/cita`} className={styles.pedirCitaCta}>
          {textoEn(pedirCita.boton, locale)}
        </Boton>
      </EnVista>
    </section>
  );
}
