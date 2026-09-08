'use client';

/* ============================================================
   EDITOR DE DISEÑO — Fely Campo (admin)
   Los 8 bloques de la home se renderizan con sus componentes REALES
   (HeroCarousel, MediaBanner, CollectionTitle...), envueltos en un
   NextIntlClientProvider con los messages/{locale}.json reales — mismo
   patrón que ya usan los *.stories.js de estos componentes para
   renderizarlos fuera del árbol [locale] (ver MediaBanner.stories.js).
   Así la vista previa es un espejo pixel a pixel de la home real, no
   una aproximación.
   Clicar un bloque abre un ModalOverlay (mismo diálogo centrado que
   "Nuevo producto" en ListaProductos.jsx) con sus campos en FormSeccion
   numeradas — mismo lenguaje visual que FormularioProducto.jsx en vez
   del panel lateral de antes.
   IMPORTANTE — solo diseño, sin lógica nueva: los bloques cuyo texto en
   la home viene de una clave de traducción (text/media/mediaSplit/
   reviews) siguen mostrando el texto REAL de esas claves
   en la vista previa — los campos del modal para esos bloques son
   cosmética/placeholder, no reescriben messages/*.json (no hay backend
   detrás de ningún bloque de este editor). Los bloques cuyo contenido
   real ya es un dato plano en vez de una clave (hero, productRow,
   mediaSplit → imagen/vídeo, mediaText) sí quedan conectados de verdad,
   igual que antes.
   ============================================================ */

import { useState, useRef } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import {
  Plus, X, Pencil, ArrowUpFromLine, Upload, Check,
} from 'lucide-react';
import { Boton, Input, CollectionTitle } from '../ui';
import {
  HeroCarousel, MediaBanner, SplitMedia, CuadriculaProductos, BloqueSeccion, SectionClientsReview,
} from '../layout';
import {
  PageHeader, PickerDrawer, SelectorIdioma, FormSeccion, ModalOverlay, useToast,
} from './index';
import {
  productosMock, resenasMock, paginasInternas, tiposProducto, bancoImagenes, bancoVideos, disenoMock,
} from './mockData';
import mensajesEs from '../../../messages/es.json';
import mensajesEn from '../../../messages/en.json';
import styles from './DisenoEditor.module.css';

const MENSAJES = { es: mensajesEs, en: mensajesEn };

// Idioma fijo de la vista previa en espejo — cada bloque edita su propio
// ES/EN dentro de su panel (ver SelectorIdioma en EditorTexto/EditorMedia/
// SlideEditor), así que ya no hace falta un selector global en la
// cabecera para decidir en qué idioma se ve el espejo.
const IDIOMA_PREVIA = 'es';

const TITULOS_KIND = {
  hero: 'Hero — carrusel',
  text: 'Bloque de texto',
  media: 'Imagen + CTA',
  productRow: 'Fila de producto',
  mediaSplit: 'Dos imágenes',
  mediaText: 'Imagen + texto',
  reviews: 'Reseñas destacadas',
};

const SPLIT_TITULO_KEYS = ['splitMedia.item1.titulo', 'splitMedia.item2.titulo'];

// Paso 1 del selector de productos (SelectorProductos), usado por
// "Destacados" (productRow): solo Prêt-à-porter y Atelier — Runway
// (tipo 'archivo') queda fuera de estas filas a propósito (novia/fiesta
// son archivo editorial, no productos vendibles — no tienen filas en
// productosMock, ver mockData.js).
const TIPOS_PRODUCTO_DESTACADOS = tiposProducto.filter((t) => ['pret-a-porter', 'atelier'].includes(t.valor));

