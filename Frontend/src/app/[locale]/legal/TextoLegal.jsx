/* ============================================================
   TEXTO LEGAL — Fely Campo
   Plantilla común de las páginas de /legal (privacidad, cookies, aviso
   legal, términos): portada (HeroPagina, la misma cabecera que el resto
   de páginas interiores, con el título y la fecha de actualización)
   + el texto en una columna. Sin el antiguo "FELY CAMPO" en
   mayúsculas encima del título (quitado a petición). Los textos viven en ./textos/*.js
   como una lista de bloques sencillos:
     'texto'                       → párrafo
     { h: 'Título' }               → subtítulo (h2)
     { h3: 'Título' }              → subtítulo menor (h3)
     { lista: ['a', 'b'] }         → lista con viñetas
   Dentro de cualquier texto, [etiqueta](/ruta) o [etiqueta](https://…)
   se pinta como enlace, y los emails sueltos (info@felycampo.com) como
   mailto.
   Cada texto tiene versión en español e inglés ({ es, en } en
   ./textos/*.js, con "titulo", "actualizado" y "bloques").
   ============================================================ */

import HeroPagina from '@/components/layout/HeroPagina';
import styles from './TextoLegal.module.css';

// [texto](url) o un email suelto.
const PATRON = /\[([^\]]+)\]\(([^)]+)\)|([\w.+-]+@[\w-]+\.[\w.]+)/g;

function conEnlaces(texto, locale) {
  const partes = [];
  let ultimo = 0;
  let coincidencia;
  PATRON.lastIndex = 0;
  while ((coincidencia = PATRON.exec(texto))) {
    if (coincidencia.index > ultimo) partes.push(texto.slice(ultimo, coincidencia.index));
    const [completo, etiqueta, url, email] = coincidencia;
    if (email) {
      partes.push(<a key={coincidencia.index} href={`mailto:${email}`} className={styles.enlace}>{email}</a>);
    } else {
      const externo = /^https?:\/\//.test(url);
      const href = externo ? url : `/${locale}${url}`;
      partes.push(
        <a key={coincidencia.index} href={href} className={styles.enlace} {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {etiqueta}
        </a>,
      );
    }
    ultimo = coincidencia.index + completo.length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
}

// Portada común de las cuatro páginas legales.
const IMAGEN_PORTADA = '/img/fely-campo-web-contacpage-hero.webp';

export default function TextoLegal({ texto, locale }) {
  const { titulo, actualizado, bloques } = texto[locale] || texto.es;
  return (
    <section>
      {/* Portada como el resto de páginas interiores (HeroPagina): título
          encima de la foto y la fecha de actualización como línea corta. */}
      <HeroPagina imagen={IMAGEN_PORTADA} alt={titulo} titulo={titulo} subtitulo={actualizado} />

      <div className={styles.pagina}>
      <div className={styles.cuerpo}>
        {bloques.map((bloque, indice) => {
          if (typeof bloque === 'string') return <p key={indice}>{conEnlaces(bloque, locale)}</p>;
          if (bloque.h) return <h2 key={indice} className={styles.h2}>{bloque.h}</h2>;
          if (bloque.h3) return <h3 key={indice} className={styles.h3}>{bloque.h3}</h3>;
          if (bloque.lista) {
            return (
              <ul key={indice} className={styles.lista}>
                {bloque.lista.map((item) => <li key={item}>{conEnlaces(item, locale)}</li>)}
              </ul>
            );
          }
          return null;
        })}
      </div>
      </div>
    </section>
  );
}
