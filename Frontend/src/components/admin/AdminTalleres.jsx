'use client';

/* ============================================================
   ADMIN · NUESTROS TALLERES — Fely Campo
   /admin/paginas/talleres, sobre el editor común (EditorPagina.jsx).
   Bloques, en el orden de la web:
     · Portada: foto, título, frase e introducción
     · Un bloque por taller: carrusel de fotos y vídeos (reordenable),
       nombre, ubicación, quién lo lleva y texto
   Datos y reglas: lib/talleres.js. Ver docs/ADMIN.md.
   ============================================================ */

import {
  ID_PAGINA_TALLERES, camposTalleres, esVideoTaller, nuevoTaller, opcionalesTalleres,
} from '@/lib/talleres';
import ControlesLista from './ControlesLista';
import EditorPagina from './EditorPagina';
import styles from './EditorPagina.module.css';

// Los bloques salen del borrador: al añadir, mover o quitar un taller,
// el índice de la izquierda cambia al momento.
const TALLER = { uno: 'un taller', este: 'este taller' };

const bloquesTalleres = (datos) => [
  {
    id: 'portada', nombre: 'Portada', resumen: 'Foto, título e introducción', descripcion: 'La foto de cabecera y el texto de presentación de los talleres.', datos: (d) => d.hero,
  },
  ...datos.talleres.map((taller) => ({
    id: taller.id,
    nombre: taller.nombre.es || 'Taller nuevo',
    resumen: taller.ubicacion.es,
    descripcion: 'Su carrusel de fotos y vídeos y su texto. El nombre es también el botón de filtro de la página.',
    datos: (d) => d.talleres.find((otro) => otro.id === taller.id),
  })),
];

function Portada({ h }) {
  return (
    <div className={styles.medioYCampos}>
      {h.medio(['hero', 'imagen'], { etiqueta: 'Foto', detalle: 'Horizontal', proporcion: '16 / 9' })}
      <div className={styles.fichaCampos}>
        {h.texto(['hero', 'titulo'], { etiqueta: 'Título', largoRecomendado: 40 })}
        {h.texto(['hero', 'lema'], {
          etiqueta: 'Frase', largoRecomendado: 60, ayuda: 'Sale bajo el título de la portada y como título de la introducción.',
        })}
        {h.texto(['hero', 'intro'], { etiqueta: 'Introducción', parrafos: true, filas: 5 })}
      </div>
    </div>
  );
}

function Taller({ h, indice }) {
  const ruta = (...resto) => ['talleres', indice, ...resto];
  return (
    <>
      <div className={styles.seccionBloque}>
        <p className={styles.grupoTitulo}>Carrusel</p>
        {h.galeria(ruta('medios'), {
          permitirVideo: true, esVideo: esVideoTaller,
        })}
      </div>

      <div className={styles.division} />

      <div className={styles.tresColumnas}>
        {h.texto(ruta('nombre'), { etiqueta: 'Nombre', largoRecomendado: 25 })}
        {h.texto(ruta('ubicacion'), { etiqueta: 'Ubicación', largoRecomendado: 60 })}
        {h.texto(ruta('responsable'), { etiqueta: 'Quién lo lleva', opcional: true, largoRecomendado: 40 })}
      </div>
      <div className={styles.columnaTexto} style={{ marginTop: 'var(--spacing-5)' }}>
        {h.texto(ruta('parrafos'), { etiqueta: 'Texto', parrafos: true, filas: 12 })}
      </div>

      <ControlesLista
        h={h}
        ruta={['talleres']}
        indice={indice}
        crear={nuevoTaller}
        elemento={TALLER}
        nombre={h.borrador.talleres[indice].nombre.es || `el taller ${indice + 1}`}
        minimo={1}
      />
    </>
  );
}

function AdminTalleres() {
  return (
    <EditorPagina
      id={ID_PAGINA_TALLERES}
      titulo="Nuestros talleres"
      rutaWeb="/talleres-fely-campo"
      bloques={bloquesTalleres}
      campos={camposTalleres}
      opcionales={opcionalesTalleres}
    >
      {(bloque, h) => {
        if (bloque.id === 'portada') return <Portada h={h} />;
        const indice = h.borrador.talleres.findIndex((taller) => taller.id === bloque.id);
        if (indice < 0) return null;
        return <Taller h={h} indice={indice} />;
      }}
    </EditorPagina>
  );
}

export default AdminTalleres;
