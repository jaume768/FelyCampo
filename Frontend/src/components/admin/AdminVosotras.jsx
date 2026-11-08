'use client';

/* ============================================================
   ADMIN · VOSOTRAS — Fely Campo
   /admin/vosotras: las fotos de clientas (looks) y sus reseñas de
   /atelier/vosotras. Igual que Blog & Podcast: un listado con pestañas
   y una ficha con el editor común (EditorPagina.jsx: vista previa en
   vivo, Español | English y «Guardar y publicar»). Vistas, según la URL:
     (sin parámetros) / ?pestana=novias / ?pestana=resenas   listados
     ?look=<id>&pestana=<invitadas|novias>   editar un look (look=nuevo: crear)
     ?resena=<id>                            editar una reseña (resena=nuevo: crear;
                                             con &look=<id>, ya enlazada a ese look)
   Datos y reglas: Vosotras.jsx (estado) y lib/vosotras.js (lo mismo que
   lee la web). Ver docs/ADMIN.md.
   ============================================================ */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink, Plus } from 'lucide-react';
import { Boton } from '@/components/ui';
import {
  ID_PREVIA_VOSOTRAS, PESTANAS_VOSOTRAS, RUTA_WEB_VOSOTRAS, camposLook, camposResena, nuevaResena, nuevoLook, pestanaDeLook,
} from '@/lib/vosotras';
import CampoLinea from './CampoLinea';
import ConfirmarBorrado from './ConfirmarBorrado';
import DragList from './DragList';
import EditorPagina from './EditorPagina';
import AdminCabecera from './AdminCabecera';
import { FilaListado, PestanasListado, PestanasPagina } from './ListadoAdmin';
import PageHeader from './PageHeader';
import { useToast } from './Toast';
import { conLook, conResena, useVosotras } from './Vosotras';
import editorStyles from './EditorPagina.module.css';
import listado from './ListadoAdmin.module.css';
import styles from './AdminVosotras.module.css';

const BASE = '/admin/vosotras';
// Al entrar se abre la página (título y texto); los looks y las reseñas
// están en sus pestañas.
const INVITADAS = `${BASE}?pestana=invitadas`;
const WEB = `/es${RUTA_WEB_VOSOTRAS}`;
const NUEVO = 'nuevo';
// Ya se guarda en la base de datos (ContenidoAdmin.jsx): sin coletilla «demo».
const DEMO = '';

const nombrePestana = (id) => PESTANAS_VOSOTRAS.find((p) => p.id === id)?.nombre || '';
const fotos = (n) => `${n} ${n === 1 ? 'foto' : 'fotos'}`;

// «Look 4 de Invitadas»: número = su posición en la pestaña (como en la web).
function nombreLook(datos, lookId) {
  const pestana = pestanaDeLook(datos, lookId);
  if (!pestana) return '';
  return `Look ${datos[pestana].findIndex((look) => look.id === lookId) + 1} de ${nombrePestana(pestana)}`;
}

// ---------- Listados ----------

