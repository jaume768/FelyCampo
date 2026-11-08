'use client';

// Deja en el almacén del navegador (src/lib/contenido.js) los documentos
// que le pasa <ContenidoCliente>, ANTES de que se pinten sus hijos: así los
// componentes de cliente de Miriam pueden seguir llamando a obtener…() sin
// cambiar. Escribir durante el render es intencionado y seguro aquí: es
// idempotente (mismos datos, mismo resultado) y el padre se renderiza
// siempre antes que los hijos.

import { fijarContenido } from '@/lib/contenido';

export default function HidratarContenido({ documentos, children }) {
  fijarContenido(documentos);
  return children;
}
