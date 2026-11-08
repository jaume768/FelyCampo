// <ContenidoCliente claves={[…]}> — pasa al navegador SOLO los documentos
// de contenido que usan los componentes de cliente que envuelve.
//
// Server Component: lee del almacén del servidor (ya cargado con
// cargarContenido()) y se lo da a HidratarContenido, que lo deja en el del
// navegador. Mandar los 19 documentos (~520 KB) en cada página sería
// tirar el trabajo de rendimiento; por eso cada sitio pide los suyos:
//
// - app/[locale]/layout.js: los del marco común (menú, pie, cabeceras,
//   ateliers, contacto).
// - cada página: lo que necesite además (p. ej. «vosotras» en
//   /atelier/vosotras o «puntos-venta» en el mapa).
//
// Si un componente de cliente pide un documento que no ha llegado,
// contenido() lanza un error con su clave: es la pista de qué añadir aquí.

import { contenido } from '@/lib/contenido';
import HidratarContenido from './HidratarContenido';

export default function ContenidoCliente({ claves, children }) {
  const documentos = Object.fromEntries(claves.map((clave) => [clave, contenido(clave)]));
  return <HidratarContenido documentos={documentos}>{children}</HidratarContenido>;
}

// El marco común de todas las páginas (Navbar, pie, WhatsApp, cabeceras,
// newsletter, tarjetas de los ateliers).
export const CLAVES_MARCO = ['piezas-comunes', 'contacto', 'cabeceras', 'sedes'];
