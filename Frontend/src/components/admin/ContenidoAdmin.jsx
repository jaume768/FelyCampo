'use client';

/* ============================================================
   CONTENIDO DEL PANEL — Fely Campo
   El puente entre las pantallas del panel (Miriam) y la base de datos.

   Al abrir el panel carga los 19 documentos de contenido con su versión
   (GET /api/v1/admin/content/?con_datos=1). Cada proveedor de sección
   (Paginas, Blog, Vosotras, catálogos…) usa
       const [datos, setDatos] = useDocumentoAdmin('clave');
   en lugar de su antiguo useState: mismo uso (setDatos(valor) o
   setDatos((actual) => nuevo)), pero cada cambio se PUBLICA:

   1. Se aplica al momento en pantalla (y en la vista previa).
   2. Las fotos y vídeos recién elegidos (URL «blob:» del navegador) se
      suben a la biblioteca de medios y se sustituyen por su URL definitiva.
   3. PUT /api/v1/admin/content/<clave>/ con la versión cargada. Django
      avisa a la web, que lo enseña en la siguiente visita.

   Los cambios de un mismo documento van en cola, uno detrás de otro.
   Si falla o si otra persona ha publicado entretanto (409), se avisa, se
   descarta lo pendiente de ese documento y se carga lo publicado: nadie
   pisa el trabajo de otra persona sin enterarse. El editor conserva su
   borrador, así que basta con revisarlo y volver a publicar.
   ============================================================ */

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { apiFetch, ErrorApi } from '@/lib/api';
import { fijarContenido } from '@/lib/contenido';
import { useToast } from './Toast';

const ContenidoContext = createContext(null);

// Para los avisos: cómo se llama cada documento en el panel.
const NOMBRES = {
  landing: 'Página de inicio',
  'piezas-comunes': 'Menú, Pedir cita y newsletter',
  'seo-textos': 'Textos de Google',
  'sobre-fely': 'Historia de Fely',
  talleres: 'Nuestros talleres',
  contacto: 'Contacto y redes',
  cabeceras: 'Cabeceras de las páginas',
  sedes: 'Ateliers',
  'puntos-venta': 'Puntos de venta',
  vosotras: 'Vosotras',
  articulos: 'Blog',
  episodios: 'Podcast',
  'editorial-novias': 'Página de Novias',
  'editorial-fiesta': 'Página de Fiesta',
  'editorial-pret-a-porter': 'Página de Prêt-à-porter',
  'colecciones-fiesta': 'Colección Fiesta',
  'colecciones-novias': 'Colección Novias',
  'colecciones-runway': 'Runway',
  'productos-pret-a-porter': 'Prêt-à-porter',
};

