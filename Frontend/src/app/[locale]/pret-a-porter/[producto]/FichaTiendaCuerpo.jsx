// FichaTiendaCuerpo.jsx

/* ============================================================
   FICHA DE PRÊT-À-PORTER — lo que se ve — Fely Campo
   Galería, nombre, descripción, color + «Contacta con nosotros»,
   acordeón y relacionados. Lo pinta page.js (servidor: busca el
   producto, los textos, el JSON-LD y el «Sigue explorando») y también la
   vista previa del admin (PreviaFichaTienda.jsx), con el borrador. Solo
   usa componentes cliente, así que vale para las dos.
   "textos": ya traducidos — { composicion: { titulo, texto, disenado,
   fabricado, etiquetaDisenado, etiquetaFabricado }, seguirExplorando }.
   El desplegable «Composición» usa la composición y el origen propios
   del producto (editables en el admin) y, si están vacíos, esos textos
   generales.
   ============================================================ */

import ProductosRecomendados from '@/components/layout/ProductosRecomendados';
import FichaProductoAcciones from '@/components/ecommerce/FichaProductoAcciones';
import GaleriaProducto from '@/components/ecommerce/GaleriaProducto';
import { Acordeon, Boton, FilaAcordeon } from '@/components/ui';
import { textoEn } from '@/lib/previa';
import styles from './page.module.css';

function FichaTiendaCuerpo({
  producto, descripcion, locale, relacionados = [], textos, hrefSeguirExplorando, antes = null, despues = null,
}) {
  const propio = (campo) => textoEn(producto[campo], locale);
  const general = textos.composicion;
  return (
    <section className={`seccion contenedor ${styles.debajoNavbar}`}>
      {antes}
      <div className={styles.ficha}>
        <GaleriaProducto
          imagenes={producto.imagenes?.length ? producto.imagenes : [producto.imagen]}
          alt={producto.nombre}
          nombre={producto.nombre}
          colores={producto.colores}
        />

        <div className={styles.info}>
          <div className={styles.bloquePrincipal}>
            <div className={styles.cabecera}>
              <h1 className={styles.nombre}>{producto.nombre}</h1>
              <p className={styles.descripcion}>{descripcion}</p>
            </div>

            <FichaProductoAcciones
              nombre={producto.nombre}
              imagen={producto.imagen}
              colores={producto.colores}
            />

            <Acordeon>
              <FilaAcordeon titulo={general.titulo}>
                <p className={styles.textoComposicion}>{propio('composicion') || general.texto}</p>
                <div>
                  <p>{propio('disenadoEn') ? `${general.etiquetaDisenado}: ${propio('disenadoEn')}` : general.disenado}</p>
                  <p>{propio('fabricadoEn') ? `${general.etiquetaFabricado}: ${propio('fabricadoEn')}` : general.fabricado}</p>
                </div>
              </FilaAcordeon>
            </Acordeon>
          </div>
        </div>
      </div>

      <div className={styles.debajoFicha}>
        {/* "Runway look" (LookPasarela) quitado a petición (2026-11-04): era
            un placeholder; el componente sigue en components/. Las reseñas
            de ejemplo se borraron el 2026-11-07. */}
        {relacionados.length > 0 && (
          <>
            <ProductosRecomendados productos={relacionados} ocultarPrecio />
            <div className={styles.seguirExplorando}>
              <Boton variante="solido" href={hrefSeguirExplorando}>{textos.seguirExplorando}</Boton>
            </div>
          </>
        )}
      </div>
      {despues}
    </section>
  );
}

export default FichaTiendaCuerpo;
