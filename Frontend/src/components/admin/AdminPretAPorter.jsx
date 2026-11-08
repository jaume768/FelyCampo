'use client';

/* ============================================================
   ADMIN · PRÊT-À-PORTER — Fely Campo
   /admin/productos/pret-a-porter: los productos de la tienda. Igual que
   el resto del panel: un listado con las piezas comunes (ListadoAdmin.jsx,
   con una pestaña por categoría) y una ficha por producto con el editor
   común (EditorPagina.jsx: Español | English, Vista previa y «Guardar y
   publicar»). Pide solo lo que enseña la ficha de la web: nombre,
   categoría, referencia, fotos, descripción y colores (sin precio ni
   tallas: la web ya no los enseña, a petición). Vistas:
     (sin parámetros)                     la página: portada y descripción
     ?vista=productos / ?categoria=<id>   productos (todos / una categoría)
     ?producto=<id>                       editar (producto=nuevo: crear)
   "categoria" es el mismo parámetro que usa el submenú del menú lateral.
   Datos y reglas: PretAPorter.jsx (estado) y lib/pretAPorter.js (lo mismo
   que lee la web). Ver docs/ADMIN.md.
   ============================================================ */

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink, Plus } from 'lucide-react';
import { Boton } from '@/components/ui';
import {
  CATEGORIAS_PRET_A_PORTER, EDITOR_PRET_A_PORTER, ID_PREVIA_PRODUCTO, camposProductoPretAPorter, nombreCategoria,
  nuevoProductoPretAPorter, slugProducto, validarExtraProducto,
} from '@/lib/pretAPorter';
import CampoLinea from './CampoLinea';
import AdminPaginaPretAPorter from './AdminPaginaPretAPorter';
import ConfirmarBorrado from './ConfirmarBorrado';
import DragList from './DragList';
import EditorPagina from './EditorPagina';
import { FilaListado, PestanasListado } from './ListadoAdmin';
import PageHeader from './PageHeader';
import { usePretAPorter } from './PretAPorter';
import SelectorColores from './SelectorColores';
import { useToast } from './Toast';
import campos from './CamposEditor.module.css';
import editorStyles from './EditorPagina.module.css';
import listado from './ListadoAdmin.module.css';
import styles from './AdminColeccionesAtelier.module.css';
import segmentos from './AdminVosotras.module.css';

const BASE = EDITOR_PRET_A_PORTER;
// Al entrar se abre la página (portada y descripción); los productos
// están en la segunda pestaña (a petición, igual que Novias y Fiesta).
const LISTADO = `${BASE}?vista=productos`;

// Pestañas de arriba: la página de la web y los productos.
function PestanasSeccion({ activa, cuenta }) {
  return (
    <PestanasListado
      etiqueta="Prêt-à-porter"
      pestanas={[
        {
          href: BASE, nombre: 'Página de la web (fotos y textos)', activa: activa === 'pagina',
        },
        {
          href: LISTADO, nombre: 'Productos', cuenta, activa: activa === 'productos',
        },
      ]}
    />
  );
}
const NUEVO = 'nuevo';
// Ya se guarda en la base de datos (ContenidoAdmin.jsx): sin coletilla «demo».
const DEMO = '';
const urlWeb = (producto) => `/es/pret-a-porter/${slugProducto(producto.nombre)}`;
const fotos = (n) => `${n} ${n === 1 ? 'foto' : 'fotos'}`;

// ---------- Listado ----------

