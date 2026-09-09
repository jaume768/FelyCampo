'use client';

/* ============================================================
   FORMULARIO DE PRODUCTO — Fely Campo (admin)
   Página única con secciones numeradas (spec 2.3), en vez de wizard:
   todo visible y editable a la vez, mejor para "editar" (no hay que
   re-navegar pasos por un solo campo). Los campos específicos
   dependen del tipo elegido — CAMPOS_TIPO decide qué renderizar, no
   una pila de "if tipo === ...".
   La categoría (antes "Sección web") ya no se elige aquí: se hereda
   del contexto de navegación — tipoInicial/categoriaInicial llegan
   fijados cuando el formulario se abre desde /admin/productos/[tipo]
   o desde un enlace de categoría del sidebar (spec: "the user already
   uploads the product on the section").
   Cambiar el tipo en modo edición pide confirmación explícita (spec:
   "should not be allowed without explicit confirmation") porque
   descarta los campos específicos del tipo anterior.
   ============================================================ */

import {
  useMemo, useRef, useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Link2, Plus, Search, Upload, X,
} from 'lucide-react';
import {
  PageHeader, FormSeccion, DragList, SelectorIdioma, useToast, useCategorias,
} from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import {
  tiposProducto, coleccionesMock, coloresMock, familiasColorMock, categoriasCuidadoMock, cuidadosMock, resenasMock, tallasEstandar, ajustesTiendaMock, rutaTipoProducto,
} from '@/components/admin/mockData';
import { useFamiliasAdmin } from './useFamiliasAdmin';
import styles from './FormularioProducto.module.css';

// Compresión de imágenes al subir — evitar que fotos de móvil (varios MB,
// sin redimensionar) lleguen pesadas a la web pública. No dependemos de que
// el usuario elija bien el tamaño: se reescala a un máximo razonable y se
// reencoda en el cliente, sin bloquear la subida en ningún caso.
const IMAGEN_DIMENSION_MAXIMA = 2000;
const IMAGEN_CALIDAD_JPEG = 0.82;
const IMAGEN_AVISO_BYTES = 1.5 * 1024 * 1024;

function extensionDeMime(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

// Esquema "Nombre - Color - TIPO _ Marca" (p.ej. "Sandalias de tacón con
// pompón - Beige - MUJER _ H&M") aplicado al `File` que se sube — nombre
// del producto tal cual lo ha escrito el usuario en este formulario,
// primer color elegido (si hay), y el tipo de producto en mayúsculas
// haciendo de "categoría". Solo cambia el nombre del archivo (metadata),
// no genera ni sube nada — ver aviso de imágenes 100% cliente en
// docs/adminpanel.md sección 5.
function nombreArchivoImagen({
  nombre, colorIds, tipo, posicion, total, mime,
}) {
  const partes = [nombre?.es?.trim() || 'Producto'];

  const colorPrincipal = coloresMock.find((c) => c.id === colorIds[0])?.nombre?.es;
  if (colorPrincipal) partes.push(colorPrincipal);

  const tipoEtiqueta = tiposProducto.find((t) => t.valor === tipo)?.etiqueta;
  if (tipoEtiqueta) partes.push(tipoEtiqueta.toUpperCase());

  const sufijoPosicion = total > 1 ? ` (${posicion})` : '';
  return `${partes.join(' - ')}${sufijoPosicion} _ ${ajustesTiendaMock.nombreTienda}.${extensionDeMime(mime)}`;
}

function comprimirImagen(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, IMAGEN_DIMENSION_MAXIMA / Math.max(img.width, img.height));
        const ancho = Math.round(img.width * escala);
        const alto = Math.round(img.height * escala);
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        canvas.getContext('2d').drawImage(img, 0, 0, ancho, alto);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))),
          'image/jpeg',
          IMAGEN_CALIDAD_JPEG
        );
      };
      img.onerror = reject;
      img.src = lector.result;
    };
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

// Un producto con varias piezas (p.ej. conjunto de dos piezas) puede tener
// una prenda por pieza, cada una con su propio SKU — mismo patrón que
// FormularioLook.jsx "Prendas y SKU". Arranca con una fila vacía para que
// el formulario no se abra sin ningún campo que rellenar.
function prendasIniciales(producto) {
  return producto?.prendas?.length ? producto.prendas : [{ nombre: '', sku: '' }];
}

// Miniatura de tela: recorte cuadrado centrado a 150×150 — a diferencia de
// comprimirImagen() (hasta 2000px, fotos reales del producto), aquí es
// solo una muestra de tejido en un chip, así que se fuerza un tamaño fijo
// pequeño para que el peso se quede bajo sin depender de lo que suba el
// admin. Duplicado de FormularioLook.jsx (no se puede importar una
// función de otro componente 'use client' sin exportarla a propósito).
const TELA_IMAGEN_LADO = 150;

function comprimirImagenTela(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const offsetX = (img.width - lado) / 2;
        const offsetY = (img.height - lado) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = TELA_IMAGEN_LADO;
        canvas.height = TELA_IMAGEN_LADO;
        canvas.getContext('2d').drawImage(img, offsetX, offsetY, lado, lado, 0, 0, TELA_IMAGEN_LADO, TELA_IMAGEN_LADO);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen de la tela'))),
          'image/jpeg',
          0.85
        );
      };
      img.onerror = reject;
      img.src = lector.result;
    };
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

// Filtro "Tipo" de la sección "Vincular a Runway/Novia/Fiesta" — mismas
// etiquetas que tiposProducto, restringidas a los 3 tipos de archivo
// editorial (looksBuscables nunca trae pret-a-porter/atelier).
const OPCIONES_TIPO_LOOK = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'archivo', etiqueta: 'Runway' },
  { valor: 'novia', etiqueta: 'Novia' },
  { valor: 'fiesta', etiqueta: 'Fiesta' },
];

const CAMPOS_TIPO = {
  'pret-a-porter': {
    precio: { requerido: true, placeholder: '890 €' }, tallas: true, colores: true, telas: true, stock: true, coleccion: 'opcional',
  },
  // Atelier (Novias/Fiesta) no lleva precio fijo — la web pública ya
  // resuelve esto con el botón "Precio a consultar" (ver
  // consultasPrecioMock en mockData.js), así que aquí tampoco se pide un
  // importe: la sección "Precio de compra" muestra el aviso fijo en su
  // lugar (`consulta: true` en vez de un objeto de validación de input).
  atelier: {
    precio: { consulta: true }, tallas: false, colores: 'opcional', telas: 'opcional', stock: false, coleccion: 'opcional',
  },
  archivo: {
    precio: false, tallas: false, colores: false, telas: false, stock: false, coleccion: { requerido: true },
  },
  // novia/fiesta: archivos de colecciones pasadas, mismo criterio que
  // archivo/Runway — ver categoriasMock.novia/fiesta en mockData.js.
  novia: {
    precio: false, tallas: false, colores: false, telas: false, stock: false, coleccion: { requerido: true },
  },
  fiesta: {
    precio: false, tallas: false, colores: false, telas: false, stock: false, coleccion: { requerido: true },
  },
};

