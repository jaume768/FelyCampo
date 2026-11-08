'use client';

/* ============================================================
   ADMIN · RUNWAY — Fely Campo
   /admin/colecciones/runway: las colecciones de pasarela. Igual que el
   resto del panel: un listado con las piezas comunes (ListadoAdmin.jsx)
   y una ficha por colección con el editor común (EditorPagina.jsx:
   Español | English, Vista previa y «Guardar y publicar»), con un bloque
   por cada parte de su página en la web (/runways-<slug>). Vistas:
     (sin parámetros)         listado (reordenable)
     ?categoria=<id>          editar una colección (categoria=nueva: crear)
   "categoria" es el mismo parámetro que usa el submenú "Runway" del menú
   lateral. Datos y reglas: Runway.jsx (estado) y lib/runway.js (lo
   mismo que lee la web). Ver docs/ADMIN.md.
   ============================================================ */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink, Plus } from 'lucide-react';
import { Boton } from '@/components/ui';
import {
  EDITOR_RUNWAY, SLUG_NUEVA_RUNWAY, camposColeccionRunway, idPreviaRunway, nuevaColeccionRunway, slugRunway, validarExtraRunway,
} from '@/lib/runway';
import CampoLinea from './CampoLinea';
import ConfirmarBorrado from './ConfirmarBorrado';
import DragList from './DragList';
import EditorPagina from './EditorPagina';
import { FilaListado } from './ListadoAdmin';
import PageHeader from './PageHeader';
import { useRunway } from './Runway';
import { useToast } from './Toast';
import editorStyles from './EditorPagina.module.css';
import listado from './ListadoAdmin.module.css';
import styles from './AdminColeccionesAtelier.module.css';
import AdminCabecera from './AdminCabecera';
import { PestanasPagina } from './ListadoAdmin';

const BASE = EDITOR_RUNWAY;
// Al entrar se abre la página (cabecera del listado de la web); las
// colecciones están en la segunda pestaña.
const LISTADO = `${BASE}?vista=colecciones`;
// Ya se guarda en la base de datos (ContenidoAdmin.jsx): sin coletilla «demo».
const DEMO = '';
const urlWeb = (coleccion) => `/es/runways-${coleccion.slug}`;

// Campos que pueden quedar vacíos a propósito (ver RunwayContenido.jsx).
const OPCIONALES = ['video', 'descripcion.en', 'videoEnlace.href', 'videoEnlace.imagen', 'videoEnlace.titulo', 'videoEnlace.meta.es', 'videoEnlace.meta.en'];

// ---------- Listado ----------

function Listado() {
  const { mostrarToast } = useToast();
  const {
    colecciones, alternar, borrar, reordenar,
  } = useRunway();
  const [porBorrar, setPorBorrar] = useState(null);
  const publicadas = colecciones.filter((c) => c.publicado).length;

  return (
    <>
      <PageHeader
        titulo="Runway"
        subtitulo={`${colecciones.length} colecciones de pasarela · ${publicadas} en la web · arrastra para cambiar el orden en que salen`}
      >
        <Boton variante="contorno" nuevaPestana href="/es/colecciones-fely-campo">
          <ExternalLink size={14} aria-hidden="true" /> Ver en la web
        </Boton>
        <Boton variante="solido" href={`${BASE}?categoria=${SLUG_NUEVA_RUNWAY}`}>
          <Plus size={14} aria-hidden="true" /> Nueva colección
        </Boton>
      </PageHeader>

      <PestanasRunway activa="listado" />

      <DragList
        items={colecciones}
        claveItem={(c) => c.id}
        onReorder={(lista) => { reordenar(lista); mostrarToast(`Orden guardado${DEMO}`); }}
        renderItem={(coleccion, indice) => (
          <FilaListado
            numero={indice + 1}
            vertical
            imagen={coleccion.portada}
            titulo={`${coleccion.nombre} · ${coleccion.temporada}`}
            detalle={[
              `${coleccion.looks.length} looks`,
              coleccion.backstage.length > 0 && `${coleccion.backstage.length} fotos de backstage`,
              coleccion.video ? 'con vídeo' : (coleccion.videoEnlace?.href && 'con enlace al desfile'),
            ].filter(Boolean).join(' · ')}
            publicado={coleccion.publicado}
            editar={`${BASE}?categoria=${coleccion.id}`}
            verEnWeb={urlWeb(coleccion)}
            onAlternar={() => {
              alternar(coleccion.id);
              mostrarToast(`${coleccion.publicado ? 'Colección oculta en la web' : 'Colección publicada en la web'}${DEMO}`);
            }}
            onBorrar={() => setPorBorrar(coleccion)}
          />
        )}
      />

      <ConfirmarBorrado
        abierto={Boolean(porBorrar)}
        titulo={`¿Borrar ${porBorrar?.nombre} ${porBorrar?.temporada}?`}
        mensaje="Su página deja de existir (quien entre en su dirección irá al listado de colecciones). No se puede deshacer; si solo quieres quitarla un tiempo, ocúltala."
        onConfirmar={() => {
          borrar(porBorrar.id);
          mostrarToast(`Colección borrada${DEMO}`);
          setPorBorrar(null);
        }}
        onCancelar={() => setPorBorrar(null)}
      />
    </>
  );
}

