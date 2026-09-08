/* ============================================================
   ESTADO PUBLICACIÓN BADGE — Fely Campo (admin)
   A diferencia de <Etiqueta> (texto plano, sin fondo — criterio de
   styleguide.html para la web pública), este badge SÍ lleva fondo de
   color: es solo para las tablas del panel interno, donde detectar
   el estado de un vistazo importa más que la coherencia editorial.
   Uso: <EstadoPublicacionBadge estado={producto.estado} />
   ============================================================ */

import styles from './EstadoPublicacionBadge.module.css';

// `clase` la reutiliza TabsFiltro para pintar sus pestañas con el mismo
// fondo/color que este badge (ver TabsFiltro.module.css — misma clase,
// mismos valores; no se puede leer un CSS module desde otro).
const CONFIG = {
  publicado: { etiqueta: 'Publicado', clase: 'publicado' },
  programado: { etiqueta: 'Esperando a publicar', clase: 'programado' },
  borrador: { etiqueta: 'Borrador', clase: 'borrador' },
  archivado: { etiqueta: 'Archivado', clase: 'archivado' },
};

function calcularEstadoPublicacion(estado) {
  if (estado === 'Activo') return 'publicado';
  if (estado === 'Archivado') return 'archivado';
  if (estado === 'Programado') return 'programado';
  return 'borrador';
}

function EstadoPublicacionBadge({ estado }) {
  const { etiqueta, clase } = CONFIG[calcularEstadoPublicacion(estado)];
  return <span className={`${styles.badge} ${styles[clase]}`}>{etiqueta}</span>;
}

export default EstadoPublicacionBadge;
export { calcularEstadoPublicacion, CONFIG as CONFIG_ESTADO_PUBLICACION };
