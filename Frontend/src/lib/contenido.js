// contenido.js — el contenido de la web, ya cargado de la base de datos.
//
// Antes las funciones obtener…() de src/lib/ devolvían los archivos de
// src/datos/. Ahora devuelven lo que hay en este almacén, que se llena así:
//
// - Servidor (Server Components): cargarContenido() de contenidoServidor.js
//   pide TODOS los documentos a la API en una sola petición, cacheada por
//   Next con la etiqueta «contenido» (se invalida al publicar desde el
//   panel). Cada página y layout la esperan antes de renderizar.
// - Navegador y SSR de componentes de cliente: <ContenidoCliente claves>
//   (components/layout/ContenidoCliente.jsx) pasa SOLO los documentos que
//   esos componentes necesitan (no los 500 KB enteros a cada visita).
// - Panel: ContenidoAdmin.jsx carga los 19 al abrirse y lo mantiene al día
//   al publicar.
//
// El contenido es el mismo para todo el mundo, así que un almacén por
// proceso es correcto: no hay datos de una persona que puedan cruzarse.
//
// Por qué funciones síncronas y no await en cada sitio: así las ~40
// pantallas y componentes de Miriam que llaman a obtener…() no cambian.

let documentos = {};

export function fijarContenido(nuevos) {
  documentos = { ...documentos, ...nuevos };
}

export function contenido(clave) {
  if (!(clave in documentos)) {
    // Se ha llamado a un obtener…() en un sitio al que no ha llegado ese
    // documento (falta en <ContenidoCliente claves>, o no se esperó a
    // cargarContenido()). Mejor fallar claro que enseñar algo vacío.
    throw new Error(`Contenido «${clave}» no cargado aquí (ver src/lib/contenido.js).`);
  }
  return documentos[clave];
}

// Memoriza un cálculo sobre un documento mientras el documento no cambie
// (misma referencia): p. ej. las colecciones con los looks ordenados.
export function derivado(clave, calcular) {
  let origen;
  let valor;
  return () => {
    const actual = contenido(clave);
    if (actual !== origen) {
      origen = actual;
      valor = calcular(actual);
    }
    return valor;
  };
}
