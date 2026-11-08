'use client';

/* ============================================================
   ADMIN · BLOG & PODCAST — Fely Campo
   /admin/blog. Una sola página con varias vistas, según la URL (así el
   botón "atrás" del navegador funciona):
     (sin parámetros)        listado de artículos
     ?tipo=podcast           listado de episodios (reordenable)
     ?articulo=<slug>        editar un artículo   (articulo=nuevo: crear)
     ?episodio=<slug>        editar un episodio   (episodio=nuevo: crear)
   Los artículos y episodios se editan con el editor común
   (EditorPagina.jsx): vista previa en vivo, Español | English y
   «Guardar y publicar». El cuerpo de un artículo, con EditorBloques.
   Datos y reglas: Blog.jsx (estado) y lib/blog.js (lo mismo que lee la
   web). Ver docs/ADMIN.md.
   ============================================================ */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink, Plus } from 'lucide-react';
import { Boton } from '@/components/ui';
import {
  SLUG_NUEVO, camposArticulo, camposEpisodio, idPreviaArticulo, idPreviaEpisodio, nuevoArticulo, nuevoEpisodio, slugDesdeTitulo,
} from '@/lib/blog';
import { useBlog } from './Blog';
import CampoLinea from './CampoLinea';
import ConfirmarBorrado from './ConfirmarBorrado';
import DragList from './DragList';
import EditorBloques from './EditorBloques';
import EditorPagina from './EditorPagina';
import AdminCabecera from './AdminCabecera';
import { FilaListado, PestanasListado, PestanasPagina } from './ListadoAdmin';
import PageHeader from './PageHeader';
import { useToast } from './Toast';
import editorStyles from './EditorPagina.module.css';
import listado from './ListadoAdmin.module.css';
import styles from './AdminBlog.module.css';

const BASE = '/admin/blog';
// Al entrar se abre la página (cabecera y textos); los artículos y el
// podcast están en sus pestañas.
const ARTICULOS = `${BASE}?tipo=articulos`;
// Ya se guarda en la base de datos (ContenidoAdmin.jsx): sin coletilla «demo».
const DEMO = '';

const formatoFecha = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
const fechaLegible = (fecha) => (fecha ? formatoFecha.format(new Date(fecha)) : 'Sin fecha');

// ---------- Listados (piezas comunes: ListadoAdmin.jsx) ----------

function Listado({ tipo }) {
  const { mostrarToast } = useToast();
  const {
    articulos, episodios, alternarArticulo, alternarEpisodio, borrarArticulo, borrarEpisodio, reordenarEpisodios,
  } = useBlog();
  const [porBorrar, setPorBorrar] = useState(null);
  const esPodcast = tipo === 'podcast';
  const ordenados = [...articulos].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  const visibles = (esPodcast ? episodios : articulos).filter((item) => item.publicado).length;
  const total = esPodcast ? episodios.length : articulos.length;

  function alternar(item) {
    (esPodcast ? alternarEpisodio : alternarArticulo)(item.slug);
    mostrarToast(`${item.publicado ? 'Oculto en la web' : 'Publicado en la web'}${DEMO}`);
  }

  return (
    <>
      <PageHeader
        titulo="Blog & Podcast"
        subtitulo={esPodcast
          ? `${total} episodios · ${visibles} en la web · arrastra para cambiar el orden en que salen`
          : `${total} artículos · ${visibles} en la web · del más reciente al más antiguo, como en la web`}
      >
        <Boton variante="contorno" nuevaPestana href="/es/blog">
          <ExternalLink size={14} aria-hidden="true" /> Ver el blog
        </Boton>
        <Boton variante="solido" href={esPodcast ? `${BASE}?episodio=${SLUG_NUEVO}` : `${BASE}?articulo=${SLUG_NUEVO}`}>
          <Plus size={14} aria-hidden="true" /> {esPodcast ? 'Nuevo episodio' : 'Nuevo artículo'}
        </Boton>
      </PageHeader>

      <PestanasPagina etiqueta="Blog & Podcast" pagina={BASE} listado={{ href: ARTICULOS, nombre: 'Artículos y podcast', cuenta: articulos.length + episodios.length }} activa="listado" />

      <PestanasListado
        etiqueta="Blog o podcast"
        pestanas={[
          {
            href: ARTICULOS, nombre: 'Artículos', cuenta: articulos.length, activa: !esPodcast,
          },
          {
            href: `${BASE}?tipo=podcast`, nombre: 'Podcast', cuenta: episodios.length, activa: esPodcast,
          },
        ]}
      />

      {total === 0 && <p className={listado.vacio}>{esPodcast ? 'Todavía no hay episodios.' : 'Todavía no hay artículos.'}</p>}

      {!esPodcast && (
        <div className={listado.lista}>
          {ordenados.map((articulo) => (
            <FilaListado
              key={articulo.slug}
              imagen={articulo.imagenCubierta}
              titulo={articulo.titulo.es}
              detalle={`${fechaLegible(articulo.fecha)} · ${articulo.bloques.length} bloques`}
              publicado={articulo.publicado}
              editar={`${BASE}?articulo=${articulo.slug}`}
              verEnWeb={`/es/blog/${articulo.slug}`}
              onAlternar={() => alternar(articulo)}
              onBorrar={() => setPorBorrar(articulo)}
            />
          ))}
        </div>
      )}

      {esPodcast && episodios.length > 0 && (
        <DragList
          items={episodios}
          claveItem={(episodio) => episodio.slug}
          onReorder={(lista) => { reordenarEpisodios(lista); mostrarToast(`Orden de episodios guardado${DEMO}`); }}
          renderItem={(episodio) => (
            <FilaListado
              imagen={episodio.imagenCubierta}
              titulo={episodio.titulo.es}
              detalle={[episodio.duracion, episodio.enlace?.replace(/^https?:\/\/(www\.)?/, '')].filter(Boolean).join(' · ')}
              publicado={episodio.publicado}
              editar={`${BASE}?episodio=${episodio.slug}`}
              verEnWeb={episodio.enlace}
              onAlternar={() => alternar(episodio)}
              onBorrar={() => setPorBorrar(episodio)}
            />
          )}
        />
      )}

      <ConfirmarBorrado
        abierto={Boolean(porBorrar)}
        titulo={`¿Borrar «${porBorrar?.titulo.es || 'Sin título'}»?`}
        mensaje={esPodcast
          ? 'Su tarjeta deja de salir en el blog. No se puede deshacer; si solo quieres quitarlo un tiempo, ocúltalo.'
          : 'Su página deja de existir (quien entre en su dirección irá al blog). No se puede deshacer; si solo quieres quitarlo un tiempo, ocúltalo.'}
        onConfirmar={() => {
          (esPodcast ? borrarEpisodio : borrarArticulo)(porBorrar.slug);
          mostrarToast(`Borrado${DEMO}`);
          setPorBorrar(null);
        }}
        onCancelar={() => setPorBorrar(null)}
      />
    </>
  );
}

