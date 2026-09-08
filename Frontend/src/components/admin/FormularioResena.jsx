'use client';

/* ============================================================
   FORMULARIO DE RESEÑA — Fely Campo (admin)
   Vive en un ModalOverlay (como el alta/edición de producto) en vez de
   ser su propia página — /admin/resenas/page.js decide cuándo se abre
   (nueva o edición), igual que ListaProductos.jsx con
   FormularioProducto.jsx.
   El producto reseñado ya no es un <select> de nombre en texto libre
   (misma relación frágil que ya se corrigió en otros sitios del panel,
   ver docs/adminpanel.md sección 7 punto 4) — ahora es un vínculo real
   por id, con buscador propio, mismo lenguaje visual que "Vincular a
   Runway / Novia / Fiesta" (FormularioProducto.jsx) / "Productos
   vinculados" (FormularioLook.jsx): search + lista de resultados con
   miniatura+SKU, tarjeta de vínculo activo con botón "Quitar vínculo".
   ============================================================ */

import {
  useMemo, useRef, useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Link2, Upload, X,
} from 'lucide-react';
import {
  PageHeader, FormSeccion, DragList, SelectorIdioma, useToast,
} from './index';
import { Boton, Input } from '../ui';
import { productosMock } from './mockData';
import { comprimirImagen } from './FormularioProducto';
import styles from './FormularioResena.module.css';

const ESTADOS = [
  { valor: 'Oculta', etiqueta: 'Oculta', clase: 'oculta' },
  { valor: 'Publicada', etiqueta: 'Publicada', clase: 'publicada' },
];