// ---------- Editar una colección ----------

const BLOQUES = [
  {
    id: 'datos', nombre: 'Nombre y temporada', resumen: 'Y su dirección', descripcion: 'Salen en la cabecera de su página y en su tarjeta del listado.', datos: (d) => [d.nombre, d.temporada],
  },
  {
    id: 'portada', nombre: 'Portada', resumen: 'Cabecera y tarjeta', descripcion: 'La foto de la cabecera de su página y de su tarjeta en el listado de colecciones.', datos: (d) => d.portada,
  },
  {
    id: 'descripcion', nombre: 'Texto', resumen: 'Bajo la cabecera', descripcion: 'El texto de la colección, debajo de la cabecera.', datos: (d) => d.descripcion,
  },
  {
    id: 'backstage', nombre: 'Backstage', resumen: 'Opcional', descripcion: 'Fotos del backstage, entre el texto y los looks. Si no hay, esa parte no sale.', datos: (d) => d.backstage,
  },
  {
    id: 'looks', nombre: 'Looks', resumen: 'Una foto por look', descripcion: 'Una foto por look, en el orden del desfile («Look 1, 2…»). Al pulsar una, se abre en grande con su texto, si lo tiene.', datos: (d) => d.looks,
  },
  {
    id: 'video', nombre: 'Vídeo del desfile', resumen: 'Al final', descripcion: 'Al final de la página: una foto que lleva al desfile en YouTube. Mejor enlazar el vídeo que subirlo.', datos: (d) => [d.video, d.videoEnlace],
  },
];