function Listado({ pestana }) {
  const { mostrarToast } = useToast();
  const {
    datos, alternarLook, borrarLook, reordenarLooks, alternarResena, borrarResena, reordenarResenas,
  } = useVosotras();
  const [porBorrar, setPorBorrar] = useState(null);
  const esResenas = pestana === 'resenas';
  const lista = esResenas ? datos.resenas : datos[pestana];
  const visibles = lista.filter((item) => item.publicado).length;

  const pestanas = [
    ...PESTANAS_VOSOTRAS.map(({ id, nombre }) => ({
      href: `${BASE}?pestana=${id}`, nombre, cuenta: datos[id].length, activa: pestana === id,
    })),
    {
      href: `${BASE}?pestana=resenas`, nombre: 'Reseñas', cuenta: datos.resenas.length, activa: esResenas,
    },
  ];

  function avisar(item) {
    mostrarToast(`${item.publicado ? 'Oculto en la web' : 'Publicado en la web'}${DEMO}`);
  }

  return (
    <>
      <PageHeader
        titulo="Vosotras"
        subtitulo={esResenas
          ? `${lista.length} reseñas · ${visibles} en la web · salen entre las fotos de Invitadas, una cada dos filas, en este orden · arrastra para cambiarlo`
          : `${lista.length} looks · ${visibles} en la web · arrastra para cambiar el orden en que salen`}
      >
        <Boton variante="contorno" nuevaPestana href={WEB}>
          <ExternalLink size={14} aria-hidden="true" /> Ver en la web
        </Boton>
        <Boton variante="solido" href={esResenas ? `${BASE}?resena=${NUEVO}` : `${BASE}?look=${NUEVO}&pestana=${pestana}`}>
          <Plus size={14} aria-hidden="true" /> {esResenas ? 'Nueva reseña' : 'Nuevo look'}
        </Boton>
      </PageHeader>

      <PestanasPagina etiqueta="Vosotras" pagina={BASE} listado={{ href: INVITADAS, nombre: 'Fotos y reseñas', cuenta: datos.invitadas.length + datos.novias.length + datos.resenas.length }} activa="listado" />

      <PestanasListado etiqueta="Pestañas de Vosotras" pestanas={pestanas} />

      {lista.length === 0 && <p className={listado.vacio}>{esResenas ? 'Todavía no hay reseñas.' : 'Todavía no hay looks en esta pestaña.'}</p>}

      {!esResenas && lista.length > 0 && (
        <DragList
          items={lista}
          claveItem={(look) => look.id}
          onReorder={(nueva) => { reordenarLooks(pestana, nueva); mostrarToast(`Orden guardado${DEMO}`); }}
          renderItem={(look, indice) => {
            const resena = datos.resenas.find((r) => r.look === look.id);
            return (
              <FilaListado
                numero={indice + 1}
                vertical
                imagen={look.fotos[0]}
                titulo={`Look ${indice + 1}`}
                detalle={`${fotos(look.fotos.length)}${resena ? ` · con la reseña de ${resena.firma.es || 'una clienta'}` : ''}`}
                publicado={look.publicado}
                editar={`${BASE}?look=${look.id}&pestana=${pestana}`}
                verEnWeb={WEB}
                onAlternar={() => { alternarLook(pestana, look.id); avisar(look); }}
                onBorrar={() => setPorBorrar({ ...look, nombre: `Look ${indice + 1}` })}
              />
            );
          }}
        />
      )}

      {esResenas && lista.length > 0 && (
        <DragList
          items={lista}
          claveItem={(resena) => resena.id}
          onReorder={(nueva) => { reordenarResenas(nueva); mostrarToast(`Orden guardado${DEMO}`); }}
          renderItem={(resena, indice) => {
            const pestanaLook = pestanaDeLook(datos, resena.look);
            const portada = pestanaLook && datos[pestanaLook].find((look) => look.id === resena.look)?.fotos[0];
            return (
              <FilaListado
                numero={indice + 1}
                vertical
                imagen={portada}
                titulo={resena.firma.es || 'Sin firma'}
                detalle={resena.extracto ? `«${resena.extracto}»` : 'Sin texto en la casilla'}
                etiqueta={resena.look ? `Con fotos: ${nombreLook(datos, resena.look)}` : 'Sin fotos'}
                publicado={resena.publicado}
                editar={`${BASE}?resena=${resena.id}`}
                verEnWeb={WEB}
                onAlternar={() => { alternarResena(resena.id); avisar(resena); }}
                onBorrar={() => setPorBorrar({ ...resena, nombre: `la reseña de ${resena.firma.es || 'la clienta'}` })}
              />
            );
          }}
        />
      )}

      <ConfirmarBorrado
        abierto={Boolean(porBorrar)}
        titulo={`¿Borrar ${esResenas ? porBorrar?.nombre : `el ${porBorrar?.nombre}`}?`}
        mensaje={esResenas
          ? 'Deja de salir en la web. No se puede deshacer; si solo quieres quitarla un tiempo, ocúltala.'
          : 'Sus fotos dejan de salir en la web (si tenía reseña, la reseña se queda, pero sin fotos). No se puede deshacer; si solo quieres quitarlo un tiempo, ocúltalo.'}
        onConfirmar={() => {
          if (esResenas) borrarResena(porBorrar.id);
          else borrarLook(pestana, porBorrar.id);
          mostrarToast(`Borrado${DEMO}`);
          setPorBorrar(null);
        }}
        onCancelar={() => setPorBorrar(null)}
      />
    </>
  );
}

