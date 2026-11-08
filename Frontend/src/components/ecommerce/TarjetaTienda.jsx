/* ============================================================
   TARJETA DE TIENDA — Fely Campo
   Referente: styleguide.html #tarjeta-tienda (.sg-tienda).
   Uso:
     <TarjetaTienda imagen="/img/madrid.jpg" ciudad="Madrid"
        direccion="C/ Claudio Coello, 88" enlace="Cómo llegar" />
   ============================================================ */

import styles from './TarjetaTienda.module.css';
import { Boton } from '../ui';
import { atributosImagen } from '@/lib/imagenes';

function TarjetaTienda({ imagen, ciudad, direccion, enlace }) {
  return (
    <div className={styles.tienda}>
      <div className={styles.marco}>
        {imagen && <img {...atributosImagen(imagen, { sizes: '(max-width: 768px) 50vw, 25vw' })} alt={ciudad} className={styles.imagen} />}
      </div>
      <h3 className={styles.ciudad}>{ciudad}</h3>
      <p className={styles.direccion}>{direccion}</p>
      {enlace && (
        <div className={styles.enlace}>
          <Boton variante="texto">{enlace}</Boton>
        </div>
      )}
    </div>
  );
}

export default TarjetaTienda;