function FormularioResena({ resenaExistente, onGuardado }) {
  const router = useRouter();
  const { mostrarToast } = useToast();

  const [nombreCliente, setNombreCliente] = useState(resenaExistente?.nombreCliente || '');
  // Texto bilingüe, mismo criterio que "Reseñas de Clientas" en
  // FormularioProducto.jsx — idioma propio, independiente de cualquier
  // otro toggle del panel. Las reseñas más antiguas del mock guardan
  // `texto` como string plano (sin traducción todavía); se reparte a
  // `es` al abrir para no perder el contenido.
  const [idiomaTexto, setIdiomaTexto] = useState('es');
  const [texto, setTexto] = useState(() => {
    const t = resenaExistente?.texto;
    if (!t) return { es: '', en: '' };
    return typeof t === 'string' ? { es: t, en: '' } : { es: t.es || '', en: t.en || '' };
  });
  // Fotos de la clienta — mismo carrusel arrastrable que "Reseñas de
  // Clientas" en FormularioProducto.jsx (.imagenesScroll/.imagenItem
  // duplicados aquí, no se puede importar una clase de otro CSS
  // Module). `foto` (singular) sigue viviendo en reseñas antiguas del
  // mock — se reparte a un array de una sola foto al abrir.
  const [fotos, setFotos] = useState(() => (
    resenaExistente?.fotos || (resenaExistente?.foto ? [resenaExistente.foto] : [])
  ));
  // Sin control de edición todavía: por defecto "Oculta" — una reseña
  // (llegue desde donde llegue, ver mockData.js) no se publica sola, hay
  // que revisarla primero.
  const [estado, setEstado] = useState(resenaExistente?.estado || 'Oculta');

  const [productoVinculado, setProductoVinculado] = useState(() => {
    const producto = productosMock.find((p) => p.id === resenaExistente?.productoId);
    return producto ? {
      id: producto.id, nombre: producto.nombre, sku: producto.sku, imagen: producto.imagen,
    } : null;
  });
  const [buscarProducto, setBuscarProducto] = useState('');

  const inputFotosRef = useRef(null);

  const resultadosProducto = useMemo(() => {
    const q = buscarProducto.trim().toLowerCase();
    if (!q) return productosMock;
    return productosMock.filter((p) => p.nombre.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [buscarProducto]);

  function vincularProducto(producto) {
    setProductoVinculado({
      id: producto.id, nombre: producto.nombre, sku: producto.sku, imagen: producto.imagen,
    });
  }

  async function agregarFotos(archivos) {
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
    setFotos((actual) => [...actual, ...nuevas]);
  }

  function quitarFoto(src) {
    setFotos((actual) => actual.filter((s) => s !== src));
  }

  function guardar(estadoFinal) {
    setEstado(estadoFinal);
    mostrarToast(estadoFinal === 'Publicada' ? 'Reseña publicada (demo)' : 'Reseña guardada (demo)');

    if (onGuardado) {
      onGuardado({
        id: resenaExistente?.id || `res${Date.now()}`,
        clienteId: resenaExistente?.clienteId,
        nombreCliente: nombreCliente.trim(),
        texto,
        // `valoracion` ya no se pide en este formulario — se conserva la
        // de una reseña existente (si la tenía) en vez de descartarla.
        valoracion: resenaExistente?.valoracion,
        fotos,
        foto: fotos[0] || undefined,
        fecha: resenaExistente?.fecha || new Date().toISOString().slice(0, 10),
        estado: estadoFinal,
        productoId: productoVinculado?.id,
        nuevo: resenaExistente?.nuevo,
      });
      return;
    }
    router.push('/admin/resenas');
  }

  return (
    <div>
      <PageHeader titulo={resenaExistente ? 'Editar reseña' : 'Nueva reseña'}>
        <div className={styles.estadoSelector} role="group" aria-label="Estado de publicación">
          {ESTADOS.map((opcion) => {
            const activo = estado === opcion.valor;
            return (
              <button
                key={opcion.valor}
                type="button"
                className={`${styles.estadoBoton} ${styles[opcion.clase]} ${activo ? styles.estadoBotonActivo : ''}`}
                aria-pressed={activo}
                onClick={() => setEstado(opcion.valor)}
              >
                {opcion.etiqueta}
              </button>
            );
          })}
        </div>
      </PageHeader>

      <FormSeccion numero={1} titulo="Contenido de la reseña">
        {/* Sin "Anónimo" como opción — toda reseña viene de una clienta con
            cuenta (ver mockData.js resenasMock), no hay reseña anónima. */}
        <Input etiqueta="Nombre del cliente" valor={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
        <div className={styles.campoAncho}>
          <SelectorIdioma idioma={idiomaTexto} onChange={setIdiomaTexto} />
        </div>
        <div className={styles.campoAncho}>
          <span className={styles.etiquetaCampo}>{`Texto de la reseña (${idiomaTexto.toUpperCase()})`}</span>
          <textarea
            className={styles.textarea}
            value={texto[idiomaTexto]}
            onChange={(e) => setTexto({ ...texto, [idiomaTexto]: e.target.value })}
          />
        </div>
      </FormSeccion>

      <FormSeccion numero={2} titulo="Producto reseñado" descripcion="Opcional — conecta la reseña con el producto real (SKU y foto incluidos).">
        <div className={styles.campoAncho}>
          {productoVinculado ? (
            <div className={styles.vinculoActual}>
              {productoVinculado.imagen ? (
                <img src={productoVinculado.imagen} alt="" className={styles.vinculoActualImagen} />
              ) : <span className={styles.vinculoActualImagen} />}
              <div className={styles.vinculoActualTexto}>
                <span className={styles.vinculoActualNombre}>{productoVinculado.nombre}</span>
                <span className={styles.vinculoActualSub}>{productoVinculado.sku}</span>
              </div>
              <Boton variante="contorno-rosa" tamano="s" onClick={() => setProductoVinculado(null)}>
                <X size={14} />
                Quitar vínculo
              </Boton>
            </div>
          ) : (
            <p className={styles.vinculoVacio}>Sin vincular todavía — busca por nombre o SKU del producto.</p>
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
              const activo = productoVinculado?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.vinculoFila} ${activo ? styles.vinculoFilaActiva : ''}`}
                  onClick={() => vincularProducto(p)}
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

      <FormSeccion numero={3} titulo="Fotos de clientas" descripcion="Opcionales — fotos de la clienta con la prenda, arrastra para reordenar.">
        <div className={styles.campoAncho}>
          <div className={styles.imagenesScroll}>
            {fotos.length > 0 && (
              <DragList
                items={fotos.map((src) => ({ src }))}
                claveItem={(item) => item.src}
                onReorder={(nuevo) => setFotos(nuevo.map((item) => item.src))}
                orientacion="horizontal"
                renderItem={(item) => (
                  <div className={styles.imagenItem}>
                    <img src={item.src} alt="" className={styles.imagenMiniatura} />
                    <button
                      type="button"
                      className={styles.imagenQuitar}
                      aria-label="Quitar foto"
                      onClick={() => quitarFoto(item.src)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              />
            )}
            <button type="button" className={styles.fotoAnadir} onClick={() => inputFotosRef.current?.click()}>
              <Upload size={18} strokeWidth={1} aria-hidden="true" />
              <span>Añadir foto</span>
            </button>
          </div>
          <input
            ref={inputFotosRef}
            type="file"
            accept="image/*"
            multiple
            className={styles.inputArchivo}
            onChange={(e) => {
              agregarFotos(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </FormSeccion>

      <div className={styles.acciones}>
        <Boton variante="contorno" onClick={() => guardar(estado)}>Guardar</Boton>
        <Boton variante="solido" onClick={() => guardar('Publicada')}>Publicar</Boton>
      </div>
    </div>
  );
}

export default FormularioResena;
