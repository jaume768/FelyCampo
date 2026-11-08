// TarjetaEnlaceExterno.jsx

/* ============================================================
   TARJETA DE ENLACE EXTERNO — Fely Campo
   Mismo diseño que BlogTarjetaPodcastDestacado.jsx (foto a sangre +
   degradado + botón de "play", estilo Spotify — reutiliza su propio
   CSS module, sin duplicarlo) pero genérica: a diferencia de esa
   tarjeta, aquí "titulo" SÍ es el nombre propio de cada aparición (no
   hay una serie fija que repetir) y el enlace sale del sitio —
   podcasts/entrevistas/prensa en los que aparece Fely Campo, no una
   ficha propia (ver /sobre-fely, page.js). target="_blank" +
   rel="noopener noreferrer" porque siempre es un dominio ajeno.
   Uso:
     <TarjetaEnlaceExterno
       href="https://www.youtube.com/watch?v=..."
       titulo="Madrid, Capital de Moda"
       meta="Entrevista en vídeo"
       imagen="/img/..."
       alt="..."
     />
   "icono": "play" (por defecto, triángulo de reproducir) o "revista"
   (Newspaper de lucide-react, para apariciones en prensa escrita en
   vez de vídeo/pódcast — usa .botonAlt en vez de .boton porque el
   padding-left de .boton es un ajuste óptico específico del triángulo,
   no le hace falta a un icono ya centrado). */

import { Newspaper } from 'lucide-react';
import styles from './BlogTarjetaPodcastDestacado.module.css';
import { atributosImagen } from '@/lib/imagenes';

function TarjetaEnlaceExterno({ href, titulo, meta, imagen, alt, icono = 'play' }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.tarjeta} aria-label={titulo}>
      <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 100vw, 33vw' })} alt={alt} className={styles.imagen} />
      <div className={styles.degradado} aria-hidden="true" />
      <div className={styles.contenido}>
        {/* "play": solo el triángulo, más pequeño y sin el recuadro de
            .boton (a petición, documental VHS de /sobre-fely) —
            .botonSinBorde, para no tocar el .boton que comparte
            BlogTarjetaPodcastDestacado. */}
        <span className={icono === 'revista' ? styles.botonAlt : styles.botonSinBorde} aria-hidden="true">
          {icono === 'revista' ? (
            <Newspaper size={22} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          ) : (
            <svg width="12" height="14" viewBox="0 0 16 18" fill="none">
              <path d="M0 0L16 9L0 18V0Z" fill="currentColor" />
            </svg>
          )}
        </span>
        <p className={styles.titulo}>{titulo}</p>
        {meta && <p className={styles.meta}>{meta}</p>}
      </div>
    </a>
  );
}

export default TarjetaEnlaceExterno;