// "Destino del CTA" en dos pasos: primero la sección (Prêt-à-porter,
// Atelier...), luego la colección/categoría concreta dentro de ella —
// mismos 8 destinos de paginasInternas (mockData.js) de siempre, solo
// reagrupados por el prefijo de su ruta en vez de una lista plana de 8
// opciones sueltas. La etiqueta corta dentro de cada grupo quita el
// "Prêt-à-porter — " repetido (ya lo dice el botón de arriba); la
// entrada de nivel superior sin " — " (p.ej. "Prêt-à-porter" a secas)
// pasa a "Todo el catálogo".
const GRUPOS_DESTINO = [
  { grupo: 'Prêt-à-porter', prefijo: '/tienda' },
  { grupo: 'Atelier', prefijo: '/atelier' },
  { grupo: 'Archivo', prefijo: '/archivo' },
  { grupo: 'Visítanos', prefijo: '/visita-fely-campo' },
].map(({ grupo, prefijo }) => ({
  grupo,
  opciones: paginasInternas
    .filter((p) => p.valor.startsWith(prefijo))
    .map((p) => ({
      valor: p.valor,
      etiqueta: p.etiqueta.startsWith(`${grupo} — `) ? p.etiqueta.slice(grupo.length + 3) : 'Todo el catálogo',
    })),
}));

function grupoDeDestino(valor) {
  return GRUPOS_DESTINO.find((g) => g.opciones.some((o) => o.valor === valor)) || GRUPOS_DESTINO[0];
}

const BANCO_MEDIA = [
  ...bancoImagenes.map((src) => ({ src, tipo: 'imagen' })),
  ...bancoVideos.map((src) => ({ src, tipo: 'video' })),
];

function productosDe(ids) {
  return ids.map((id) => productosMock.find((p) => p.id === id)).filter(Boolean);
}

// Vista previa real de cada bloque — mismos componentes y mismas claves
// de traducción que src/app/[locale]/page.js, con href="#" en vez de
// rutas reales (PreviewBloque ya bloquea el click con pointer-events:none
// más el botón overlay, así que "#" nunca llega a navegar).
function vistaPreviaDe(bloque, idioma) {
  switch (bloque.kind) {
    case 'hero':
      return (
        <HeroCarousel
          slides={bloque.slides.map((s) => ({
            tipo: s.tipo, src: s.src, titulo: s.titulo[idioma], ctaTexto: s.ctaTexto[idioma], ctaHref: s.destino,
          }))}
        />
      );
    case 'text':
      return (
        <CollectionTitle
          labelKey="collectionTitle.edicionMujer.label"
          titleKey="collectionTitle.edicionMujer.title"
          descriptionKey="collectionTitle.edicionMujer.description"
        />
      );
    case 'media':
      return (
        <MediaBanner
          src={bloque.src}
          tipo={bloque.tipo}
          tituloKey="mediaBanner.titulo"
          ctaKey="mediaBanner.cta"
          href="#"
          variante="imageTitle"
        />
      );
    case 'productRow':
      return <CuadriculaProductos productos={productosDe(bloque.productoIds)} verMasHref="#" />;
    case 'mediaSplit':
      return (
        <SplitMedia
          variante="landing"
          items={bloque.items.map((item, i) => ({
            tipo: item.tipo, src: item.src, href: '#', tituloKey: SPLIT_TITULO_KEYS[i] || SPLIT_TITULO_KEYS[0],
          }))}
        />
      );
    case 'mediaText':
      return (
        <BloqueSeccion imagen={bloque.imagen} titulo={bloque.titulo} texto={bloque.texto} enlace={bloque.enlaceTexto} href="#" />
      );
    case 'reviews':
      return <SectionClientsReview />;
    default:
      return null;
  }
}

// Envoltorio de cada bloque en la vista previa: el bloque real (sin
// interacción propia, ver .previaContenido) más un botón transparente a
// pantalla completa que, al hover, oscurece y enseña "Editar…" — clicar
// en cualquier punto abre el modal, no hay que acertarle a un botón
// pequeño.
function PreviewBloque({ bloque, idioma, onEditar }) {
  return (
    <div className={styles.previaBloque}>
      <div className={styles.previaContenido}>{vistaPreviaDe(bloque, idioma)}</div>
      <button type="button" className={styles.previaOverlay} onClick={onEditar} aria-label={`Editar ${bloque.label}`}>
        <span className={styles.previaEtiqueta}>
          <Pencil size={14} aria-hidden="true" />
          {`Editar ${bloque.label}`}
        </span>
      </button>
    </div>
  );
}

