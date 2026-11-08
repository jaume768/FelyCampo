// LookPasarela.jsx

/* ============================================================
   LOOK DE PASARELA (placeholder) — Fely Campo
   Bloque "Runway look" de la ficha de producto (ver
   tienda/[producto]/page.js, debajo del Acordeon): título +
   foto de pasarela en formato fijo (200px de ancho, 3/4).

   PLACEHOLDER a propósito — de momento se renderiza SIEMPRE, con una
   imagen fija, para que el diseño pueda revisarse ya mismo. La lógica
   real (qué foto mostrar, y si mostrar el bloque siquiera) queda
   pendiente de conectar con el admin panel — ver la explicación
   completa en docs/design.md, sección "Look de pasarela (placeholder)".
   Uso:
     <LookPasarela titulo="Runway look" imagen="/img/collections/runway/fw27-lacoleccion/fely-campo-pasarela-la-coleccion-look-01.webp" alt="Fely Campo FW27" />
   ============================================================ */

import styles from './LookPasarela.module.css';
import { atributosImagen } from '@/lib/imagenes';

function LookPasarela({ titulo, imagen, alt }) {
  return (
    <div className={styles.lookPasarela}>
      <span className={styles.titulo}>{titulo}</span>
      <div className={styles.marco}>
        <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt={alt} className={styles.imagen} />
      </div>
    </div>
  );
}

export default LookPasarela;
