// InfoAtelier.jsx

'use client';

/* ============================================================
   INFO DE FICHA — ATELIER (Novias/Fiesta) — Fely Campo
   Parte interactiva de FichaProductoAtelier.jsx (cabecera + color +
   CTA) — aparte porque page.js/FichaProductoAtelier.jsx es un Server
   Component y esto necesita useState, mismo motivo que
   FichaProductoAcciones.jsx en /pret-a-porter/[producto].

   "sku": referencia real del look (ver noviaProductos.js) — se pinta
   debajo del nombre, encima de la descripción, solo si llega (Bride 27
   no trae sku, ver comentario de excepción en noviaProductos.js; el
   resto de Atelier con el catálogo de ejemplo tampoco).
   "colores": mismo SelectorColor que la ficha de Tienda, pero aquí NO
   cambia la foto de la galería al elegir uno (estas piezas no tienen
   variantes de imagen por color todavía) — es solo para que el equipo
   sepa qué color quiere el cliente al contactar. Por eso es
   obligatorio: sin color elegido, "Contacta con nosotros" no abre el
   modal, solo avisa (mismo patrón que avisoTalla en
   FichaProductoAcciones.jsx).
   ".fila": solo el CTA a todo el ancho — sin BotonGuardar (wishlist),
   quitado a petición: en los looks de Atelier no hace falta guardar.
   "Contacta con nosotros" abre ModalSolicitudAtelier.jsx (talla +
   datos de contacto + comentario) en vez de navegar directamente.
   Uso:
     <InfoAtelier imagen="/img/aurora.jpg" nombre="Vestido Aurora"
       descripcion="..." colores={[...]} tallas={[...]} />
   ============================================================ */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Boton, SelectorColor } from '../ui';
import ModalSolicitudAtelier from './ModalSolicitudAtelier';
import styles from './FichaProductoAtelier.module.css';

function InfoAtelier({ imagen, nombre, sku, descripcion, colores = [], tallas = [] }) {
  const t = useTranslations('producto');
  const [color, setColor] = useState(null);
  const [avisoColor, setAvisoColor] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const alContactar = () => {
    if (colores.length > 0 && !color) {
      setAvisoColor(true);
      return;
    }
    setModalAbierto(true);
  };

  return (
    <>
      <div className={styles.cabecera}>
        <h1 className={styles.nombre}>{nombre}</h1>
        {sku && <p className={styles.sku}>{t('sku')}: {sku}</p>}
        <p className={styles.descripcion}>{descripcion}</p>

        {colores.length > 0 && (
          <div className={styles.coloresFicha}>
            <SelectorColor
              colores={colores}
              seleccionado={color}
              onSelect={(valor) => { setColor(valor); setAvisoColor(false); }}
            />
          </div>
        )}
      </div>

      <div className={styles.bloqueContactar}>
        <div className={styles.fila}>
          <Boton variante="solido" tamano="full" onClick={alContactar}>
            {t('contactar')}
          </Boton>
        </div>
        {avisoColor && <p className={styles.avisoColor}>{t('avisoColor')}</p>}
      </div>

      <ModalSolicitudAtelier
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        imagen={imagen}
        producto={nombre}
        color={color}
        colorHex={colores.find((candidato) => candidato.nombre === color)?.hex}
        tallas={tallas}
      />
    </>
  );
}

export default InfoAtelier;
