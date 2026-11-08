'use client';

/* ============================================================
   ADMIN · PUNTOS DE VENTA — Fely Campo
   /admin/puntos-de-venta: los puntos del mapa de la web
   (/puntos-de-venta-fely-campo y el final de /visita-fely-campo).
   Igual que el resto del panel: un listado (con buscador y filtro por
   país, como Citas o Consultas: con 11 países, unas pestañas no cabían) y
   una ficha con el editor común (EditorPagina.jsx: vista previa del mapa
   y «Guardar y publicar»). Vistas, según la URL:
     (sin parámetros) / ?pais=<país>   listado (todos, agrupados por país / un país)
     ?punto=<id>                       editar un punto (punto=nuevo: crear)
   Datos y reglas: PuntosVenta.jsx (estado) y lib/puntosVenta.js (lo
   mismo que lee la web). Ver docs/ADMIN.md.
   ============================================================ */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink, Plus } from 'lucide-react';
import { Boton, Input } from '@/components/ui';
import {
  EDITOR_PUNTOS, ID_PREVIA_PUNTOS, RUTA_WEB_PUNTOS, camposPunto, conDatosDeSede, esAtelierPropio, nuevoPunto, paisesDe, validarExtraPunto,
} from '@/lib/puntosVenta';
import { IDS_SEDES, editorSede, idPaginaSede } from '@/lib/ateliers';
import CampoLinea from './CampoLinea';
import ConfirmarBorrado from './ConfirmarBorrado';
import EditorPagina from './EditorPagina';
import FiltroBar, { Selector } from './FiltroBar';
import AdminCabecera from './AdminCabecera';
import { FilaListado, PestanasPagina } from './ListadoAdmin';
import PageHeader from './PageHeader';
import { conPunto, usePuntosVenta } from './PuntosVenta';
import SelectorUbicacion from './SelectorUbicacion';
import { usePagina } from './Paginas';
import { useToast } from './Toast';
import editorStyles from './EditorPagina.module.css';
import campos from './CamposEditor.module.css';
import listado from './ListadoAdmin.module.css';
import styles from './AdminPuntosVenta.module.css';

const BASE = EDITOR_PUNTOS;
// Al entrar se abre la página (cabecera, textos del mapa y presencia
// internacional); los puntos están en la segunda pestaña.
const LISTADO = `${BASE}?vista=puntos`;
const WEB = `/es${RUTA_WEB_PUNTOS}`;
const NUEVO = 'nuevo';
const OTRO_PAIS = '__otro__';
// Ya se guarda en la base de datos (ContenidoAdmin.jsx): sin coletilla «demo».
const DEMO = '';

// Los ateliers propios toman la dirección y el teléfono de su página de
// atelier: aquí, de lo publicado en el admin. (Siempre las 3 sedes, en el
// mismo orden: así los hooks no cambian.)
function useSedes() {
  const publicadas = Object.fromEntries(IDS_SEDES.map((id) => [id, usePagina(idPaginaSede(id)).publicado]));
  return (id) => publicadas[id];
}

// ---------- Listado ----------