const EXTENSIONES = {
  'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};

// Recorre el documento y sustituye cada «blob:…» (foto o vídeo elegido en
// este navegador) por lo que devuelva subir(). Devuelve el mismo objeto si
// no había nada que subir.
async function conMediosSubidos(valor, subir) {
  if (typeof valor === 'string') return valor.startsWith('blob:') ? subir(valor) : valor;
  if (Array.isArray(valor)) {
    const nuevo = await Promise.all(valor.map((item) => conMediosSubidos(item, subir)));
    return nuevo.some((item, i) => item !== valor[i]) ? nuevo : valor;
  }
  if (valor && typeof valor === 'object') {
    const entradas = await Promise.all(
      Object.entries(valor).map(async ([k, v]) => [k, await conMediosSubidos(v, subir)]),
    );
    return entradas.some(([k, v]) => v !== valor[k]) ? Object.fromEntries(entradas) : valor;
  }
  return valor;
}

function mensajeDeError(error) {
  const detalle = error?.details && Object.values(error.details).flat().find((d) => typeof d === 'string');
  return detalle || error?.message || 'error desconocido';
}

export function ContenidoAdminProvider({ children }) {
  const { mostrarToast } = useToast();
  const [documentos, setDocumentos] = useState(null);
  const [errorCarga, setErrorCarga] = useState(null);
  const [pendientes, setPendientes] = useState(0);

  const docsRef = useRef({});
  const versiones = useRef({});
  const colas = useRef({});
  const generacion = useRef({});
  // blob: ya subido → su URL definitiva (un mismo archivo no se sube dos
  // veces aunque se publique varias veces seguidas).
  const subidas = useRef(new Map());

  const aplicar = useCallback((clave, datos) => {
    docsRef.current = { ...docsRef.current, [clave]: datos };
    // Las funciones de src/lib/ (obtener…) que usan las pantallas y la
    // vista previa leen del almacén: tiene que ir al día.
    fijarContenido({ [clave]: datos });
    setDocumentos(docsRef.current);
  }, []);

  const cargar = useCallback(async () => {
    setErrorCarga(null);
    try {
      const lista = await apiFetch('/admin/content/?con_datos=1');
      const datos = {};
      for (const doc of lista) {
        datos[doc.key] = doc.data;
        versiones.current[doc.key] = doc.version;
      }
      docsRef.current = datos;
      fijarContenido(datos);
      setDocumentos(datos);
    } catch (error) {
      setErrorCarga(mensajeDeError(error));
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Avisar antes de cerrar la pestaña con cambios aún sin guardar.
  useEffect(() => {
    if (!pendientes) return undefined;
    const aviso = (evento) => { evento.preventDefault(); evento.returnValue = ''; };
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [pendientes]);

  const subirMedio = useCallback(async (url, clave) => {
    const [base, fragmento] = url.split('#');
    const sufijo = fragmento ? `#${fragmento}` : '';
    if (subidas.current.has(base)) return subidas.current.get(base) + sufijo;
    const blob = await fetch(base).then((r) => r.blob());
    const nombre = `fely-campo-${clave}`;
    const archivo = new File([blob], `${nombre}.${EXTENSIONES[blob.type] || 'bin'}`, { type: blob.type });
    const formulario = new FormData();
    formulario.append('file', archivo);
    formulario.append('nombre', nombre);
    const medio = await apiFetch('/admin/media/', { method: 'POST', body: formulario });
    // La API devuelve la URL absoluta; en el contenido se guarda la ruta
    // (/media/…), que vale igual en producción (Caddy) y en desarrollo.
    const ruta = new URL(medio.file, window.location.origin).pathname;
    subidas.current.set(base, ruta);
    return ruta + sufijo;
  }, []);

  const recargarDocumento = useCallback(async (clave) => {
    const doc = await apiFetch(`/admin/content/${clave}/`);
    versiones.current[clave] = doc.version;
    aplicar(clave, doc.data);
    return doc;
  }, [aplicar]);

  const publicar = useCallback((clave, valorOFuncion) => {
    const anterior = docsRef.current[clave];
    const nuevo = typeof valorOFuncion === 'function' ? valorOFuncion(anterior) : valorOFuncion;
    aplicar(clave, nuevo);

    const miGeneracion = generacion.current[clave] || 0;
    const nombre = NOMBRES[clave] || clave;
    setPendientes((n) => n + 1);

    const tarea = (colas.current[clave] || Promise.resolve()).then(async () => {
      // Tras un error se descarta lo que estaba en cola para este documento:
      // se construyó sobre una versión que ya no es la buena.
      if ((generacion.current[clave] || 0) !== miGeneracion) return;
      const datos = await conMediosSubidos(nuevo, (url) => subirMedio(url, clave));
      const respuesta = await apiFetch(`/admin/content/${clave}/`, {
        method: 'PUT',
        body: { data: datos, version: versiones.current[clave] },
      });
      versiones.current[clave] = respuesta.version;
      // Si mientras tanto no ha habido más cambios, se queda lo del servidor
      // (con las URL definitivas de lo subido).
      if (docsRef.current[clave] === nuevo) aplicar(clave, respuesta.data);
    }).catch(async (error) => {
      generacion.current[clave] = miGeneracion + 1;
      if (error instanceof ErrorApi && error.code === 'version_conflict') {
        const quien = error.details?.updated_by ? ` (${error.details.updated_by})` : '';
        mostrarToast(`Otra persona${quien} ha publicado cambios en «${nombre}» mientras editabas. Se ha cargado su versión: revisa y vuelve a publicar.`, 9000);
      } else {
        mostrarToast(`No se ha podido guardar «${nombre}»: ${mensajeDeError(error)}. Se ha vuelto a cargar lo publicado.`, 9000);
      }
      try {
        await recargarDocumento(clave);
      } catch {
        // Sin conexión: se queda lo de pantalla; el siguiente guardado lo reintentará.
      }
    }).finally(() => setPendientes((n) => n - 1));

    colas.current[clave] = tarea;
    return tarea;
  }, [aplicar, mostrarToast, recargarDocumento, subirMedio]);

  if (errorCarga) {
    return (
      <div role="alert" style={{ padding: '48px 32px', maxWidth: 560 }}>
        <p style={{ marginBottom: 16 }}>No se ha podido cargar el contenido de la web: {errorCarga}</p>
        <button type="button" onClick={cargar} style={{ padding: '10px 20px', cursor: 'pointer' }}>Reintentar</button>
      </div>
    );
  }
  if (!documentos) {
    return <p role="status" style={{ padding: '48px 32px' }}>Cargando el contenido de la web…</p>;
  }

  return (
    <ContenidoContext.Provider value={{ documentos, publicar, pendientes }}>
      {children}
      {pendientes > 0 && (
        <div
          role="status"
          style={{
            position: 'fixed', right: 24, bottom: 24, zIndex: 1000, padding: '10px 16px',
            background: '#202020', color: '#fff', fontSize: 13,
          }}
        >
          Guardando…
        </div>
      )}
    </ContenidoContext.Provider>
  );
}

export function useContenidoAdmin() {
  const contexto = useContext(ContenidoContext);
  if (!contexto) throw new Error('useContenidoAdmin debe usarse dentro de <ContenidoAdminProvider>');
  return contexto;
}

// Igual que useState, pero guarda en la base de datos: [datos, setDatos].
export function useDocumentoAdmin(clave) {
  const { documentos, publicar } = useContenidoAdmin();
  const setDatos = useCallback((valorOFuncion) => publicar(clave, valorOFuncion), [clave, publicar]);
  return [documentos[clave], setDatos];
}
