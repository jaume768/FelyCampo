/* ============================================================
   ESTADO BADGE — Fely Campo (admin)
   Envuelve Etiqueta (texto plano, sin fondo ni pill) y solo decide
   qué variante de color le corresponde a cada estado del panel.
   Uso: <EstadoBadge estado="Activo" /> <EstadoBadge estado="Pendiente" />
   ============================================================ */

import { Etiqueta } from '../ui';

const VARIANTE_POR_ESTADO = {
  Activo: 'tinta',
  Publicado: 'tinta',
  Pagado: 'tinta',
  Entregado: 'tinta',
  Cerrado: 'tinta',
  Publicada: 'tinta',

  Borrador: 'rosa',
  Pendiente: 'rosa',
  Procesando: 'rosa',
  Contactado: 'rosa',

  Archivado: 'velo',
  Enviado: 'velo',
  Oculta: 'velo',
  Oculto: 'velo',
  Inactivo: 'velo',

  Fallido: 'agotado',
  Agotado: 'agotado',
};

function EstadoBadge({ estado }) {
  return <Etiqueta variante={VARIANTE_POR_ESTADO[estado] || 'tinta'}>{estado}</Etiqueta>;
}

export default EstadoBadge;
