'use client';

/* ============================================================
   ADMIN · PÁGINA DE NOVIAS / DE FIESTA (parte editorial) — Fely Campo
   La pestaña «Página de la web» de Colección Novias y Colección Fiesta:
   las fotos y los textos de /atelier/novias y /atelier/fiesta, con el
   editor común (EditorPagina.jsx). Bloques, en el orden de la web:
     · Portada: foto y frase
     · Introducción
     · Pestañas (solo Fiesta): «Así trabajamos» / «Colección fiesta»
     · Un bloque por cada foto (o vídeo) + texto, en zigzag
     · Galería final: fotos y vídeos, reordenables
   Datos y reglas: lib/atelierEditorial.js. Ver docs/ADMIN.md.
   ============================================================ */

import { camposEditorial, esVideoEditorial, nuevoBloqueEditorial } from '@/lib/atelierEditorial';
import ControlesLista, { BotonAnadir } from './ControlesLista';
import EditorPagina from './EditorPagina';
import editorStyles from './EditorPagina.module.css';
import segmentos from './AdminVosotras.module.css';
import styles from './AdminColeccionesAtelier.module.css';
import campos from './CamposEditor.module.css';

const BLOQUE = { uno: 'un bloque', este: 'este bloque' };

// Los bloques salen del borrador: al añadir, mover o quitar un bloque de
// foto + texto, el índice de la izquierda cambia al momento.
function bloquesEditor(datos) {
  return [
    {
      id: 'portada', nombre: 'Portada', resumen: 'Foto y frase', descripcion: 'La foto a todo el ancho con la que se abre la página, y la frase bajo el título.', datos: (d) => d.hero,
    },
    {
      id: 'introduccion', nombre: 'Introducción', resumen: 'El texto de entrada', descripcion: 'El texto que presenta la página, bajo la portada.', datos: (d) => d.descripcion,
    },
    ...(datos.pestanas ? [{
      id: 'pestanas', nombre: 'Pestañas', resumen: 'Sus dos nombres', descripcion: 'Los nombres de las dos pestañas que hay bajo la introducción: la parte editorial y la de la colección.', datos: (d) => d.pestanas,
    }] : []),
    ...datos.bloques.map((bloque, indice) => ({
      id: bloque.id,
      nombre: `Bloque ${indice + 1}`,
      resumen: bloque.titulo.es || 'Nuevo',
      descripcion: `Foto (o vídeo) con su título y su texto. Va ${indice % 2 === 0 ? 'a la izquierda' : 'a la derecha'} del texto (alternan solas: si mueves un bloque, cambia de lado).`,
      datos: (d) => d.bloques.find((otro) => otro.id === bloque.id),
    })),
    // Sin bloques: uno para poder añadir el primero.
    ...(datos.bloques.length === 0 ? [{
      id: 'sin-bloques', nombre: 'Bloques de foto y texto', resumen: 'Ninguno', descripcion: 'Fotos (o vídeos) con su título y su texto, en zigzag, bajo la introducción.', datos: (d) => d.bloques,
    }] : []),
    {
      id: 'galeria', nombre: 'Galería', resumen: 'Fotos y vídeos del final', descripcion: 'Las fotos (y vídeos) que cierran la parte editorial, en este orden. Arrastra para cambiarlo.', datos: (d) => d.backstage,
    },
  ];
}

function ElegirTipo({ valor, onChange }) {
  return (
    <div className={segmentos.segmentado} role="radiogroup" aria-label="Foto o vídeo">
      {[['imagen', 'Foto'], ['video', 'Vídeo']].map(([tipo, texto]) => (
        <button
          key={tipo}
          type="button"
          role="radio"
          aria-checked={valor === tipo}
          className={`${segmentos.segmento} ${valor === tipo ? segmentos.segmentoActivo : ''}`}
          onClick={() => onChange(tipo)}
        >
          {texto}
        </button>
      ))}
    </div>
  );
}

