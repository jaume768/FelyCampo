// IntroSeccion.jsx

/* ============================================================
   INTRO DE SECCIÓN — Fely Campo
   Bloque de introducción bajo el hero de una página (/blog,
   /talleres-fely-campo): mínimo 60vh, centrado en vertical y alineado
   a la izquierda — título (19px), texto (13px, 60vw en escritorio) y,
   opcionalmente, una fila de filtros debajo.

   Los filtros son <button> con el mismo subrayado que el CTA del
   resto del sitio (.texto de Boton.module.css): Boton sin href pinta
   un <span>, que no se puede usar con teclado. Solo el activo lleva el
   subrayado; los demás, mismo color y opacidad, sin subrayado.

   Sin estado propio: quien lo usa (un componente cliente) guarda el
   filtro activo y lo pasa en "activo" + "onCambiar". "className"
   (opcional) va al <section>, para ajustes propios de una página.
   Uso:
     <IntroSeccion
       titulo="Podcast & Blog"
       texto="Un espacio para conversar…"
       filtros={[{ id: 'todo', etiqueta: 'Ver todo' }, …]}
       activo={filtro}
       onCambiar={setFiltro}
     />
   ============================================================ */

import estilosBoton from '../ui/Boton.module.css';
import styles from './IntroSeccion.module.css';

function IntroSeccion({ titulo, texto, filtros, activo, onCambiar, className }) {
  return (
    <section className={`${styles.intro} ${className || ''}`}>
      <h2 className={styles.titulo}>{titulo}</h2>
      <p className={styles.texto}>{texto}</p>
      {filtros && filtros.length > 0 && (
        <div className={styles.filtros} role="group" aria-label={titulo}>
          {filtros.map(({ id, etiqueta }) => (
            <button
              key={id}
              type="button"
              aria-pressed={activo === id}
              onClick={() => onCambiar(id)}
              className={`${estilosBoton.texto} ${styles.filtro} ${activo === id ? styles.filtroActivo : ''}`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default IntroSeccion;