function renderMediaPicker(item) {
  return item.tipo === 'video'
    ? <video src={item.src} className={styles.pickerImagen} muted />
    : <img src={item.src} alt="" className={styles.pickerImagen} />;
}

function elegirMediaUnico({ abrirPicker, actual, onElegido }) {
  abrirPicker({
    titulo: 'Elegir imagen o vídeo',
    items: BANCO_MEDIA,
    claveItem: (item) => item.src,
    seleccionInicial: actual ? [actual] : [],
    max: 1,
    renderItem: renderMediaPicker,
    onConfirmar: (seleccion) => {
      const elegido = BANCO_MEDIA.find((item) => item.src === seleccion[0]);
      if (elegido) onElegido(elegido);
    },
  });
}

// Selector de imagen/vídeo del modal — mismo lenguaje visual que
// FormularioProducto.module.css .subirVacio (caja de borde discontinuo,
// icono + texto centrados): aquí siempre hay ya una imagen elegida, así
// que se ve de fondo y el aviso de "Añadir imagen" pasa a "Cambiar
// imagen/vídeo" en overlay al hover, en vez del estado vacío puro de
// FormularioProducto (que si arranca sin ninguna imagen subida).
function SelectorMedia({ src, tipo, onAbrir }) {
  return (
    <button type="button" className={styles.imagenSelector} onClick={onAbrir}>
      {tipo === 'video' ? (
        <video src={src} className={styles.imagenSelectorMedia} muted />
      ) : (
        <img src={src} alt="" className={styles.imagenSelectorMedia} />
      )}
      <span className={styles.imagenSelectorOverlay}>
        <Upload size={20} strokeWidth={1} aria-hidden="true" />
        Cambiar imagen/vídeo
      </span>
    </button>
  );
}

