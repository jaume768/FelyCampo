// FichaAtelierCuerpo.jsx

/* ============================================================
   FICHA DE ATELIER — lo que se ve — Fely Campo
   El cuerpo de la ficha de un look de Atelier (Novias/Fiesta): galería,
   nombre, referencia, descripción, acordeón y relacionados. Lo pinta
   FichaProductoAtelier.jsx (servidor: busca el look, los textos y el
   JSON-LD) y también la vista previa del admin (PreviaFichaFiesta.jsx),
   con el borrador. Solo usa componentes cliente, así que vale para las
   dos.
   "textos": lo que ya viene traducido del servidor —
     { acordeon: <FilaAcordeon>…</FilaAcordeon>, seguirExplorando }.
   ============================================================ */

import ProductosRecomendados from '@/components/layout/ProductosRecomendados';
import { Acordeon, Boton } from '@/components/ui';
import GaleriaProducto from './GaleriaProducto';
import InfoAtelier from './InfoAtelier';
import styles from './FichaProductoAtelier.module.css';

function FichaAtelierCuerpo({
  producto, nombreVisible, descripcion, relacionados = [], seccion, locale, textos, antes = null, despues = null,
}) {
  return (
    <section className={`seccion contenedor ${styles.debajoNavbar}`}>
      {antes}
      <div className={styles.ficha}>
        <GaleriaProducto
          imagenes={producto.imagenes?.length ? producto.imagenes : [producto.imagen]}
          alt={nombreVisible}
          nombre={nombreVisible}
          colores={producto.colores}
          tallas={producto.tallas}
          esAtelier
        />

        <div className={styles.info}>
          <InfoAtelier
            imagen={producto.imagen}
            nombre={nombreVisible}
            sku={producto.sku}
            descripcion={descripcion}
            colores={producto.colores}
            tallas={producto.tallas}
          />

          <Acordeon>{textos.acordeon}</Acordeon>

        </div>
      </div>

      <div className={styles.debajoFicha}>
        {relacionados.length > 0 && (
          <ProductosRecomendados
            productos={relacionados}
            hrefBase={`atelier/${seccion}`}
            ocultarPrecio
          />
        )}

        <div className={styles.seguirExplorando}>
          <Boton variante="solido" href={`/${locale}/atelier/${seccion}`}>
            {textos.seguirExplorando}
          </Boton>
        </div>
      </div>
      {despues}
    </section>
  );
}

export default FichaAtelierCuerpo;