// "id": ID_PAGINA_NOVIAS / ID_PAGINA_FIESTA; "base": el listado de
// colecciones (para volver); "rutaWeb": /atelier/novias…; "titulo": «Página de Novias».
// "pestanas": las pestañas de la sección (Página | Colecciones), arriba.
function AdminEditorialAtelier({
  id, titulo, rutaWeb, migas, pestanas,
}) {
  return (
    <EditorPagina
      id={id}
      titulo={titulo}
      rutaWeb={rutaWeb}
      bloques={bloquesEditor}
      campos={camposEditorial}
      migas={migas}
      encabezado={pestanas}
    >
      {(bloque, h) => {
        if (bloque.id === 'portada') {
          return (
            <div className={editorStyles.medioYCampos}>
              {h.medio(['hero', 'imagen'], { etiqueta: 'Foto', detalle: 'Horizontal', proporcion: '16 / 9' })}
              <div className={editorStyles.fichaCampos}>
                {h.texto(['hero', 'subtitulo'], { etiqueta: 'Frase', largoRecomendado: 60, ayuda: 'Sale bajo el título de la portada.' })}
              </div>
            </div>
          );
        }
        if (bloque.id === 'introduccion') {
          return (
            <div className={editorStyles.columnaTexto}>
              {h.texto(['descripcion'], { etiqueta: 'Texto', parrafos: true, filas: 8 })}
            </div>
          );
        }
        if (bloque.id === 'pestanas') {
          return (
            <div className={editorStyles.dosColumnas}>
              {h.texto(['pestanas', 'atelier'], { etiqueta: '1.ª pestaña (la parte editorial)', largoRecomendado: 25 })}
              {h.texto(['pestanas', 'colecciones'], { etiqueta: '2.ª pestaña (la colección)', largoRecomendado: 25 })}
            </div>
          );
        }
        if (bloque.id === 'galeria') {
          return h.galeria(['backstage'], {
            permitirVideo: true, esVideo: esVideoEditorial, columnas: 4, textoAnadir: 'Añadir fotos o vídeos',
          });
        }
        if (bloque.id === 'sin-bloques') {
          return <BotonAnadir h={h} ruta={['bloques']} crear={nuevoBloqueEditorial} posicion={0}>Añadir un bloque</BotonAnadir>;
        }
        // Un bloque de foto (o vídeo) + texto
        const indice = h.borrador.bloques.findIndex((otro) => otro.id === bloque.id);
        if (indice < 0) return null;
        const ruta = (...resto) => ['bloques', indice, ...resto];
        const actual = h.borrador.bloques[indice];
        return (
          <>
          <div className={styles.bloqueEditorial}>
            <div className={editorStyles.fichaCampos}>
              <div>
                <p className={campos.etiqueta}>Foto o vídeo</p>
                <ElegirTipo
                  valor={actual.tipo}
                  onChange={(tipo) => {
                    if (tipo === actual.tipo) return;
                    h.cambiar(ruta('tipo'), tipo);
                    h.cambiar(ruta('src'), '');
                  }}
                />
              </div>
              <div>
                {h.medio(ruta('src'), {
                  etiqueta: actual.tipo === 'video' ? 'Vídeo' : 'Foto', tipo: actual.tipo, detalle: 'Vertical', proporcion: '3 / 4',
                })}
              </div>
            </div>
            <div className={`${editorStyles.fichaCampos} ${styles.columnaTextos}`}>
              {h.texto(ruta('titulo'), { etiqueta: 'Título', largoRecomendado: 40 })}
              {h.texto(ruta('texto'), { etiqueta: 'Texto', multilinea: true, filas: 6 })}
            </div>
          </div>
          <ControlesLista
            h={h}
            ruta={['bloques']}
            indice={indice}
            crear={nuevoBloqueEditorial}
            elemento={BLOQUE}
            nombre={actual.titulo.es || `el bloque ${indice + 1}`}
          />
          </>
        );
      }}
    </EditorPagina>
  );
}

export default AdminEditorialAtelier;
