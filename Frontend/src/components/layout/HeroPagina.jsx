// HeroPagina.jsx

/* ============================================================
   HERO DE PÁGINA — Fely Campo
   Cabecera común de todas las páginas interiores (todas menos la home
   y /atelier): imagen o vídeo a pantalla completa (102vh) con el título
   y una línea corta superpuestos abajo a la izquierda, en blanco, sobre
   un degradado inferior que los hace legibles. El degradado superior,
   para el Navbar transparente, lo pone RunwayMediaLateral.
   Mismo diseño que tenía /atelier/novias, sacado aquí para que todas
   las páginas lo compartan.

   Uso:
     <HeroPagina
       medio={{ tipo: 'imagen', src: '/img/...' }}
       alt="..."
       titulo={['Atelier', 'Novias']}
       subtitulo="Vestidos de novia hechos a medida en nuestro atelier"
     />
   "titulo": string o array — va en un <h1>, cada parte en su <span>, en fila
   (en mayúsculas). "subtitulo" opcional, siempre sin punto final (se
   quita aquí si el texto lo trae, a petición).
   "children" (opcional): sustituye a RunwayMediaLateral cuando el
   fondo no es un único medio (ej. el carrusel de /pret-a-porter). En
   ese caso el degradado superior (el del Navbar, que con un único
   medio pone RunwayMediaLateral) lo pinta el propio hero.
   "tono": "claro" (por defecto, texto blanco + degradado inferior) u
   "oscuro" (texto en tinta, sin degradado) para fondos claros — ej. el
   carrusel de looks recortados de /pret-a-porter.
   "extra" (opcional): nodo adicional dentro del hero, por encima de la
   imagen (ej. el botón "volver" de BlogArticulo).
   "fijarEnMobile": efecto "pin" en mobile — la imagen se queda fija y
   el contenido siguiente sube por encima tapándola (el hermano
   siguiente necesita fondo opaco, ver /sobre-fely).
   data-navbar-hero: el Navbar pasa a transparente/claro mientras este
   bloque está en pantalla (ver Navbar.jsx).
   ============================================================ */

import RunwayMediaLateral from './RunwayMediaLateral';
import styles from './HeroPagina.module.css';

function HeroPagina({ medio, imagen, alt = '', titulo, subtitulo, children, extra, tono = 'claro', fijarEnMobile = false, className }) {
  const partes = Array.isArray(titulo) ? titulo : [titulo];
  const subtituloSinPunto = typeof subtitulo === 'string' ? subtitulo.trim().replace(/\.$/, '') : subtitulo;
  const medioFinal = medio || (imagen ? { tipo: 'imagen', src: imagen } : null);
  const clases = [styles.hero, children && styles.fondoPropio, tono === 'oscuro' && styles.oscuro, fijarEnMobile && styles.fijarEnMobile, className].filter(Boolean).join(' ');

  return (
    <div className={clases} data-navbar-hero>
      {children || <RunwayMediaLateral medio={medioFinal} alt={alt} />}
      {extra}

      {(titulo || subtituloSinPunto) && (
        <div className={styles.texto}>
          {titulo && (
            <h1 className={styles.titulo}>
              {partes.filter(Boolean).map((parte) => (
                <span key={parte} className={styles.tituloParte}>{parte}</span>
              ))}
            </h1>
          )}
          {subtituloSinPunto && <p className={styles.subtitulo}>{subtituloSinPunto}</p>}
        </div>
      )}
    </div>
  );
}

export default HeroPagina;
