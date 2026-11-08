// GaleriaVosotras.jsx

'use client';

/* ============================================================
   GALERÍA DE VOSOTRAS — Fely Campo
   Cuadrícula de looks de clientas para /atelier/vosotras — a
   diferencia de Novias/Fiesta (CuadriculaProductos: catálogo de
   producto con precio/talla/color), esta sección es la comunidad:
   fotos que las clientas comparten llevando piezas de Fely Campo, no
   productos en venta. Por eso no lleva PanelFiltros (sin talla/color/
   precio que filtrar) ni CuadriculaProductos.

   Cada tile de la cuadrícula es un "look": su propia mini-galería de
   fotos (CarruselFotos.jsx, ui/ — cross-fade + barra de progreso al
   hover) más un botón "+"
   (40px, esquina inferior derecha, ver .abrirBtn) que — igual que
   clicar la propia foto — abre un lightbox a pantalla completa con esa
   mini-galería. Las fotos son reales (público/img/Clientes/CLIENTAS,
   ver src/datos/vosotras.js): cada "look" es
   UN grupo de fotos que a simple vista parecen de la misma clienta/
   misma boda (mismo vestido, mismo acompañante, mismo lugar) — se
   agruparon a mano revisando las fotos una a una, no hay metadato real
   que las una todavía.

   El lightbox reutiliza el mecanismo de RunwayGaleria.jsx (mismo
   .lightbox/.abierta, cabecera con logo + cerrar, pista con scroll-
   snap + rueda con cooldown, franja de miniaturas a la izquierda para
   saltar entre fotos sin cerrar) pero sin su panel inferior ("Look X" +
   "Consigue el look"): aquí ese panel (nombre/comentario de la clienta
   + producto vinculado) era placeholder puro, sin reseña real de estas
   clientas ni prenda real detrás, así que se quitó a petición — solo
   fotos + miniaturas, sin nada debajo. Las miniaturas son las fotos DE
   ESE MISMO look (no otros looks de la cuadrícula — no hay forma de
   saltar de un look a otro sin cerrar, a diferencia de RunwayGaleria
   con sus looks de colección).

   La propia CabeceraSeccion vive aquí dentro (no en page.js, que solo
   le reenvía subtitleKey/titleKey/descriptionKey/margenSuperiorAmplio)
   — mismo criterio que CuadriculaProductos.jsx con su toggle de
   densidad: el toggle "Invitadas"/"Novias" (.toggleCategoria, mismo
   lenguaje visual que .toggleBoton ahí — subrayado en el activo) sale
   como "children" de CabeceraSeccion y enseña los looks de esa
   pestaña (datos/vosotras.js: "invitadas" o "novias").
   Uso:
     <GaleriaVosotras titleKey="..." />
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
import { CabeceraSeccion, CarruselFotos } from '../ui';
import useEnVista from '@/hooks/useEnVista';
import {
  EDITOR_VOSOTRAS, ID_PREVIA_VOSOTRAS, looksVisibles as looksDe, obtenerVosotras, resenaDeLook, resenasCuadricula,
} from '@/lib/vosotras';
import BarraPrevia from './BarraPrevia';
import usePrevia from './usePrevia';
import styles from './GaleriaVosotras.module.css';
import { useTextoCabecera } from './CabeceraPagina';
import { atributosImagen } from '@/lib/imagenes';

// Campos de las reseñas que pueden quedar vacíos a propósito en un
// borrador del admin (para que la vista previa no los rellene con lo
// publicado). Rutas por posición en la lista.
const OPCIONALES_PREVIA = Array.from({ length: 100 }, (_, i) => ['extracto', 'look', 'firma.es', 'firma.en'].map((campo) => `resenas.${i}.${campo}`)).flat();

// Mismo fundido+subida al entrar en el viewport que TarjetaProducto.jsx
// (useEnVista + .al-scroll/.en-vista de global.css) — aparte porque un
// hook no puede llamarse dentro del .map() de la cuadrícula más abajo.
function TileVosotras({ onAbrir, fotos, etiquetaAbrir, prioridad = false }) {
  const [ref, enVista] = useEnVista();

  return (
    // Las que ya se ven al cargar (prioridad) aparecen sin esperar a la
    // animación de entrada: esperaban al JavaScript y la imagen principal
    // tardaba ~9 s más en pintarse en móvil (Lighthouse, «render delay»).
    <div ref={ref} className={`${styles.item} al-scroll ${enVista || prioridad ? 'en-vista' : ''}`} onClick={onAbrir}>
      <CarruselFotos fotos={fotos} prioridad={prioridad} />
      <button
        type="button"
        className={styles.abrirBtn}
        onClick={(evento) => { evento.stopPropagation(); onAbrir(); }}
        aria-label={etiquetaAbrir}
      >
        <Plus size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" />
      </button>
    </div>
  );
}

// Casilla de reseña intercalada (resenasCuadricula): mismo tamaño
// que una foto, extracto + "(...)" y firma. Con "onAbrir" (reseña con
// look) es un botón que abre la galería de esa clienta.
function TileResena({ resena, onAbrir }) {
  const [ref, enVista] = useEnVista();
  const locale = useLocale();
  const Etiqueta = onAbrir ? 'button' : 'div';

  return (
    <Etiqueta
      ref={ref}
      {...(onAbrir ? { type: 'button', onClick: onAbrir } : {})}
      className={`${styles.item} ${styles.resenaTile} al-scroll ${enVista ? 'en-vista' : ''}`}
    >
      <blockquote className={styles.resenaTileCita}>
        <p className={styles.resenaTileTexto}>&ldquo;{resena.extracto} (...)&rdquo;</p>
        {resena.firma && <footer className={styles.resenaTileFirma}>{resena.firma[locale] ?? resena.firma.es}</footer>}
      </blockquote>
    </Etiqueta>
  );
}

// Una reseña cada dos filas de 4 (cada 8 casillas), en la segunda fila
// del bloque, alternando columna 2 y columna 4 para que no caigan
// todas en la misma vertical. En mobile (2 columnas) quedan una cada
// cuatro filas, alternando lado.
function intercalarResenas(looks, resenas) {
  const celdas = [];
  let siguiente = 0;
  looks.forEach((look, indice) => {
    const bloque = Math.floor(celdas.length / 8);
    const posicion = bloque * 8 + (bloque % 2 === 0 ? 5 : 7);
    if (siguiente < resenas.length && celdas.length === posicion) {
      celdas.push({ tipo: 'resena', resena: resenas[siguiente] });
      siguiente += 1;
    }
    celdas.push({ tipo: 'look', look, indice });
  });
  return celdas;
}

// "publicado": los datos de lib/vosotras.js (los mismos que edita
// /admin/vosotras). Con ?previa=vosotras, el borrador del admin.
function GaleriaVosotras({
  subtitleKey, titleKey, descriptionKey, cabecera, margenSuperiorAmplio, publicado = obtenerVosotras(),
}) {
  // "cabecera": el título y el texto salen de lib/cabeceras.js (con vista previa).
  const textoCabecera = useTextoCabecera(cabecera || 'vosotras');
  const t = useTranslations();
  const { datos, enPrevia } = usePrevia(ID_PREVIA_VOSOTRAS, publicado, OPCIONALES_PREVIA);
  // Pestañas Invitadas/Novias: mismo fundido+subida de entrada que el
  // título (CabeceraSeccion) y las casillas (TileVosotras).
  const [toggleRef, toggleEnVista] = useEnVista();
  const locale = useLocale();
  const pistaRef = useRef(null);
  const cerrarRef = useRef(null);
  const ruedaEnCooldownRef = useRef(false);

  const [categoria, setCategoria] = useState('invitadas');
  const [abierta, setAbierta] = useState(false);
  const [indiceLook, setIndiceLook] = useState(0);
  const [indiceFoto, setIndiceFoto] = useState(0);

  // Cada look: su propia mini-galería (portada siempre primera). "resena":
  // la reseña entera de la clienta, si la tiene, que se lee junto a sus
  // fotos en el lightbox (.resena).
  const looksVisibles = useMemo(
    () => looksDe(datos, categoria).map((look) => ({ fotos: look.fotos, categoria, resena: resenaDeLook(datos, look.id) })),
    [datos, categoria]
  );
  const lookActivo = looksVisibles[indiceLook] || looksVisibles[0] || { fotos: [] };

  // Casillas de reseña intercaladas solo en Invitadas.
  const celdas = useMemo(
    () => intercalarResenas(looksVisibles, categoria === 'invitadas' ? resenasCuadricula(datos) : []),
    [looksVisibles, categoria, datos]
  );

  const abrir = (indice) => {
    setIndiceLook(indice);
    setIndiceFoto(0);
    setAbierta(true);
  };
  const cerrar = () => setAbierta(false);

  // Cambiar de categoría cierra el lightbox y vuelve a "indiceLook" 0 —
  // el índice pertenece a la lista ya filtrada, así que no tiene
  // sentido mantenerlo al cambiar de lista.
  const cambiarCategoria = (nueva) => {
    if (nueva === categoria) return;
    setCategoria(nueva);
    setIndiceLook(0);
    setAbierta(false);
  };

  // Foco en cerrar + sin scroll de la página detrás mientras está
  // abierto — mismo criterio que RunwayGaleria/GaleriaProductoLightbox.
  // También marca <body> con "vosotras-lightbox-abierta" mientras dura:
  // el lightbox ya trae su propia cabecera (logo + cerrar, ver más abajo)
  // así que el Navbar de siempre no pinta nada ahí — global.css lo
  // esconde con esa clase en vez de duplicar aquí la lógica de
  // scrolled/transparent que ya tiene Navbar.jsx.
  useEffect(() => {
    if (!abierta) return undefined;
    const enfocadoAntes = document.activeElement;
    cerrarRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('vosotras-lightbox-abierta');

    const alTeclado = (evento) => {
      if (evento.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alTeclado);

    return () => {
      document.removeEventListener('keydown', alTeclado);
      document.body.style.overflow = overflowPrevio;
      document.body.classList.remove('vosotras-lightbox-abierta');
      enfocadoAntes?.focus?.();
    };
  }, [abierta]);

  // Al abrir (o cambiar de look), salta de golpe a la primera foto —
  // el barrido solo se ve al navegar ya dentro.
  useEffect(() => {
    if (!abierta) return;
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indiceFoto * nodo.clientWidth, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta, indiceLook]);

  const irAIndice = (indice) => {
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indice * nodo.clientWidth, behavior: 'smooth' });
    setIndiceFoto(indice);
  };

  const alScroll = () => {
    const nodo = pistaRef.current;
    if (!nodo || nodo.clientWidth === 0) return;
    const indice = Math.round(nodo.scrollLeft / nodo.clientWidth);
    if (indice !== indiceFoto) setIndiceFoto(indice);
  };

  const alRueda = (evento) => {
    evento.preventDefault();
    if (ruedaEnCooldownRef.current) return;

    const delta = Math.abs(evento.deltaX) > Math.abs(evento.deltaY) ? evento.deltaX : evento.deltaY;
    if (Math.abs(delta) < 10) return;

    const siguiente = indiceFoto + (delta > 0 ? 1 : -1);
    if (siguiente < 0 || siguiente >= lookActivo.fotos.length) return;

    ruedaEnCooldownRef.current = true;
    irAIndice(siguiente);
    setTimeout(() => { ruedaEnCooldownRef.current = false; }, 500);
  };

  const tabIndexInteractivo = abierta ? 0 : -1;

  return (
    <>
      <CabeceraSeccion
        subtitleKey={subtitleKey}
        titleKey={titleKey}
        title={cabecera ? textoCabecera('titulo') : undefined}
        descriptionKey={descriptionKey}
        description={cabecera ? textoCabecera('texto') : undefined}
        margenSuperiorAmplio={margenSuperiorAmplio}
        className={styles.cabeceraSeccion}
      >
        <div ref={toggleRef} className={`${styles.toggleCategoria} al-scroll ${toggleEnVista ? 'en-vista' : ''}`}>
          <button
            type="button"
            className={`${styles.toggleCategoriaBoton} ${categoria === 'invitadas' ? styles.toggleCategoriaBotonActivo : ''}`}
            aria-pressed={categoria === 'invitadas'}
            onClick={() => cambiarCategoria('invitadas')}
          >
            {t('vosotras.invitadas')}
          </button>
          <button
            type="button"
            className={`${styles.toggleCategoriaBoton} ${categoria === 'novias' ? styles.toggleCategoriaBotonActivo : ''}`}
            aria-pressed={categoria === 'novias'}
            onClick={() => cambiarCategoria('novias')}
          >
            {t('vosotras.novias')}
          </button>
        </div>
      </CabeceraSeccion>

      <div className={styles.grid}>
        {celdas.map((celda) => {
          if (celda.tipo === 'resena') {
            const indiceLookResena = looksVisibles.findIndex((look) => look.fotos[0] === celda.resena.portada);
            return (
              <TileResena
                key={`resena-${celda.resena.extracto}`}
                resena={celda.resena}
                onAbrir={indiceLookResena >= 0 ? () => abrir(indiceLookResena) : undefined}
              />
            );
          }
          return (
            <TileVosotras
              key={celda.indice}
              fotos={celda.look.fotos}
              onAbrir={() => abrir(celda.indice)}
              etiquetaAbrir={t('vosotras.verGaleria')}
              // Las dos primeras están a la vista al cargar: su primera foto
              // es la imagen principal de la página (LCP), sin carga diferida.
              prioridad={celda.indice < 2}
            />
          );
        })}
      </div>

      <div className={`${styles.lightbox} ${abierta ? styles.abierta : ''} ${lookActivo.resena ? styles.conResena : ''}`} aria-hidden={!abierta}>
        <div className={styles.cabecera}>
          <a href={`/${locale}`} className={styles.logoLink} tabIndex={tabIndexInteractivo}>
            <img src="/img/logo/fely-campo-logo.webp" alt="Fely Campo" className={styles.logo} />
          </a>
          <button
            ref={cerrarRef}
            type="button"
            className={styles.cerrar}
            onClick={cerrar}
            aria-label={t('producto.galeriaCerrar')}
            tabIndex={tabIndexInteractivo}
          >
            <X size={40} strokeWidth={1} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        </div>

        <div ref={pistaRef} className={styles.pista} onScroll={alScroll} onWheel={alRueda}>
          {lookActivo.fotos.map((foto) => (
            <div key={foto} className={styles.pistaItem}>
              <img {...atributosImagen(foto, { sizes: '100vw' })} alt="" className={styles.pistaImagen} />
            </div>
          ))}
        </div>

        {lookActivo.fotos.length > 1 && (
          <div className={styles.miniaturas}>
            {lookActivo.fotos.map((foto, indice) => (
              <button
                key={foto}
                type="button"
                className={`${styles.miniatura} ${indice === indiceFoto ? styles.miniaturaActiva : ''}`}
                onClick={() => irAIndice(indice)}
                aria-label={String(indice + 1)}
                aria-current={indice === indiceFoto}
                tabIndex={tabIndexInteractivo}
              >
                <img {...atributosImagen(foto, { sizes: '96px' })} alt="" className={styles.miniaturaImagen} />
              </button>
            ))}
          </div>
        )}

        {/* Puntos abajo en el centro (a petición): uno por foto del look,
            el activo marcado — dice cuántas fotos hay y en cuál estás.
            También navegan, igual que las miniaturas (que en mobile no
            se ven). */}
        {lookActivo.fotos.length > 1 && (
          <div className={styles.puntos}>
            {lookActivo.fotos.map((foto, indice) => (
              <button
                key={foto}
                type="button"
                className={`${styles.punto} ${indice === indiceFoto ? styles.puntoActivo : ''}`}
                onClick={() => irAIndice(indice)}
                aria-label={`${indice + 1} / ${lookActivo.fotos.length}`}
                aria-current={indice === indiceFoto}
                tabIndex={tabIndexInteractivo}
              />
            ))}
          </div>
        )}

        {lookActivo.resena && (
          <blockquote className={styles.resena}>
            {lookActivo.resena.parrafos.map((parrafo) => (
              <p key={parrafo} className={styles.resenaTexto}>{parrafo}</p>
            ))}
          </blockquote>
        )}
      </div>
      {enPrevia && <BarraPrevia editor={EDITOR_VOSOTRAS} />}
    </>
  );
}

export default GaleriaVosotras;
