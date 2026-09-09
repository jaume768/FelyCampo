'use client';

/* ============================================================
   LISTA DE PRODUCTOS — Fely Campo (admin)
   Reutilizada por /admin/productos (todos) y las 3 subrutas por tipo
   (tipoFijo preseleccionado y oculto del filtro, spec 2.1). Filtros y
   búsqueda SÍ filtran de verdad sobre el array mock (es un simple
   Array.filter en cliente, no "lógica real" de backend) — mucho más
   convincente para enseñar que unos controles decorativos.
   Los datos se copian a estado local: así activar/desactivar o
   archivar en bloque se ve reflejado al momento, sin persistir tras
   recargar (no hay backend detrás todavía).
   ============================================================ */

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus, X, Pencil, List, LayoutGrid, Upload, ChevronLeft, ChevronRight, ArrowUpFromLine, Check, RefreshCw,
} from 'lucide-react';
import {
  PageHeader, TablaAdmin, GridProductos, EstadoPublicacionBadge, FiltroBar, FiltroSelector, TabsFiltro, ModalOverlay, ConfirmarBorrado, BotonVolver, useToast, useCategorias,
} from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import {
  tiposProducto, coleccionesMock, coloresMock, codigoTemporada, rutaTipoProducto,
} from '@/components/admin/mockData';
import { useProductosAdmin, useAccionesProductoAdmin } from './useProductosAdmin';
import { STATUS_POR_ESTADO, ESTADO_POR_STATUS, slugCategoriaPanel } from '@/lib/api/adminCatalog';
import { guardarProducto } from './guardarProducto';
import { useFamiliasAdmin } from './useFamiliasAdmin';
import { formatearImporte } from '@/lib/precio';
import { calcularEstadoPublicacion, CONFIG_ESTADO_PUBLICACION } from './EstadoPublicacionBadge';
import FormularioProducto from './FormularioProducto';
import FormularioColeccion from './FormularioColeccion';
import FormularioLook from './FormularioLook';
import styles from './ListaProductos.module.css';

// TabsFiltro trabaja con las claves del badge ('publicado', 'borrador'…); la API con
// `status`. `ETIQUETA_A_ESTADO` cierra ese hueco. Los cuatro estados son reales, incluido
// 'programado' (`scheduled`): publicación programada añadida al modelo.
const ETIQUETA_A_ESTADO = {
  publicado: 'Activo',
  borrador: 'Borrador',
  archivado: 'Archivado',
  programado: 'Programado',
};

const OPCIONES_PUBLICACION = [
  { valor: 'Todos', etiqueta: 'Todos' },
  ...Object.entries(CONFIG_ESTADO_PUBLICACION).map(([valor, cfg]) => ({ valor, etiqueta: cfg.etiqueta, clase: cfg.clase })),
];

function etiquetaTipo(tipo) {
  return tiposProducto.find((t) => t.valor === tipo)?.etiqueta || tipo;
}

function etiquetaColeccion(coleccion) {
  return coleccionesMock.find((c) => c.valor === coleccion)?.etiqueta || '—';
}

function stockTotal(producto) {
  if (!producto.tallas) return '—';
  return producto.tallas.reduce((total, t) => total + t.stock, 0);
}