// ---------- Editar un artículo ----------

const BLOQUES_ARTICULO = [
  {
    id: 'datos',
    nombre: 'Portada y tarjeta',
    resumen: 'Título, fecha, foto y resumen',
    descripcion: 'La cabecera del artículo y su tarjeta en el listado del blog.',
    datos: (d) => [d.titulo, d.fecha, d.imagenCubierta, d.resumen],
  },
  {
    id: 'cuerpo',
    nombre: 'Contenido',
    resumen: 'Textos, fotos y citas',
    descripcion: 'El artículo, bloque a bloque, en el orden de la web. Usa «+» entre dos bloques para insertar uno ahí.',
    datos: (d) => d.bloques,
  },
];

function DatosArticulo({ h, slug, esNuevo }) {
  const direccion = esNuevo ? slugDesdeTitulo(h.borrador.titulo.es) : slug;
  return (
    <div className={editorStyles.medioYCampos}>
      {h.medio(['imagenCubierta'], { etiqueta: 'Foto de portada', detalle: 'Horizontal · cabecera y tarjeta', proporcion: '16 / 9' })}
      <div className={editorStyles.fichaCampos}>
        {h.texto(['titulo'], { etiqueta: 'Título', largoRecomendado: 70 })}
        <CampoLinea
          etiqueta="Fecha"
          tipo="date"
          valor={h.borrador.fecha}
          ayuda="Sale bajo el título y ordena el listado: los más recientes, primero."
          onChange={(fecha) => h.cambiar(['fecha'], fecha)}
        />
        {h.texto(['resumen'], {
          etiqueta: 'Resumen', multilinea: true, filas: 3, largoRecomendado: 200, ayuda: 'Sale en la tarjeta del listado y en Google.',
        })}
        <p className={styles.direccion}>
          <span className={styles.direccionEtiqueta}>Dirección</span>
          {`felycampo.com/blog/${direccion}`}
          <span className={styles.direccionAyuda}>
            {esNuevo
              ? 'Se crea con el título al publicar y ya no cambia, para no romper enlaces ni perder posiciones en Google.'
              : 'Fija: no cambia aunque cambie el título, para no romper enlaces ni perder posiciones en Google.'}
          </span>
        </p>
      </div>
    </div>
  );
}