function FormularioProducto({
  productoExistente, productoBase, tipoInicial, categoriaInicial, onGuardado,
}) {
  const router = useRouter();
  const { mostrarToast } = useToast();

  // Semilla de datos iniciales: productoExistente (edición in-place, mismo
  // id) o productoBase (duplicar como variante de color desde el botón
  // "Duplicar" de ListaProductos — mismo producto, pero con todo lo que
  // debe cambiar entre colores vacío: fotos, color/estampado, SKU propio
  // y de cada prenda, stock por talla (es inventario de OTRO color, no
  // vale para este), look vinculado (la foto de pasarela es de OTRO
  // color) y reseñas (son de compradoras de la pieza original, no de esta
  // variante nueva) — el admin solo tiene que rellenar eso y subir las
  // fotos del color nuevo. Sin ninguno de los dos (alta desde cero) es
  // null y cada useState de abajo cae en su valor por defecto de siempre.
  const semilla = productoExistente || (productoBase ? {
    ...productoBase,
    id: undefined,
    sku: undefined,
    imagen: '',
    imagenes: [],
    colorIds: [],
    estampadoId: null,
    estado: 'Borrador',
    lookVinculado: null,
    tallas: (productoBase.tallas || []).map((t) => ({ ...t, stock: 0 })),
    prendas: (productoBase.prendas || []).map((p) => ({ ...p, sku: '' })),
  } : null);

  const tipoFijado = Boolean(tipoInicial) && !productoExistente;
  const ocultarSeccionTipo = tipoFijado || Boolean(productoExistente) || Boolean(productoBase);
  const [tipo, setTipo] = useState(semilla?.tipo || tipoInicial || '');
  // Va DESPUÉS de `tipo`, no antes: leerlo arriba daba «Cannot access 'tipo' before
  // initialization» y el modal entero se caía al abrirse.
  //
  // `Product.family` es FK obligatoria (sin ella el alta da 400) y el formulario no tenía
  // selector porque el mock no tenía familias. Acotadas por línea: en atelier no pintan
  // nada «Faldas» ni «Zapatos».
  const { familias, cargando: cargandoFamilias } = useFamiliasAdmin(tipo);
  const [categoriaId, setCategoriaId] = useState(semilla?.categoriaId || categoriaInicial || '');
  const [idioma, setIdioma] = useState('es');
  const [nombre, setNombre] = useState({ es: semilla?.nombre || '', en: '' });
  const [descripcion, setDescripcion] = useState({ es: semilla?.descripcionCorta || '', en: '' });
  const [estado, setEstado] = useState(semilla?.estado || 'Borrador');
  const [familiaId, setFamiliaId] = useState(semilla?.familiaId || '');
  // Fecha desde la que se publica un producto programado. El backend la exige (y futura)
  // cuando el estado es 'Programado'.
  const [publicadoEn, setPublicadoEn] = useState(
    semilla?.publicadoEn ? String(semilla.publicadoEn).slice(0, 16) : ''
  );
  const [precio, setPrecio] = useState(semilla?.precio || '');
  // Variantes de color — un producto puede subirse (o editarse) con varias
  // variantes de color a la vez, una pestaña por variante con SU PROPIA
  // Imágenes/Color o Estampado/Tallas y Stock (lo único que cambia entre
  // colores); el resto del formulario (nombre, precio, composición,
  // cuidados...) es compartido y se rellena una sola vez. Disponible al
  // dar de alta un producto nuevo de cero y también al editar uno ya
  // existente (así se puede añadir un color más sin salir del panel de
  // edición) — solo "Duplicar" (productoBase) sigue trabajando sobre una
  // única variante, sin pestañas ni botón de añadir otra: ya es en sí
  // mismo el alta de una variante de color nueva.
  const permiteVariasVariantes = !productoBase;
  const [variantes, setVariantes] = useState(() => [{
    id: 'v0',
    imagenes: semilla?.imagenes || [],
    colorIds: semilla?.colorIds || [],
    estampadoId: semilla?.estampadoId || null,
    tallas: semilla?.tallas || [],
  }]);
  const [varianteActivaIndice, setVarianteActivaIndice] = useState(0);
  const varianteActiva = variantes[varianteActivaIndice] || variantes[0];

  function actualizarVarianteActiva(cambios) {
    setVariantes((actual) => actual.map((v, i) => (i === varianteActivaIndice ? { ...v, ...cambios } : v)));
  }

  function anadirVariante() {
    setVariantes((actual) => [...actual, {
      id: `v${Date.now()}`, imagenes: [], colorIds: [], estampadoId: null, tallas: [],
    }]);
    setVarianteActivaIndice(variantes.length);
  }

  function quitarVariante(indice) {
    setVariantes((actual) => (actual.length > 1 ? actual.filter((_, i) => i !== indice) : actual));
    setVarianteActivaIndice((actual) => (indice <= actual ? Math.max(0, actual - 1) : actual));
  }

  const [coleccion, setColeccion] = useState(semilla?.coleccion || '');
  // El desplegable arranca mostrando solo la colección vigente (FW27,
  // "Otoño-Invierno 2027") — no las 4 temporadas de coleccionesMock, para
  // no enseñar un histórico que hoy no aplica a ningún producto nuevo.
  // Si el producto que se edita ya pertenecía a otra colección (una de
  // las antiguas del mock), se añade también esa para no perder el dato
  // al abrir el formulario. Mismo criterio "demo, sin backend" que
  // coloresDisponibles más abajo: una colección añadida aquí no se
  // escribe de vuelta en mockData.js.
  const [coleccionesDisponibles, setColeccionesDisponibles] = useState(() => {
    const vigente = coleccionesMock.filter((c) => c.valor === 'FW27');
    const actual = semilla?.coleccion;
    if (actual && !vigente.some((c) => c.valor === actual)) {
      const existente = coleccionesMock.find((c) => c.valor === actual);
      if (existente) return [...vigente, existente];
    }
    return vigente;
  });
  const [estacionColeccionNueva, setEstacionColeccionNueva] = useState('fw');
  const [anioColeccionNuevo, setAnioColeccionNuevo] = useState('');
  const [nombresArchivos, setNombresArchivos] = useState({});
  const [prendas, setPrendas] = useState(() => prendasIniciales(semilla));
  // Copia local de coloresMock — permite añadir un color nuevo sin salir
  // del modal (mismo criterio "demo, sin backend" que GestorColores.jsx:
  // no se escribe de vuelta en mockData.js, pero el recién creado sí
  // aparece al momento como chip seleccionable aquí).
  const [coloresDisponibles, setColoresDisponibles] = useState(coloresMock);
  const [nombreColorNuevoEs, setNombreColorNuevoEs] = useState('');
  const [nombreColorNuevoEn, setNombreColorNuevoEn] = useState('');
  // El nuevo color siempre encaja en una familia ya existente (Neutros,
  // Rojos y vinos...) — el desplegable no ofrece "crear familia", arranca
  // en la primera para que nunca quede sin seleccionar.
  const [familiaColorNueva, setFamiliaColorNueva] = useState(familiasColorMock[0]?.id || '');
  const [hexColorNuevo, setHexColorNuevo] = useState('#000000');
  // Familia de color actualmente desplegada bajo la rejilla de "padres"
  // (null = ninguna) — un solo grupo abierto a la vez, ver Colores más
  // abajo.
  const [familiaColorActiva, setFamiliaColorActiva] = useState(null);
  // El input HEX es texto libre mientras se escribe ("#6E263" a mitad de
  // teclear no es un hex válido todavía) — el swatch nativo <input
  // type="color"> exige siempre un #rrggbb completo, así que recibe esta
  // versión saneada en vez de hexColorNuevo tal cual.
  const hexColorValido = /^#[0-9a-fA-F]{6}$/.test(hexColorNuevo) ? hexColorNuevo : '#000000';
  // Estampados: biblioteca de la sesión (igual que coloresDisponibles),
  // sin mock previo — arranca vacía porque no hay biblioteca de fábrica de
  // estampados, solo lo que suba el admin aquí. `estampadoId` (dentro de
  // la variante activa) es excluyente con `colorIds` (spec: "Selecciona
  // un color o estampado" — uno u otro, nunca los dos), así que elegir
  // uno vacía el otro.
  const [estampadosDisponibles, setEstampadosDisponibles] = useState([]);
  // Qué fila de alta se enseña bajo la rejilla de padres/estampados —
  // solo una a la vez, y ninguna por defecto (null) hasta que el admin
  // toca uno de los dos botones.
  const [modoAnadir, setModoAnadir] = useState(null);
  const [nombreEstampadoNuevoEs, setNombreEstampadoNuevoEs] = useState('');
  const [nombreEstampadoNuevoEn, setNombreEstampadoNuevoEn] = useState('');
  const [imagenEstampadoNueva, setImagenEstampadoNueva] = useState('');
  const [subiendoImagenEstampado, setSubiendoImagenEstampado] = useState(false);
  // Composición y Origen: campos directos del producto, sin biblioteca
  // reutilizable (a diferencia de Colores/Telas) — cada producto escribe
  // los suyos, no hay chips que guardar ni seleccionar. Bilingües como
  // Nombre/Descripción (objeto {es, en} + su propio SelectorIdioma, no
  // comparte el `idioma` de "Datos comunes" porque son secciones
  // independientes del formulario).
  const [idiomaComposicion, setIdiomaComposicion] = useState('es');
  const [composicion, setComposicion] = useState({ es: semilla?.composicion?.es || '', en: semilla?.composicion?.en || '' });
  const [disenadoEn, setDisenadoEn] = useState({ es: semilla?.disenadoEn?.es || '', en: semilla?.disenadoEn?.en || '' });
  const [fabricadoEn, setFabricadoEn] = useState({ es: semilla?.fabricadoEn?.es || '', en: semilla?.fabricadoEn?.en || '' });
  const [tinturaEstampacion, setTinturaEstampacion] = useState({ es: semilla?.tinturaEstampacion?.es || '', en: semilla?.tinturaEstampacion?.en || '' });
  const [origenTejido, setOrigenTejido] = useState({ es: semilla?.origenTejido?.es || '', en: semilla?.origenTejido?.en || '' });
  // Cuidados: selección múltiple — una prenda suele llevar
  // varias instrucciones a la vez (lavado + planchado + secado...), no una
  // sola. cuidadosMock trae ya las más comunes agrupadas por categoría
  // (ver categoriasCuidadoMock); el admin puede añadir cualquier otra.
  const [cuidadosDisponibles, setCuidadosDisponibles] = useState(cuidadosMock);
  const [cuidadoIds, setCuidadoIds] = useState(semilla?.cuidadoIds || []);
  const [nombreCuidadoNuevoEs, setNombreCuidadoNuevoEs] = useState('');
  const [nombreCuidadoNuevoEn, setNombreCuidadoNuevoEn] = useState('');
  const [categoriaCuidadoNueva, setCategoriaCuidadoNueva] = useState(categoriasCuidadoMock[0]?.id || '');
  // Vínculo con el look de Runway/Novia/Fiesta que enseña esta misma
  // pieza en pasarela — `categorias` viene de CategoriasProvider (mismo
  // Context que ListaProductos.jsx/FormularioLook.jsx), así que un look
  // subido/editado en esta misma sesión de admin ya aparece aquí buscable,
  // sin recargar. Al revés (FormularioLook.jsx buscando productos) no
  // tiene ese lujo: productosMock ahí es la copia estática del import,
  // porque no existe un ProductosProvider — ver comentario en ese archivo.
  const { categorias } = useCategorias();
  const [lookVinculado, setLookVinculado] = useState(semilla?.lookVinculado || null);
  const [buscarLook, setBuscarLook] = useState('');
  const [filtroTipoLook, setFiltroTipoLook] = useState('todos');
  const [filtroColeccionLook, setFiltroColeccionLook] = useState('todas');
  // Reseñas de Clientas — dos vías, igual de válidas: vincular una reseña
  // que ya existe en /admin/resenas (resenasMock, buscador igual que
  // "Vincular a Runway...") o subir una nueva directamente aquí. La nueva
  // solo vive en la sesión de este formulario (mismo límite "demo, sin
  // backend" que coloresDisponibles): no aparece en /admin/resenas hasta
  // que exista un backend real.
  const [resenasVinculadas, setResenasVinculadas] = useState(() => (
    productoExistente ? resenasMock.filter((r) => r.productoId === productoExistente.id) : []
  ));
  const [modoResena, setModoResena] = useState(null);
  const [buscarResena, setBuscarResena] = useState('');
  const [nombreClienteResenaNueva, setNombreClienteResenaNueva] = useState('');
  // Texto bilingüe como Composición y Origen — idioma propio, independiente
  // del `idioma` de "Datos comunes" (secciones distintas del formulario).
  const [idiomaResenaNueva, setIdiomaResenaNueva] = useState('es');
  const [textoResenaNueva, setTextoResenaNueva] = useState({ es: '', en: '' });
  const [fotosResenaNueva, setFotosResenaNueva] = useState([]);

  // blob URL -> File real de cada foto nueva, para poder subirla al guardar. Un ref y no
  // estado: cambiarlo no tiene que repintar nada, y así no se pierde entre renders.
  const archivosRef = useRef({});
  const inputArchivoRef = useRef(null);
  const inputImagenEstampadoRef = useRef(null);
  const inputFotosResenaRef = useRef(null);

  async function agregarImagenes(archivos) {
    const lista = Array.from(archivos || []);
    if (!lista.length) return;

    let pesoOriginal = 0;
    let pesoComprimido = 0;
    let algunaPesada = false;
    let posicion = varianteActiva.imagenes.length;
    const total = varianteActiva.imagenes.length + lista.length;
    const nombresNuevos = {};

    const nuevas = await Promise.all(lista.map(async (archivo) => {
      posicion += 1;
      const miPosicion = posicion;
      pesoOriginal += archivo.size;
      let blobFinal;
      try {
        blobFinal = await comprimirImagen(archivo);
      } catch {
        blobFinal = archivo;
      }
      pesoComprimido += blobFinal.size;
      if (blobFinal.size > IMAGEN_AVISO_BYTES) algunaPesada = true;

      const archivoNombrado = new File(
        [blobFinal],
        nombreArchivoImagen({
          nombre, colorIds: varianteActiva.colorIds, tipo, posicion: miPosicion, total, mime: blobFinal.type,
        }),
        { type: blobFinal.type }
      );
      const url = URL.createObjectURL(archivoNombrado);
      nombresNuevos[url] = archivoNombrado.name;
      // El File se guarda aparte, no solo su blob URL: esa URL únicamente vale dentro de
      // esta pestaña y muere al recargar. Para subir la foto al servidor hace falta el
      // archivo de verdad.
      archivosRef.current[url] = archivoNombrado;
      return url;
    }));

    actualizarVarianteActiva({ imagenes: [...varianteActiva.imagenes, ...nuevas] });
    setNombresArchivos((actual) => ({ ...actual, ...nombresNuevos }));

    const enMb = (bytes) => (bytes / (1024 * 1024)).toFixed(1);
    const resumen = `Imágenes optimizadas: ${enMb(pesoOriginal)} MB → ${enMb(pesoComprimido)} MB (demo)`;
    mostrarToast(algunaPesada ? `${resumen}. Alguna sigue pesando bastante — considera recortarla.` : resumen);
  }

  // Agrupa coloresDisponibles bajo su familia (Neutros, Rojos y vinos...)
  // en el orden de familiasColorMock — una familia sin ningún color
  // asignado todavía no se muestra (no hay nada que pintar en ella).
  // `muestras` resuelve los 1-2 ids curados de familiasColorMock a su hex,
  // siempre contra coloresMock (no coloresDisponibles) — el par de
  // cuadraditos del grupo es fijo, no cambia si se añade un color nuevo.
  const gruposColores = useMemo(() => (
    familiasColorMock
      .map((f) => ({
        ...f,
        muestras: f.muestras.map((id) => coloresMock.find((c) => c.id === id)?.hex).filter(Boolean),
        colores: coloresDisponibles.filter((c) => c.familia === f.id),
      }))
      .filter((f) => f.colores.length > 0)
  ), [coloresDisponibles]);

  const campos = CAMPOS_TIPO[tipo];
  const idiomasCompletados = ['es', 'en'].filter((cod) => nombre[cod]?.trim() && descripcion[cod]?.trim());
  // Vincular a un look solo tiene sentido para las piezas vendibles
  // (Prêt-à-porter/Atelier) — Runway/Novia/Fiesta ya SON el lado
  // editorial, no un producto que se vincule a sí mismo.
  const esVendible = tipo === 'pret-a-porter' || tipo === 'atelier';

  // Numeración de secciones — Imágenes, Datos comunes y Prendas y SKU son
  // siempre 1, 2 y 3; el resto se calcula con un contador porque "Tipo de
  // producto" es opcional (ocultarSeccionTipo) y "Colores"/"Composición y
  // Cuidados" solo existen para los tipos que los usan (CAMPOS_TIPO) —
  // evita reescribir ternarios a mano en cada FormSeccion cuando cambia
  // qué va antes de qué. Colores y Estampados va antes que Tallas y Stock
  // (numeroColores se calcula antes que numeroTallas) a propósito.
  let contadorSeccion = 3;
  const numeroTipo = !ocultarSeccionTipo ? (contadorSeccion += 1) : null;
  const numeroEspecificos = (contadorSeccion += 1);
  const numeroColeccion = campos?.coleccion ? (contadorSeccion += 1) : null;
  const numeroColores = campos?.colores ? (contadorSeccion += 1) : null;
  const numeroTallas = campos?.tallas ? (contadorSeccion += 1) : null;
  const numeroComposicion = campos?.telas ? (contadorSeccion += 1) : null;
  const numeroCuidados = campos?.telas ? (contadorSeccion += 1) : null;
  const numeroVinculo = esVendible ? (contadorSeccion += 1) : null;
  const numeroResenas = esVendible ? (contadorSeccion += 1) : null;

  // Aplana categorias.archivo/novia/fiesta → una fila por look ya con
  // alguna imagen o prenda subida (los huecos "Look N" vacíos no aportan
  // nada que buscar). Es la lista que se filtra por nombre/SKU/colección
  // en la sección "Vincular a Runway/Novia/Fiesta".
  const looksBuscables = useMemo(() => {
    const lista = [];
    ['archivo', 'novia', 'fiesta'].forEach((tipoArchivo) => {
      (categorias[tipoArchivo] || []).forEach((cat) => {
        if (!cat.numeroLooks) return;
        for (let i = 0; i < cat.numeroLooks; i += 1) {
          const look = cat.looks?.[i];
          if (!look?.imagenes?.length && !look?.prendas?.length) continue;
          lista.push({
            tipo: tipoArchivo,
            categoriaId: cat.id,
            categoriaNombre: cat.nombre,
            lookIndice: i,
            lookNombre: look.nombre || `Look ${i + 1}`,
            imagen: look.imagenes?.[0],
            prendas: look.prendas || [],
          });
        }
      });
    });
    return lista;
  }, [categorias]);

  // Opciones del filtro "Colección" — solo las que existen dentro del tipo
  // ya elegido (filtroTipoLook), para no enseñar nombres de una colección
  // de Runway mientras se filtra por Novia. Cambiar de tipo resetea este
  // filtro (ver el onChange del select) en vez de dejar seleccionado un
  // nombre que ya no aplica.
  const coleccionesLookDisponibles = useMemo(() => {
    const relevantes = filtroTipoLook === 'todos'
      ? looksBuscables
      : looksBuscables.filter((l) => l.tipo === filtroTipoLook);
    return [...new Set(relevantes.map((l) => l.categoriaNombre))].sort((a, b) => a.localeCompare(b));
  }, [looksBuscables, filtroTipoLook]);

  const resultadosLook = useMemo(() => {
    const q = buscarLook.trim().toLowerCase();
    return looksBuscables
      .filter((l) => filtroTipoLook === 'todos' || l.tipo === filtroTipoLook)
      .filter((l) => filtroColeccionLook === 'todas' || l.categoriaNombre === filtroColeccionLook)
      .filter((l) => !q || l.categoriaNombre.toLowerCase().includes(q)
        || l.lookNombre.toLowerCase().includes(q)
        || l.prendas.some((p) => p.nombre?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)));
  }, [looksBuscables, buscarLook, filtroTipoLook, filtroColeccionLook]);

  function vincularLook(item) {
    setLookVinculado(item);
    setBuscarLook('');
  }

  // Excluye las ya vinculadas — no tiene sentido volver a enseñarlas en
  // los resultados de búsqueda.
  const resultadosResena = useMemo(() => {
    const q = buscarResena.trim().toLowerCase();
    const vinculadasIds = resenasVinculadas.map((r) => r.id);
    return resenasMock
      .filter((r) => !vinculadasIds.includes(r.id))
      .filter((r) => !q || r.nombreCliente.toLowerCase().includes(q) || r.texto.toLowerCase().includes(q));
  }, [buscarResena, resenasVinculadas]);

  function vincularResenaExistente(resena) {
    setResenasVinculadas((actual) => [...actual, resena]);
    setBuscarResena('');
    setModoResena(null);
  }

  function quitarResenaVinculada(id) {
    setResenasVinculadas((actual) => actual.filter((r) => r.id !== id));
  }

  async function agregarFotosResena(archivos) {
    const lista = Array.from(archivos || []);
    if (!lista.length) return;
    const nuevas = await Promise.all(lista.map(async (archivo) => {
      let blobFinal;
      try {
        blobFinal = await comprimirImagen(archivo);
      } catch {
        blobFinal = archivo;
      }
      return URL.createObjectURL(blobFinal);
    }));
    setFotosResenaNueva((actual) => [...actual, ...nuevas]);
  }

  function quitarFotoResenaNueva(src) {
    setFotosResenaNueva((actual) => actual.filter((s) => s !== src));
  }

  function anadirResenaNueva() {
    if (!nombreClienteResenaNueva.trim() || !textoResenaNueva.es.trim()) return;
    const nueva = {
      id: `res${Date.now()}`,
      nombreCliente: nombreClienteResenaNueva.trim(),
      texto: { es: textoResenaNueva.es.trim(), en: textoResenaNueva.en.trim() },
      fotos: fotosResenaNueva,
      estado: 'Oculta',
      productoId: productoExistente?.id,
    };
    setResenasVinculadas((actual) => [...actual, nueva]);
    setModoResena(null);
    setNombreClienteResenaNueva('');
    setTextoResenaNueva({ es: '', en: '' });
    setFotosResenaNueva([]);
  }

  function actualizarPrenda(indice, campo, valor) {
    setPrendas((actual) => actual.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p)));
  }

  function agregarPrenda() {
    setPrendas((actual) => [...actual, { nombre: '', sku: '' }]);
  }

  function quitarPrenda(indice) {
    setPrendas((actual) => (actual.length > 1 ? actual.filter((_, i) => i !== indice) : [{ nombre: '', sku: '' }]));
  }

  function anadirColorNuevo() {
    if (!nombreColorNuevoEs.trim() || !nombreColorNuevoEn.trim() || !familiaColorNueva) return;
    const nuevo = {
      id: `col${Date.now()}`,
      familia: familiaColorNueva,
      nombre: { es: nombreColorNuevoEs.trim(), en: nombreColorNuevoEn.trim() },
      hex: hexColorValido,
    };
    setColoresDisponibles((actual) => [...actual, nuevo]);
    actualizarVarianteActiva({ colorIds: [nuevo.id], estampadoId: null });
    setFamiliaColorActiva(familiaColorNueva);
    setModoAnadir(null);
    setNombreColorNuevoEs('');
    setNombreColorNuevoEn('');
    setHexColorNuevo('#000000');
  }

  async function agregarImagenEstampado(archivo) {
    if (!archivo) return;
    setSubiendoImagenEstampado(true);
    let blobFinal;
    try {
      blobFinal = await comprimirImagenTela(archivo);
    } catch {
      blobFinal = archivo;
    }
    setImagenEstampadoNueva(URL.createObjectURL(blobFinal));
    setSubiendoImagenEstampado(false);
  }

  function anadirEstampadoNuevo() {
    if (!nombreEstampadoNuevoEs.trim() || !nombreEstampadoNuevoEn.trim() || !imagenEstampadoNueva) return;
    const nuevo = {
      id: `est${Date.now()}`,
      nombre: { es: nombreEstampadoNuevoEs.trim(), en: nombreEstampadoNuevoEn.trim() },
      imagen: imagenEstampadoNueva,
    };
    setEstampadosDisponibles((actual) => [...actual, nuevo]);
    actualizarVarianteActiva({ estampadoId: nuevo.id, colorIds: [] });
    setModoAnadir(null);
    setNombreEstampadoNuevoEs('');
    setNombreEstampadoNuevoEn('');
    setImagenEstampadoNueva('');
  }

  function anadirCuidadoNuevo() {
    if (!nombreCuidadoNuevoEs.trim() || !nombreCuidadoNuevoEn.trim() || !categoriaCuidadoNueva) return;
    const nuevo = {
      id: `cui${Date.now()}`,
      categoria: categoriaCuidadoNueva,
      texto: { es: nombreCuidadoNuevoEs.trim(), en: nombreCuidadoNuevoEn.trim() },
    };
    setCuidadosDisponibles((actual) => [...actual, nuevo]);
    setCuidadoIds((actual) => [...actual, nuevo.id]);
    setNombreCuidadoNuevoEs('');
    setNombreCuidadoNuevoEn('');
  }

  function anadirColeccionNueva() {
    const anio = parseInt(anioColeccionNuevo, 10);
    if (!anio || anio < 2000 || anio > 2099) {
      mostrarToast('Introduce un año válido para la colección');
      return;
    }
    const valor = `${estacionColeccionNueva}${String(anio).slice(-2)}`;
    if (coleccionesDisponibles.some((c) => c.valor === valor)) {
      mostrarToast('Esa colección ya existe');
      return;
    }
    const etiquetaEstacion = estacionColeccionNueva === 'fw' ? 'Otoño-Invierno' : 'Primavera-Verano';
    const nueva = { valor, etiqueta: `${etiquetaEstacion} ${anio}` };
    setColeccionesDisponibles((actual) => [...actual, nueva]);
    setColeccion(valor);
    setAnioColeccionNuevo('');
  }

  function cambiarTipo(nuevoTipo) {
    if (productoExistente && tipo && nuevoTipo !== tipo) {
      const confirmado = window.confirm(
        'Cambiar el tipo de producto descarta los campos específicos del tipo actual (precio, tallas, colección...). ¿Quieres continuar?'
      );
      if (!confirmado) return;
    }
    setTipo(nuevoTipo);
    setCategoriaId('');
  }

  function alternarTalla(talla) {
    const actual = varianteActiva.tallas;
    actualizarVarianteActiva({
      tallas: actual.some((f) => f.talla === talla)
        ? actual.filter((f) => f.talla !== talla)
        : [...actual, { talla, stock: 0 }],
    });
  }

  function cambiarStockTalla(talla, stock) {
    actualizarVarianteActiva({
      tallas: varianteActiva.tallas.map((f) => (f.talla === talla ? { ...f, stock } : f)),
    });
  }

  const MENSAJE_GUARDADO = {
    Activo: (n) => (n > 1 ? `${n} variantes publicadas (demo)` : 'Producto publicado (demo)'),
    Programado: (n) => (n > 1
      ? `${n} variantes guardadas para publicar más tarde — no visibles en la web todavía (demo)`
      : 'Guardado para publicar más tarde — no visible en la web todavía (demo)'),
    Borrador: (n) => (n > 1 ? `${n} variantes guardadas como borrador (demo)` : 'Borrador guardado (demo)'),
  };

  function guardar(estadoFinal) {
    setEstado(estadoFinal);
    mostrarToast(MENSAJE_GUARDADO[estadoFinal](variantes.length));

    if (onGuardado) {
      // Campos compartidos por todas las variantes de color de este
      // producto — se rellenan una sola vez en el formulario, no por
      // variante (ver `variantes`/`camposApilados` de Colores más abajo).
      const camposComunes = {
        tipo,
        categoriaId,
        nombre: nombre.es,
        descripcionCorta: descripcion.es,
        ...(campos.precio && !campos.precio.consulta && { precio }),
        ...(campos.telas && {
          composicion: (composicion.es.trim() || composicion.en.trim()) ? composicion : undefined,
          disenadoEn: (disenadoEn.es.trim() || disenadoEn.en.trim()) ? disenadoEn : undefined,
          fabricadoEn: (fabricadoEn.es.trim() || fabricadoEn.en.trim()) ? fabricadoEn : undefined,
          tinturaEstampacion: (tinturaEstampacion.es.trim() || tinturaEstampacion.en.trim()) ? tinturaEstampacion : undefined,
          origenTejido: (origenTejido.es.trim() || origenTejido.en.trim()) ? origenTejido : undefined,
          cuidadoIds,
        }),
        ...(campos.coleccion && { coleccion }),
        prendas: prendas.filter((p) => p.nombre.trim() || p.sku.trim()),
        estado: estadoFinal,
        // Para poder guardar de verdad: familia (FK obligatoria) y, si se programa, la
        // fecha desde la que se publica.
        familiaId,
        // Los File de las fotos nuevas, indexados por su blob URL. Sin esto solo viajaban
        // blob URLs, que fuera de esta pestaña no significan nada y no se pueden subir.
        archivosPorUrl: archivosRef.current,
        publicadoEn: estadoFinal === 'Programado' && publicadoEn
          ? new Date(publicadoEn).toISOString()
          : undefined,
      };

      const idRaiz = semilla?.id || `p${Date.now()}`;

      // Una fila de productosMock por variante — la primera es la "raíz"
      // (se queda con el id/SKU del producto que se está editando, si lo
      // hay, y con lookVinculado/reseñas: son contenido editorial, no
      // tiene sentido duplicarlo en cada color); el resto son variantes
      // nuevas encadenadas a ella vía `varianteDeId`, mismo campo que ya
      // usa "Duplicar" en ListaProductos.jsx.
      const productos = variantes.map((v, indice) => {
        const esRaiz = indice === 0;
        const varianteDeId = esRaiz
          ? (productoBase?.id || productoExistente?.varianteDeId || undefined)
          : idRaiz;
        return {
          id: esRaiz ? idRaiz : `p${Date.now()}${indice}`,
          ...(varianteDeId && { varianteDeId }),
          ...camposComunes,
          imagen: v.imagenes[0] || '',
          imagenes: v.imagenes,
          ...(campos.tallas && { tallas: v.tallas }),
          ...(campos.colores && { colorIds: v.colorIds, estampadoId: v.estampadoId || undefined }),
          ...(esRaiz && esVendible && { lookVinculado: lookVinculado || undefined, resenas: resenasVinculadas }),
          sku: esRaiz ? (semilla?.sku || `FC-NEW-${Date.now().toString().slice(-4)}`) : `FC-NEW-${Date.now().toString().slice(-4)}${indice}`,
        };
      });

      // Editar sin tocar "Variante de color" sigue mandando un único objeto
      // (mismo contrato de siempre para guardarEdicion) — solo se manda el
      // array completo si, estando en edición, se han añadido variantes
      // nuevas además de la raíz.
      onGuardado(productoExistente && productos.length === 1 ? productos[0] : productos);
      return;
    }

    router.push(tipo ? rutaTipoProducto(tipo) : '/admin/productos');
  }

  // Pestaña por variante de color — solo al dar de alta un producto nuevo
  // de cero (permiteVariasVariantes). Vive UNA sola vez, pegada (sticky)
  // justo debajo de la cabecera del modal (ver .cabeceraFija más abajo),
  // no repetida dentro de Imágenes/Colores y Estampados/Tallas y Stock:
  // así el admin puede cambiar de variante sin tener que volver a subir
  // del todo, sea cual sea la sección por la que vaya scrolleando.
  const variantesTabsUI = permiteVariasVariantes && (
    <div className={styles.variantesTabs}>
      {variantes.map((v, indice) => {
        const colorDeVariante = coloresDisponibles.find((c) => v.colorIds.includes(c.id));
        const estampadoDeVariante = estampadosDisponibles.find((e) => e.id === v.estampadoId);
        const etiqueta = colorDeVariante?.nombre?.es || estampadoDeVariante?.nombre?.es || `Variante ${indice + 1}`;
        const activa = indice === varianteActivaIndice;
        return (
          <div key={v.id} className={styles.varianteTabWrap}>
            <button
              type="button"
              className={`${styles.varianteTab} ${activa ? styles.varianteTabActiva : ''}`}
              onClick={() => setVarianteActivaIndice(indice)}
            >
              {colorDeVariante && <span className={styles.varianteTabMuestra} style={{ background: colorDeVariante.hex }} />}
              {etiqueta}
            </button>
            {variantes.length > 1 && (
              <button
                type="button"
                className={`${styles.varianteTabQuitar} ${activa ? styles.varianteTabQuitarActiva : ''}`}
                aria-label={`Quitar ${etiqueta}`}
                onClick={() => quitarVariante(indice)}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
      <Boton variante="contorno" tamano="s" className={styles.varianteAnadirBoton} onClick={anadirVariante}>
        <Plus size={14} />
        Variante de color
      </Boton>
    </div>
  );

  return (
    <div>
      <div className={styles.cabeceraFija}>
        <PageHeader
          titulo={productoExistente
            ? `Editar: ${productoExistente.nombre}`
            : productoBase ? `Nueva variante: ${productoBase.nombre}` : 'Nuevo producto'}
          subtitulo={productoExistente
            ? `SKU ${productoExistente.sku}`
            : productoBase ? 'Mismos datos que el original — cambia el color, sube las fotos y asigna un SKU nuevo.' : 'Completa los pasos en orden'}
        />
        {variantesTabsUI}
      </div>

      <FormSeccion
        numero={1}
        titulo="Imágenes"
        descripcion={permiteVariasVariantes
          ? 'Mínimo 1 por variante, recomendado 3-6 — arrastra para reordenar.'
          : 'Mínimo 1, recomendado 3-6 — arrastra para reordenar.'}
        accion={varianteActiva.imagenes.length > 0 && (
          <Boton variante="solido" onClick={() => inputArchivoRef.current?.click()}>
            <Upload size={14} />
            Subir otra imagen
          </Boton>
        )}
      >
        <div className={styles.galeria}>
          <div className={styles.subirCaja}>
            {varianteActiva.imagenes.length === 0 ? (
              <button type="button" className={styles.subirVacio} onClick={() => inputArchivoRef.current?.click()}>
                <Upload size={22} strokeWidth={1} className={styles.subirIcono} aria-hidden="true" />
                <span>Añadir imagen</span>
              </button>
            ) : (
              <div className={styles.imagenesScroll}>
                <DragList
                  items={varianteActiva.imagenes.map((src) => ({ src, nombreArchivo: nombresArchivos[src] }))}
                  claveItem={(item) => item.src}
                  onReorder={(nuevo) => actualizarVarianteActiva({ imagenes: nuevo.map((i) => i.src) })}
                  orientacion="horizontal"
                  renderItem={(item, indice) => (
                    <div className={styles.imagenItem}>
                      <img src={item.src} alt="" title={item.nombreArchivo} className={styles.imagenMiniatura} />
                      {indice === 0 && <span className={styles.imagenEtiqueta}>Portada</span>}
                      {indice === 1 && <span className={styles.imagenEtiqueta}>Contra portada</span>}
                      <button
                        type="button"
                        className={styles.imagenQuitar}
                        aria-label="Quitar imagen"
                        onClick={() => actualizarVarianteActiva({ imagenes: varianteActiva.imagenes.filter((s) => s !== item.src) })}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
          <p className={styles.subirHint}>
            Se optimizan automáticamente al subirlas. Recomendado: menos de 500 KB, formato WebP/JPEG.
          </p>
          <input
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            multiple
            className={styles.inputArchivo}
            onChange={(e) => {
              agregarImagenes(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </FormSeccion>

      <FormSeccion numero={2} titulo="Datos comunes" descripcion="Nombre y descripción necesitan versión en los dos idiomas del sitio.">
        <div className={styles.campoAncho}>
          <SelectorIdioma idioma={idioma} onChange={setIdioma} completados={idiomasCompletados} />
        </div>
        <Input
          etiqueta={`Nombre (${idioma.toUpperCase()})`}
          valor={nombre[idioma]}
          onChange={(e) => setNombre({ ...nombre, [idioma]: e.target.value })}
        />
        <div className={styles.campoAncho}>
          <span className={styles.etiquetaCampo}>{`Descripción corta (${idioma.toUpperCase()})`}</span>
          <textarea
            className={styles.textarea}
            value={descripcion[idioma]}
            onChange={(e) => setDescripcion({ ...descripcion, [idioma]: e.target.value })}
          />
        </div>
      </FormSeccion>

      <FormSeccion numero={3} titulo="Prendas y SKU" descripcion="Cada pieza del producto con su código de inventario — útil si es un conjunto de varias piezas.">
        <div className={styles.campoAncho}>
          <div className={styles.prendasLista}>
            {prendas.map((prenda, indice) => (
              // eslint-disable-next-line react/no-array-index-key -- filas sin id propio, reordenar no está soportado
              <div key={indice} className={styles.prendaFila}>
                <Input
                  etiqueta="Prenda"
                  valor={prenda.nombre}
                  onChange={(e) => actualizarPrenda(indice, 'nombre', e.target.value)}
                  placeholder="Pantalón"
                />
                <Input
                  etiqueta="SKU"
                  valor={prenda.sku}
                  onChange={(e) => actualizarPrenda(indice, 'sku', e.target.value)}
                  placeholder="MBO2724"
                />
                <button
                  type="button"
                  className={styles.prendaQuitar}
                  aria-label={`Quitar ${prenda.nombre || 'prenda'}`}
                  onClick={() => quitarPrenda(indice)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <Boton variante="contorno" tamano="s" onClick={agregarPrenda}>
            <Plus size={14} />
            Añadir prenda
          </Boton>
        </div>
      </FormSeccion>

      {!ocultarSeccionTipo && (
        <FormSeccion numero={numeroTipo} titulo="Tipo de producto" descripcion="Determina qué campos y categorías aplican — no se puede cambiar sin confirmación una vez creado.">
          <div className={styles.tipoGrid}>
            {tiposProducto.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                className={`${styles.tipoOpcion} ${tipo === opcion.valor ? styles.tipoOpcionActiva : ''}`}
                onClick={() => cambiarTipo(opcion.valor)}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        </FormSeccion>
      )}

      {tipo && (
        <>
          <FormSeccion numero={numeroEspecificos} titulo="Precio de compra" descripcion={`Solo lo relevante para ${tiposProducto.find((t) => t.valor === tipo).etiqueta}.`}>
            {/* Familia: FK obligatoria del modelo (`Product.family`). No existía en el
                formulario porque el mock no tenía familias — sin ella el alta da 400. */}
            <label className={styles.campoAncho}>
              <span className={styles.etiquetaCampo}>Familia de producto *</span>
              <select
                className={styles.selectInput}
                value={familiaId}
                onChange={(e) => setFamiliaId(e.target.value)}
                disabled={cargandoFamilias}
              >
                <option value="">{cargandoFamilias ? 'Cargando…' : 'Selecciona una familia'}</option>
                {familias.map((f) => (
                  <option key={f.id} value={f.id}>{f.code} · {f.nombre}</option>
                ))}
              </select>
            </label>

            {/* Solo cuando se programa: el backend exige fecha futura. */}
            {estado === 'Programado' && (
              <label className={styles.campoAncho}>
                <span className={styles.etiquetaCampo}>Publicar a partir de *</span>
                <input
                  type="datetime-local"
                  className={styles.selectInput}
                  value={publicadoEn}
                  onChange={(e) => setPublicadoEn(e.target.value)}
                />
              </label>
            )}

            {campos.precio && (campos.precio.consulta ? (
              <p className={styles.precioConsulta}>Precios a consultar</p>
            ) : (
              <Input
                etiqueta={`Precio${campos.precio.requerido ? '' : ' (opcional)'}`}
                placeholder={campos.precio.placeholder}
                valor={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            ))}
          </FormSeccion>

          {campos.coleccion && (
            <FormSeccion numero={numeroColeccion} titulo="Colección" descripcion={`Colección/temporada del producto${campos.coleccion.requerido ? '' : ' (opcional)'} — a la que pertenece hoy.`}>
              <label className={styles.campoAncho}>
                <span className={styles.etiquetaCampo}>Colección actual</span>
                <select className={styles.selectInput} value={coleccion} onChange={(e) => setColeccion(e.target.value)}>
                  <option value="">Selecciona una colección</option>
                  {coleccionesDisponibles.map((c) => (
                    <option key={c.valor} value={c.valor}>{c.etiqueta}</option>
                  ))}
                </select>
              </label>

              <div className={styles.campoAncho}>
                <span className={styles.etiquetaCampo}>Añadir una colección nueva</span>
                <div className={styles.anadirFila}>
                  <label>
                    <span className={styles.etiquetaCampo}>Temporada</span>
                    <select className={styles.selectInput} value={estacionColeccionNueva} onChange={(e) => setEstacionColeccionNueva(e.target.value)}>
                      <option value="fw">Otoño-Invierno</option>
                      <option value="ss">Primavera-Verano</option>
                    </select>
                  </label>
                  <Input etiqueta="Año" tipo="number" valor={anioColeccionNuevo} onChange={(e) => setAnioColeccionNuevo(e.target.value)} placeholder="2027" />
                </div>
                {/* Botón subordinado, debajo de los campos en vez de metido en la
                    misma fila — nunca desactivado (la validación del año avisa
                    con un toast en vez de deshabilitar el botón). */}
                <Boton variante="contorno" tamano="s" className={styles.accionAnadirColeccion} onClick={anadirColeccionNueva}>
                  <Plus size={14} />
                  Añadir colección
                </Boton>
              </div>
            </FormSeccion>
          )}

          {campos.colores && (
            <FormSeccion
              numero={numeroColores}
              titulo="Colores y Estampados"
              descripcion={`Selecciona un color o estampado para tu producto${campos.colores === 'opcional' ? ' (opcional)' : ''}.`}
            >
              <div className={styles.campoAncho}>
                <div className={styles.familiasBloque}>
                  <span className={styles.etiquetaCampo}>COLORES</span>
                  <div className={styles.familiasGrid}>
                    {gruposColores.map((grupo) => {
                      const seleccionados = grupo.colores.filter((c) => varianteActiva.colorIds.includes(c.id)).length;
                      const activa = familiaColorActiva === grupo.id;
                      return (
                        <button
                          key={grupo.id}
                          type="button"
                          className={`${styles.familiaChip} ${(activa || seleccionados > 0) ? styles.familiaChipActiva : ''}`}
                          onClick={() => setFamiliaColorActiva(activa ? null : grupo.id)}
                        >
                          <span className={styles.familiaMuestras}>
                            {grupo.muestras.map((hex) => (
                              <span key={hex} className={styles.familiaMuestra} style={{ background: hex }} />
                            ))}
                          </span>
                          {grupo.etiqueta}
                          {seleccionados > 0 && <span className={styles.familiaBadge}>{seleccionados}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {familiaColorActiva && (
                  <div className={styles.coloresPanel}>
                    <span className={styles.etiquetaCampo}>Selecciona un color</span>
                    <div className={styles.coloresGrid}>
                      {gruposColores.find((g) => g.id === familiaColorActiva)?.colores.map((c) => {
                        const activo = varianteActiva.colorIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            className={`${styles.colorChip} ${activo ? styles.colorChipActivo : ''}`}
                            onClick={() => {
                              if (activo) {
                                actualizarVarianteActiva({ colorIds: [] });
                              } else {
                                actualizarVarianteActiva({ colorIds: [c.id], estampadoId: null });
                                setModoAnadir(null);
                              }
                            }}
                          >
                            <span className={styles.colorPunto} style={{ background: c.hex }} />
                            <span className={styles.colorChipTexto}>
                              <span className={styles.colorChipNombre}>{c.nombre.es}</span>
                              <span className={styles.colorChipTraduccion}>{c.nombre.en}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {estampadosDisponibles.length > 0 && (
                  <div className={styles.familiasBloque}>
                    <span className={styles.etiquetaCampo}>ESTAMPADOS</span>
                    <div className={styles.estampadosGrid}>
                      {estampadosDisponibles.map((p) => {
                        const activo = varianteActiva.estampadoId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            className={`${styles.estampadoChip} ${activo ? styles.estampadoChipActivo : ''}`}
                            onClick={() => {
                              if (activo) {
                                actualizarVarianteActiva({ estampadoId: null });
                              } else {
                                actualizarVarianteActiva({ estampadoId: p.id, colorIds: [] });
                                setModoAnadir(null);
                              }
                            }}
                          >
                            <img src={p.imagen} alt="" className={styles.estampadoChipImagen} />
                            <span className={styles.colorChipTexto}>
                              <span className={styles.colorChipNombre}>{p.nombre.es}</span>
                              <span className={styles.colorChipTraduccion}>{p.nombre.en}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={styles.modoAnadirGrupo}>
                  <Boton
                    variante="contorno"
                    tamano="s"
                    className={modoAnadir === 'color' ? styles.modoAnadirBotonActivo : ''}
                    onClick={() => setModoAnadir(modoAnadir === 'color' ? null : 'color')}
                  >
                    <Plus size={14} />
                    Añadir color
                  </Boton>
                  <Boton
                    variante="contorno"
                    tamano="s"
                    className={modoAnadir === 'estampado' ? styles.modoAnadirBotonActivo : ''}
                    onClick={() => setModoAnadir(modoAnadir === 'estampado' ? null : 'estampado')}
                  >
                    <Plus size={14} />
                    Añadir estampado
                  </Boton>
                </div>

                {modoAnadir === 'color' && (
                  <div className={styles.anadirFila}>
                    <label className={styles.campoColor}>
                      <span className={styles.etiquetaCampo}>Selector</span>
                      <input type="color" value={hexColorValido} onChange={(e) => setHexColorNuevo(e.target.value)} className={styles.inputColor} aria-label="Elegir color" />
                    </label>
                    {/* HEX como campo editable junto al swatch — el swatch da el atajo
                        visual rápido, el texto permite pegar/escribir un código exacto;
                        ambos sincronizados con el mismo estado. */}
                    <Input etiqueta="HEX" valor={hexColorNuevo} onChange={(e) => setHexColorNuevo(e.target.value)} placeholder="#6E2635" />
                    <Input etiqueta="Nombre (ES)" valor={nombreColorNuevoEs} onChange={(e) => setNombreColorNuevoEs(e.target.value)} placeholder="Burdeos" />
                    <Input etiqueta="Name (EN)" valor={nombreColorNuevoEn} onChange={(e) => setNombreColorNuevoEn(e.target.value)} placeholder="Bordeaux" />
                    <label>
                      <span className={styles.etiquetaCampo}>Grupo</span>
                      <select className={styles.selectInput} value={familiaColorNueva} onChange={(e) => setFamiliaColorNueva(e.target.value)}>
                        {familiasColorMock.map((f) => (
                          <option key={f.id} value={f.id}>{f.etiqueta}</option>
                        ))}
                      </select>
                    </label>
                    <Boton
                      variante="contorno"
                      tamano="s"
                      onClick={anadirColorNuevo}
                      desactivado={!nombreColorNuevoEs.trim() || !nombreColorNuevoEn.trim()}
                    >
                      Guardar color
                    </Boton>
                  </div>
                )}

                {modoAnadir === 'estampado' && (
                  <div className={styles.anadirFila}>
                    <div className={styles.campoColor}>
                      <span className={styles.etiquetaCampo}>Imagen</span>
                      <button
                        type="button"
                        className={`${styles.inputColor} ${styles.inputImagenTela}`}
                        onClick={() => inputImagenEstampadoRef.current?.click()}
                        aria-label="Subir foto del estampado"
                      >
                        {imagenEstampadoNueva ? (
                          <img src={imagenEstampadoNueva} alt="" className={styles.inputImagenTelaPreview} />
                        ) : (
                          <Upload size={16} strokeWidth={1} aria-hidden="true" />
                        )}
                      </button>
                      <input
                        ref={inputImagenEstampadoRef}
                        type="file"
                        accept="image/*"
                        className={styles.inputArchivo}
                        onChange={(e) => {
                          agregarImagenEstampado(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </div>
                    <Input etiqueta="Nombre (ES)" valor={nombreEstampadoNuevoEs} onChange={(e) => setNombreEstampadoNuevoEs(e.target.value)} placeholder="Flores" />
                    <Input etiqueta="Name (EN)" valor={nombreEstampadoNuevoEn} onChange={(e) => setNombreEstampadoNuevoEn(e.target.value)} placeholder="Floral" />
                    <Boton
                      variante="contorno"
                      tamano="s"
                      onClick={anadirEstampadoNuevo}
                      desactivado={!nombreEstampadoNuevoEs.trim() || !nombreEstampadoNuevoEn.trim() || !imagenEstampadoNueva || subiendoImagenEstampado}
                    >
                      {subiendoImagenEstampado ? 'Optimizando…' : 'Guardar estampado'}
                    </Boton>
                  </div>
                )}
              </div>
            </FormSeccion>
          )}

          {campos.tallas && (
            <FormSeccion numero={numeroTallas} titulo="Tallas y Stock" descripcion="Tallas disponibles y stock por talla.">
              <div className={styles.campoAncho}>
                <span className={styles.etiquetaCampo}>Toca una talla para activarla</span>
                <div className={styles.tallasGrid}>
                  {tallasEstandar.map((t) => {
                    const fila = varianteActiva.tallas.find((f) => f.talla === t);
                    const activa = Boolean(fila);
                    return (
                      <div key={t} className={`${styles.tallaBox} ${activa ? styles.tallaBoxActiva : ''}`}>
                        <button type="button" className={styles.tallaBoton} onClick={() => alternarTalla(t)}>
                          {t}
                        </button>
                        {activa && (
                          <input
                            type="number"
                            min={0}
                            className={styles.tallaStock}
                            value={fila.stock}
                            onChange={(e) => cambiarStockTalla(t, Number(e.target.value))}
                            aria-label={`Stock talla ${t}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </FormSeccion>
          )}

          {campos.telas && (
            <FormSeccion
              numero={numeroComposicion}
              titulo="Composición y Origen"
              descripcion={`Tejido y procedencia del producto${campos.telas === 'opcional' ? ' (opcional)' : ''}.`}
            >
              <div className={styles.campoAncho}>
                <SelectorIdioma idioma={idiomaComposicion} onChange={setIdiomaComposicion} />
              </div>
              <div className={styles.campoAncho}>
                <div className={styles.camposApilados}>
                  <div className={styles.campoAncho}>
                    <span className={styles.etiquetaCampo}>{`Composición (${idiomaComposicion.toUpperCase()})`}</span>
                    <textarea
                      className={styles.textarea}
                      value={composicion[idiomaComposicion]}
                      onChange={(e) => setComposicion({ ...composicion, [idiomaComposicion]: e.target.value })}
                      placeholder={idiomaComposicion === 'en' ? '70% cotton, 30% polyester' : '70% algodón, 30% poliéster'}
                    />
                  </div>
                  <Input
                    etiqueta={`Diseñado en (${idiomaComposicion.toUpperCase()})`}
                    valor={disenadoEn[idiomaComposicion]}
                    onChange={(e) => setDisenadoEn({ ...disenadoEn, [idiomaComposicion]: e.target.value })}
                    placeholder={idiomaComposicion === 'en' ? 'Spain' : 'España'}
                  />
                  <Input
                    etiqueta={`Fabricado en (${idiomaComposicion.toUpperCase()})`}
                    valor={fabricadoEn[idiomaComposicion]}
                    onChange={(e) => setFabricadoEn({ ...fabricadoEn, [idiomaComposicion]: e.target.value })}
                    placeholder="Portugal"
                  />
                  <Input
                    etiqueta={`Tintura y estampación (${idiomaComposicion.toUpperCase()})`}
                    valor={tinturaEstampacion[idiomaComposicion]}
                    onChange={(e) => setTinturaEstampacion({ ...tinturaEstampacion, [idiomaComposicion]: e.target.value })}
                    placeholder={idiomaComposicion === 'en' ? 'Italy' : 'Italia'}
                  />
                  <Input
                    etiqueta={`Origen tejido (${idiomaComposicion.toUpperCase()})`}
                    valor={origenTejido[idiomaComposicion]}
                    onChange={(e) => setOrigenTejido({ ...origenTejido, [idiomaComposicion]: e.target.value })}
                    placeholder="India"
                  />
                </div>
              </div>
            </FormSeccion>
          )}

          {campos.telas && (
            <FormSeccion
              numero={numeroCuidados}
              titulo="Cuidados"
              descripcion={`Instrucciones de conservación del producto${campos.telas === 'opcional' ? ' (opcional)' : ''}.`}
            >
              <div className={styles.campoAncho}>
                <div className={styles.cuidadosLista}>
                  {categoriasCuidadoMock.map((cat) => {
                    const items = cuidadosDisponibles.filter((c) => c.categoria === cat.id);
                    if (!items.length) return null;
                    return (
                      <div key={cat.id} className={styles.cuidadoCategoria}>
                        <span className={styles.cuidadoCategoriaTitulo}>{cat.etiqueta.es}</span>
                        <div className={styles.telasGrid}>
                          {items.map((c) => {
                            const activo = cuidadoIds.includes(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                className={`${styles.telaChip} ${activo ? styles.telaChipActivo : ''}`}
                                onClick={() => setCuidadoIds(activo ? cuidadoIds.filter((id) => id !== c.id) : [...cuidadoIds, c.id])}
                              >
                                <span className={styles.telaChipTexto}>
                                  <span className={styles.telaChipNombre}>{c.texto.es}</span>
                                  <span className={styles.telaChipComposicion}>{c.texto.en}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.anadirFila}>
                  <Input etiqueta="Nueva instrucción (ES)" valor={nombreCuidadoNuevoEs} onChange={(e) => setNombreCuidadoNuevoEs(e.target.value)} placeholder="Secar a la sombra" />
                  <Input etiqueta="New instruction (EN)" valor={nombreCuidadoNuevoEn} onChange={(e) => setNombreCuidadoNuevoEn(e.target.value)} placeholder="Dry in shade" />
                  <label>
                    <span className={styles.etiquetaCampo}>Categoría</span>
                    <select className={styles.selectInput} value={categoriaCuidadoNueva} onChange={(e) => setCategoriaCuidadoNueva(e.target.value)}>
                      {categoriasCuidadoMock.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.etiqueta.es}</option>
                      ))}
                    </select>
                  </label>
                  <Boton
                    variante="contorno"
                    tamano="s"
                    onClick={anadirCuidadoNuevo}
                    desactivado={!nombreCuidadoNuevoEs.trim() || !nombreCuidadoNuevoEn.trim()}
                  >
                    <Plus size={14} />
                    Añadir cuidado
                  </Boton>
                </div>
              </div>
            </FormSeccion>
          )}

          {esVendible && (
            <FormSeccion numero={numeroVinculo} titulo="Vincular a Runway / Novia / Fiesta" descripcion="Conecta esta pieza con el look de pasarela en el que aparece — así la clienta puede comprarla desde el archivo editorial.">
              <div className={styles.campoAncho}>
                {lookVinculado ? (
                  <div className={styles.vinculoActual}>
                    {lookVinculado.imagen ? (
                      <img src={lookVinculado.imagen} alt="" className={styles.vinculoActualImagen} />
                    ) : <span className={styles.vinculoActualImagen} />}
                    <div className={styles.vinculoActualTexto}>
                      <span className={styles.vinculoActualNombre}>{lookVinculado.lookNombre}</span>
                      <span className={styles.vinculoActualSub}>{lookVinculado.categoriaNombre}</span>
                    </div>
                    <Boton variante="contorno-rosa" tamano="s" onClick={() => setLookVinculado(null)}>
                      <X size={14} />
                      Quitar vínculo
                    </Boton>
                  </div>
                ) : (
                  <p className={styles.vinculoVacio}>Sin vincular todavía — busca por nombre de colección, look o SKU de una prenda.</p>
                )}

                <div className={styles.anadirFila}>
                  <label>
                    <span className={styles.etiquetaCampo}>Tipo</span>
                    <select
                      className={styles.selectInput}
                      value={filtroTipoLook}
                      onChange={(e) => {
                        setFiltroTipoLook(e.target.value);
                        setFiltroColeccionLook('todas');
                      }}
                    >
                      {OPCIONES_TIPO_LOOK.map((opcion) => (
                        <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className={styles.etiquetaCampo}>Colección</span>
                    <select
                      className={styles.selectInput}
                      value={filtroColeccionLook}
                      onChange={(e) => setFiltroColeccionLook(e.target.value)}
                    >
                      <option value="todas">Todas</option>
                      {coleccionesLookDisponibles.map((nombre) => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.vinculoBuscador}>
                  <Search size={16} className={styles.vinculoBuscadorIcono} aria-hidden="true" />
                  <input
                    type="text"
                    className={styles.vinculoBuscadorInput}
                    placeholder="Buscar por colección, look o SKU…"
                    value={buscarLook}
                    onChange={(e) => setBuscarLook(e.target.value)}
                  />
                </div>

                <div className={styles.vinculoLista}>
                  {resultadosLook.length === 0 ? (
                    <p className={styles.vinculoVacio}>Sin resultados.</p>
                  ) : resultadosLook.map((item) => {
                    const activo = lookVinculado?.tipo === item.tipo
                      && lookVinculado?.categoriaId === item.categoriaId
                      && lookVinculado?.lookIndice === item.lookIndice;
                    return (
                      <button
                        key={`${item.tipo}-${item.categoriaId}-${item.lookIndice}`}
                        type="button"
                        className={`${styles.vinculoFila} ${activo ? styles.vinculoFilaActiva : ''}`}
                        onClick={() => vincularLook(item)}
                      >
                        {item.imagen ? (
                          <img src={item.imagen} alt="" className={styles.vinculoFilaImagen} />
                        ) : <span className={styles.vinculoFilaImagen} />}
                        <span className={styles.vinculoFilaTexto}>
                          <span className={styles.vinculoFilaNombre}>{item.lookNombre}</span>
                          <span className={styles.vinculoFilaSub}>{item.categoriaNombre}</span>
                        </span>
                        {activo && <Link2 size={14} className={styles.vinculoFilaCheck} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </FormSeccion>
          )}

          {esVendible && (
            <FormSeccion
              numero={numeroResenas}
              titulo="Reseñas de Clientas"
              descripcion="Vincula una reseña ya creada en Reseñas o sube una nueva directamente aquí."
            >
              <div className={styles.campoAncho}>
                {resenasVinculadas.length === 0 ? (
                  <p className={styles.vinculoVacio}>Sin reseñas vinculadas todavía.</p>
                ) : (
                  <div className={styles.resenasLista}>
                    {resenasVinculadas.map((r) => (
                      <div key={r.id} className={styles.resenaTarjeta}>
                        <div className={styles.resenaTarjetaCabecera}>
                          <span className={styles.resenaTarjetaNombre}>{r.nombreCliente}</span>
                          <button
                            type="button"
                            className={styles.prendaQuitar}
                            aria-label={`Quitar reseña de ${r.nombreCliente}`}
                            onClick={() => quitarResenaVinculada(r.id)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {/* r.texto es string en reseñas ya vinculadas desde /admin/resenas
                            (sin traducción todavía) y {es, en} en las nuevas creadas aquí
                            mismo — se enseña el texto en español en ambos casos. */}
                        <p className={styles.resenaTarjetaTexto}>{typeof r.texto === 'string' ? r.texto : r.texto.es}</p>
                        {(r.fotos?.length > 0 || r.foto) && (
                          <div className={styles.resenaTarjetaFotos}>
                            {(r.fotos || [r.foto]).map((src) => (
                              <img key={src} src={src} alt="" className={styles.resenaTarjetaFoto} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.modoAnadirGrupo}>
                  <Boton
                    variante="contorno"
                    tamano="s"
                    className={modoResena === 'vincular' ? styles.modoAnadirBotonActivo : ''}
                    onClick={() => setModoResena(modoResena === 'vincular' ? null : 'vincular')}
                  >
                    <Link2 size={14} />
                    Vincular reseña
                  </Boton>
                  <Boton
                    variante="contorno"
                    tamano="s"
                    className={modoResena === 'nueva' ? styles.modoAnadirBotonActivo : ''}
                    onClick={() => setModoResena(modoResena === 'nueva' ? null : 'nueva')}
                  >
                    <Plus size={14} />
                    Nueva reseña
                  </Boton>
                </div>

                {modoResena === 'vincular' && (
                  <div className={styles.campoAncho}>
                    <div className={styles.vinculoBuscador}>
                      <Search size={16} className={styles.vinculoBuscadorIcono} aria-hidden="true" />
                      <input
                        type="text"
                        className={styles.vinculoBuscadorInput}
                        placeholder="Buscar por nombre de la clienta o texto…"
                        value={buscarResena}
                        onChange={(e) => setBuscarResena(e.target.value)}
                      />
                    </div>
                    <div className={styles.vinculoLista}>
                      {resultadosResena.length === 0 ? (
                        <p className={styles.vinculoVacio}>Sin resultados.</p>
                      ) : resultadosResena.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className={styles.vinculoFila}
                          onClick={() => vincularResenaExistente(r)}
                        >
                          {r.foto ? (
                            <img src={r.foto} alt="" className={styles.vinculoFilaImagen} />
                          ) : <span className={styles.vinculoFilaImagen} />}
                          <span className={styles.vinculoFilaTexto}>
                            <span className={styles.vinculoFilaNombre}>{r.nombreCliente}</span>
                            <span className={styles.vinculoFilaSub}>{r.texto}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {modoResena === 'nueva' && (
                  <div className={styles.resenaNuevaForm}>
                    <div className={styles.campoAncho}>
                      <span className={styles.etiquetaCampo}>Nombre de la clienta</span>
                      <input
                        type="text"
                        className={styles.inputTexto}
                        value={nombreClienteResenaNueva}
                        onChange={(e) => setNombreClienteResenaNueva(e.target.value)}
                        placeholder="Marta Ibáñez"
                      />
                    </div>
                    <div className={styles.campoAncho}>
                      <SelectorIdioma idioma={idiomaResenaNueva} onChange={setIdiomaResenaNueva} />
                    </div>
                    <div className={styles.campoAncho}>
                      <span className={styles.etiquetaCampo}>{`Texto de la reseña (${idiomaResenaNueva.toUpperCase()})`}</span>
                      <textarea
                        className={styles.textarea}
                        value={textoResenaNueva[idiomaResenaNueva]}
                        onChange={(e) => setTextoResenaNueva({ ...textoResenaNueva, [idiomaResenaNueva]: e.target.value })}
                      />
                    </div>
                    <div className={styles.campoAncho}>
                      <span className={styles.etiquetaCampo}>Fotos (opcional)</span>
                      {/* Mismo patrón de arrastrar-para-reordenar que Imágenes (ver
                          .imagenesScroll más arriba) — la portada de la reseña es
                          la primera foto de fotosResenaNueva. */}
                      <div className={styles.imagenesScroll}>
                        {fotosResenaNueva.length > 0 && (
                          <DragList
                            items={fotosResenaNueva.map((src) => ({ src }))}
                            claveItem={(item) => item.src}
                            onReorder={(nuevo) => setFotosResenaNueva(nuevo.map((item) => item.src))}
                            orientacion="horizontal"
                            renderItem={(item) => (
                              <div className={styles.imagenItem}>
                                <img src={item.src} alt="" className={styles.imagenMiniatura} />
                                <button
                                  type="button"
                                  className={styles.imagenQuitar}
                                  aria-label="Quitar foto"
                                  onClick={() => quitarFotoResenaNueva(item.src)}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          />
                        )}
                        <button
                          type="button"
                          className={styles.resenaFotoAnadir}
                          onClick={() => inputFotosResenaRef.current?.click()}
                        >
                          <Upload size={18} strokeWidth={1} aria-hidden="true" />
                          <span>Añadir foto</span>
                        </button>
                      </div>
                      <input
                        ref={inputFotosResenaRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className={styles.inputArchivo}
                        onChange={(e) => {
                          agregarFotosResena(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </div>
                    <Boton
                      variante="contorno"
                      tamano="s"
                      onClick={anadirResenaNueva}
                      desactivado={!nombreClienteResenaNueva.trim() || !textoResenaNueva.es.trim()}
                    >
                      <Plus size={14} />
                      Añadir reseña
                    </Boton>
                  </div>
                )}
              </div>
            </FormSeccion>
          )}

          <div className={styles.acciones}>
            <Boton variante="contorno" className={styles.accionBorrador} onClick={() => guardar('Borrador')}>Guardar borrador</Boton>
            <Boton variante="contorno" className={styles.accionProgramado} onClick={() => guardar('Programado')}>Publicar más tarde</Boton>
            <Boton variante="solido" onClick={() => guardar('Activo')}>Publicar producto</Boton>
          </div>
        </>
      )}
    </div>
  );
}

export default FormularioProducto;
export { comprimirImagen };