// Tarjeta de un look en la rejilla — necesita su propio estado (índice de
// la imagen mostrada), así que no puede vivir inline en el .map() de
// ListaProductosContenido (las reglas de hooks no lo permiten). Mismo
// patrón de slide que GridPedidos.jsx `Tarjeta`: flechas + puntos, pero
// aquí desliza entre imágenes del look, no entre items de un pedido.
function LookTarjeta({
  look, onEditar, onEliminar,
}) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  const imagenes = look.imagenes || [];
  const hayVarias = imagenes.length > 1;
  const vinculados = look.productosVinculados || [];

  function irAProducto(id) {
    router.push(`/admin/productos/${id}`);
  }

  function irAnterior(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndice((i) => (i === 0 ? imagenes.length - 1 : i - 1));
  }

  function irSiguiente(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndice((i) => (i === imagenes.length - 1 ? 0 : i + 1));
  }

  return (
    <div className={styles.lookTarjeta}>
      <button type="button" className={styles.lookTarjetaBoton} onClick={onEditar}>
        {imagenes.length > 0 ? (
          <div className={styles.lookImagenWrap}>
            <img src={imagenes[indice]} alt="" className={styles.lookImagen} />
            {hayVarias && (
              <>
                <button type="button" className={`${styles.flecha} ${styles.flechaIzq}`} onClick={irAnterior} aria-label="Imagen anterior">
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button type="button" className={`${styles.flecha} ${styles.flechaDer}`} onClick={irSiguiente} aria-label="Imagen siguiente">
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
                <div className={styles.puntos}>
                  {imagenes.map((src, i) => (
                    <span key={src} className={`${styles.punto} ${i === indice ? styles.puntoActivo : ''}`} />
                  ))}
                </div>
              </>
            )}
            {hayVarias && <span className={styles.lookContador}>{`+${imagenes.length - 1}`}</span>}
          </div>
        ) : (
          <div className={styles.lookVacio}>
            <Upload size={20} strokeWidth={1} aria-hidden="true" />
            <span>Añadir imágenes</span>
          </div>
        )}
        <div className={styles.lookInfo}>
          <span className={styles.lookNombre}>{look.nombre}</span>
        </div>
      </button>

      {/* Fuera de .lookTarjetaBoton a propósito — un <button> (navegar a
          producto) no puede anidarse dentro de otro <button> (onEditar) sin
          romper la hidratación y el propio click. Se superpone a la imagen
          por posición absoluta (mismo box, misma esquina) en vez de vivir
          dentro de ella. */}
      {imagenes.length > 0 && vinculados.length > 0 && (
        <div className={styles.lookImagenOverlay}>
          <div className={styles.lookVinculadosGrid}>
            {vinculados.slice(0, 2).map((p, i) => {
              const esContador = i === 1 && vinculados.length > 2;
              if (esContador) {
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.lookVinculadoMas}
                    onClick={onEditar}
                    aria-label={`Ver ${vinculados.length - 1} productos vinculados más`}
                  >
                    {`+${vinculados.length - 1}`}
                  </button>
                );
              }
              return (
                <button
                  key={p.id}
                  type="button"
                  className={styles.lookVinculadoTile}
                  onClick={() => irAProducto(p.id)}
                  aria-label={`Ver producto vinculado: ${p.nombre}`}
                >
                  {p.imagen ? (
                    <img src={p.imagen} alt="" className={styles.lookVinculadoImagen} />
                  ) : <span className={styles.lookVinculadoImagen} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button type="button" className={styles.lookQuitar} aria-label={`Borrar ${look.nombre}`} onClick={onEliminar}>
        <X size={14} />
      </button>
      <button type="button" className={styles.lookEditar} aria-label={`Editar ${look.nombre}`} onClick={onEditar}>
        <Pencil size={14} />
      </button>
    </div>
  );
}

function ListaProductosContenido({
  tipoFijo, titulo, agruparPorCategoria = false, iconoCategoria: IconoCategoria, imagenesCategoria,
}) {
  // La URL de la ruta puede diferir del valor interno de `tipo` (p.ej.
  // Runway vive en /admin/colecciones/runway pero tipoFijo sigue siendo
  // "archivo", ver docs/adminpanel.md sección 5) — rutaTipoProducto()
  // sabe ese mapeo, único sitio que lo sabe.
  const rutaBase = rutaTipoProducto(tipoFijo);
  const { mostrarToast } = useToast();
  const {
    categorias, anadirCategoria, editarCategoria, eliminarCategoria,
  } = useCategorias();
  const searchParams = useSearchParams();
  const categoriaFija = searchParams.get('categoria') || '';
  const [query, setQuery] = useState('');
  const [pagina, setPagina] = useState(1);
  // La categoría del panel que está fijada por la URL (?categoria=cat7). Se resuelve
  // aquí, ANTES del listado, porque el filtro contra la API va por su slug real.
  const categoriaSeleccionada = categoriaFija
    ? (categorias[tipoFijo] || []).find((c) => c.id === categoriaFija) || null
    : null;

  const [filtroTipo, setFiltroTipo] = useState(tipoFijo || 'Todos');
  const [filtroPublicacion, setFiltroPublicacion] = useState('Todos');
  const [filtroColeccion, setFiltroColeccion] = useState('Todas');
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [confirmarBorradoBloqueAbierto, setConfirmarBorradoBloqueAbierto] = useState(false);
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
  // Duplicar = alta de una variante de color del mismo producto: mismo
  // formulario que "Nuevo producto", pero con productoBase precargando
  // todo lo compartido (nombre, descripción, precio, tallas, composición,
  // cuidados...) y dejando en blanco lo que cambia por color (fotos,
  // color/estampado, SKU) — ver FormularioProducto.jsx `semilla`.
  const [productoParaDuplicar, setProductoParaDuplicar] = useState(null);
  const [vistaProductos, setVistaProductos] = useState('tabla');
  const [filtroTemporada, setFiltroTemporada] = useState('Todas');
  const [nuevaColeccionAbierta, setNuevaColeccionAbierta] = useState(false);
  const [coleccionEnEdicion, setColeccionEnEdicion] = useState(null);
  const [coleccionABorrar, setColeccionABorrar] = useState(null);

  // DATOS REALES: /api/v1/admin/products/. Búsqueda, filtros y paginación los resuelve
  // el SERVIDOR — antes era un Array.filter sobre el mock entero, que con un catálogo de
  // verdad significaría traérselo completo en cada visita.
  const {
    productos, total, paginas, cargando: cargandoProductos, error: errorProductos, recargar,
  } = useProductosAdmin({
    busqueda: query,
    tipo: tipoFijo || filtroTipo,
    estado: filtroPublicacion === 'Todos' ? undefined : ETIQUETA_A_ESTADO[filtroPublicacion],
    // NO `categoriaFija` ('cat7'): ese id solo existe en el contexto local del panel.
    // El backend filtra por el SLUG de la `Category` real — el mismo que construye
    // `asegurarCategoria` al guardar. Mandar 'cat7' devolvía siempre cero productos, y
    // por eso un producto recién guardado no aparecía en ninguna parte.
    categoriaSlug: slugCategoriaPanel(categoriaSeleccionada) || undefined,
    pagina,
  });
  const { guardando, aplicarEnBloque: aplicarEnBloqueApi, archivar } = useAccionesProductoAdmin(recargar);
  // Respaldo para los borradores que se guardan sin elegir familia: la primera de esta
  // línea. `family` es FK obligatoria, así que sin esto un borrador a medias no se podría
  // guardar (que es justo lo que se quiere permitir).
  const { familias: familiasDeLaLinea } = useFamiliasAdmin(tipoFijo || filtroTipo);

  // Cualquier cambio de filtro vuelve a la página 1: seguir en la 4 tras estrechar el
  // filtro deja al usuario mirando una página que ya no existe.
  useEffect(() => {
    setPagina(1);
  }, [query, filtroTipo, filtroPublicacion, filtroColeccion, categoriaFija]);

  function crearColeccion(datos) {
    // La colección nueva es, por definición, la más reciente del archivo
    // — se inserta antes que todas las demás (orden mínimo actual - 1) en
    // vez de al final, así queda arriba del todo en la rejilla igual que
    // "La Colección"/etc. hoy. La propia orden ascendente de las 9/6/10
    // existentes ya codifica su secuencia real de temporada; no hace falta
    // volver a calcularla a partir del string de `temporada`.
    const ordenes = (categorias[tipoFijo] || []).map((c) => c.orden);
    const ordenNuevo = ordenes.length ? Math.min(...ordenes) - 1 : 1;
    anadirCategoria(tipoFijo, {
      ...datos, fija: true, orden: ordenNuevo,
    });
    setNuevaColeccionAbierta(false);
    mostrarToast(`"${datos.nombre}" creada (demo)`);
  }

  function guardarEdicionColeccion(datos) {
    editarCategoria(tipoFijo, coleccionEnEdicion.id, datos);
    setColeccionEnEdicion(null);
    mostrarToast(`"${datos.nombre}" actualizada (demo)`);
  }

  function cerrarModalColeccion() {
    setNuevaColeccionAbierta(false);
    setColeccionEnEdicion(null);
  }

  // "Borrar colección" (dentro del formulario de edición) cierra ese modal
  // y abre la confirmación en su lugar, en vez de anidar un ModalOverlay
  // dentro de otro — más simple y evita dos fondos oscuros superpuestos.
  function pedirBorrarColeccion() {
    setColeccionABorrar(coleccionEnEdicion);
    setColeccionEnEdicion(null);
  }

  function confirmarBorrarColeccion() {
    eliminarCategoria(tipoFijo, coleccionABorrar.id);
    mostrarToast(`"${coleccionABorrar.nombre}" borrada (demo)`);
    setColeccionABorrar(null);
  }

  const categoriaActual = categoriaSeleccionada;

  // Vista de looks: si la colección se creó con `numeroLooks` (ver
  // FormularioColeccion), en vez de la tabla/rejilla de productos reales
  // se pinta una rejilla de N huecos "Look 1"..."Look N" — `looks` es
  // disperso (`categoriaActual.looks`, un hueco por look ya editado), los
  // que faltan se rellenan aquí con un placeholder de solo nombre.
  const looks = categoriaActual?.numeroLooks
    ? Array.from({ length: categoriaActual.numeroLooks }, (_, i) => categoriaActual.looks?.[i] || { nombre: `Look ${i + 1}` })
    : [];
  // "Publicar colección" no se enseña hasta que el primer look esté
  // completo (al menos una imagen subida) — publicar una colección sin
  // ni un look con foto no tendría sentido.
  const hayLookCompleto = looks.some((l) => l.imagenes?.length > 0);
  // publicadaAlDia: publicada y sin ediciones de looks posteriores → botón
  // desactivado, "Colección publicada". necesitaActualizar: se editó un
  // look después de publicar (ver marcarCambiosSiPublicada más abajo) →
  // el botón vuelve a activarse como "Actualizar publicación" en vez de
  // quedarse marcado como publicado cuando ya no refleja lo editado.
  const publicadaAlDia = categoriaActual?.publicada && !categoriaActual?.cambiosSinPublicar;
  const necesitaActualizar = categoriaActual?.publicada && categoriaActual?.cambiosSinPublicar;
  const [vistaLooks, setVistaLooks] = useState('rejilla');
  const [lookEnEdicionIndice, setLookEnEdicionIndice] = useState(null);
  const [lookAEliminarIndice, setLookAEliminarIndice] = useState(null);

  // Una vez publicada, tocar cualquier look (editar, añadir, borrar) deja
  // la colección "desactualizada" — el botón de Publicar pasa a "Actualizar
  // publicación" (ver PageHeader más abajo) en vez de quedarse en "Colección
  // publicada" como si lo ya visible siguiera reflejando lo editado.
  function marcarCambiosSiPublicada() {
    return categoriaActual?.publicada ? { cambiosSinPublicar: true } : {};
  }

  function guardarLook(datos) {
    const nuevosLooks = looks.map((l, i) => (i === lookEnEdicionIndice ? datos : l));
    editarCategoria(tipoFijo, categoriaActual.id, { looks: nuevosLooks, ...marcarCambiosSiPublicada() });
    setLookEnEdicionIndice(null);
    mostrarToast(`"${datos.nombre}" guardado (demo)`);
  }

  function agregarLook() {
    editarCategoria(tipoFijo, categoriaActual.id, {
      numeroLooks: categoriaActual.numeroLooks + 1, ...marcarCambiosSiPublicada(),
    });
    mostrarToast(`Look ${categoriaActual.numeroLooks + 1} añadido (demo)`);
  }

  function publicarColeccion() {
    const actualizacion = categoriaActual.publicada;
    editarCategoria(tipoFijo, categoriaActual.id, { publicada: true, cambiosSinPublicar: false });
    mostrarToast(actualizacion
      ? `"${categoriaActual.nombre}" actualizada (demo) — sigue sin haber una web pública real detrás`
      : `"${categoriaActual.nombre}" publicada (demo) — sigue sin haber una web pública real detrás`);
  }

  function confirmarEliminarLook() {
    const indice = lookAEliminarIndice;
    const nuevosLooks = looks.filter((_, i) => i !== indice);
    editarCategoria(tipoFijo, categoriaActual.id, {
      numeroLooks: categoriaActual.numeroLooks - 1,
      looks: nuevosLooks,
      ...marcarCambiosSiPublicada(),
    });
    setLookAEliminarIndice(null);
    mostrarToast('Look eliminado (demo)');
  }

  function etiquetaCategoria(tipo, categoriaId) {
    return categorias[tipo]?.find((c) => c.id === categoriaId)?.nombre || '—';
  }

  // Ya vienen filtrados y paginados por el servidor: volver a filtrar aquí descartaría
  // resultados legítimos de otras páginas.
  const filtrados = productos;

  function alternarSeleccion(id) {
    setSeleccionadas((actual) => (actual.includes(id) ? actual.filter((s) => s !== id) : [...actual, id]));
  }

  function alternarTodas(marcar) {
    setSeleccionadas(marcar ? filtrados.map((p) => p.id) : []);
  }

  // Contra la API, nunca sobre estado local: lo que se ve es lo que dice el servidor.
  async function aplicarEnBloque(cambio) {
    const status = STATUS_POR_ESTADO[cambio.estado];
    const resultado = await aplicarEnBloqueApi(seleccionadas, { status });
    mostrarToast(resultado.ok ? 'Cambios aplicados' : `No se pudo guardar: ${resultado.mensaje}`);
    if (resultado.ok) setSeleccionadas([]);
  }

  async function confirmarBorrarEnBloque() {
    // El DELETE del backend ARCHIVA, no elimina: el histórico de pedidos referencia el
    // producto (Product.archive(), ADMIN_API_PLAN.md D8). Comprobado: tras el DELETE el
    // producto sigue existiendo con status "archived".
    const resultado = await archivar(seleccionadas);
    mostrarToast(resultado.ok ? 'Productos archivados' : `No se pudo archivar: ${resultado.mensaje}`);
    if (resultado.ok) setSeleccionadas([]);
    setConfirmarBorradoBloqueAbierto(false);
  }

  function duplicar(producto) {
    setProductoParaDuplicar(producto);
  }

  // ALTA REAL contra POST /admin/products/.
  //
  // `FormularioProducto` puede emitir un array (varias "variantes de color"). Eso en el
  // modelo real NO son productos distintos: son `Colorway` de un mismo `Product`. Aquí
  // solo se guarda la raíz y se avisa; el flujo de colorways es otra pantalla.
  async function crearProducto(productoOProductos) {
    const lista = Array.isArray(productoOProductos) ? productoOProductos : [productoOProductos];
    const [raiz, ...variantes] = lista;

    const resultado = await guardarProducto(raiz, {
      familiaId: raiz.familiaId,
      publicadoEn: raiz.publicadoEn,
      // Categoría del panel → `Category` real (se crea si no existe). Sin esto el
      // producto se guarda «suelto» y no sale en el listado de su categoría.
      categoriaPanel: raiz.categoriaNombre
        ? { id: raiz.categoriaId, nombre: raiz.categoriaNombre }
        : categoriaSeleccionada,
      // Respaldo solo para borradores: `family` es FK obligatoria y sin ella no se
      // podría guardar un borrador a medias.
      familiaPorDefecto: familiasDeLaLinea[0]?.id,
    });

    if (!resultado.ok) {
      mostrarToast(`No se ha guardado: ${resultado.mensaje}`);
      return;
    }

    avisarDeLoQueNoSeGuarda(resultado.perdidos, variantes.length);
    if (resultado.categoriaFallida) {
      mostrarToast('Guardado, pero no se pudo asignar la categoría: revísala en la ficha.');
    }
    // Se dice qué se ha rellenado solo: inventar datos en silencio es peor que bloquear.
    if (resultado.rellenado?.length) {
      mostrarToast(`Hemos rellenado por ti: ${resultado.rellenado.join(', ')} — cámbialo antes de publicar.`);
    }
    avisarDeLasFotos(resultado.fotos);
    mostrarToast(raiz.estado === 'Activo' ? 'Producto publicado' : 'Producto guardado');
    avisarSiLosFiltrosLoEsconden(resultado.producto);
    setNuevoAbierto(false);
    setProductoParaDuplicar(null);
    recargar();
  }

  /** Dice qué se ha quedado fuera en vez de callarlo. */
  /**
   * Las fotos se suben DESPUÉS de guardar el producto (necesitan su id), así que pueden
   * fallar por separado: se dice cuántas entraron y por qué falló cada una, en vez de dar
   * el guardado por bueno sin más.
   */
  function avisarDeLasFotos(fotos) {
    if (!fotos) return;
    if (fotos.subidas > 0) {
      mostrarToast(`${fotos.subidas} foto${fotos.subidas === 1 ? '' : 's'} subida${fotos.subidas === 1 ? '' : 's'}.`);
    }
    if (fotos.borradas > 0) {
      mostrarToast(`${fotos.borradas} foto${fotos.borradas === 1 ? '' : 's'} quitada${fotos.borradas === 1 ? '' : 's'}.`);
    }
    fotos.fallidas?.forEach((motivo) => mostrarToast(`Foto no subida — ${motivo}`));
  }

  /**
   * El producto se ha guardado, pero el listado que se está mirando puede no enseñarlo:
   * se está dentro de una categoría o con un filtro de estado que el producto nuevo no
   * cumple. Sin este aviso parece que no se ha guardado nada — que es justo lo que
   * parecía.
   */
  function avisarSiLosFiltrosLoEsconden(producto) {
    if (!producto) return;
    const slugFiltro = slugCategoriaPanel(categoriaSeleccionada);
    const slugsDelProducto = (producto.categories_detail || []).map((c) => c.slug);
    if (slugFiltro && !slugsDelProducto.includes(slugFiltro)) {
      mostrarToast(
        `Está guardado, pero no en «${categoriaSeleccionada.nombre}», que es la categoría que estás viendo`
        + `${slugsDelProducto.length ? '' : ' (se ha guardado sin categoría)'}. Cámbiala en la ficha o mira el listado completo.`
      );
      return;
    }
    const estadoFiltrado = filtroPublicacion !== 'Todos'
      ? STATUS_POR_ESTADO[ETIQUETA_A_ESTADO[filtroPublicacion]]
      : null;
    if (estadoFiltrado && producto.status !== estadoFiltrado) {
      mostrarToast(`Está guardado como «${ESTADO_POR_STATUS[producto.status]}», y el listado está filtrado por «${filtroPublicacion}».`);
    }
  }

  /** Dice qué se ha quedado fuera en vez de callarlo. */
  function avisarDeLoQueNoSeGuarda(perdidos, numeroVariantes) {
    if (numeroVariantes > 0) {
      mostrarToast(
        `Las ${numeroVariantes} variantes de color no se han creado: en el catálogo real son colorways de un mismo producto, no productos aparte.`
      );
    }
    if (perdidos?.length) {
      mostrarToast(`Sin guardar (no existen en el catálogo): ${perdidos.join(', ')}.`);
    }
  }

  function abrirEdicion(producto) {
    setProductoEnEdicion(producto);
  }

  // EDICIÓN REAL contra PATCH /admin/products/{id}/.
  async function guardarEdicion(productoOProductos) {
    const lista = Array.isArray(productoOProductos) ? productoOProductos : [productoOProductos];
    const [raiz, ...variantes] = lista;
    const id = productoEnEdicion?.id;

    const resultado = await guardarProducto(raiz, {
      id,
      familiaId: raiz.familiaId,
      publicadoEn: raiz.publicadoEn,
      categoriaPanel: raiz.categoriaNombre
        ? { id: raiz.categoriaId, nombre: raiz.categoriaNombre }
        : categoriaSeleccionada,
      // Las que la ficha ya tenía: sin esto, quitar una foto en el formulario no la
      // quitaba del servidor y volvía a aparecer al recargar.
      imagenesPrevias: productoEnEdicion?.imagenesDetalle || [],
    });

    if (!resultado.ok) {
      mostrarToast(`No se ha guardado: ${resultado.mensaje}`);
      return;
    }

    avisarDeLoQueNoSeGuarda(resultado.perdidos, variantes.length);
    avisarDeLasFotos(resultado.fotos);
    mostrarToast('Cambios guardados');
    setProductoEnEdicion(null);
    recargar();
  }

  if (categoriaActual?.numeroLooks) {
    return (
      <div>
        <div className={styles.cabeceraSuperior}>
          <BotonVolver href={rutaBase}>Atrás</BotonVolver>
          <div className={styles.vistaToggle} role="group" aria-label="Cambiar vista">
            <button
              type="button"
              className={`${styles.vistaBoton} ${vistaLooks === 'tabla' ? styles.vistaBotonActiva : ''}`}
              aria-pressed={vistaLooks === 'tabla'}
              aria-label="Vista de tabla"
              onClick={() => setVistaLooks('tabla')}
            >
              <List size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.vistaBoton} ${vistaLooks === 'rejilla' ? styles.vistaBotonActiva : ''}`}
              aria-pressed={vistaLooks === 'rejilla'}
              aria-label="Vista de rejilla"
              onClick={() => setVistaLooks('rejilla')}
            >
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <PageHeader
          titulo={`${titulo} — ${categoriaActual.nombre}`}
          subtitulo={`${categoriaActual.numeroLooks} look${categoriaActual.numeroLooks === 1 ? '' : 's'}${publicadaAlDia ? ' · Publicada' : ''}${necesitaActualizar ? ' · Cambios sin publicar' : ''}`}
        >
          {hayLookCompleto && (
            <Boton
              variante="solido"
              className={`${styles.publicarBoton} ${publicadaAlDia ? styles.publicarBotonPublicada : ''}`}
              onClick={publicarColeccion}
              desactivado={publicadaAlDia}
            >
              {/* eslint-disable-next-line no-nested-ternary -- 3 estados: sin publicar / cambios pendientes / al día */}
              {publicadaAlDia ? <Check size={14} /> : necesitaActualizar ? <RefreshCw size={14} /> : <ArrowUpFromLine size={14} />}
              {/* eslint-disable-next-line no-nested-ternary -- idem */}
              {publicadaAlDia ? 'Colección publicada' : necesitaActualizar ? 'Actualizar publicación' : 'Publicar colección'}
            </Boton>
          )}
          <Boton variante="solido" onClick={agregarLook}>
            <Plus size={14} />
            Añadir Look
          </Boton>
        </PageHeader>

        {vistaLooks === 'rejilla' ? (
          <div className={styles.looksGrid}>
            {looks.map((look, indice) => (
              <LookTarjeta
                key={look.nombre + indice}
                look={look}
                onEditar={() => setLookEnEdicionIndice(indice)}
                onEliminar={() => setLookAEliminarIndice(indice)}
              />
            ))}
          </div>
        ) : (
          <TablaAdmin
            columnas={[
              {
                clave: 'imagen',
                etiqueta: '',
                render: (look) => (look.imagenes?.[0]
                  ? <img src={look.imagenes[0]} alt="" className={styles.miniatura} />
                  : <span className={styles.miniatura} />),
              },
              { clave: 'nombre', etiqueta: 'Look' },
              {
                clave: 'sku',
                etiqueta: 'SKU',
                render: (look) => (look.prendas?.length
                  ? look.prendas.map((p) => p.sku).filter(Boolean).join(', ') || '—'
                  : '—'),
              },
              {
                clave: 'imagenes', etiqueta: 'Imágenes', render: (look) => look.imagenes?.length || 0,
              },
              { clave: 'descripcion', etiqueta: 'Descripción', render: (look) => look.descripcion || '—' },
            ]}
            filas={looks}
            claveFila={(look) => look.nombre}
            onClickFila={(look) => setLookEnEdicionIndice(looks.indexOf(look))}
          />
        )}

        <ModalOverlay abierto={lookEnEdicionIndice !== null} onCerrar={() => setLookEnEdicionIndice(null)}>
          {lookEnEdicionIndice !== null && (
            <FormularioLook
              key={lookEnEdicionIndice}
              numero={lookEnEdicionIndice + 1}
              look={looks[lookEnEdicionIndice]}
              onGuardado={guardarLook}
            />
          )}
        </ModalOverlay>

        <ConfirmarBorrado
          abierto={lookAEliminarIndice !== null}
          titulo={lookAEliminarIndice !== null ? `¿Borrar "${looks[lookAEliminarIndice]?.nombre}"?` : ''}
          onConfirmar={confirmarEliminarLook}
          onCancelar={() => setLookAEliminarIndice(null)}
        />
      </div>
    );
  }

  if (agruparPorCategoria && !categoriaFija) {
    const categoriasSinFiltrar = categorias[tipoFijo] || [];
    // Archivos de colecciones (Runway/Novia/Fiesta) tienen categorías fijas
    // (ver categoriasMock en mockData.js) — solo ahí tiene sentido dar de
    // alta una colección nueva desde aquí; Pret-à-porter/Atelier ya tienen
    // su propia alta de categoría en /admin/categorias.
    const esColeccionFija = categoriasSinFiltrar.some((c) => c.fija);
    // `orden` ascendente = más reciente primero (así están definidas las
    // colecciones de Runway/Novia/Fiesta en mockData.js) — sin este sort
    // una colección añadida desde el modal se pintaría en su posición de
    // array, no en su sitio cronológico. Solo para `fija`: Prêt-à-porter/
    // Atelier se reordenan por drag & drop (`reordenarCategorias`), que
    // cambia el array pero no toca `orden` — ordenar esos por `orden`
    // ignoraría el reorden manual del usuario.
    const todasLasCategorias = esColeccionFija
      ? categoriasSinFiltrar.filter((c) => c.visible).sort((a, b) => a.orden - b.orden)
      : categoriasSinFiltrar.filter((c) => c.visible);
    const hayTemporadas = todasLasCategorias.some((c) => c.temporada);
    const categoriasVisibles = hayTemporadas && filtroTemporada !== 'Todas'
      ? todasLasCategorias.filter((c) => codigoTemporada(c.temporada).startsWith(filtroTemporada))
      : todasLasCategorias;
    return (
      <div>
        <PageHeader
          titulo={titulo}
          subtitulo={`${categoriasVisibles.length} categoría${categoriasVisibles.length === 1 ? '' : 's'} — elige una para ver sus productos`}
        >
          {hayTemporadas && (
            <div className={styles.temporadaSelector}>
              {[
                { valor: 'AW', etiqueta: 'Autumn Winter', clase: styles.temporadaBotonAw },
                { valor: 'SS', etiqueta: 'Spring Summer', clase: styles.temporadaBotonSs },
              ].map(({ valor, etiqueta, clase }) => (
                <button
                  key={valor}
                  type="button"
                  className={`${styles.temporadaBoton} ${clase} ${filtroTemporada === valor ? styles.temporadaBotonActivo : ''}`}
                  aria-pressed={filtroTemporada === valor}
                  onClick={() => setFiltroTemporada(filtroTemporada === valor ? 'Todas' : valor)}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          )}
          {esColeccionFija && (
            <Boton variante="solido" onClick={() => setNuevaColeccionAbierta(true)}>
              <Plus size={14} />
              Nueva Colección
            </Boton>
          )}
        </PageHeader>
        <div className={`${styles.categoriasGrid} ${imagenesCategoria ? styles.categoriasGridImagenes : ''}`}>
          {categoriasVisibles.map((cat) => (imagenesCategoria ? (
            <Link
              key={cat.id}
              href={`${rutaBase}?categoria=${cat.id}`}
              className={styles.categoriaTarjetaImagen}
            >
              {esColeccionFija && (
                <button
                  type="button"
                  className={styles.categoriaEditar}
                  aria-label={`Editar ${cat.nombre}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setColeccionEnEdicion(cat);
                  }}
                >
                  <Pencil size={14} />
                </button>
              )}
              <div className={styles.categoriaImagenWrap}>
                {imagenesCategoria[cat.id] || cat.imagen ? (
                  <img src={imagenesCategoria[cat.id] || cat.imagen} alt="" className={styles.categoriaImagen} />
                ) : <div className={styles.categoriaImagenVacia} />}
                {cat.temporada && (
                  <span className={`${styles.categoriaBadge} ${codigoTemporada(cat.temporada).startsWith('AW') ? styles.categoriaBadgeAw : styles.categoriaBadgeSs}`}>
                    {codigoTemporada(cat.temporada)}
                  </span>
                )}
              </div>
              <div className={styles.categoriaInfoFila}>
                <span className={styles.categoriaNombre}>{cat.nombre}</span>
                <span className={styles.categoriaContador}>
                  {cat.numeroLooks ?? productos.filter((p) => p.tipo === tipoFijo && p.categoriaId === cat.id).length}
                </span>
              </div>
            </Link>
          ) : (
            <Link key={cat.id} href={`${rutaBase}?categoria=${cat.id}`} className={styles.categoriaTarjeta}>
              {IconoCategoria && <IconoCategoria className={styles.categoriaIcono} aria-hidden="true" />}
              <span className={styles.categoriaNombre}>{cat.nombre}</span>
            </Link>
          )))}
        </div>

        {esColeccionFija && (
          <ModalOverlay
            abierto={nuevaColeccionAbierta || Boolean(coleccionEnEdicion)}
            onCerrar={cerrarModalColeccion}
          >
            <FormularioColeccion
              key={coleccionEnEdicion?.id || 'nueva'}
              onGuardado={coleccionEnEdicion ? guardarEdicionColeccion : crearColeccion}
              pedirTemporada={hayTemporadas}
              categoriaExistente={coleccionEnEdicion}
              onBorrar={coleccionEnEdicion ? pedirBorrarColeccion : undefined}
            />
          </ModalOverlay>
        )}

        {esColeccionFija && (
          <ConfirmarBorrado
            abierto={Boolean(coleccionABorrar)}
            titulo={coleccionABorrar ? `¿Borrar "${coleccionABorrar.nombre}"?` : ''}
            onConfirmar={confirmarBorrarColeccion}
            onCancelar={() => setColeccionABorrar(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cabeceraSuperior}>
        {agruparPorCategoria ? <BotonVolver href={rutaBase}>Atrás</BotonVolver> : <div />}
        <div className={styles.vistaToggle} role="group" aria-label="Cambiar vista">
          <button
            type="button"
            className={`${styles.vistaBoton} ${vistaProductos === 'tabla' ? styles.vistaBotonActiva : ''}`}
            aria-pressed={vistaProductos === 'tabla'}
            aria-label="Vista de tabla"
            onClick={() => setVistaProductos('tabla')}
          >
            <List size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.vistaBoton} ${vistaProductos === 'rejilla' ? styles.vistaBotonActiva : ''}`}
            aria-pressed={vistaProductos === 'rejilla'}
            aria-label="Vista de rejilla"
            onClick={() => setVistaProductos('rejilla')}
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <PageHeader
        titulo={categoriaActual ? `${titulo} — ${categoriaActual.nombre}` : titulo}
        subtitulo={cargandoProductos ? 'Cargando…' : `${total} producto${total === 1 ? '' : 's'}`}
      >
        <Boton variante="solido" onClick={() => setNuevoAbierto(true)}>
          <Plus size={14} className={styles.iconoAnadir} />
          Añadir producto
        </Boton>
      </PageHeader>

      <FiltroBar>
        <Input etiqueta="Buscar" placeholder="Nombre o SKU" valor={query} onChange={(e) => setQuery(e.target.value)} />
        {!tipoFijo && (
          <FiltroSelector
            etiqueta="Tipo"
            valor={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            opciones={[{ valor: 'Todos', etiqueta: 'Todos' }, ...tiposProducto]}
          />
        )}
        <FiltroSelector
          etiqueta="Colección"
          valor={filtroColeccion}
          onChange={(e) => setFiltroColeccion(e.target.value)}
          opciones={[{ valor: 'Todas', etiqueta: 'Todas' }, ...coleccionesMock]}
        />
      </FiltroBar>

      <TabsFiltro opciones={OPCIONES_PUBLICACION} valor={filtroPublicacion} onChange={setFiltroPublicacion} />

      {seleccionadas.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkTexto}>{seleccionadas.length} seleccionados</span>
          <Boton variante="contorno" tamano="s" className={styles.bulkPublicar} onClick={() => aplicarEnBloque({ estado: 'Activo' })}>Publicar</Boton>
          <Boton variante="contorno" tamano="s" className={styles.bulkDesactivar} onClick={() => aplicarEnBloque({ estado: 'Archivado' })}>Archivar</Boton>
          <Boton variante="contorno" tamano="s" className={styles.bulkBorrar} onClick={() => setConfirmarBorradoBloqueAbierto(true)}>Borrar</Boton>
          <button type="button" className={styles.bulkCerrar} aria-label="Deseleccionar todo" onClick={() => setSeleccionadas([])}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Sin sesión de staff o backend caído: se dice, no se enseña una tabla vacía. */}
      {errorProductos && (
        <div className={styles.estadoAviso} role="alert">
          <p>
            {errorProductos.isNetworkError
              ? 'No hemos podido conectar con el servidor.'
              : errorProductos.status === 401 || errorProductos.status === 403
                ? 'Tu sesión no tiene acceso al panel. Vuelve a entrar.'
                : errorProductos.message}
          </p>
          <Boton variante="contorno" tamano="s" onClick={recargar}>Reintentar</Boton>
        </div>
      )}

      {!errorProductos && cargandoProductos && (
        <p className={styles.estadoCargando} role="status">Cargando productos…</p>
      )}

      {!errorProductos && !cargandoProductos && filtrados.length === 0 && (
        <p className={styles.estadoVacio}>
          No hay productos que coincidan con los filtros.
        </p>
      )}

      {vistaProductos === 'tabla' ? (
        <TablaAdmin
          seleccionables
          seleccionadas={seleccionadas}
          onToggleSeleccion={alternarSeleccion}
          onToggleTodas={alternarTodas}
          columnas={[
            { clave: 'imagen', etiqueta: '', render: (p) => (p.imagen ? <img src={p.imagen} alt="" className={styles.miniatura} /> : <span className={styles.miniatura} />) },
            {
              clave: 'nombre',
              etiqueta: 'Nombre',
              render: (p) => {
                const color = coloresMock.find((c) => p.colorIds?.includes(c.id));
                return (
                  <span className={styles.nombreCelda}>
                    {p.nombre}
                    {color && <span className={styles.nombreVarianteSwatch} style={{ background: color.hex }} title={color.nombre.es} />}
                  </span>
                );
              },
            },
            { clave: 'sku', etiqueta: 'SKU', render: (p) => p.sku || '—' },
            // "Tipo"/"Categoría" se ocultan cuando ya vienen fijados por la
            // ruta/filtro (tipoFijo, ?categoria=) — todas las filas serían el
            // mismo valor, columna redundante. Mismo criterio que ya usa el
            // filtro "Tipo" de FiltroBar más arriba (!tipoFijo).
            !tipoFijo && { clave: 'tipo', etiqueta: 'Tipo', render: (p) => etiquetaTipo(p.tipo) },
            !categoriaFija && { clave: 'categoria', etiqueta: 'Categoría', render: (p) => etiquetaCategoria(p.tipo, p.categoriaId) },
            { clave: 'coleccion', etiqueta: 'Colección', render: (p) => etiquetaColeccion(p.coleccion) },
            // El dato es un decimal tipado; el formato se aplica AQUÍ, en la vista, no
            // se guarda dentro del dato (era lo que rompía los céntimos).
            { clave: 'precio', etiqueta: 'Precio', render: (p) => (p.precio ? formatearImporte(p.precio) : '—') },
            { clave: 'stock', etiqueta: 'Stock', render: (p) => stockTotal(p) },
            { clave: 'estado', etiqueta: 'Estado', render: (p) => <EstadoPublicacionBadge estado={p.estado} /> },
          ].filter(Boolean)}
          filas={filtrados}
          onClickFila={abrirEdicion}
          renderAcciones={(p) => (
            <div className={styles.filaAcciones}>
              <Boton variante="texto" onClick={() => abrirEdicion(p)}>Editar</Boton>
              <Boton variante="texto" onClick={() => duplicar(p)}>Duplicar</Boton>
            </div>
          )}
        />
      ) : (
        <GridProductos filas={filtrados} onClickFila={abrirEdicion} onDuplicar={duplicar} porPagina={12} />
      )}

      {/* Paginación de SERVIDOR: cada página es una petición, no un recorte del array. */}
      {paginas > 1 && (
        <div className={styles.paginacion}>
          <button
            type="button"
            className={styles.paginaBoton}
            onClick={() => setPagina((n) => Math.max(1, n - 1))}
            disabled={pagina <= 1 || cargandoProductos}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className={styles.paginaTexto}>Página {pagina} de {paginas}</span>
          <button
            type="button"
            className={styles.paginaBoton}
            onClick={() => setPagina((n) => Math.min(paginas, n + 1))}
            disabled={pagina >= paginas || cargandoProductos}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <ModalOverlay abierto={nuevoAbierto} onCerrar={() => setNuevoAbierto(false)}>
        <FormularioProducto tipoInicial={tipoFijo} categoriaInicial={categoriaFija || undefined} onGuardado={crearProducto} />
      </ModalOverlay>

      <ModalOverlay abierto={!!productoParaDuplicar} onCerrar={() => setProductoParaDuplicar(null)}>
        <FormularioProducto productoBase={productoParaDuplicar} onGuardado={crearProducto} />
      </ModalOverlay>

      <ModalOverlay abierto={!!productoEnEdicion} onCerrar={() => setProductoEnEdicion(null)}>
        <FormularioProducto productoExistente={productoEnEdicion} onGuardado={guardarEdicion} />
      </ModalOverlay>

      <ConfirmarBorrado
        abierto={confirmarBorradoBloqueAbierto}
        titulo={`¿Borrar ${seleccionadas.length} producto${seleccionadas.length === 1 ? '' : 's'}?`}
        onConfirmar={confirmarBorrarEnBloque}
        onCancelar={() => setConfirmarBorradoBloqueAbierto(false)}
      />
    </div>
  );
}

function ListaProductos(props) {
  return (
    <Suspense fallback={null}>
      <ListaProductosContenido {...props} />
    </Suspense>
  );
}

export default ListaProductos;