function SelectorDestino({ etiqueta = 'Destino', valor, onChange }) {
  const [grupo, setGrupo] = useState(() => grupoDeDestino(valor).grupo);
  const grupoActivo = GRUPOS_DESTINO.find((g) => g.grupo === grupo) || GRUPOS_DESTINO[0];

  // Cambiar de sección salta directamente a su primera colección — así
  // el <select> de abajo nunca queda apuntando a un valor que ya no
  // está en su lista de opciones.
  function elegirGrupo(g) {
    setGrupo(g.grupo);
    onChange({ target: { value: g.opciones[0].valor } });
  }

  return (
    <div className={styles.campoAncho}>
      <span className={styles.etiquetaCampo}>{etiqueta}</span>
      <div className={styles.destinoTipos}>
        {GRUPOS_DESTINO.map((g) => (
          <button
            key={g.grupo}
            type="button"
            className={`${styles.destinoTipoBoton} ${grupo === g.grupo ? styles.destinoTipoBotonActivo : ''}`}
            onClick={() => elegirGrupo(g)}
          >
            {g.grupo}
          </button>
        ))}
      </div>
      <select className={styles.selectInput} value={valor} onChange={onChange}>
        {grupoActivo.opciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
      </select>
    </div>
  );
}

// Elegir productos en dos pasos, directo en la sección (nada de abrir un
// picker aparte ni una lista arrastrable con lo ya elegido — el check en
// la tarjeta ya dice qué está dentro): primero el origen del producto
// (Prêt-à-porter/Atelier/Archivo — mismo patrón de pastilla que "Destino
// del CTA"/GRUPOS_DESTINO más abajo), luego una cuadrícula con los
// productos de ese origen — tocar una tarjeta la marca/desmarca. La fila
// exige los 4 huecos llenos y del MISMO origen (no se puede mezclar
// Prêt-à-porter con Atelier en una misma fila): cambiar de pastilla
// vacía la selección en curso en vez de dejarla mezclarse con el nuevo
// origen — "Guardar cambios" en DisenoEditor se desactiva hasta que
// haya exactamente 4 (ver bloqueCompleto).
function SelectorProductos({ productoIds, onChange, max = 4 }) {
  // Arranca en la pastilla del origen ya elegido (no siempre la primera)
  // — si no, una fila ya guardada en Atelier/Archivo abriría mostrando la
  // cuadrícula de Prêt-à-porter: nada marcado y todo bloqueado por haber
  // llegado a max, sin forma de ver ni tocar la selección real.
  const [tipo, setTipo] = useState(() => productosMock.find((p) => p.id === productoIds[0])?.tipo ?? TIPOS_PRODUCTO_DESTACADOS[0].valor);
  const seleccionados = productoIds.map((id) => productosMock.find((p) => p.id === id)).filter(Boolean);
  const productosTipo = productosMock.filter((p) => p.tipo === tipo);

  function elegirTipo(t) {
    if (t.valor === tipo) return;
    setTipo(t.valor);
    onChange([]);
  }

  function alternar(id) {
    if (productoIds.includes(id)) {
      onChange(productoIds.filter((pid) => pid !== id));
    } else if (productoIds.length < max) {
      onChange([...productoIds, id]);
    }
  }

  return (
    <div>
      <div className={styles.destinoTipos}>
        {TIPOS_PRODUCTO_DESTACADOS.map((t) => (
          <button
            key={t.valor}
            type="button"
            className={`${styles.destinoTipoBoton} ${tipo === t.valor ? styles.destinoTipoBotonActivo : ''}`}
            onClick={() => elegirTipo(t)}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      <p className={styles.contadorSeleccion}>{seleccionados.length} de {max} seleccionados</p>

      <div className={styles.productosGrid}>
        {productosTipo.map((p) => {
          const marcado = productoIds.includes(p.id);
          const bloqueado = !marcado && productoIds.length >= max;
          return (
            <button
              key={p.id}
              type="button"
              disabled={bloqueado}
              className={`${styles.productoTarjeta} ${marcado ? styles.productoTarjetaSeleccionada : ''}`}
              onClick={() => alternar(p.id)}
            >
              {marcado && (
                <span className={styles.productoTarjetaMarca}>
                  <Check size={14} />
                </span>
              )}
              <img src={p.imagen} alt="" className={styles.pickerImagen} />
              <span className={styles.productoTarjetaNombre}>{p.nombre}</span>
              <span className={styles.productoTarjetaPrecio}>{p.precio}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Editores por tipo de bloque (contenido del ModalOverlay) ----------

// Idioma propio del panel — mismo criterio que SlideEditor del Hero:
// poder editar ES y EN de este bloque sin cerrar el modal.
function EditorTexto({ bloque, actualizar }) {
  const [idioma, setIdioma] = useState('es');
  return (
    <FormSeccion numero={1} titulo="Texto" descripcion="Etiqueta, título y descripción del bloque.">
      <div className={styles.campoAncho}><SelectorIdioma idioma={idioma} onChange={setIdioma} /></div>
      <Input
        etiqueta={`Etiqueta (${idioma.toUpperCase()})`}
        valor={bloque.etiqueta[idioma]}
        onChange={(e) => actualizar({ etiqueta: { ...bloque.etiqueta, [idioma]: e.target.value } })}
      />
      <Input
        etiqueta={`Título (${idioma.toUpperCase()})`}
        valor={bloque.titulo[idioma]}
        onChange={(e) => actualizar({ titulo: { ...bloque.titulo, [idioma]: e.target.value } })}
      />
      <div className={styles.campoAncho}>
        <span className={styles.etiquetaCampo}>{`Descripción (${idioma.toUpperCase()})`}</span>
        <textarea
          className={styles.textarea}
          value={bloque.descripcion[idioma]}
          onChange={(e) => actualizar({ descripcion: { ...bloque.descripcion, [idioma]: e.target.value } })}
        />
      </div>
    </FormSeccion>
  );
}

// Idioma propio del panel — mismo criterio que EditorTexto/SlideEditor:
// poder editar ES y EN del título y el CTA sin cerrar el modal.
function EditorMedia({ bloque, actualizar, abrirPicker }) {
  const [idioma, setIdioma] = useState('es');
  return (
    <FormSeccion numero={1} titulo="Imagen y CTA" descripcion="Imagen o vídeo a ancho completo con título y CTA superpuestos.">
      <div className={styles.campoAncho}>
        <SelectorMedia
          src={bloque.src}
          tipo={bloque.tipo}
          onAbrir={() => elegirMediaUnico({ abrirPicker, actual: bloque.src, onElegido: (m) => actualizar({ src: m.src, tipo: m.tipo }) })}
        />
      </div>
      <div className={styles.campoAncho}><SelectorIdioma idioma={idioma} onChange={setIdioma} /></div>
      <Input
        etiqueta={`Título (${idioma.toUpperCase()})`}
        valor={bloque.titulo[idioma]}
        onChange={(e) => actualizar({ titulo: { ...bloque.titulo, [idioma]: e.target.value } })}
      />
      <Input
        etiqueta={`Texto del CTA (${idioma.toUpperCase()})`}
        valor={bloque.ctaTexto[idioma]}
        onChange={(e) => actualizar({ ctaTexto: { ...bloque.ctaTexto, [idioma]: e.target.value } })}
      />
    </FormSeccion>
  );
}

function EditorProductRow({ bloque, actualizar }) {
  return (
    <FormSeccion numero={1} titulo="Productos" descripcion="4 productos ya publicados, del mismo origen.">
      <div className={styles.campoAncho}>
        <SelectorProductos productoIds={bloque.productoIds} onChange={(ids) => actualizar({ productoIds: ids })} max={4} />
      </div>
    </FormSeccion>
  );
}

function EditorMediaSplit({ bloque, actualizar, abrirPicker }) {
  function actualizarItem(id, cambios) {
    actualizar({ items: bloque.items.map((i) => (i.id === id ? { ...i, ...cambios } : i)) });
  }
  return (
    <>
      {bloque.items.map((item, indice) => (
        <FormSeccion key={item.id} numero={indice + 1} titulo={`Imagen ${indice + 1}`}>
          <div className={styles.campoAncho}>
            <SelectorMedia
              src={item.src}
              tipo={item.tipo}
              onAbrir={() => elegirMediaUnico({ abrirPicker, actual: item.src, onElegido: (m) => actualizarItem(item.id, m) })}
            />
          </div>
          <Input etiqueta="Título" valor={item.titulo} onChange={(e) => actualizarItem(item.id, { titulo: e.target.value })} />
        </FormSeccion>
      ))}
    </>
  );
}

function EditorMediaText({ bloque, actualizar, abrirPicker }) {
  return (
    <FormSeccion numero={1} titulo="Imagen y texto">
      <div className={styles.campoAncho}>
        <SelectorMedia
          src={bloque.imagen}
          tipo="imagen"
          onAbrir={() => elegirMediaUnico({ abrirPicker, actual: bloque.imagen, onElegido: (m) => actualizar({ imagen: m.src }) })}
        />
      </div>
      <Input etiqueta="Título" valor={bloque.titulo} onChange={(e) => actualizar({ titulo: e.target.value })} />
      <Input etiqueta="Texto del enlace" valor={bloque.enlaceTexto} onChange={(e) => actualizar({ enlaceTexto: e.target.value })} />
      <div className={styles.campoAncho}>
        <span className={styles.etiquetaCampo}>Texto</span>
        <textarea className={styles.textarea} value={bloque.texto} onChange={(e) => actualizar({ texto: e.target.value })} />
      </div>
    </FormSeccion>
  );
}

const RESEÑA_VACIA = { nombreCliente: '', texto: '' };

// Cuadrícula de reseñas elegibles (mismo lenguaje que SelectorProductos:
// tocar una tarjeta la marca/desmarca, sin drawer lateral de por medio) +
// un popup propio (ModalOverlay anidado, no PanelLateral) para que el
// admin dé de alta una reseña que no está en resenasMock — se guarda en
// bloque.resenasPropias (persiste con el resto del bloque, ver
// actualizarBloque en DisenoEditor) y queda disponible en la cuadrícula
// igual que las publicadas.
function EditorReviews({ bloque, actualizar }) {
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [nuevaResena, setNuevaResena] = useState(RESEÑA_VACIA);

  const propias = bloque.resenasPropias || [];
  const disponibles = [...resenasMock.filter((r) => r.estado === 'Publicada'), ...propias];
  const seleccionadas = bloque.resenaIds.length;

  function alternar(id) {
    if (bloque.resenaIds.includes(id)) {
      actualizar({ resenaIds: bloque.resenaIds.filter((rid) => rid !== id) });
    } else if (bloque.resenaIds.length < bloque.maximo) {
      actualizar({ resenaIds: [...bloque.resenaIds, id] });
    }
  }

  function guardarNueva() {
    if (!nuevaResena.nombreCliente.trim() || !nuevaResena.texto.trim()) return;
    const id = `rp${Date.now()}`;
    const resena = {
      id, nombreCliente: nuevaResena.nombreCliente.trim(), texto: nuevaResena.texto.trim(), estado: 'Publicada', foto: '',
    };
    actualizar({
      resenasPropias: [...propias, resena],
      resenaIds: bloque.resenaIds.length < bloque.maximo ? [...bloque.resenaIds, id] : bloque.resenaIds,
    });
    setNuevaResena(RESEÑA_VACIA);
    setMostrarAlta(false);
  }

  return (
    <FormSeccion numero={1} titulo="Reseñas" descripcion={`Hasta ${bloque.maximo} reseñas ya publicadas.`}>
      <div className={styles.campoAncho}>
        <p className={styles.contadorSeleccion}>{seleccionadas} de {bloque.maximo} seleccionadas</p>

        <div className={styles.reseñasGrid}>
          {disponibles.map((r) => {
            const marcada = bloque.resenaIds.includes(r.id);
            const bloqueada = !marcada && bloque.resenaIds.length >= bloque.maximo;
            return (
              <button
                key={r.id}
                type="button"
                disabled={bloqueada}
                className={`${styles.reseñaTarjeta} ${marcada ? styles.reseñaTarjetaSeleccionada : ''}`}
                onClick={() => alternar(r.id)}
              >
                {marcada && (
                  <span className={styles.productoTarjetaMarca}>
                    <Check size={14} />
                  </span>
                )}
                {r.foto ? <img src={r.foto} alt="" className={styles.reseñaTarjetaFoto} /> : <span className={styles.reseñaTarjetaFoto} />}
                <span className={styles.reseñaTarjetaNombre}>{r.nombreCliente}</span>
                <span className={styles.reseñaTarjetaExtracto}>{r.texto}</span>
              </button>
            );
          })}
        </div>

        <Boton variante="contorno" tamano="s" onClick={() => setMostrarAlta(true)}>
          <Plus size={14} /> Añadir tu reseña
        </Boton>
      </div>

      <ModalOverlay abierto={mostrarAlta} onCerrar={() => setMostrarAlta(false)}>
        <PageHeader titulo="Añadir reseña" subtitulo="Se añade a la cuadrícula ya marcada." />
        <Input
          etiqueta="Nombre del cliente"
          valor={nuevaResena.nombreCliente}
          onChange={(e) => setNuevaResena((actual) => ({ ...actual, nombreCliente: e.target.value }))}
        />
        <div className={styles.campoAncho}>
          <span className={styles.etiquetaCampo}>Texto</span>
          <textarea
            className={styles.textarea}
            value={nuevaResena.texto}
            onChange={(e) => setNuevaResena((actual) => ({ ...actual, texto: e.target.value }))}
          />
        </div>
        <div className={styles.accionesModal}>
          <Boton variante="solido" onClick={guardarNueva}>Añadir reseña</Boton>
        </div>
      </ModalOverlay>
    </FormSeccion>
  );
}

// Un componente propio por slide (no una función renderItem suelta) para
// que cada uno tenga su PROPIO estado de idioma — el Hero tiene 3 slides
// independientes y forzar que las 3 compartan un único toggle obligaría a
// cerrar el modal para editar cada versión. `useState` solo
// funciona aquí porque SlideEditor es un componente real: metido a mano
// dentro de un .map() no tendría un lugar propio donde vivir el hook.
function SlideEditor({
  slide, indice, actualizarSlide, quitarSlide,
}) {
  const [idioma, setIdioma] = useState('es');
  const inputArchivoRef = useRef(null);

  function archivoElegido(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const esVideo = archivo.type.startsWith('video/');
    actualizarSlide(slide.id, { src: URL.createObjectURL(archivo), tipo: esVideo ? 'video' : 'imagen' });
    e.target.value = '';
  }

  return (
    <FormSeccion
      numero={indice + 1}
      titulo={`Slide ${indice + 1}`}
      accion={<Boton variante="texto" onClick={() => quitarSlide(slide.id)}><X size={14} /></Boton>}
    >
      <div className={styles.campoAncho}>
        {/* Slide del Hero = archivo real del ordenador, no el banco de
            imágenes ya subidas que usan el resto de bloques (Banner, Dos
            imágenes, Imagen + texto) — por eso onAbrir dispara un
            <input type="file"> en vez de abrirPicker/PickerDrawer. */}
        <SelectorMedia src={slide.src} tipo={slide.tipo} onAbrir={() => inputArchivoRef.current?.click()} />
        <input
          ref={inputArchivoRef}
          type="file"
          accept="image/*,video/*"
          className={styles.inputArchivo}
          onChange={archivoElegido}
        />
      </div>
      <div className={styles.campoAncho}><SelectorIdioma idioma={idioma} onChange={setIdioma} /></div>
      <Input
        etiqueta={`Título (${idioma.toUpperCase()})`}
        valor={slide.titulo[idioma]}
        onChange={(e) => actualizarSlide(slide.id, { titulo: { ...slide.titulo, [idioma]: e.target.value } })}
      />
      <Input
        etiqueta={`Texto del CTA (${idioma.toUpperCase()})`}
        valor={slide.ctaTexto[idioma]}
        onChange={(e) => actualizarSlide(slide.id, { ctaTexto: { ...slide.ctaTexto, [idioma]: e.target.value } })}
      />
      <SelectorDestino etiqueta="Destino del CTA" valor={slide.destino} onChange={(e) => actualizarSlide(slide.id, { destino: e.target.value })} />
    </FormSeccion>
  );
}

function EditorHero({ bloque, actualizar }) {
  function actualizarSlide(id, cambios) {
    actualizar({ slides: bloque.slides.map((s) => (s.id === id ? { ...s, ...cambios } : s)) });
  }
  function quitarSlide(id) {
    actualizar({ slides: bloque.slides.filter((s) => s.id !== id) });
  }
  function anadirSlide() {
    actualizar({
      slides: [...bloque.slides, {
        id: `s${Date.now()}`, src: bancoImagenes[0], tipo: 'imagen', titulo: { es: '', en: '' }, ctaTexto: { es: '', en: '' }, destino: paginasInternas[0].valor,
      }],
    });
  }
  return (
    <>
      {bloque.slides.map((slide, indice) => (
        <SlideEditor
          key={slide.id}
          slide={slide}
          indice={indice}
          actualizarSlide={actualizarSlide}
          quitarSlide={quitarSlide}
        />
      ))}
      <Boton variante="contorno" tamano="s" onClick={anadirSlide}><Plus size={14} /> Añadir slide</Boton>
    </>
  );
}

// Fila de producto ("Destacados") exige sus 4 huecos llenos (ver
// SelectorProductos) antes de poder guardar — el resto de bloques no
// tiene ese requisito, así que se dan siempre por completos.
function bloqueCompleto(bloque) {
  if (bloque.kind === 'productRow') return bloque.productoIds.length === 4;
  return true;
}

const EDITORES = {
  hero: EditorHero,
  text: EditorTexto,
  media: EditorMedia,
  productRow: EditorProductRow,
  mediaSplit: EditorMediaSplit,
  mediaText: EditorMediaText,
  reviews: EditorReviews,
};

function DisenoEditor() {
  const { mostrarToast } = useToast();
  const [bloques, setBloques] = useState(disenoMock);
  const [picker, setPicker] = useState(null);
  const [seleccionTemp, setSeleccionTemp] = useState([]);
  const [bloqueEnEdicionId, setBloqueEnEdicionId] = useState(null);

  const bloqueEnEdicion = bloques.find((b) => b.id === bloqueEnEdicionId);

  function actualizarBloque(id, cambios) {
    setBloques((actual) => actual.map((b) => (b.id === id ? { ...b, ...cambios } : b)));
  }

  function abrirPicker(config) {
    setSeleccionTemp(config.seleccionInicial || []);
    setPicker(config);
  }

  function publicarDiseno() {
    mostrarToast('Nuevo diseño publicado (demo) — sigue sin haber una web pública real detrás');
  }

  return (
    <div>
      <PageHeader
        titulo="Diseño"
        subtitulo="Vista previa en espejo de la página de inicio — clica un bloque para editarlo."
      >
        <Boton variante="solido" className={styles.publicarBoton} onClick={publicarDiseno}>
          <ArrowUpFromLine size={14} />
          Publicar nuevo diseño
        </Boton>
      </PageHeader>

      <NextIntlClientProvider locale={IDIOMA_PREVIA} messages={MENSAJES[IDIOMA_PREVIA]}>
        <div className={styles.previaMarco}>
          <div className={styles.previaSangre}>
            {bloques.map((bloque) => (
              <PreviewBloque
                key={bloque.id}
                bloque={bloque}
                idioma={IDIOMA_PREVIA}
                onEditar={() => setBloqueEnEdicionId(bloque.id)}
              />
            ))}
          </div>
        </div>
      </NextIntlClientProvider>

      <ModalOverlay abierto={Boolean(bloqueEnEdicion)} onCerrar={() => setBloqueEnEdicionId(null)}>
        {bloqueEnEdicion && (() => {
          const EditorEnPanel = EDITORES[bloqueEnEdicion.kind];
          return (
            <>
              <PageHeader titulo={bloqueEnEdicion.label} subtitulo={TITULOS_KIND[bloqueEnEdicion.kind]} />
              <EditorEnPanel
                bloque={bloqueEnEdicion}
                actualizar={(cambios) => actualizarBloque(bloqueEnEdicion.id, cambios)}
                abrirPicker={abrirPicker}
              />
              <div className={styles.accionesModal}>
                <Boton
                  variante="solido"
                  desactivado={!bloqueCompleto(bloqueEnEdicion)}
                  onClick={() => setBloqueEnEdicionId(null)}
                >
                  Guardar cambios
                </Boton>
              </div>
            </>
          );
        })()}
      </ModalOverlay>

      {/* z-index propio: crea un stacking context por encima del
          ModalOverlay (z-index 100 en ModalOverlay.module.css) sin tocar
          PanelLateral.module.css (compartido con el submenú del Navbar
          público) — así el picker se ve aunque se abra con el modal de
          edición ya abierto detrás. */}
      <div className={styles.pickerCapa}>
        {picker && (
          <PickerDrawer
            abierto
            onCerrar={() => setPicker(null)}
            titulo={picker.titulo}
            items={picker.items}
            claveItem={picker.claveItem}
            seleccionados={seleccionTemp}
            onToggle={(clave) => setSeleccionTemp((actual) => {
              if (picker.max === 1) return [clave];
              return actual.includes(clave) ? actual.filter((c) => c !== clave) : [...actual, clave];
            })}
            max={picker.max}
            renderItem={picker.renderItem}
            onConfirmar={() => picker.onConfirmar(seleccionTemp)}
            columnas={2}
          />
        )}
      </div>
    </div>
  );
}

export default DisenoEditor;