function Listado({ categoria }) {
  const { mostrarToast } = useToast();
  const {
    productos, alternar, borrar, reordenar,
  } = usePretAPorter();
  const [porBorrar, setPorBorrar] = useState(null);
  const lista = categoria ? productos.filter((p) => p.categoria === categoria) : productos;
  const publicados = lista.filter((p) => p.publicado).length;

  return (
    <>
      <PageHeader
        titulo="Prêt-à-porter"
        subtitulo={`${lista.length} productos${categoria ? ` en ${nombreCategoria(categoria).toLowerCase()}` : ''} · ${publicados} en la web · arrastra para cambiar el orden en que salen en la web`}
      >
        <Boton variante="contorno" nuevaPestana href="/es/pret-a-porter">
          <ExternalLink size={14} aria-hidden="true" /> Ver en la web
        </Boton>
        <Boton variante="solido" href={`${BASE}?producto=${NUEVO}${categoria ? `&categoria=${categoria}` : ''}`}>
          <Plus size={14} aria-hidden="true" /> Nuevo producto
        </Boton>
      </PageHeader>

      <PestanasSeccion activa="productos" cuenta={productos.length} />

      <PestanasListado
        etiqueta="Categorías"
        pestanas={[
          {
            href: LISTADO, nombre: 'Todos', cuenta: productos.length, activa: !categoria,
          },
          ...CATEGORIAS_PRET_A_PORTER.map((c) => ({
            href: `${BASE}?categoria=${c.id}`, nombre: c.nombre, cuenta: productos.filter((p) => p.categoria === c.id).length, activa: categoria === c.id,
          })),
        ]}
      />

      {lista.length === 0 && <p className={listado.vacio}>Todavía no hay productos en esta categoría.</p>}
      <DragList
        items={lista}
        claveItem={(producto) => producto.id}
        onReorder={(nueva) => { reordenar(nueva); mostrarToast(`Orden guardado${DEMO}`); }}
        renderItem={(producto, indice) => (
          <FilaListado
            numero={indice + 1}
            vertical
            imagen={producto.imagenes[0]}
            titulo={producto.nombre}
            detalle={[
              !categoria && nombreCategoria(producto.categoria),
              producto.colores.map((c) => c.nombre).join(', '),
              fotos(producto.imagenes.length),
            ].filter(Boolean).join(' · ')}
            publicado={producto.publicado}
            editar={`${BASE}?producto=${producto.id}`}
            verEnWeb={urlWeb(producto)}
            onAlternar={() => {
              alternar(producto.id);
              mostrarToast(`${producto.publicado ? 'Producto oculto en la web' : 'Producto publicado en la web'}${DEMO}`);
            }}
            onBorrar={() => setPorBorrar(producto)}
          />
        )}
      />

      <ConfirmarBorrado
        abierto={Boolean(porBorrar)}
        titulo={`¿Borrar «${porBorrar?.nombre}»?`}
        mensaje="Su página deja de existir (quien entre en su dirección irá a Prêt-à-porter). No se puede deshacer; si solo quieres quitarlo un tiempo, ocúltalo."
        onConfirmar={() => {
          borrar(porBorrar.id);
          mostrarToast(`Producto borrado${DEMO}`);
          setPorBorrar(null);
        }}
        onCancelar={() => setPorBorrar(null)}
      />
    </>
  );
}

// ---------- Editar un producto ----------

const BLOQUES = [
  {
    id: 'datos', nombre: 'Nombre y categoría', resumen: 'Y su referencia', descripcion: 'El nombre es el que se ve en la web y forma la dirección (URL) del producto.', datos: (d) => [d.nombre, d.categoria, d.sku],
  },
  {
    id: 'fotos', nombre: 'Fotos', resumen: 'La primera, en la tarjeta', descripcion: 'La 1.ª es la de la tarjeta y la principal de la ficha; la 2.ª aparece al pasar el ratón por la tarjeta. Arrastra para cambiar el orden.', datos: (d) => d.imagenes,
  },
  {
    id: 'descripcion', nombre: 'Descripción', resumen: 'Opcional', descripcion: 'El texto bajo el nombre, en la ficha.', datos: (d) => d.descripcion,
  },
  {
    id: 'composicion',
    nombre: 'Composición y origen',
    resumen: 'Opcional',
    descripcion: 'El desplegable «Composición» de la ficha. Lo que dejes vacío sale con el texto general, el mismo para todas las prendas.',
    datos: (d) => [d.composicion, d.disenadoEn, d.fabricadoEn],
  },
  {
    id: 'colores', nombre: 'Colores', resumen: 'Al menos uno', descripcion: 'Los colores en que está el producto: salen en la tarjeta y en la ficha.', datos: (d) => d.colores,
  },
  {
    id: 'pasarela',
    nombre: 'Foto de pasarela',
    resumen: 'Opcional',
    descripcion: 'Una foto de desfile con este producto, que sale a su lado en la página principal de Prêt-à-porter (no en las categorías). Al pulsarla, se abre la ficha del producto.',
    datos: (d) => d.fotoPasarela,
  },
];

