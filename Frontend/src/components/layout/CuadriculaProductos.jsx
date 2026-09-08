// CuadriculaProductos.jsx

'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutGrid, Square, SlidersHorizontal } from 'lucide-react';
import TarjetaProducto from '../ecommerce/TarjetaProducto';
import TarjetaMedia from '../ecommerce/TarjetaMedia';
import { Boton, CabeceraSeccion } from '../ui';
import PanelFiltros from './PanelFiltros';
import { familiasColorMock, coloresMock } from '@/components/admin/mockData';
import { TALLAS_DISPONIBLES } from '@/components/ecommerce/guiaTallasData';
import { ListadoVacio } from './EstadoListado';
import { urlDesdeEstadoFiltros } from '@/lib/api/filtrosTienda';
import styles from './CuadriculaProductos.module.css';

const LOTE_INICIAL = 8;
const LOTE_INCREMENTO = 8;
// Mismo rango de tallas (36 a 64) que GuiaTallas — fuente única en
// guiaTallasData.js, ver TALLAS_DISPONIBLES ahí.
const ORDEN_TALLAS = TALLAS_DISPONIBLES;

// Los precios del catálogo se escriben "990 €"/"1.050 €" (punto como
// separador de miles, sin decimales) — quitar todo lo que no sea
// dígito basta para llegar al número entero en los dos casos.
function parsearPrecio(precio) {
  if (!precio) return 0;
  return parseInt(String(precio).replace(/[^\d]/g, ''), 10) || 0;
}

// El filtro de Color agrupa por familia (Neutros, Rojos y vinos... ver
// familiasColorMock/coloresMock en components/admin/mockData.js — las
// mismas familias con las que ya se organizan los colores en el panel
// admin, ver familiaChip en FormularioProducto.jsx), no por color
// suelto. productosEjemplo no tiene un id de coloresMock por color (sus
// nombres/hex son propios), así que cada hex se asigna a la familia
// cuyo color de coloresMock tenga el tono más parecido (distancia
// euclídea en RGB) — heurística, no una relación de datos real.
function distanciaHex(hexA, hexB) {
  const [rA, gA, bA] = hexA.match(/\w\w/g).map((h) => parseInt(h, 16));
  const [rB, gB, bB] = hexB.match(/\w\w/g).map((h) => parseInt(h, 16));
  return (rA - rB) ** 2 + (gA - gB) ** 2 + (bA - bB) ** 2;
}

function familiaDeHex(hex) {
  return coloresMock.reduce((mejor, candidato) => (
    distanciaHex(hex, candidato.hex) < distanciaHex(hex, mejor.hex) ? candidato : mejor
  ), coloresMock[0]).familia;
}