function EditarColeccion({ id }) {
  const router = useRouter();
  const { colecciones, guardar } = useRunway();
  const esNueva = id === SLUG_NUEVA_RUNWAY;
  const [vacia] = useState(nuevaColeccionRunway);
  const coleccion = esNueva ? vacia : colecciones.find((c) => c.id === id);

  if (!coleccion) {
    return <p className={listado.vacio}>Esta colección no existe. <Link href={LISTADO}>Volver a Runway</Link></p>;
  }
  const slug = esNueva ? SLUG_NUEVA_RUNWAY : coleccion.slug;

  return (
    <EditorPagina
      key={id}
      id={idPreviaRunway(slug)}
      titulo={esNueva ? 'Nueva colección' : `${coleccion.nombre} · ${coleccion.temporada}`}
      rutaWeb={`/runways-${slug}`}
      bloques={BLOQUES}
      campos={camposColeccionRunway}
      opcionales={OPCIONALES}
      validarExtra={validarExtraRunway}
      publicado={coleccion}
      guardar={(datos) => {
        const nuevoId = guardar(datos, id);
        if (esNueva) router.replace(`${BASE}?categoria=${nuevoId}`);
      }}
      migas="Runway"
      volver={LISTADO}
      estadoPublicado={esNueva ? 'Sin publicar' : (coleccion.publicado ? 'Publicada' : 'Oculta en la web')}
      textoPublicado={esNueva ? 'Colección publicada' : 'Cambios publicados'}
      enLaWeb={!esNueva && coleccion.publicado}
    >
      {(bloque, h) => {
        if (bloque.id === 'datos') {
          return (
            <div className={editorStyles.columnaTexto}>
              <div className={editorStyles.dosColumnas}>
                <CampoLinea etiqueta="Nombre" valor={h.borrador.nombre} placeholder="La Colección" onChange={(nombre) => h.cambiar(['nombre'], nombre)} />
                <CampoLinea
                  etiqueta="Temporada"
                  valor={h.borrador.temporada}
                  placeholder="AW27"
                  ayuda="AW (otoño-invierno) o SS (primavera-verano) y el año."
                  onChange={(temporada) => h.cambiar(['temporada'], temporada.toUpperCase())}
                />
              </div>
              <p className={styles.ayuda}>
                Dirección: <strong>/runways-{esNueva ? (slugRunway(h.borrador.nombre, colecciones.map((c) => c.slug))) : coleccion.slug}</strong>
                {' · '}
                {esNueva
                  ? 'se crea con el nombre al publicar y ya no cambia, para no romper enlaces ni perder posiciones en Google.'
                  : 'fija: no cambia aunque cambie el nombre.'}
              </p>
            </div>
          );
        }
        if (bloque.id === 'portada') {
          return <div className={styles.portadaHorizontal}>{h.medio(['portada'], { etiqueta: 'Portada', detalle: 'Horizontal', proporcion: '16 / 9' })}</div>;
        }
        if (bloque.id === 'descripcion') {
          return (
            <div className={editorStyles.columnaTexto}>
              {h.texto(['descripcion'], {
                etiqueta: 'Texto',
                multilinea: true,
                filas: 12,
                opcional: h.idioma === 'en',
                ayuda: h.idioma === 'en' ? 'Si se deja vacío, en inglés se enseña el texto en español.' : 'Un solo párrafo.',
              })}
            </div>
          );
        }
        if (bloque.id === 'backstage') return h.galeria(['backstage'], { textoAnadir: 'Añadir fotos', columnas: 4 });
        if (bloque.id === 'looks') {
          return h.galeria(['looks'], {
            conPie: true, papeles: (indice) => `Look ${indice + 1}`, textoPie: 'Texto del look', textoAnadir: 'Añadir looks', columnas: 4,
          });
        }
        // Vídeo del desfile: primero el enlace a YouTube (lo recomendado);
        // el vídeo propio queda debajo como segunda opción, más discreta
        // (pesa mucho y ralentiza la web).
        return (
          <div className={editorStyles.columnaTexto}>
            {h.borrador.video && (
              <p className={styles.aviso}>
                Esta colección tiene un vídeo propio (abajo): mientras esté, se enseña ese vídeo y no el enlace.
                Para usar el enlace a YouTube, quita el vídeo.
              </p>
            )}
            {h.url(['videoEnlace', 'href'], { etiqueta: 'Enlace al desfile en YouTube', ayuda: 'La dirección del vídeo, empezando por https://', opcional: true })}
            <div className={editorStyles.medioYCampos}>
              {h.medio(['videoEnlace', 'imagen'], {
                etiqueta: 'Foto del enlace', detalle: 'Horizontal', proporcion: '16 / 9', opcional: true,
              })}
              <div className={editorStyles.fichaCampos}>
                <CampoLinea
                  etiqueta="Título"
                  opcional
                  valor={h.borrador.videoEnlace.titulo}
                  placeholder="Dreaming SS26 - Desfile"
                  onChange={(titulo) => h.cambiar(['videoEnlace', 'titulo'], titulo)}
                />
                {h.texto(['videoEnlace', 'meta'], { etiqueta: 'Texto bajo el título', opcional: true, largoRecomendado: 50 })}
              </div>
            </div>

            <div className={editorStyles.division} />

            <div className={styles.videoPropio}>
              <p className={styles.videoPropioTitulo}>Otra opción: subir el vídeo (no recomendado)</p>
              <p className={styles.ayuda}>
                Un vídeo subido pesa mucho y hace que la página tarde en cargar. Mejor súbelo a YouTube y pon aquí arriba el enlace.
              </p>
              <div className={styles.portadaColeccion}>
                {h.medio(['video'], {
                  etiqueta: 'Vídeo propio', tipo: 'video', proporcion: '16 / 9', opcional: true,
                })}
              </div>
            </div>
          </div>
        );
      }}
    </EditorPagina>
  );
}

function PestanasRunway({ activa }) {
  const { colecciones } = useRunway();
  return <PestanasPagina etiqueta="Runway" pagina={BASE} listado={{ href: LISTADO, nombre: 'Colecciones', cuenta: colecciones.length }} activa={activa} />;
}

function AdminRunway() {
  const params = useSearchParams();
  const id = params.get('categoria');
  if (id) return <EditarColeccion id={id} />;
  if (params.get('vista') === 'colecciones') return <Listado />;
  return <AdminCabecera id="runway" migas="Runway" pestanas={<PestanasRunway activa="pagina" />} />;
}

export default AdminRunway;
