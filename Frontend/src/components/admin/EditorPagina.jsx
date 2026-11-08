'use client';

/* ============================================================
   EDITOR DE PÁGINA — Fely Campo (admin)
   El editor común de las páginas de la web (inicio, Sobre Fely,
   Talleres…), al estilo de los editores de WordPress / Shopify:
     · Barra fija arriba: estado (publicada / cambios sin publicar),
       idioma que se edita (Español | English, con el número de textos
       que faltan), Descartar, Vista previa y Guardar y publicar.
     · Índice a la izquierda con los bloques de la página, que marca los
       editados y los incompletos.
     · Una tarjeta por bloque, en el orden de la web.
   Cada página solo describe sus bloques y sus campos:
     <EditorPagina
       id="sobre-fely"                    ← usePagina(id) y ?previa=id
       titulo="Sobre Fely"
       rutaWeb="/sobre-fely"
       bloques={[{ id, nombre, resumen, descripcion, datos: (d) => d.hero }]}
                                          ← o (borrador) => [...]
       campos={camposSobreFely}           ← lib/camposPagina.js
       opcionales={opcionalesSobreFely}   ← lo que puede quedar vacío
     >
       {(bloque, h) => …campos del bloque con h.texto, h.medio…}
     </EditorPagina>
   "h" trae los campos ya conectados al borrador: texto(ruta, props),
   medio, enlace, url, galeria, y además borrador, cambiar, idioma.
   Los cambios se preparan en un borrador; "Vista previa" abre la página
   real en otra pestaña con ese borrador (lib/previa.js) y "Guardar y
   publicar" lo aplica (Paginas.jsx).
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Eye } from 'lucide-react';
import { Boton } from '@/components/ui';
import { bloqueIncompleto, textosQueFaltan, validarCampos } from '@/lib/camposPagina';
import { clavePrevia, completarCon, PARAMETRO_PREVIA } from '@/lib/previa';
import BotonVolver from './BotonVolver';
import CampoMedio from './CampoMedio';
import CampoTexto from './CampoTexto';
import CampoUrl from './CampoUrl';
import GaleriaEditable from './GaleriaEditable';
import SelectorEnlace from './SelectorEnlace';
import { usePagina } from './Paginas';
import { useToast } from './Toast';
import styles from './EditorPagina.module.css';

// Ya se guarda en la base de datos (ContenidoAdmin.jsx): sin coletilla «demo».
const DEMO = '';

const IDIOMAS = [['es', 'Español'], ['en', 'English']];

// Banderas del selector de idioma (SVG propio: nítidas a cualquier
// tamaño y sin depender de los emojis de cada sistema).
function Bandera({ idioma }) {
  if (idioma === 'es') {
    return (
      <svg className={styles.bandera} viewBox="0 0 24 16" aria-hidden="true">
        <rect width="24" height="16" fill="#AA151B" />
        <rect y="4" width="24" height="8" fill="#F1BF00" />
      </svg>
    );
  }
  return (
    <svg className={styles.bandera} viewBox="0 0 60 40" aria-hidden="true">
      <clipPath id="bandera-en"><rect width="60" height="40" /></clipPath>
      <g clipPath="url(#bandera-en)">
        <rect width="60" height="40" fill="#012169" />
        <path d="M0,0 60,40 M60,0 0,40" stroke="#FFF" strokeWidth="8" />
        <path d="M0,0 60,40 M60,0 0,40" stroke="#C8102E" strokeWidth="3" />
        <path d="M30,0 V40 M0,20 H60" stroke="#FFF" strokeWidth="12" />
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7" />
      </g>
    </svg>
  );
}

const leer = (objeto, ruta) => ruta.reduce((nodo, clave) => nodo?.[clave], objeto);

// Tarjeta de un bloque de la página.
function Bloque({
  bloque, editado, incompleto, children,
}) {
  return (
    <section id={`bloque-${bloque.id}`} className={styles.bloque} aria-labelledby={`titulo-${bloque.id}`}>
      <header className={styles.bloqueCabecera}>
        <div>
          <h2 id={`titulo-${bloque.id}`} className={styles.bloqueTitulo}>{bloque.nombre}</h2>
          {bloque.descripcion && <p className={styles.bloqueDescripcion}>{bloque.descripcion}</p>}
        </div>
        <div className={styles.bloqueEstados}>
          {incompleto && <span className={`${styles.chip} ${styles.chipAviso}`}>Incompleto</span>}
          {editado && <span className={`${styles.chip} ${styles.chipEditado}`}>Editado</span>}
        </div>
      </header>
      <div className={styles.bloqueCuerpo}>{children}</div>
    </section>
  );
}

function EditorPagina({
  id, titulo, rutaWeb, bloques, campos, opcionales = [], children,
  // Para editar algo que no es una página fija (un artículo del blog, un
  // episodio): lo publicado y cómo guardarlo vienen de fuera, en vez de
  // usePagina(id). "volver" convierte las migas en un enlace al listado.
  publicado: publicadoFuera, guardar: guardarFuera, migas = 'Páginas de la web', volver,
  estadoPublicado = 'Publicada', textoPublicado, enLaWeb = true,
  // Lo que se guarda para la vista previa. Por defecto, el borrador
  // completado con lo publicado; un elemento de una lista (un look de
  // Vosotras) lo mete en la página entera.
  datosPrevia,
  // Comprobaciones que no son "falta un campo" (un nombre repetido…):
  // (borrador) => ['mensaje', …]. Se suman a las de "campos".
  validarExtra,
  // false: sin botón de vista previa (lo editado no se ve en una página).
  conVistaPrevia = true,
  // Algo que va encima de todo en la barra (p. ej. las pestañas Página |
  // Colecciones de Colección Novias / Fiesta).
  encabezado,
}) {
  const pagina = usePagina(id);
  const publicado = publicadoFuera ?? pagina.publicado;
  const guardar = guardarFuera ?? pagina.guardar;
  const { mostrarToast } = useToast();
  const [borrador, setBorrador] = useState(() => structuredClone(publicado));
  const [idioma, setIdioma] = useState('es');
  const [errores, setErrores] = useState([]);
  // "bloques" también puede ser una función del borrador: así una página
  // con secciones que se añaden o se quitan (un atelier) las ve al momento.
  const listaBloques = typeof bloques === 'function' ? bloques(borrador) : bloques;
  const idsBloques = listaBloques.map((bloque) => bloque.id).join(',');
  const [activo, setActivo] = useState(listaBloques[0].id);
  // Tras abrir la vista previa, cada cambio le llega solo (ver más abajo).
  const previaAbierta = useRef(false);
  // Tras publicar, el borrador se pone al día con lo que quedó publicado
  // (que puede llevar algún retoque: espacios quitados, la URL antigua de
  // algo renombrado…), para que no siga diciendo «Cambios sin publicar».
  const recienPublicado = useRef(false);
  useEffect(() => {
    if (!recienPublicado.current) return;
    recienPublicado.current = false;
    setBorrador(structuredClone(publicado));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicado]);

  const hayCambios = JSON.stringify(borrador) !== JSON.stringify(publicado);
  const listaCampos = campos(borrador);
  const listaOpcionales = typeof opcionales === 'function' ? opcionales(publicado) : opcionales;
  const urlWeb = (locale) => `/${locale}${rutaWeb === '/' ? '' : rutaWeb}`;
  const paraPrevia = (datos) => (datosPrevia ? datosPrevia(datos) : completarCon(datos, publicado, listaOpcionales));

  // El índice marca el bloque que se está viendo.
  useEffect(() => {
    const observador = new IntersectionObserver((entradas) => {
      const visible = entradas.find((entrada) => entrada.isIntersecting);
      if (visible) setActivo(visible.target.id.replace('bloque-', ''));
    }, { rootMargin: '-140px 0px -60% 0px' });
    idsBloques.split(',').forEach((idBloque) => {
      const elemento = document.getElementById(`bloque-${idBloque}`);
      if (elemento) observador.observe(elemento);
    });
    return () => observador.disconnect();
  }, [idsBloques]);

  // Cambia un valor del borrador por su ruta: cambiar(['hero', 'video'], src).
  // "valor" también puede ser una función (valorActual) => valorNuevo: así
  // un cambio que llega tarde (una foto que termina de subirse) se aplica
  // sobre lo que hay en ese momento y no pisa lo editado mientras tanto.
  function cambiar(ruta, valor) {
    setBorrador((actual) => {
      const copia = structuredClone(actual);
      let nodo = copia;
      ruta.slice(0, -1).forEach((clave) => { nodo = nodo[clave]; });
      const clave = ruta[ruta.length - 1];
      nodo[clave] = typeof valor === 'function' ? valor(nodo[clave]) : valor;
      return copia;
    });
  }

  function publicar(evento) {
    evento.preventDefault();
    const encontrados = [...validarCampos(listaCampos), ...(validarExtra ? validarExtra(borrador) : [])];
    setErrores(encontrados);
    if (encontrados.length > 0) {
      document.getElementById('errores-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    recienPublicado.current = true;
    guardar(borrador);
    mostrarToast(`${textoPublicado || `${titulo} publicada`}${DEMO}`);
  }

  function descartar() {
    setBorrador(structuredClone(publicado));
    setErrores([]);
  }

  // Abre la página con el borrador. Lo que falte se ve como está
  // publicado, para que la vista previa no salga rota. Siempre la misma
  // pestaña: si ya está abierta, se actualiza en vez de abrir otra.
  function vistaPrevia() {
    try {
      localStorage.setItem(clavePrevia(id), JSON.stringify(paraPrevia(borrador)));
    } catch {
      mostrarToast('No se ha podido preparar la vista previa en este navegador.');
      return;
    }
    previaAbierta.current = true;
    window.open(`${urlWeb(idioma)}?${PARAMETRO_PREVIA}=${id}`, `fc-vista-previa-${id}`);
  }

  // Vista previa en vivo: con la pestaña ya abierta, cada cambio del
  // borrador se guarda y la página lo pinta al momento (evento "storage"
  // en usePrevia), sin volver a pulsar "Vista previa".
  useEffect(() => {
    if (!previaAbierta.current) return;
    try {
      localStorage.setItem(clavePrevia(id), JSON.stringify(paraPrevia(borrador)));
    } catch {
      // Sin almacenamiento: la vista previa se actualiza al pulsar el botón.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrador]);

  function irA(bloqueId) {
    setActivo(bloqueId);
    document.getElementById(`bloque-${bloqueId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const estado = (bloque) => ({
    editado: JSON.stringify(bloque.datos(borrador)) !== JSON.stringify(bloque.datos(publicado)),
    incompleto: bloqueIncompleto(listaCampos, bloque.id),
  });

  // Campos ya conectados al borrador, para el contenido de cada bloque.
  const h = {
    borrador,
    cambiar,
    idioma,
    leer: (ruta) => leer(borrador, ruta),
    texto: (ruta, props) => (
      <CampoTexto idioma={idioma} valor={leer(borrador, ruta)} onChange={(valor) => cambiar(ruta, valor)} {...props} />
    ),
    medio: (ruta, props) => (
      <CampoMedio valor={leer(borrador, ruta)} onChange={(src) => cambiar(ruta, src)} {...props} />
    ),
    enlace: (ruta, etiqueta) => (
      <SelectorEnlace etiqueta={etiqueta} valor={leer(borrador, ruta)} onChange={(valor) => cambiar(ruta, valor)} />
    ),
    url: (ruta, props) => (
      <CampoUrl valor={leer(borrador, ruta)} onChange={(valor) => cambiar(ruta, valor)} {...props} />
    ),
    galeria: (ruta, props) => (
      <GaleriaEditable idioma={idioma} valor={leer(borrador, ruta)} onChange={(valor) => cambiar(ruta, valor)} {...props} />
    ),
  };

  return (
    <form className={styles.editor} onSubmit={publicar} noValidate>
      {/* ---------- Barra fija ---------- */}
      <header className={styles.barra}>
        {encabezado && <div className={styles.barraEncabezado}>{encabezado}</div>}
        <div className={styles.barraIzquierda}>
          {/* Volver al listado: un botón con borde, bien visible (el mismo
              BotonVolver del resto del panel), que dice adónde vuelve.
              Es un Link (sin recargar): no hace falta volver a cargar
              el contenido del panel. */}
          {volver && (
            <BotonVolver href={volver} enBarra>
              {`Volver a ${migas.split(' · ').pop()}`}
            </BotonVolver>
          )}
          <div className={styles.barraTitulo}>
            <p className={styles.migas}>{migas}</p>
            <div className={styles.tituloFila}>
              <h1 className={styles.titulo}>{titulo}</h1>
              <span className={`${styles.estado} ${hayCambios ? styles.estadoPendiente : styles.estadoPublicada}`}>
                <span className={styles.estadoPunto} aria-hidden="true" />
                {hayCambios ? 'Cambios sin publicar' : estadoPublicado}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.barraAcciones}>
          <div className={styles.idiomas} role="radiogroup" aria-label="Idioma que se edita">
            {IDIOMAS.map(([clave, nombre]) => {
              const faltan = textosQueFaltan(listaCampos, clave);
              return (
                <button
                  key={clave}
                  type="button"
                  role="radio"
                  aria-checked={idioma === clave}
                  className={`${styles.idioma} ${idioma === clave ? styles.idiomaActivo : ''}`}
                  onClick={() => setIdioma(clave)}
                  title={faltan ? `Faltan ${faltan} textos en ${nombre}` : `Editar en ${nombre}`}
                >
                  <Bandera idioma={clave} />
                  {nombre}
                  {faltan > 0 && <span className={styles.idiomaFaltan}>{faltan}</span>}
                </button>
              );
            })}
          </div>

          <span className={styles.separador} aria-hidden="true" />

          {hayCambios && (
            <button type="button" className={styles.descartar} onClick={descartar}>Descartar</button>
          )}
          {conVistaPrevia && (
            <Boton variante="contorno" onClick={vistaPrevia}>
              <span className={styles.conIcono}>
                <Eye size={16} aria-hidden="true" />
                Vista previa
              </span>
            </Boton>
          )}
          {/* Sin cambios: «Publicar» en gris claro y sin clic. */}
          <Boton
            variante="solido"
            type="submit"
            desactivado={!hayCambios}
            className={hayCambios ? '' : styles.sinCambios}
          >
            {hayCambios ? 'Guardar y publicar' : 'Publicar'}
          </Boton>
        </div>
      </header>

      <div className={styles.cuerpo}>
        {/* ---------- Índice ---------- */}
        <nav className={styles.indice} aria-label="Bloques de la página">
          <p className={styles.indiceTitulo}>Bloques</p>
          <ol className={styles.indiceLista}>
            {listaBloques.map((bloque, indice) => {
              const { editado, incompleto } = estado(bloque);
              return (
                <li key={bloque.id}>
                  <button
                    type="button"
                    className={`${styles.indiceItem} ${activo === bloque.id ? styles.indiceActivo : ''}`}
                    onClick={() => irA(bloque.id)}
                  >
                    <span className={styles.indiceNumero}>{String(indice + 1).padStart(2, '0')}</span>
                    <span className={styles.indiceTexto}>
                      <span className={styles.indiceNombre}>{bloque.nombre}</span>
                      {bloque.resumen && <span className={styles.indiceResumen}>{bloque.resumen}</span>}
                    </span>
                    {(incompleto || editado) && (
                      <span
                        className={`${styles.indiceMarca} ${incompleto ? styles.marcaAviso : styles.marcaEditado}`}
                        title={incompleto ? 'Le falta contenido' : 'Editado, sin publicar'}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className={styles.indicePie}>
            {enLaWeb && (
              <a href={urlWeb('es')} target="_blank" rel="noopener noreferrer" className={styles.verPublicada}>
                Ver la página publicada
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            <p className={styles.indiceNota}>
              Nada se publica hasta pulsar «Guardar y publicar».
            </p>
          </div>
        </nav>

        {/* ---------- Bloques ---------- */}
        <div className={styles.bloques}>
          {errores.length > 0 && (
            <div id="errores-editor" className={styles.errores} role="alert">
              <p className={styles.erroresTitulo}>Antes de publicar, completa esto:</p>
              <ul>{errores.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          )}

          {listaBloques.map((bloque) => (
            <Bloque key={bloque.id} bloque={bloque} {...estado(bloque)}>
              {children(bloque, h)}
            </Bloque>
          ))}
        </div>
      </div>
    </form>
  );
}

export default EditorPagina;