/**
 * Cuadrícula de productos, en dos disposiciones (prop "disposicion"):
 *
 * - "fila" (por defecto): banda en fila única — cada tarjeta reparte
 *   el ancho disponible a partes iguales (.item, flex:1) y se adapta
 *   sola al ancho de pantalla, sin arrastre ni flechas. Pensada para 4
 *   productos, recortados aquí si llegan más.
 * - "grid": catálogo completo de Tienda/Atelier — cuadrícula de 4
 *   columnas en escritorio (2 en móvil), con filtros (talla/color/
 *   precio), orden y paginación por scroll (ver más abajo).
 *
 * En ambos casos cada producto se muestra con TarjetaProducto en su
 * forma base — este componente no le pasa badge/precioRebajado, solo
 * lo que venga en cada objeto de "productos". Un objeto con "media:
 * true" rompe esa norma: se renderiza como TarjetaMedia (solo imagen/
 * gif/vídeo en bucle, sin nombre ni precio) en vez de TarjetaProducto,
 * y no lo tocan los filtros de talla/color/precio.
 * "ocultarPrecio" (opcional, se le pasa tal cual a TarjetaProducto): no
 * pinta el precio en ninguna tarjeta — usado por Atelier (Novias/
 * Fiesta), no por Tienda. En PanelFiltros, esta misma prop también
 * oculta "ordenar por" y el rango de precio (no tiene sentido filtrar/
 * ordenar por un dato que no se enseña).
 * "hrefBase" (opcional, se le pasa tal cual a TarjetaProducto): primer
 * segmento de la ficha de cada producto ('tienda' por defecto) — Atelier
 * (Novias/Fiesta) pasa 'atelier/novias'/'atelier/fiesta', su propia
 * ficha sin precio ni carrito (ver FichaProductoAtelier.jsx).
 * "colecciones" (opcional, array de nombres): activa un desplegable
 * más en PanelFiltros ("Colección") — lista de nombres, selección
 * única (clicar el ya activo lo quita), mismo patrón que "ordenar por".
 * Usado por Atelier (Novias/Fiesta), no por Tienda. De momento es solo
 * selección visual: productosEjemplo no tiene todavía un campo
 * "colección" con el que cruzarla, así que no filtra la cuadrícula de
 * verdad (ver coleccionSeleccionada más abajo).
 * "estiloYSilueta" (opcional): activa el bloque "Estilo y silueta" en
 * PanelFiltros (Silueta/Volumen/Largo/Estilo/Detalles, y "Ocasión" si
 * además "esFiesta"). Usado por Atelier (Novias/Fiesta) — mismo caso
 * que "colecciones": selección visual, productosEjemplo no tiene esos
 * atributos todavía, así que tampoco filtra la cuadrícula de verdad.
 *
 * "categoriaActiva" (opcional, {grupo, opcion} — ver
 * estiloSiluetaGrupos.js): la pasan las páginas
 * /atelier/{seccion}/categoria/[categoria]/page.js, resuelta ahí desde
 * el segmento de URL (params.categoria), no desde el cliente — así la
 * miga de pan y el título de categoría salen ya en el HTML servido
 * (SEO/crawlers), no solo tras hidratar. Con ella: preselecciona el
 * chip correspondiente en PanelFiltros (y abre su fila,
 * "estiloSiluetaAbiertoPorDefecto") y cambia la cabecera de
 * "tituloKey"/"coleccionKey" normal a una miga de pan real
 * ("Atelier" enlaza a /atelier, "coleccionKey" enlaza a "hrefBase")
 * con el nombre de la categoría como título grande (ver
 * "breadcrumbItems" más abajo y "breadcrumbItems" en
 * CabeceraSeccion.jsx). Misma limitación que "estiloYSilueta": no
 * filtra la cuadrícula de verdad, solo la selección visual del chip —
 * los tags de categoría de FichaProductoAtelier.jsx son quienes
 * enlazan a estas páginas.
 *
 * "tituloKey" (opcional): activa la cabecera (CabeceraSeccion) —
 * subtítulo pequeño "tituloKey", título grande "coleccionKey" (si
 * falta, reusa tituloKey) y descripción opcional "descriptionKey". Sin
 * tituloKey no se pinta cabecera — pensado para sitios que ya traen su
 * propio título encima. "verMasHref" es el destino del botón "flecha"
 * en la accion (y no pinta el botón si
 * falta, aunque haya título).
 *
 * En "grid", la cabecera (CabeceraSeccion con enCuadricula + alinear
 * "start") pasa a ser una fila de 3: el botón "Filtros" (before, abre
 * PanelFiltros — panel lateral con talla/color/precio + ordenar por),
 * el grupo título (70% de ancho) y el toggle de densidad (children/accion: icono
 * "layout-grid", activo por defecto — cuadrícula de 4 columnas — e
 * icono "square", que la cambia a 2 columnas centradas; oculto en
 * mobile). "tallas"/"colores"/precio disponibles para filtrar se
 * calculan a partir de "productos" (no hay lista fija). La cuadrícula
 * solo pinta un lote inicial de 8 — al acercarse al final
 * (IntersectionObserver sobre un centinela después de la cuadrícula)
 * carga 8 más, con tarjetas-esqueleto (.skeleton) mientras "llega"
 * (simulado con un timeout — aquí no hay backend real todavía).
 */