// Para buscar sin tildes ni mayúsculas: «coruna» encuentra «A Coruña».
const normalizar = (texto) => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function Listado({ pais }) {
  const router = useRouter();
  const { mostrarToast } = useToast();
  const { puntos: guardados, alternar, borrar } = usePuntosVenta();
  const sedes = useSedes();
  const puntos = guardados.map((punto) => conDatosDeSede(punto, sedes));
  const [porBorrar, setPorBorrar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const paises = paisesDe(puntos);
  const enLaWeb = puntos.filter((punto) => punto.publicado).length;
  const buscado = normalizar(busqueda.trim());
  const lista = puntos.filter((punto) => (!pais || punto.pais === pais) && (!buscado || normalizar(
    [punto.nombre, ...punto.direccion, punto.pais, punto.telefono, punto.email].join(' '),
  ).includes(buscado)));
  // Agrupados por país, en el orden del filtro (España primero).
  const grupos = paises
    .map(({ pais: nombre }) => ({ pais: nombre, puntos: lista.filter((punto) => punto.pais === nombre) }))
    .filter((grupo) => grupo.puntos.length > 0);
  const elegirPais = (nombre) => router.replace(nombre ? `${BASE}?pais=${encodeURIComponent(nombre)}` : LISTADO);

  const fila = (punto) => (
    <FilaListado
      key={punto.id}
      vertical
      imagen={punto.foto}
      titulo={punto.nombre}
      detalle={punto.direccion.join(', ')}
      etiqueta={esAtelierPropio(punto) ? 'Atelier propio' : undefined}
      publicado={punto.publicado}
      editar={`${BASE}?punto=${punto.id}`}
      verEnWeb={WEB}
      onAlternar={() => {
        alternar(punto.id);
        mostrarToast(`${punto.publicado ? 'Quitado del mapa' : 'Vuelve a salir en el mapa'}${DEMO}`);
      }}
      onBorrar={esAtelierPropio(punto) ? undefined : () => setPorBorrar(punto)}
    />
  );

  return (
    <>
      <PageHeader
        titulo="Puntos de venta"
        subtitulo={`${puntos.length} puntos · ${enLaWeb} en el mapa de la web · los ateliers propios y las tiendas que venden Fely Campo`}
      >
        <Boton variante="contorno" nuevaPestana href={WEB}>
          <ExternalLink size={14} aria-hidden="true" /> Ver en la web
        </Boton>
        <Boton variante="solido" href={`${BASE}?punto=${NUEVO}${pais ? `&pais=${encodeURIComponent(pais)}` : ''}`}>
          <Plus size={14} aria-hidden="true" /> Nuevo punto de venta
        </Boton>
      </PageHeader>

      <PestanasPagina etiqueta="Puntos de venta" pagina={BASE} listado={{ href: LISTADO, nombre: 'Puntos de venta', cuenta: puntos.length }} activa="listado" />

      <FiltroBar onLimpiar={pais || busqueda ? () => { setBusqueda(''); elegirPais(''); } : undefined}>
        <Input
          etiqueta="Buscar"
          placeholder="Nombre, ciudad o calle"
          valor={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
        <Selector
          etiqueta="País"
          valor={pais || ''}
          activo={Boolean(pais)}
          onChange={(evento) => elegirPais(evento.target.value)}
          opciones={[
            { valor: '', etiqueta: `Todos los países (${puntos.length})` },
            ...paises.map(({ pais: nombre, numero }) => ({ valor: nombre, etiqueta: `${nombre} (${numero})` })),
          ]}
        />
      </FiltroBar>

      {(pais || buscado) && (
        <p className={styles.resultado} role="status">
          {lista.length === 1 ? '1 punto de venta' : `${lista.length} puntos de venta`}
          {pais ? ` en ${pais}` : ''}
          {buscado ? ` con «${busqueda.trim()}»` : ''}
        </p>
      )}

      {lista.length === 0 && <p className={listado.vacio}>No hay ningún punto de venta así. Prueba con otra palabra o elige «Todos los países».</p>}

      {grupos.map((grupo) => (
        <section key={grupo.pais} className={styles.grupo} aria-label={grupo.pais}>
          {!pais && (
            <h2 className={styles.grupoTitulo}>
              {grupo.pais}
              <span className={styles.grupoCuenta}>{grupo.puntos.length}</span>
            </h2>
          )}
          {grupo.puntos.map(fila)}
        </section>
      ))}

      <ConfirmarBorrado
        abierto={Boolean(porBorrar)}
        titulo={`¿Borrar «${porBorrar?.nombre}»?`}
        mensaje="Deja de salir en el mapa de la web. No se puede deshacer; si solo quieres quitarlo un tiempo, ocúltalo con el ojo."
        onConfirmar={() => {
          borrar(porBorrar.id);
          mostrarToast(`Borrado${DEMO}`);
          setPorBorrar(null);
        }}
        onCancelar={() => setPorBorrar(null)}
      />
    </>
  );
}

// ---------- Editar un punto ----------

const BLOQUES = [
  {
    id: 'datos',
    nombre: 'Datos',
    resumen: 'Nombre, dirección y contacto',
    descripcion: 'Lo que se lee en el listado del mapa y al pinchar en su punto. Sale igual en español y en inglés.',
    datos: (d) => [d.nombre, d.pais, d.direccion, d.telefono, d.email],
  },
  {
    id: 'ubicacion',
    nombre: 'Dónde está',
    resumen: 'Su punto en el mapa',
    descripcion: 'El sitio exacto del punto en el mapa de la web.',
    datos: (d) => [d.lat, d.lng],
  },
  {
    id: 'foto',
    nombre: 'Foto',
    resumen: 'Opcional',
    descripcion: 'La foto pequeña junto a su nombre en el listado del mapa. Si no tiene, sale una foto de un atelier.',
    datos: (d) => d.foto,
  },
];

// Un atelier propio: su dirección y su teléfono se ven, pero se cambian en
// su página de atelier (una sola copia para la web, el mapa y la cita).
function DatosDeSede({ punto, sede }) {
  return (
    <div className={styles.datosSede}>
      <p className={styles.datosSedeTexto}>
        <strong>{punto.direccion.join(', ')}</strong>
        {punto.telefono && <><br />{punto.telefono}</>}
      </p>
      <p className={campos.ayuda}>
        Es un atelier propio: su dirección y su teléfono se cambian en su página, «{sede.contacto.nombre}», y de ahí pasan solos al mapa.
        Si cambia de calle, mueve también su punto aquí abajo, en «Dónde está».
      </p>
      <Link href={editorSede(sede.id)} className={styles.datosSedeEnlace}>Cambiar en «{sede.contacto.nombre}»</Link>
    </div>
  );
}

// El país: los que ya hay, o uno nuevo escrito a mano.
function ElegirPais({ valor, paises, onChange }) {
  const [otro, setOtro] = useState(() => Boolean(valor) && !paises.includes(valor));
  return (
    <div className={campos.campo}>
      <div className={campos.cabecera}>
        <label htmlFor="punto-pais" className={campos.etiqueta}>País</label>
      </div>
      <select
        id="punto-pais"
        className={campos.entrada}
        value={otro ? OTRO_PAIS : valor}
        onChange={(evento) => {
          if (evento.target.value === OTRO_PAIS) {
            setOtro(true);
            onChange('');
          } else {
            setOtro(false);
            onChange(evento.target.value);
          }
        }}
      >
        {paises.map((pais) => <option key={pais} value={pais}>{pais}</option>)}
        <option value={OTRO_PAIS}>Otro país…</option>
      </select>
      {otro && (
        <CampoLinea etiqueta="¿Qué país?" valor={valor} placeholder="Portugal" onChange={onChange} />
      )}
    </div>
  );
}

function EditarPunto({ puntoId, paisInicial }) {
  const router = useRouter();
  const { puntos, guardar } = usePuntosVenta();
  const sedes = useSedes();
  const esNuevo = puntoId === NUEVO;
  const paises = paisesDe(puntos).map(({ pais }) => pais);
  const [vacio] = useState(() => ({ ...nuevoPunto(), pais: paisInicial || 'España' }));
  const guardado = esNuevo ? vacio : puntos.find((punto) => punto.id === puntoId);

  if (!guardado) {
    return <p className={listado.vacio}>Este punto de venta no existe. <Link href={LISTADO}>Volver a Puntos de venta</Link></p>;
  }

  // En el editor, teléfono y email vacíos son '' (se guardan como null).
  const publicado = { ...guardado, telefono: guardado.telefono || '', email: guardado.email || '' };
  const idPrevia = (borrador) => borrador.id || 'nuevo-en-previa';

  return (
    <EditorPagina
      key={puntoId}
      id={ID_PREVIA_PUNTOS}
      titulo={esNuevo ? 'Nuevo punto de venta' : guardado.nombre}
      rutaWeb={RUTA_WEB_PUNTOS}
      bloques={BLOQUES}
      campos={camposPunto}
      publicado={publicado}
      datosPrevia={(borrador) => ({
        puntos: conPunto(puntos, { ...borrador, id: idPrevia(borrador), publicado: true }),
        enfocar: idPrevia(borrador),
      })}
      validarExtra={(borrador) => validarExtraPunto(borrador, puntos)}
      guardar={(borrador) => {
        const id = guardar(borrador);
        router.replace(`${BASE}?punto=${id}`);
      }}
      migas="Puntos de venta"
      volver={LISTADO}
      estadoPublicado={esNuevo ? 'Sin publicar' : (guardado.publicado ? 'En el mapa' : 'Oculto en la web')}
      textoPublicado={esNuevo ? 'Punto de venta publicado' : 'Cambios publicados'}
      enLaWeb={!esNuevo}
    >
      {(bloque, h) => {
        const linea = (ruta, props) => (
          <CampoLinea valor={h.leer(ruta) || ''} onChange={(valor) => h.cambiar(ruta, valor)} {...props} />
        );
        if (bloque.id === 'datos') {
          return (
            <div className={editorStyles.columnaTexto}>
              <div className={editorStyles.fichaCampos}>
                {linea(['nombre'], { etiqueta: 'Nombre de la tienda', placeholder: 'Boutique Tess' })}
                <ElegirPais valor={h.borrador.pais} paises={paises} onChange={(pais) => h.cambiar(['pais'], pais)} />
                {h.borrador.sede ? (
                  <DatosDeSede punto={conDatosDeSede(h.borrador, sedes)} sede={sedes(h.borrador.sede)} />
                ) : (
                  <>
                    <div className={editorStyles.dosColumnas}>
                      {linea(['direccion', 0], { etiqueta: 'Calle y número', placeholder: 'C/ Marqués de Molins 14' })}
                      {linea(['direccion', 1], { etiqueta: 'Ciudad y código postal', placeholder: 'Albacete 02001' })}
                    </div>
                    {linea(['telefono'], {
                      etiqueta: 'Teléfono', opcional: true, placeholder: '+34 967 60 74 47', ayuda: 'Con el prefijo del país (+34…), para poder llamar desde el móvil.',
                    })}
                  </>
                )}
                {linea(['email'], {
                  etiqueta: 'Email', opcional: true, tipo: 'email', placeholder: 'tienda@ejemplo.com',
                })}
              </div>
            </div>
          );
        }
        if (bloque.id === 'ubicacion') {
          const { direccion, pais } = conDatosDeSede(h.borrador, sedes);
          return (
            <SelectorUbicacion
              lat={h.borrador.lat}
              lng={h.borrador.lng}
              direccion={[...direccion, pais].filter((parte) => String(parte || '').trim()).join(', ')}
              onChange={({ lat, lng }) => { h.cambiar(['lat'], lat); h.cambiar(['lng'], lng); }}
            />
          );
        }
        return (
          <div className={editorStyles.medioYCampos}>
            {h.medio(['foto'], {
              etiqueta: 'Foto', detalle: 'Vertical', proporcion: '3 / 4', opcional: true,
            })}
          </div>
        );
      }}
    </EditorPagina>
  );
}

// ---------- Página ----------

function PestanasPuntos() {
  const { puntos } = usePuntosVenta();
  return <PestanasPagina etiqueta="Puntos de venta" pagina={BASE} listado={{ href: LISTADO, nombre: 'Puntos de venta', cuenta: puntos.length }} activa="pagina" />;
}

function AdminPuntosVenta() {
  const params = useSearchParams();
  const punto = params.get('punto');
  const pais = params.get('pais');
  if (punto) return <EditarPunto puntoId={punto} paisInicial={pais} />;
  if (pais || params.get('vista') === 'puntos') return <Listado pais={pais} />;
  return <AdminCabecera id="puntos-de-venta" migas="Dónde encontrarnos" pestanas={<PestanasPuntos />} />;
}

export default AdminPuntosVenta;
