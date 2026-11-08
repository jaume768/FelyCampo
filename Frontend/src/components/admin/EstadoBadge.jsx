/* ============================================================
   ESTADO BADGE — Fely Campo (admin)
   La etiqueta de estado de todas las tablas del panel (citas,
   consultas, pedidos, clientes, reseñas…): siempre una etiqueta de color
   del mismo tamaño, con los mismos colores en todas partes (como
   «Publicado / Oculto» de los listados y los estados de Pedidos):
     verde     hecho / va bien       (Publicada, Pagado, Contactada…)
     rosa      necesita atención     (Pendiente, Borrador…)
     amarillo  en camino             (Enviado, Procesando)
     gris      archivado / oculto    (Oculta, Cerrado, Inactivo…)
     tachado   fallido / agotado
   Uso: <EstadoBadge estado="Pendiente" />
   ============================================================ */

import styles from './EstadoBadge.module.css';

const TONO_POR_ESTADO = {
  Activo: 'verde',
  Publicado: 'verde',
  Publicada: 'verde',
  Pagado: 'verde',
  Entregado: 'verde',
  Contactado: 'verde',
  Contactada: 'verde',
  'Cita confirmada': 'verde',

  Borrador: 'rosa',
  Pendiente: 'rosa',

  Procesando: 'amarillo',
  Enviado: 'amarillo',

  Cerrado: 'gris',
  Cerrada: 'gris',
  Archivado: 'gris',
  Oculta: 'gris',
  Oculto: 'gris',
  Inactivo: 'gris',

  Fallido: 'tachado',
  Agotado: 'tachado',
};

function EstadoBadge({ estado }) {
  const tono = TONO_POR_ESTADO[estado] || 'gris';
  return <span className={`${styles.badge} ${styles[tono]}`}>{estado}</span>;
}

export default EstadoBadge;
