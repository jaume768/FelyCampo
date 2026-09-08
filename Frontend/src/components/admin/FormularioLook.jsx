'use client';

/* ============================================================
   FORMULARIO DE LOOK — Fely Campo (admin)
   Alta/edición de un look dentro de una colección con `numeroLooks`
   (Runway/Novia/Fiesta, ver ListaProductos.jsx "Vista de looks"). Mismo
   espíritu que FormularioColeccion: placeholder de diseño, no lógica
   real — un look no es un producto de `productosMock`, vive solo dentro
   de `categoriasMock[tipo][].looks` (array disperso, un hueco por look
   sin editar todavía). Reutiliza comprimirImagen() de
   FormularioProducto.jsx, igual que FormularioColeccion.

   6 secciones: Imágenes / Prendas y SKU / Datos comunes con ES-EN /
   Colores / Tejidos y Composición / Productos vinculados, tratando el
   look como un mini-producto: Nombre/Descripción con SelectorIdioma
   (mismo límite conocido que FormularioProducto — solo se guarda `.es`,
   ver docs/adminpanel.md sección 5), Colores/Telas del mismo look con
   los mismos selectores de chip que un producto, cada uno en su propia
   sección (no combinados en un "Campos específicos" único) para que
   añadir un color/tela nuevo desde aquí sea fácil de encontrar (sin
   precio/tallas/stock: un look no es inventario vendible en sí — las
   prendas que lo componen sí llevan SKU, ver sección "Prendas y SKU").
   "Productos vinculados" conecta este look editorial con las piezas
   reales vendibles de Prêt-à-porter/Atelier (búsqueda por nombre/SKU
   sobre productosMock, selección múltiple — un look suele ser varias
   piezas puestas a la vez) — mismo concepto, en sentido inverso y
   1-a-1, que "Vincular a Runway / Novia / Fiesta" en
   FormularioProducto.jsx.
   ============================================================ */

import { useMemo, useRef, useState } from 'react';
import {
  Link2, Plus, Search, Upload, X,
} from 'lucide-react';
import { PageHeader, FormSeccion, SelectorIdioma } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import {
  coloresMock, familiasColorMock, telasMock, productosMock,
} from '@/components/admin/mockData';
import { comprimirImagen } from './FormularioProducto';
import styles from './FormularioLook.module.css';

// Solo Prêt-à-porter/Atelier son piezas vendibles con las que vincular un
// look — mismo criterio que FormularioProducto.jsx `esVendible`.
const PRODUCTOS_VENDIBLES = productosMock.filter((p) => p.tipo === 'pret-a-porter' || p.tipo === 'atelier');

function descripcionInicial(look) {
  if (!look?.descripcion) return { es: '', en: '' };
  if (typeof look.descripcion === 'string') return { es: look.descripcion, en: '' };
  return { es: look.descripcion.es || '', en: look.descripcion.en || '' };
}

// Un look de pasarela suele ser varias prendas puestas a la vez (pantalón,
// chaqueta, blusa...), cada una con su propio SKU de inventario — por eso
// esta lista es N filas nombre+SKU, no un único campo como en
// FormularioProducto. Siempre arranca con una fila vacía para que el
// formulario no se abra sin ningún campo que rellenar.
function prendasIniciales(look) {
  return look?.prendas?.length ? look.prendas : [{ nombre: '', sku: '' }];
}

// Miniatura de tela: recorte cuadrado centrado a 150×150 — a diferencia de
// comprimirImagen() (FormularioProducto.jsx, hasta 2000px, foto real del
// look), aquí es solo una muestra de tejido en un chip, así que se fuerza
// un tamaño fijo pequeño para que el peso se quede bajo sin depender de lo
// que suba el admin.
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