// ---------- Editar un look ----------

const BLOQUES_LOOK = [
  {
    id: 'fotos',
    nombre: 'Fotos',
    resumen: 'La primera es la portada',
    descripcion: 'Las fotos de la clienta. La primera es la portada de su casilla; al pulsarla, se ven todas. Arrastra para cambiar el orden.',
    datos: (d) => d.fotos,
  },
  {
    id: 'pestana',
    nombre: 'Dónde sale',
    resumen: 'Invitadas o Novias',
    descripcion: 'La pestaña de la página en la que sale este look.',
    datos: (d) => d.pestana,
  },
  {
    id: 'resena',
    nombre: 'Reseña de la clienta',
    resumen: 'Opcional',
    descripcion: 'Lo que la clienta escribió. Se edita aparte, en la pestaña «Reseñas».',
    datos: () => null,
  },
];

function ElegirPestana({ valor, onChange }) {
  return (
    <div className={styles.segmentado} role="radiogroup" aria-label="Pestaña">
      {PESTANAS_VOSOTRAS.map(({ id, nombre }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={valor === id}
          className={`${styles.segmento} ${valor === id ? styles.segmentoActivo : ''}`}
          onClick={() => onChange(id)}
        >
          {nombre}
        </button>
      ))}
    </div>
  );
}

function ResenasDelLook({ datos, lookId }) {
  const resenas = datos.resenas.filter((r) => r.look === lookId);
  if (!lookId) {
    return <p className={editorStyles.ayudaBloque}>Cuando publiques el look, podrás añadirle la reseña de la clienta.</p>;
  }
  return (
    <div className={styles.resenasLook}>
      {resenas.length === 0 && <p className={editorStyles.ayudaBloque}>Este look no tiene reseña.</p>}
      {resenas.map((resena) => (
        <div key={resena.id} className={styles.resenaLook}>
          <p className={styles.resenaFirma}>{resena.firma.es || 'Sin firma'}</p>
          <p className={styles.resenaTexto}>{resena.extracto ? `«${resena.extracto} (...)»` : '(sin texto en la casilla)'}</p>
          <Link href={`${BASE}?resena=${resena.id}`} className={styles.enlace}>Editar la reseña</Link>
        </div>
      ))}
      {resenas.length === 0 && (
        <Boton variante="contorno" href={`${BASE}?resena=${NUEVO}&look=${lookId}`}>
          <Plus size={14} aria-hidden="true" /> Añadir una reseña a este look
        </Boton>
      )}
    </div>
  );
}