function EditarArticulo({ slug }) {
  const router = useRouter();
  const { articulos, guardarArticulo } = useBlog();
  const esNuevo = slug === SLUG_NUEVO;
  const [vacio] = useState(nuevoArticulo);
  const articulo = esNuevo ? vacio : articulos.find((item) => item.slug === slug);

  if (!articulo) {
    return <p className={listado.vacio}>Este artículo no existe. <Link href={ARTICULOS}>Volver al blog</Link></p>;
  }

  return (
    <EditorPagina
      key={slug}
      id={idPreviaArticulo(slug)}
      titulo={articulo.titulo.es || 'Nuevo artículo'}
      rutaWeb={`/blog/${slug}`}
      bloques={BLOQUES_ARTICULO}
      campos={camposArticulo}
      publicado={articulo}
      guardar={(datos) => {
        const guardado = guardarArticulo(datos, slug);
        if (esNuevo) router.replace(`${BASE}?articulo=${guardado}`);
      }}
      migas="Blog & Podcast"
      volver={ARTICULOS}
      estadoPublicado={esNuevo ? 'Sin publicar' : (articulo.publicado ? 'Publicado' : 'Oculto en la web')}
      textoPublicado={esNuevo ? 'Artículo publicado' : 'Cambios publicados'}
      enLaWeb={!esNuevo && articulo.publicado}
    >
      {(bloque, h) => (bloque.id === 'datos'
        ? <DatosArticulo h={h} slug={slug} esNuevo={esNuevo} />
        : <EditorBloques bloques={h.borrador.bloques} idioma={h.idioma} onChange={(bloques) => h.cambiar(['bloques'], bloques)} />)}
    </EditorPagina>
  );
}

// ---------- Editar un episodio ----------

const BLOQUES_EPISODIO = [
  {
    id: 'episodio',
    nombre: 'Episodio',
    resumen: 'Portada, título, duración y enlace',
    descripcion: 'Su tarjeta en el blog. Al pulsarla, se abre el episodio en una pestaña nueva.',
    datos: (d) => d,
  },
];

function EditarEpisodio({ slug }) {
  const router = useRouter();
  const { episodios, guardarEpisodio } = useBlog();
  const esNuevo = slug === SLUG_NUEVO;
  const [vacio] = useState(nuevoEpisodio);
  const episodio = esNuevo ? vacio : episodios.find((item) => item.slug === slug);

  if (!episodio) {
    return <p className={listado.vacio}>Este episodio no existe. <Link href={`${BASE}?tipo=podcast`}>Volver al podcast</Link></p>;
  }

  return (
    <EditorPagina
      key={slug}
      id={idPreviaEpisodio(slug)}
      titulo={episodio.titulo.es || 'Nuevo episodio'}
      rutaWeb="/blog"
      bloques={BLOQUES_EPISODIO}
      campos={camposEpisodio}
      publicado={episodio}
      guardar={(datos) => {
        const guardado = guardarEpisodio(datos, slug);
        if (esNuevo) router.replace(`${BASE}?episodio=${guardado}`);
      }}
      migas="Blog & Podcast · Podcast"
      volver={`${BASE}?tipo=podcast`}
      estadoPublicado={esNuevo ? 'Sin publicar' : (episodio.publicado ? 'Publicado' : 'Oculto en la web')}
      textoPublicado={esNuevo ? 'Episodio publicado' : 'Cambios publicados'}
      enLaWeb={!esNuevo}
    >
      {(_, h) => (
        <div className={editorStyles.medioYCampos}>
          {h.medio(['imagenCubierta'], { etiqueta: 'Foto de portada', detalle: 'Ocupa toda la tarjeta', proporcion: '4 / 3' })}
          <div className={editorStyles.fichaCampos}>
            {h.texto(['titulo'], { etiqueta: 'Título', largoRecomendado: 60, ayuda: 'Sale en la tarjeta, junto a la duración.' })}
            <CampoLinea
              etiqueta="Duración"
              valor={h.borrador.duracion}
              placeholder="34 min"
              ayuda="Tal cual se escribe: «34 min», «1 h 5 min»…"
              onChange={(duracion) => h.cambiar(['duracion'], duracion)}
            />
            {h.url(['enlace'], {
              etiqueta: 'Enlace al episodio',
              ayuda: 'La dirección completa del vídeo (YouTube, Spotify…), empezando por https://',
            })}
          </div>
        </div>
      )}
    </EditorPagina>
  );
}

// ---------- Página ----------

// La pestaña «Página de la web»: cabecera e introducción de /blog.
function PaginaBlog() {
  const { articulos, episodios } = useBlog();
  return (
    <AdminCabecera
      id="blog"
      migas="Blog & Podcast"
      pestanas={<PestanasPagina etiqueta="Blog & Podcast" pagina={BASE} listado={{ href: ARTICULOS, nombre: 'Artículos y podcast', cuenta: articulos.length + episodios.length }} activa="pagina" />}
    />
  );
}

function AdminBlog() {
  const params = useSearchParams();
  const articulo = params.get('articulo');
  const episodio = params.get('episodio');

  if (articulo) return <EditarArticulo slug={articulo} />;
  if (episodio) return <EditarEpisodio slug={episodio} />;
  if (params.get('tipo')) return <Listado tipo={params.get('tipo')} />;
  return <PaginaBlog />;
}

export default AdminBlog;