function FormularioLook({
  numero, look, onGuardado,
}) {
  // El nombre siempre es "Look (nº)" — no tiene sentido dejarlo editable,
  // es la posición del look dentro de la colección, no un dato propio.
  const nombreLook = `Look ${numero}`;
  const [idioma, setIdioma] = useState('es');
  const [descripcion, setDescripcion] = useState(() => descripcionInicial(look));
  const [colorIds, setColorIds] = useState(look?.colorIds || []);
  const [telaIds, setTelaIds] = useState(look?.telaIds || []);
  // Copia local de coloresMock/telasMock — permite añadir un color/tela
  // nuevos sin salir del modal (mismo criterio "demo, sin backend" que
  // GestorColores.jsx/GestorTejidos.jsx: no se escribe de vuelta en
  // mockData.js, pero el recién creado sí aparece al momento como chip
  // seleccionable aquí).
  const [coloresDisponibles, setColoresDisponibles] = useState(coloresMock);
  const [telasDisponibles, setTelasDisponibles] = useState(telasMock);
  const [nombreColorNuevoEs, setNombreColorNuevoEs] = useState('');
  const [nombreColorNuevoEn, setNombreColorNuevoEn] = useState('');
  // El nuevo color siempre encaja en una familia ya existente — mismo
  // criterio que FormularioProducto.jsx/GestorColores.jsx.
  const [familiaColorNueva, setFamiliaColorNueva] = useState(familiasColorMock[0]?.id || '');
  const [hexColorNuevo, setHexColorNuevo] = useState('#000000');
  // Familia actualmente desplegada bajo la rejilla de "padres" (null =
  // ninguna) — mismo criterio que FormularioProducto.jsx.
  const [familiaColorActiva, setFamiliaColorActiva] = useState(null);
  // El input HEX es texto libre mientras se escribe ("#6E263" a mitad de
  // teclear no es un hex válido todavía) — el swatch nativo <input
  // type="color"> exige siempre un #rrggbb completo, así que recibe esta
  // versión saneada en vez de hexColorNuevo tal cual.
  const hexColorValido = /^#[0-9a-fA-F]{6}$/.test(hexColorNuevo) ? hexColorNuevo : '#000000';
  const [nombreTelaNueva, setNombreTelaNueva] = useState('');
  const [composicionTelaNueva, setComposicionTelaNueva] = useState('');
  const [imagenTelaNueva, setImagenTelaNueva] = useState('');
  const [subiendoImagenTela, setSubiendoImagenTela] = useState(false);
  const [prendas, setPrendas] = useState(() => prendasIniciales(look));
  const [imagenes, setImagenes] = useState(look?.imagenes || []);
  const [subiendo, setSubiendo] = useState(false);
  // Vínculo con los productos reales de Prêt-à-porter/Atelier que se
  // pueden comprar — un look suele ser varias piezas puestas a la vez
  // (mismo espíritu que "Prendas y SKU"), así que admite más de uno, no
  // solo un producto principal. `look?.productoVinculado` (singular) es
  // el nombre de campo antiguo, de antes de admitir varios — se migra
  // aquí a la nueva forma en vez de perder el vínculo ya guardado.
  // Al revés que en FormularioProducto.jsx (que busca looks vía
  // CategoriasProvider, siempre al día dentro de la sesión), aquí solo hay
  // la copia estática de productosMock: no existe un ProductosProvider
  // compartido (productosMock vive como useState local de
  // ListaProductos.jsx), así que un producto creado en esta misma sesión
  // de admin no aparece buscable aquí hasta recargar la página.
  const [productosVinculados, setProductosVinculados] = useState(
    () => look?.productosVinculados || (look?.productoVinculado ? [look.productoVinculado] : [])
  );
  const [buscarProducto, setBuscarProducto] = useState('');
  const inputArchivoRef = useRef(null);
  const inputImagenTelaRef = useRef(null);

  const idiomasCompletados = ['es', 'en'].filter((cod) => descripcion[cod]?.trim());

  // Agrupa coloresDisponibles bajo su familia — mismo criterio que
  // gruposColores en FormularioProducto.jsx/GestorColores.jsx. `muestras`
  // se resuelve siempre contra coloresMock (fijo), no coloresDisponibles.
  const gruposColores = useMemo(() => (
    familiasColorMock
      .map((f) => ({
        ...f,
        muestras: f.muestras.map((id) => coloresMock.find((c) => c.id === id)?.hex).filter(Boolean),
        colores: coloresDisponibles.filter((c) => c.familia === f.id),
      }))
      .filter((f) => f.colores.length > 0)
  ), [coloresDisponibles]);

  const resultadosProducto = useMemo(() => {
    const q = buscarProducto.trim().toLowerCase();
    if (!q) return PRODUCTOS_VENDIBLES;
    return PRODUCTOS_VENDIBLES.filter((p) => p.nombre.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [buscarProducto]);

  function alternarProducto(producto) {
    setProductosVinculados((actual) => (
      actual.some((p) => p.id === producto.id)
        ? actual.filter((p) => p.id !== producto.id)
        : [...actual, {
          id: producto.id, nombre: producto.nombre, sku: producto.sku, imagen: producto.imagen,
        }]
    ));
  }

  function quitarProducto(id) {
    setProductosVinculados((actual) => actual.filter((p) => p.id !== id));
  }

  async function agregarImagenes(archivos) {
    const lista = Array.from(archivos || []);
    if (!lista.length) return;
    setSubiendo(true);
    const nuevas = await Promise.all(lista.map(async (archivo) => {
      let blobFinal;
      try {
        blobFinal = await comprimirImagen(archivo);
      } catch {
        blobFinal = archivo;
      }
      return URL.createObjectURL(blobFinal);
    }));
    setImagenes((actual) => [...actual, ...nuevas]);
    setSubiendo(false);
  }

  function quitarImagen(src) {
    setImagenes((actual) => actual.filter((s) => s !== src));
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
    setColorIds((actual) => [...actual, nuevo.id]);
    setFamiliaColorActiva(familiaColorNueva);
    setNombreColorNuevoEs('');
    setNombreColorNuevoEn('');
    setHexColorNuevo('#000000');
  }

  async function agregarImagenTela(archivo) {
    if (!archivo) return;
    setSubiendoImagenTela(true);
    let blobFinal;
    try {
      blobFinal = await comprimirImagenTela(archivo);
    } catch {
      blobFinal = archivo;
    }
    setImagenTelaNueva(URL.createObjectURL(blobFinal));
    setSubiendoImagenTela(false);
  }

  function anadirTelaNueva() {
    if (!nombreTelaNueva.trim()) return;
    const nueva = {
      id: `tel${Date.now()}`,
      nombre: nombreTelaNueva.trim(),
      composicion: composicionTelaNueva.trim(),
      imagen: imagenTelaNueva || undefined,
    };
    setTelasDisponibles((actual) => [...actual, nueva]);
    setTelaIds((actual) => [...actual, nueva.id]);
    setNombreTelaNueva('');
    setComposicionTelaNueva('');
    setImagenTelaNueva('');
  }

  function guardar() {
    onGuardado({
      nombre: nombreLook,
      descripcion: descripcion.es.trim() || undefined,
      colorIds,
      telaIds,
      prendas: prendas.filter((p) => p.nombre.trim() || p.sku.trim()),
      imagenes,
      productosVinculados: productosVinculados.length ? productosVinculados : undefined,
    });
  }

  return (
    <div>
      <PageHeader titulo={`Editar ${nombreLook}`} subtitulo="Imágenes, datos y campos específicos del look" />

      <FormSeccion numero={1} titulo="Imágenes" descripcion="Foto(s) de este look.">
        <div className={styles.seccionAncha}>
          {imagenes.length === 0 ? (
            <button type="button" className={styles.subirVacio} onClick={() => inputArchivoRef.current?.click()}>
              <Upload size={22} strokeWidth={1} aria-hidden="true" />
              <span>{subiendo ? 'Optimizando…' : 'Añadir imágenes'}</span>
            </button>
          ) : (
            <div className={styles.galeria}>
              {imagenes.map((src) => (
                <div key={src} className={styles.imagenItem}>
                  <img src={src} alt="" className={styles.imagenMiniatura} />
                  <button type="button" className={styles.imagenQuitar} aria-label="Quitar imagen" onClick={() => quitarImagen(src)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" className={styles.imagenAnadir} onClick={() => inputArchivoRef.current?.click()}>
                <Upload size={18} strokeWidth={1} aria-hidden="true" />
                <span>{subiendo ? 'Optimizando…' : 'Añadir'}</span>
              </button>
            </div>
          )}
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

      <FormSeccion numero={2} titulo="Prendas y SKU" descripcion="Cada pieza del look con su código de inventario — un look puede llevar varias prendas.">
        <div className={styles.seccionAncha}>
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

      <FormSeccion numero={3} titulo="Datos comunes" descripcion="El nombre es fijo (posición del look); la descripción necesita versión en los dos idiomas del sitio.">
        <div className={styles.seccionAncha}>
          <SelectorIdioma idioma={idioma} onChange={setIdioma} completados={idiomasCompletados} />
        </div>
        <div>
          <span className={styles.etiqueta}>Nombre</span>
          <p className={styles.nombreFijo}>{nombreLook}</p>
        </div>
        <div className={styles.seccionAncha}>
          <span className={styles.etiqueta}>{`Descripción (${idioma.toUpperCase()})`}</span>
          <textarea
            className={styles.textarea}
            value={descripcion[idioma]}
            onChange={(e) => setDescripcion({ ...descripcion, [idioma]: e.target.value })}
            placeholder="Composición, detalles del styling, notas de producción…"
            rows={3}
          />
        </div>
      </FormSeccion>

      <FormSeccion numero={4} titulo="Colores" descripcion="Colores del look — no lleva precio, tallas ni stock: no es inventario vendible.">
        <div className={styles.seccionAncha}>
          <span className={styles.etiqueta}>Toca un color guardado para activarlo o añade uno nuevo</span>
          <div className={styles.familiasGrid}>
            {gruposColores.map((grupo) => {
              const seleccionados = grupo.colores.filter((c) => colorIds.includes(c.id)).length;
              const activa = familiaColorActiva === grupo.id;
              return (
                <button
                  key={grupo.id}
                  type="button"
                  className={`${styles.familiaChip} ${activa ? styles.familiaChipActiva : ''}`}
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

          {familiaColorActiva && (
            <div className={styles.coloresGrid}>
              {gruposColores.find((g) => g.id === familiaColorActiva)?.colores.map((c) => {
                const activo = colorIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.colorChip} ${activo ? styles.colorChipActivo : ''}`}
                    onClick={() => setColorIds(activo ? colorIds.filter((id) => id !== c.id) : [...colorIds, c.id])}
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
          )}
          <div className={styles.anadirFila}>
            <label className={styles.campoColor}>
              <span className={styles.etiqueta}>Selector</span>
              <input type="color" value={hexColorValido} onChange={(e) => setHexColorNuevo(e.target.value)} className={styles.inputColor} aria-label="Elegir color" />
            </label>
            {/* HEX como campo editable junto al swatch — el swatch da el atajo
                visual rápido, el texto permite pegar/escribir un código exacto;
                ambos sincronizados con el mismo estado. */}
            <Input etiqueta="HEX" valor={hexColorNuevo} onChange={(e) => setHexColorNuevo(e.target.value)} placeholder="#6E2635" />
            <Input etiqueta="Nombre (ES)" valor={nombreColorNuevoEs} onChange={(e) => setNombreColorNuevoEs(e.target.value)} placeholder="Burdeos" />
            <Input etiqueta="Name (EN)" valor={nombreColorNuevoEn} onChange={(e) => setNombreColorNuevoEn(e.target.value)} placeholder="Bordeaux" />
            <label>
              <span className={styles.etiqueta}>Grupo</span>
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
              <Plus size={14} />
              Añadir color
            </Boton>
          </div>
        </div>
      </FormSeccion>

      <FormSeccion numero={5} titulo="Tejidos y Composición" descripcion="Telas del look, con su composición.">
        <div className={styles.seccionAncha}>
          <span className={styles.etiqueta}>Toca una tela guardada en Materiales para activarla, o añade una nueva</span>
          <div className={styles.telasGrid}>
            {telasDisponibles.map((t) => {
              const activo = telaIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.telaChip} ${activo ? styles.telaChipActivo : ''}`}
                  onClick={() => setTelaIds(activo ? telaIds.filter((id) => id !== t.id) : [...telaIds, t.id])}
                >
                  {t.imagen && <img src={t.imagen} alt="" className={styles.telaChipImagen} />}
                  <span className={styles.telaChipTexto}>
                    <span className={styles.telaChipNombre}>{t.nombre}</span>
                    <span className={styles.telaChipComposicion}>{t.composicion}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className={styles.anadirFila}>
            <div className={styles.campoColor}>
              <span className={styles.etiqueta}>Imagen</span>
              <button
                type="button"
                className={`${styles.inputColor} ${styles.inputImagenTela}`}
                onClick={() => inputImagenTelaRef.current?.click()}
                aria-label="Subir foto de la tela"
              >
                {imagenTelaNueva ? (
                  <img src={imagenTelaNueva} alt="" className={styles.inputImagenTelaPreview} />
                ) : (
                  <Upload size={16} strokeWidth={1} aria-hidden="true" />
                )}
              </button>
              <input
                ref={inputImagenTelaRef}
                type="file"
                accept="image/*"
                className={styles.inputArchivo}
                onChange={(e) => {
                  agregarImagenTela(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
            <Input etiqueta="Nueva tela" valor={nombreTelaNueva} onChange={(e) => setNombreTelaNueva(e.target.value)} placeholder="Tafetán" />
            <Input etiqueta="Composición" valor={composicionTelaNueva} onChange={(e) => setComposicionTelaNueva(e.target.value)} placeholder="70% algodón, 30% poliéster" />
            <Boton variante="contorno" tamano="s" onClick={anadirTelaNueva} desactivado={!nombreTelaNueva.trim() || subiendoImagenTela}>
              <Plus size={14} />
              {subiendoImagenTela ? 'Optimizando…' : 'Añadir tela'}
            </Boton>
          </div>
        </div>
      </FormSeccion>

      <FormSeccion numero={6} titulo="Productos vinculados" descripcion="Conecta este look con las piezas reales de Prêt-à-porter/Atelier que se pueden comprar — un look puede llevar varias.">
        <div className={styles.seccionAncha}>
          {productosVinculados.length === 0 ? (
            <p className={styles.vinculoVacio}>Sin vincular todavía — busca por nombre o SKU del producto.</p>
          ) : (
            <div className={styles.vinculoActualLista}>
              {productosVinculados.map((p) => (
                <div key={p.id} className={styles.vinculoActual}>
                  {p.imagen ? (
                    <img src={p.imagen} alt="" className={styles.vinculoActualImagen} />
                  ) : <span className={styles.vinculoActualImagen} />}
                  <div className={styles.vinculoActualTexto}>
                    <span className={styles.vinculoActualNombre}>{p.nombre}</span>
                    <span className={styles.vinculoActualSub}>{p.sku}</span>
                  </div>
                  <Boton variante="contorno-rosa" tamano="s" onClick={() => quitarProducto(p.id)}>
                    <X size={14} />
                    Quitar vínculo
                  </Boton>
                </div>
              ))}
            </div>
          )}

          <div className={styles.vinculoBuscador}>
            <Search size={16} className={styles.vinculoBuscadorIcono} aria-hidden="true" />
            <input
              type="text"
              className={styles.vinculoBuscadorInput}
              placeholder="Buscar por nombre o SKU…"
              value={buscarProducto}
              onChange={(e) => setBuscarProducto(e.target.value)}
            />
          </div>

          <div className={styles.vinculoLista}>
            {resultadosProducto.length === 0 ? (
              <p className={styles.vinculoVacio}>Sin resultados.</p>
            ) : resultadosProducto.map((p) => {
              const activo = productosVinculados.some((v) => v.id === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.vinculoFila} ${activo ? styles.vinculoFilaActiva : ''}`}
                  onClick={() => alternarProducto(p)}
                >
                  {p.imagen ? (
                    <img src={p.imagen} alt="" className={styles.vinculoFilaImagen} />
                  ) : <span className={styles.vinculoFilaImagen} />}
                  <span className={styles.vinculoFilaTexto}>
                    <span className={styles.vinculoFilaNombre}>{p.nombre}</span>
                    <span className={styles.vinculoFilaSub}>{p.sku}</span>
                  </span>
                  {activo && <Link2 size={14} className={styles.vinculoFilaCheck} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      </FormSeccion>

      <div className={styles.acciones}>
        <Boton onClick={guardar}>Guardar look</Boton>
      </div>
    </div>
  );
}

export default FormularioLook;
