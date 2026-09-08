// InfoAtelier.jsx

'use client';

/* ============================================================
   INFO DE FICHA — ATELIER (Novias/Fiesta) — Fely Campo
   Parte interactiva de FichaProductoAtelier.jsx (cabecera + color +
   CTA) — aparte porque page.js/FichaProductoAtelier.jsx es un Server
   Component y esto necesita useState, mismo motivo que
   FichaProductoAcciones.jsx en /tienda/[producto].

   "colores": mismo SelectorColor que la ficha de Tienda, pero aquí NO
   cambia la foto de la galería al elegir uno (estas piezas no tienen
   variantes de imagen por color todavía) — es solo para que el equipo
   sepa qué color quiere el cliente al contactar. Por eso es
   obligatorio: sin color elegido, "Contacta con nosotros" no abre el
   modal, solo avisa (mismo patrón que avisoTalla en
   FichaProductoAcciones.jsx).
   ".fila" (Boton + BotonGuardar): mismo patrón que .fila de
   FichaProductoAcciones.jsx en Tienda — el CTA principal reparte el
   ancho con el botón de wishlist, en vez de ir solo a todo el ancho.
   "Contacta con nosotros" abre ModalSolicitudAtelier.jsx (talla +
   datos de contacto + comentario) en vez de navegar directamente.
   Uso:
     <InfoAtelier imagen="/img/aurora.jpg" nombre="Vestido Aurora"
       descripcion="..." colores={[...]} tallas={[...]} />
   ============================================================ */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Boton, SelectorColor, BotonGuardar } from '../ui';
import ModalSolicitudAtelier from './ModalSolicitudAtelier';
import styles from './FichaProductoAtelier.module.css';

function InfoAtelier({ imagen, nombre, descripcion, colores = [], tallas = [], productoSlug }) {
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
          <BotonGuardar variante="solido" />
        </div>
        {avisoColor && <p className={styles.avisoColor}>{t('avisoColor')}</p>}
      </div>

      <ModalSolicitudAtelier
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        imagen={imagen}
        producto={nombre}
        productoSlug={productoSlug}
        color={color}
        colorHex={colores.find((candidato) => candidato.nombre === color)?.hex}
        tallas={tallas}
      />
    </>
  );
}

export default InfoAtelier;