function EditarLook({ lookId, pestanaInicial }) {
  const router = useRouter();
  const { datos, guardarLook } = useVosotras();
  const esNuevo = lookId === NUEVO;
  const pestanaActual = esNuevo ? (pestanaInicial === 'novias' ? 'novias' : 'invitadas') : pestanaDeLook(datos, lookId);
  const [vacio] = useState(nuevoLook);
  const look = esNuevo ? vacio : pestanaActual && datos[pestanaActual].find((item) => item.id === lookId);

  if (!look) {
    return <p className={listado.vacio}>Este look no existe. <Link href={INVITADAS}>Volver a Vosotras</Link></p>;
  }

  const publicado = { ...look, pestana: pestanaActual };
  const sinPestana = ({ pestana, ...resto }) => resto;
  const titulo = esNuevo ? 'Nuevo look' : nombreLook(datos, lookId);

  return (
    <EditorPagina
      key={lookId}
      id={ID_PREVIA_VOSOTRAS}
      titulo={titulo}
      rutaWeb={RUTA_WEB_VOSOTRAS}
      bloques={BLOQUES_LOOK}
      campos={camposLook}
      publicado={publicado}
      datosPrevia={(borrador) => conLook(datos, { ...sinPestana(borrador), id: borrador.id || 'nuevo-en-previa' }, borrador.pestana)}
      guardar={(borrador) => {
        const id = guardarLook(sinPestana(borrador), borrador.pestana);
        router.replace(`${BASE}?look=${id}&pestana=${borrador.pestana}`);
      }}
      migas="Vosotras"
      volver={pestanaActual === 'novias' ? `${BASE}?pestana=novias` : INVITADAS}
      estadoPublicado={esNuevo ? 'Sin publicar' : (look.publicado ? 'Publicado' : 'Oculto en la web')}
      textoPublicado={esNuevo ? 'Look publicado' : 'Cambios publicados'}
      enLaWeb={!esNuevo}
    >
      {(bloque, h) => {
        if (bloque.id === 'fotos') {
          return h.galeria(['fotos'], { papeles: (indice) => (indice === 0 ? 'Portada' : ''), textoAnadir: 'Añadir fotos' });
        }
        if (bloque.id === 'pestana') {
          return <ElegirPestana valor={h.borrador.pestana} onChange={(pestana) => h.cambiar(['pestana'], pestana)} />;
        }
        return <ResenasDelLook datos={datos} lookId={esNuevo ? '' : lookId} />;
      }}
    </EditorPagina>
  );
}

// ---------- Editar una reseña ----------

const BLOQUES_RESENA = [
  {
    id: 'resena',
    nombre: 'Reseña',
    resumen: 'Quién la escribe y su texto',
    descripcion: 'Sale como una casilla de texto entre las fotos de Invitadas, una cada dos filas.',
    datos: (d) => [d.firma, d.extracto],
  },
  {
    id: 'fotos',
    nombre: 'Sus fotos',
    resumen: 'Opcional',
    descripcion: 'Si eliges sus fotos, al pulsar la casilla se abren, y junto a ellas se puede leer la reseña entera.',
    datos: (d) => [d.look, d.texto],
  },
];