function CampoCategoria({ valor, onChange }) {
  const id = useId();
  return (
    <div className={campos.campo}>
      <div className={campos.cabecera}>
        <label htmlFor={id} className={campos.etiqueta}>Categoría</label>
      </div>
      <div className={campos.selectMarco}>
        <select id={id} className={campos.select} value={valor} onChange={(evento) => onChange(evento.target.value)}>
          {CATEGORIAS_PRET_A_PORTER.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
    </div>
  );
}

function EditarProducto({ id, categoriaInicial }) {
  const router = useRouter();
  const { productos, guardar } = usePretAPorter();
  const esNuevo = id === NUEVO;
  const [vacio] = useState(() => nuevoProductoPretAPorter(CATEGORIAS_PRET_A_PORTER.some((c) => c.id === categoriaInicial) ? categoriaInicial : undefined));
  const producto = esNuevo ? vacio : productos.find((p) => p.id === id);

  if (!producto) {
    return <p className={listado.vacio}>Este producto no existe. <Link href={LISTADO}>Volver a Prêt-à-porter</Link></p>;
  }

  return (
    <EditorPagina
      key={id}
      id={ID_PREVIA_PRODUCTO}
      titulo={esNuevo ? 'Nuevo producto' : producto.nombre}
      rutaWeb={`/pret-a-porter/${slugProducto(producto.nombre) || NUEVO}`}
      bloques={BLOQUES}
      campos={camposProductoPretAPorter}
      validarExtra={(d) => validarExtraProducto(d, productos)}
      publicado={producto}
      datosPrevia={(d) => d}
      guardar={(d) => {
        const nuevoId = guardar(d);
        if (esNuevo) router.replace(`${BASE}?producto=${nuevoId}`);
      }}
      migas={`Prêt-à-porter · ${nombreCategoria(producto.categoria)}`}
      volver={`${BASE}?categoria=${producto.categoria}`}
      estadoPublicado={esNuevo ? 'Sin publicar' : (producto.publicado ? 'Publicado' : 'Oculto en la web')}
      textoPublicado={esNuevo ? 'Producto publicado' : 'Cambios publicados'}
      enLaWeb={!esNuevo && producto.publicado}
    >
      {(bloque, h) => {
        if (bloque.id === 'datos') {
          const slug = slugProducto(h.borrador.nombre);
          const cambiaUrl = !esNuevo && producto.publicado && slugProducto(producto.nombre) !== slug;
          return (
            <div className={editorStyles.columnaTexto}>
              <div className={editorStyles.dosColumnas}>
                <CampoLinea etiqueta="Nombre" valor={h.borrador.nombre} placeholder="Falda Basilea" onChange={(nombre) => h.cambiar(['nombre'], nombre)} />
                <CampoCategoria valor={h.borrador.categoria} onChange={(categoria) => h.cambiar(['categoria'], categoria)} />
              </div>
              <p className={styles.ayuda}>Dirección: <strong>/pret-a-porter/{slug || '…'}</strong></p>
              {cambiaUrl && (
                <p className={styles.aviso}>
                  Este producto ya está publicado: al cambiar el nombre cambia su dirección. La antigua
                  ({slugProducto(producto.nombre)}) llevará a la nueva, así no se pierden visitas ni posiciones en Google.
                </p>
              )}
              <CampoLinea
                etiqueta="Referencia (SKU)"
                opcional
                valor={h.borrador.sku}
                placeholder="MBO2723"
                ayuda="No se ve en la web; ayuda a Google a reconocer el producto."
                onChange={(sku) => h.cambiar(['sku'], sku)}
              />
            </div>
          );
        }
        if (bloque.id === 'fotos') {
          return h.galeria(['imagenes'], {
            papeles: (indice) => ['Tarjeta y ficha', 'Al pasar el ratón'][indice] || '', textoAnadir: 'Añadir fotos',
          });
        }
        if (bloque.id === 'descripcion') {
          return (
            <div className={editorStyles.columnaTexto}>
              {h.texto(['descripcion'], {
                etiqueta: 'Descripción',
                multilinea: true,
                filas: 4,
                opcional: true,
                ayuda: h.idioma === 'en' ? 'Si se deja vacía, en inglés se enseña la descripción en español.' : undefined,
              })}
            </div>
          );
        }
        if (bloque.id === 'composicion') {
          const siVacio = (texto) => (h.idioma === 'en' ? 'Si se deja vacío, en inglés sale el texto en español.' : `Si lo dejas vacío: «${texto}».`);
          return (
            <div className={editorStyles.columnaTexto}>
              {h.texto(['composicion'], {
                etiqueta: 'Composición',
                multilinea: true,
                filas: 3,
                opcional: true,
                ayuda: `Por ejemplo: 100% seda. ${siVacio('100% materiales de temporada, seleccionados por nuestro equipo de diseño.')}`,
              })}
              <div className={editorStyles.dosColumnas}>
                {h.texto(['disenadoEn'], { etiqueta: 'Diseñado en', opcional: true, ayuda: siVacio('Salamanca, España') })}
                {h.texto(['fabricadoEn'], {
                  etiqueta: 'Fabricado en',
                  opcional: true,
                  ayuda: siVacio('nuestros talleres de Salamanca, España'),
                })}
              </div>
            </div>
          );
        }
        if (bloque.id === 'colores') {
          return <SelectorColores valor={h.borrador.colores} onChange={(colores) => h.cambiar(['colores'], colores)} />;
        }
        // Foto de pasarela
        const pasarela = h.borrador.fotoPasarela || { src: '', antes: false };
        return (
          <div className={editorStyles.medioYCampos}>
            <div className={styles.portadaColeccion}>
              {h.medio(['fotoPasarela', 'src'], {
                etiqueta: 'Foto', detalle: 'Recorte sin fondo', proporcion: '3 / 4', opcional: true,
              })}
            </div>
            {pasarela.src && (
              <div className={editorStyles.fichaCampos}>
                <p className={campos.etiqueta}>Dónde va</p>
                <div className={segmentos.segmentado} role="radiogroup" aria-label="Dónde va la foto de pasarela">
                  {[[true, 'Delante del producto'], [false, 'Detrás del producto']].map(([valor, texto]) => (
                    <button
                      key={texto}
                      type="button"
                      role="radio"
                      aria-checked={Boolean(pasarela.antes) === valor}
                      className={`${segmentos.segmento} ${Boolean(pasarela.antes) === valor ? segmentos.segmentoActivo : ''}`}
                      onClick={() => h.cambiar(['fotoPasarela', 'antes'], valor)}
                    >
                      {texto}
                    </button>
                  ))}
                </div>
                <p className={campos.ayuda}>Así se decide en qué lado de la fila cae la foto.</p>
              </div>
            )}
          </div>
        );
      }}
    </EditorPagina>
  );
}

// ---------- Página ----------

function AdminPretAPorter() {
  const params = useSearchParams();
  const producto = params.get('producto');
  const categoria = params.get('categoria');
  const { productos } = usePretAPorter();
  if (producto) return <EditarProducto id={producto} categoriaInicial={categoria} />;
  // Sin categoría ni ?vista=productos: la página (portada y descripción).
  if (!categoria && params.get('vista') !== 'productos') {
    return <AdminPaginaPretAPorter pestanas={<PestanasSeccion activa="pagina" cuenta={productos.length} />} />;
  }
  return <Listado categoria={CATEGORIAS_PRET_A_PORTER.some((c) => c.id === categoria) ? categoria : null} />;
}

export default AdminPretAPorter;