function CuadriculaProductos({ productos, verMasHref, tituloKey, coleccionKey, descriptionKey, botonTextKey = 'cuadriculaProductos.shopNow', disposicion = 'fila', ocultarPrecio = false, colecciones = [], hrefBase, estiloYSilueta = false, esFiesta = false, categoriaActiva = null, modoServidor = null }) {
  const t = useTranslations();
  const locale = useLocale();

  const esGrid = disposicion === 'grid';
  const [columnas, setColumnas] = useState(4);
  const esCompacta = esGrid && columnas === 2;

  // ---------- Filtros / orden (solo "grid") ----------
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  // Con `modoServidor`, los filtros los manda la URL (que ya viene resuelta del Server
  // Component): el estado local solo refleja lo que dice la URL, nunca es la verdad.
  // Compartir el enlace tiene que reproducir el mismo listado.
  const router = useRouter();
  const pathname = usePathname();
  const [navegando, iniciarNavegacion] = useTransition();
  const filtrosUrl = modoServidor?.filtros ?? null;

  const [orden, setOrden] = useState(filtrosUrl?.orden ?? 'recomendados');
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState(filtrosUrl?.tallas ?? []);
  const [familiasSeleccionadas, setFamiliasSeleccionadas] = useState([]);
  const [coleccionSeleccionada, setColeccionSeleccionada] = useState(null);
  // Preseleccionado desde "categoriaActiva" (prop, resuelta en el
  // Server Component de la página) cuando se llega a una URL de
  // categoría — ver comentario de "categoriaActiva" arriba.
  const [estiloSiluetaSeleccionados, setEstiloSiluetaSeleccionados] = useState(
    categoriaActiva ? [categoriaActiva.opcion] : []
  );

  const tallasDisponibles = useMemo(() => {
    if (!esGrid) return [];
    const encontradas = new Set();
    productos.forEach((producto) => (producto.tallas || []).forEach((talla) => encontradas.add(talla)));
    return ORDEN_TALLAS.filter((talla) => encontradas.has(talla));
  }, [productos, esGrid]);

  const familiasDisponibles = useMemo(() => {
    if (!esGrid) return [];
    const idsPresentes = new Set();
    productos.forEach((producto) => (producto.colores || []).forEach(({ hex }) => {
      idsPresentes.add(familiaDeHex(hex));
    }));
    return familiasColorMock
      .filter((familia) => idsPresentes.has(familia.id))
      .map((familia) => ({
        ...familia,
        muestras: familia.muestras.map((id) => coloresMock.find((c) => c.id === id)?.hex).filter(Boolean),
      }));
  }, [productos, esGrid]);

  const precioMaximoDisponible = useMemo(() => {
    if (!esGrid) return 0;
    const maximo = productos.reduce((acumulado, producto) => Math.max(acumulado, parsearPrecio(producto.precio)), 0);
    return Math.ceil(maximo / 50) * 50;
  }, [productos, esGrid]);

  const [precioMax, setPrecioMax] = useState(precioMaximoDisponible);

  // El techo del rango depende de "productos" (cambia entre páginas) —
  // sin esto, una página con precios más baratos que la anterior
  // arrancaría con el filtro de precio ya aplicado sin que nadie lo tocara.
  useEffect(() => {
    setPrecioMax(precioMaximoDisponible);
  }, [precioMaximoDisponible]);

  const hayFiltrosActivos = tallasSeleccionadas.length > 0
    || familiasSeleccionadas.length > 0
    || Boolean(coleccionSeleccionada)
    || estiloSiluetaSeleccionados.length > 0
    || precioMax < precioMaximoDisponible;

  const alternarEnLista = (lista, valor) => (
    lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
  );

  const limpiarFiltros = () => {
    setTallasSeleccionadas([]);
    setFamiliasSeleccionadas([]);
    setColeccionSeleccionada(null);
    setEstiloSiluetaSeleccionados([]);
    setPrecioMax(precioMaximoDisponible);
  };

  // Lista filtrada + ordenada — base de la paginación por scroll de
  // más abajo.
  // Con servidor, la URL manda: si cambia (atrás/adelante, enlace compartido), el estado
  // local se realinea. Sin esto, volver atrás enseñaría filtros marcados que ya no aplican.
  useEffect(() => {
    if (!filtrosUrl) return;
    setOrden(filtrosUrl.orden);
    setTallasSeleccionadas(filtrosUrl.tallas);
  }, [filtrosUrl?.orden, filtrosUrl?.tallas?.join(','), filtrosUrl]);

  // Empuja los filtros a la URL. El servidor vuelve a consultar y devuelve la página ya
  // filtrada: no se recorta nada en el cliente.
  const navegarConFiltros = (cambios) => {
    if (!modoServidor) return;
    const siguiente = {
      tallas: tallasSeleccionadas,
      colores: filtrosUrl?.colores ?? [],
      precioMax: filtrosUrl?.precioMax ?? null,
      orden,
      soloRebajas: filtrosUrl?.soloRebajas ?? false,
      soloDisponibles: filtrosUrl?.soloDisponibles ?? false,
      pagina: 1,
      ...cambios,
    };
    // `scroll: false`: al filtrar, el usuario está mirando la cuadrícula, no la cabecera.
    iniciarNavegacion(() => router.replace(`${pathname}${urlDesdeEstadoFiltros(siguiente)}`, { scroll: false }));
  };

  const productosOrdenados = useMemo(() => {
    // En modo servidor la lista YA viene filtrada, ordenada y paginada por el backend:
    // volver a filtrar aquí descartaría resultados legítimos de otras páginas.
    if (modoServidor) return productos;
    if (!esGrid) return productos;

    const filtrados = productos.filter((producto) => {
      if (producto.media) return true;
      const pasaTalla = tallasSeleccionadas.length === 0
        || (producto.tallas || []).some((talla) => tallasSeleccionadas.includes(talla));
      const pasaColor = familiasSeleccionadas.length === 0
        || (producto.colores || []).some(({ hex }) => familiasSeleccionadas.includes(familiaDeHex(hex)));
      const pasaPrecio = parsearPrecio(producto.precio) <= precioMax;
      return pasaTalla && pasaColor && pasaPrecio;
    });

    if (orden === 'precioAsc') return [...filtrados].sort((a, b) => parsearPrecio(a.precio) - parsearPrecio(b.precio));
    if (orden === 'precioDesc') return [...filtrados].sort((a, b) => parsearPrecio(b.precio) - parsearPrecio(a.precio));
    return filtrados;
  }, [productos, esGrid, tallasSeleccionadas, familiasSeleccionadas, precioMax, orden]);

  // ---------- Paginación por scroll (solo "grid") ----------
  const [visibles, setVisibles] = useState(LOTE_INICIAL);
  const [cargandoMas, setCargandoMas] = useState(false);
  const centinelaRef = useRef(null);

  // Cambiar filtros/orden reinicia la paginación — si no, un filtro más
  // estricto podría dejar "visibles" apuntando más allá del final.
  useEffect(() => {
    setVisibles(LOTE_INICIAL);
  }, [tallasSeleccionadas, familiasSeleccionadas, precioMax, orden]);
  // "estiloSiluetaSeleccionados"/"coleccionSeleccionada" no filtran la
  // cuadrícula de verdad (ver comentario de "estiloYSilueta"/
  // "colecciones" más arriba), así que no reinician "visibles".

  useEffect(() => {
    if (modoServidor) return undefined; // la paginación la lleva el servidor
    if (!esGrid || cargandoMas || visibles >= productosOrdenados.length) return undefined;
    const nodo = centinelaRef.current;
    if (!nodo || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) setCargandoMas(true);
    });
    observer.observe(nodo);
    return () => observer.disconnect();
  }, [esGrid, cargandoMas, visibles, productosOrdenados.length]);

  // El "cargando" simula la petición al backend real que sustituirá a
  // este catálogo de ejemplo — sin el retardo, el lote siguiente
  // aparece de golpe y la animación de carga (.skeleton) ni se ve.
  useEffect(() => {
    if (!cargandoMas) return undefined;
    const temporizador = setTimeout(() => {
      setVisibles((actual) => Math.min(actual + LOTE_INCREMENTO, productosOrdenados.length));
      setCargandoMas(false);
    }, 500);
    return () => clearTimeout(temporizador);
  }, [cargandoMas, productosOrdenados.length]);

  // "fila" está pensada para 4 productos (ver arriba), recortados aquí
  // si llegan más; "grid" pagina por scroll sobre la lista ya filtrada/
  // ordenada.
  const productosVisibles = modoServidor
    ? productos
    : esGrid
      ? productosOrdenados.slice(0, visibles)
      : productos.slice(0, 4);
  const quedanMas = modoServidor ? false : esGrid && visibles < productosOrdenados.length;
  const loteCargando = Math.min(LOTE_INCREMENTO, productosOrdenados.length - visibles);

  const claseCuadricula = esGrid
    ? (esCompacta ? styles.cuadriculaGridCompacta : styles.cuadriculaGrid)
    : styles.cuadricula;
  const claseItem = esGrid ? styles.itemGrid : styles.item;

  const accion = (
    <>
      {verMasHref && <Boton variante="flecha" href={verMasHref}>{t(botonTextKey)}</Boton>}
      {esGrid && (
        <div className={styles.toggleVista}>
          <button
            type="button"
            className={`${styles.toggleBoton} ${columnas === 4 ? styles.toggleBotonActivo : ''}`}
            aria-pressed={columnas === 4}
            aria-label={t('cuadriculaProductos.vistaCuadricula')}
            title={t('cuadriculaProductos.vistaCuadricula')}
            onClick={() => setColumnas(4)}
          >
            <LayoutGrid size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
          <button
            type="button"
            className={`${styles.toggleBoton} ${columnas === 2 ? styles.toggleBotonActivo : ''}`}
            aria-pressed={columnas === 2}
            aria-label={t('cuadriculaProductos.vistaCompacta')}
            title={t('cuadriculaProductos.vistaCompacta')}
            onClick={() => setColumnas(2)}
          >
            <Square size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        </div>
      )}
    </>
  );

  // Botón "Filtros" — en "grid" vive como primer elemento de la fila
  // de CabeceraSeccion (ver "before" más abajo), no en una barra propia
  // debajo del título como antes.
  const filtrosBoton = esGrid && (
    <button type="button" className={styles.filtrosBoton} onClick={() => setFiltrosAbiertos(true)}>
      <SlidersHorizontal size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" />
      {t('cuadriculaProductos.filtros')}
      {hayFiltrosActivos && <span className={styles.filtrosPunto} aria-hidden="true" />}
    </button>
  );

  return (
    <section className={`${styles.seccion} ${esGrid ? styles.seccionGrid : ''}`}>
      {/* "breadcrumbItems": el primer tramo (tituloKey) enlaza a
          "/atelier" — única sección que hoy usa "categoriaActiva" y que
          tiene una página real en ese segmento (ver atelier/page.js). */}
      {tituloKey && (
        <CabeceraSeccion
          subtitleKey={tituloKey}
          titleKey={categoriaActiva
            ? `filtros.estiloYSilueta.grupos.${categoriaActiva.grupo}.opciones.${categoriaActiva.opcion}`
            : (coleccionKey || tituloKey)}
          breadcrumbItems={categoriaActiva ? [
            { key: tituloKey, href: `/${locale}/atelier` },
            { key: coleccionKey || tituloKey, href: `/${locale}/${hrefBase}` },
          ] : undefined}
          descriptionKey={descriptionKey}
          alinear={esGrid ? 'start' : 'end'}
          enCuadricula
          before={filtrosBoton}
        >
          {(verMasHref || esGrid) && accion}
        </CabeceraSeccion>
      )}

      <div className={claseCuadricula}>
        {productosVisibles.map((producto) => (
          <div key={producto.nombre || producto.src} className={claseItem}>
            {producto.media ? (
              <TarjetaMedia {...producto} />
            ) : (
              <TarjetaProducto {...producto} coloresSiempreVisibles={esGrid} ocultarPrecio={ocultarPrecio} hrefBase={hrefBase} />
            )}
          </div>
        ))}

        {cargandoMas && Array.from({ length: loteCargando }, (_, indice) => (
          <div key={`skeleton-${indice}`} className={claseItem}>
            <div className={styles.skeleton} aria-hidden="true" />
          </div>
        ))}
      </div>

      {modoServidor && productos.length === 0 && (
        <ListadoVacio
          titulo={t('cuadriculaProductos.sinResultadosTitulo')}
          mensaje={t('cuadriculaProductos.sinResultadosTexto')}
          accion={
            hayFiltrosActivos ? (
              <button type="button" className={styles.filtrosBoton} onClick={limpiarFiltros}>
                {t('cuadriculaProductos.limpiarFiltros')}
              </button>
            ) : null
          }
        />
      )}

      {/* Paginación de SERVIDOR: cada página es una URL propia, compartible e indexable
          — no un scroll infinito que el buscador no puede recorrer. */}
      {modoServidor?.hayMas && (
        <div className={styles.centinela}>
          <Boton
            variante="solido"
            href={`${pathname}${urlDesdeEstadoFiltros({ ...filtrosUrl, pagina: (filtrosUrl?.pagina ?? 1) + 1 }, true)}`}
          >
            {t('cuadriculaProductos.cargarMas')}
          </Boton>
        </div>
      )}

      {quedanMas && (
        <div ref={centinelaRef} className={styles.centinela} aria-hidden="true" />
      )}
      {cargandoMas && (
        <p className={styles.cargandoTexto} role="status">{t('cuadriculaProductos.cargandoMas')}</p>
      )}

      {esGrid && (
        <PanelFiltros
          abierto={filtrosAbiertos}
          onCerrar={() => setFiltrosAbiertos(false)}
          orden={orden}
          onCambiarOrden={(valor) => {
            setOrden(valor);
            navegarConFiltros({ orden: valor });
          }}
          tallas={tallasDisponibles}
          tallasSeleccionadas={tallasSeleccionadas}
          onToggleTalla={(talla) => {
            const siguientes = alternarEnLista(tallasSeleccionadas, talla);
            setTallasSeleccionadas(siguientes);
            navegarConFiltros({ tallas: siguientes });
          }}
          familias={familiasDisponibles}
          familiasSeleccionadas={familiasSeleccionadas}
          onToggleFamilia={(id) => setFamiliasSeleccionadas((actual) => alternarEnLista(actual, id))}
          estiloYSilueta={estiloYSilueta}
          esFiesta={esFiesta}
          estiloSiluetaAbiertoPorDefecto={Boolean(categoriaActiva)}
          estiloSiluetaSeleccionados={estiloSiluetaSeleccionados}
          onToggleEstiloSilueta={(id) => setEstiloSiluetaSeleccionados((actual) => alternarEnLista(actual, id))}
          colecciones={colecciones}
          coleccionSeleccionada={coleccionSeleccionada}
          onSeleccionarColeccion={(nombre) => setColeccionSeleccionada((actual) => (actual === nombre ? null : nombre))}
          ocultarPrecio={ocultarPrecio}
          precioMax={precioMax}
          precioMaximo={precioMaximoDisponible}
          onCambiarPrecioMax={setPrecioMax}
          onLimpiar={() => {
            limpiarFiltros();
            navegarConFiltros({ tallas: [], colores: [], precioMax: null, orden: 'recomendados', soloRebajas: false, soloDisponibles: false });
          }}
          cargando={navegando}
        />
      )}
    </section>
  );
}

export default CuadriculaProductos;