// Elegir el look de la clienta mirando las portadas.
function ElegirLook({ datos, valor, onChange }) {
  return (
    <div className={styles.elegirLook}>
      <button
        type="button"
        className={`${styles.sinFotos} ${!valor ? styles.lookElegido : ''}`}
        aria-pressed={!valor}
        onClick={() => onChange('')}
      >
        Sin fotos
      </button>
      {PESTANAS_VOSOTRAS.map(({ id, nombre }) => (
        <div key={id} className={styles.grupoLooks}>
          <p className={styles.grupoLooksTitulo}>{nombre}</p>
          <div className={styles.portadas}>
            {datos[id].map((look, indice) => (
              <button
                key={look.id}
                type="button"
                className={`${styles.portada} ${valor === look.id ? styles.lookElegido : ''}`}
                aria-pressed={valor === look.id}
                aria-label={`Look ${indice + 1} de ${nombre}`}
                title={`Look ${indice + 1} de ${nombre}`}
                onClick={() => onChange(look.id)}
              >
                <img src={look.fotos[0]} alt="" loading="lazy" />
                <span className={styles.portadaNumero}>{indice + 1}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EditarResena({ resenaId, lookInicial }) {
  const router = useRouter();
  const { datos, guardarResena } = useVosotras();
  const esNueva = resenaId === NUEVO;
  const [vacia] = useState(() => nuevaResena(lookInicial || ''));
  const resena = esNueva ? vacia : datos.resenas.find((item) => item.id === resenaId);

  if (!resena) {
    return <p className={listado.vacio}>Esta reseña no existe. <Link href={`${BASE}?pestana=resenas`}>Volver a las reseñas</Link></p>;
  }

  return (
    <EditorPagina
      key={resenaId}
      id={ID_PREVIA_VOSOTRAS}
      titulo={esNueva ? 'Nueva reseña' : `Reseña de ${resena.firma.es || 'una clienta'}`}
      rutaWeb={RUTA_WEB_VOSOTRAS}
      bloques={BLOQUES_RESENA}
      campos={camposResena}
      publicado={resena}
      datosPrevia={(borrador) => conResena(datos, { ...borrador, id: borrador.id || 'nueva-en-previa' })}
      guardar={(borrador) => {
        const id = guardarResena(borrador);
        router.replace(`${BASE}?resena=${id}`);
      }}
      migas="Vosotras · Reseñas"
      volver={`${BASE}?pestana=resenas`}
      estadoPublicado={esNueva ? 'Sin publicar' : (resena.publicado ? 'Publicada' : 'Oculta en la web')}
      textoPublicado={esNueva ? 'Reseña publicada' : 'Cambios publicados'}
      enLaWeb={!esNueva}
    >
      {(bloque, h) => {
        if (bloque.id === 'resena') {
          return (
            <div className={editorStyles.columnaTexto}>
              {h.texto(['firma'], {
                etiqueta: 'Quién la escribe', largoRecomendado: 40, ayuda: 'Sale debajo del texto. Por ejemplo: «Mari Carmen, Gijón» o «Madrina de boda».',
              })}
              <CampoLinea
                etiqueta="Texto de la casilla"
                filas={4}
                valor={h.borrador.extracto}
                ayuda="Lo que se lee en la casilla, con «(...)» al final. Son las palabras de la clienta: salen igual en español y en inglés."
                onChange={(extracto) => h.cambiar(['extracto'], extracto)}
              />
            </div>
          );
        }
        return (
          <div className={styles.fotosResena}>
            <ElegirLook datos={datos} valor={h.borrador.look} onChange={(look) => h.cambiar(['look'], look)} />
            {h.borrador.look && (
              <div className={editorStyles.columnaTexto}>
                <CampoLinea
                  etiqueta="Reseña entera"
                  opcional
                  filas={8}
                  valor={h.borrador.texto.join('\n\n')}
                  ayuda="Se lee junto a sus fotos al abrirlas. Deja una línea en blanco entre párrafos. Sale igual en español y en inglés."
                  onChange={(texto) => h.cambiar(['texto'], texto ? texto.split('\n\n') : [])}
                />
              </div>
            )}
          </div>
        );
      }}
    </EditorPagina>
  );
}

// ---------- Página ----------

// La pestaña «Página de la web»: título y texto de /atelier/vosotras.
function PaginaVosotras() {
  const { datos } = useVosotras();
  return (
    <AdminCabecera
      id="vosotras"
      migas="Vosotras"
      pestanas={<PestanasPagina etiqueta="Vosotras" pagina={BASE} listado={{ href: INVITADAS, nombre: 'Fotos y reseñas', cuenta: datos.invitadas.length + datos.novias.length + datos.resenas.length }} activa="pagina" />}
    />
  );
}

function AdminVosotras() {
  const params = useSearchParams();
  const look = params.get('look');
  const resena = params.get('resena');
  const pestana = params.get('pestana');

  // Primero la reseña: «Añadir una reseña a este look» lleva ?resena=nuevo&look=<id>.
  if (resena) return <EditarResena resenaId={resena} lookInicial={look} />;
  if (look) return <EditarLook lookId={look} pestanaInicial={pestana} />;
  if (pestana) return <Listado pestana={['novias', 'resenas'].includes(pestana) ? pestana : 'invitadas'} />;
  return <PaginaVosotras />;
}

export default AdminVosotras;
