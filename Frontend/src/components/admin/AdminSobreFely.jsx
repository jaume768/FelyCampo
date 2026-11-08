'use client';

/* ============================================================
   ADMIN · SOBRE FELY (HISTORIA) — Fely Campo
   /admin/paginas/sobre-fely, sobre el editor común (EditorPagina.jsx).
   Bloques, en el orden de la web:
     · Portada: foto, título y subtítulo
     · Un bloque por capítulo: título, subtítulo, texto, fotos (de 1 a 6,
       con su pie, reordenables)
     · Cierre: título y texto
     · Documental: foto, título, texto y enlace (YouTube)
   Datos y reglas: lib/sobreFely.js. Ver docs/ADMIN.md.
   ============================================================ */

import {
  ID_PAGINA_SOBRE_FELY, MAXIMO_FOTOS_CAPITULO, camposSobreFely, nuevoCapitulo, opcionalesSobreFely,
} from '@/lib/sobreFely';
import ControlesLista from './ControlesLista';
import EditorPagina from './EditorPagina';
import styles from './EditorPagina.module.css';

// Qué hace cada foto de un capítulo según su posición (ver
// SobreFelyContenido.jsx en la web).
function papelFotoCapitulo(indice, total) {
  if (indice === 0) return 'Principal, junto al texto';
  if (total === 2) return 'Debajo del texto';
  // Fotos en filas de dos: si sobra una (número impar), va sola y centrada.
  return (total - 1) % 2 === 1 && indice === total - 1 ? 'Sola y centrada, debajo' : 'En fila, debajo';
}

// Los bloques salen del borrador: al añadir, mover o quitar un capítulo,
// el índice de la izquierda cambia al momento.
const CAPITULO = { uno: 'un capítulo', este: 'este capítulo' };

const bloquesSobreFely = (datos) => [
  {
    id: 'portada', nombre: 'Portada', resumen: 'Foto, título y subtítulo', descripcion: 'La foto a pantalla completa con la que se abre la página.', datos: (d) => d.hero,
  },
  ...datos.capitulos.map((capitulo, indice) => ({
    id: capitulo.id,
    nombre: capitulo.etiqueta.es || 'Capítulo nuevo',
    resumen: `Capítulo ${indice + 1}`,
    descripcion: `Capítulo ${indice + 1} de la historia. La foto principal va ${indice % 2 === 0 ? 'a la izquierda' : 'a la derecha'} del texto (alternan solas: si mueves un capítulo, cambia de lado).`,
    datos: (d) => d.capitulos.find((otro) => otro.id === capitulo.id),
  })),
  {
    id: 'cierre', nombre: 'Cierre', resumen: 'Título y texto', descripcion: 'El texto centrado que cierra la historia.', datos: (d) => d.cierre,
  },
  {
    id: 'documental', nombre: 'Documental', resumen: 'Tarjeta con enlace', descripcion: 'La tarjeta grande del final, que lleva al vídeo.', datos: (d) => d.documental,
  },
];

function Portada({ h }) {
  return (
    <div className={styles.medioYCampos}>
      {h.medio(['hero', 'imagen'], { etiqueta: 'Foto', detalle: 'Horizontal', proporcion: '16 / 9' })}
      <div className={styles.fichaCampos}>
        {h.texto(['hero', 'titulo'], { etiqueta: 'Título', largoRecomendado: 40 })}
        {h.texto(['hero', 'subtitulo'], { etiqueta: 'Subtítulo', largoRecomendado: 60 })}
      </div>
    </div>
  );
}

function Capitulo({ h, indice }) {
  const ruta = (...resto) => ['capitulos', indice, ...resto];
  return (
    <>
      <div className={styles.dosColumnas}>
        <div className={styles.fichaCampos}>
          {h.texto(ruta('etiqueta'), { etiqueta: 'Título', largoRecomendado: 40 })}
          {h.texto(ruta('titulo'), { etiqueta: 'Subtítulo', largoRecomendado: 70 })}
        </div>
        {h.texto(ruta('parrafos'), { etiqueta: 'Texto', parrafos: true, filas: 12 })}
      </div>

      <div className={styles.division} />

      <div className={styles.seccionBloque}>
        <p className={styles.grupoTitulo}>Fotos del capítulo</p>
        <p className={styles.ayudaBloque}>
          Hasta {MAXIMO_FOTOS_CAPITULO}. La 1.ª es la principal y va junto al texto. Si hay una más, va debajo del texto; si hay más, forman filas de dos debajo del capítulo (si sobra una, va centrada).
        </p>
        {h.galeria(ruta('imagenes'), { conPie: true, papeles: papelFotoCapitulo, maximo: MAXIMO_FOTOS_CAPITULO })}
      </div>

      <ControlesLista
        h={h}
        ruta={['capitulos']}
        indice={indice}
        crear={nuevoCapitulo}
        elemento={CAPITULO}
        nombre={h.borrador.capitulos[indice].etiqueta.es || `el capítulo ${indice + 1}`}
        minimo={1}
      />

    </>
  );
}

function Cierre({ h }) {
  return (
    <div className={styles.columnaTexto}>
      {h.texto(['cierre', 'titulo'], { etiqueta: 'Título', largoRecomendado: 70 })}
      {h.texto(['cierre', 'parrafos'], { etiqueta: 'Texto', parrafos: true, filas: 8 })}
    </div>
  );
}

function Documental({ h }) {
  return (
    <div className={styles.medioYCampos}>
      {h.medio(['documental', 'imagen'], { etiqueta: 'Foto', detalle: 'Horizontal', proporcion: '16 / 9' })}
      <div className={styles.fichaCampos}>
        {h.texto(['documental', 'titulo'], { etiqueta: 'Título', largoRecomendado: 60 })}
        {h.texto(['documental', 'texto'], { etiqueta: 'Texto', largoRecomendado: 90 })}
        {h.url(['documental', 'enlace'], { etiqueta: 'Enlace al vídeo', ayuda: 'Dirección completa, por ejemplo de YouTube. Se abre en otra pestaña.' })}
      </div>
    </div>
  );
}

function AdminSobreFely() {
  return (
    <EditorPagina
      id={ID_PAGINA_SOBRE_FELY}
      titulo="Historia de Fely"
      rutaWeb="/sobre-fely"
      bloques={bloquesSobreFely}
      campos={camposSobreFely}
      opcionales={opcionalesSobreFely}
    >
      {(bloque, h) => {
        if (bloque.id === 'portada') return <Portada h={h} />;
        if (bloque.id === 'cierre') return <Cierre h={h} />;
        if (bloque.id === 'documental') return <Documental h={h} />;
        const indice = h.borrador.capitulos.findIndex((capitulo) => capitulo.id === bloque.id);
        if (indice < 0) return null;
        return <Capitulo h={h} indice={indice} />;
      }}
    </EditorPagina>
  );
}

export default AdminSobreFely;
