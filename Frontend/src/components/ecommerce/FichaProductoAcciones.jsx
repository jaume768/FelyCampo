// FichaProductoAcciones.jsx

'use client';

/* ============================================================
   ACCIONES DE FICHA DE PRODUCTO — Fely Campo
   Panel interactivo de la ficha de producto (/pret-a-porter/[producto]):
   color (SelectorColor, ya existente) + el CTA "Contacta con nosotros"
   — el resto de la ficha (galería, acordeón, "también te puede
   interesar") vive directamente en page.js porque no necesita estado
   propio. Aparte porque page.js es un Server Component (resuelve el
   producto por slug) y esto sí necesita useState — no se puede
   repartir estado de un Server Component.

   Prêt-à-porter ya no vende con precio ni tallas online (a petición
   explícita) — mismo criterio que Atelier (ver InfoAtelier.jsx), así
   que este panel deja de tener SelectorTalla/GuiaTallas/"Añadir a la
   cesta" y pasa a un único CTA "Contacta con nosotros" que abre
   ModalSolicitudAtelier — el mismo formulario que las fichas de Atelier
   (antes ModalContactoProducto, solo nombre + email) — sin wishlist (BotonGuardar) tampoco, a diferencia de
   Atelier: aquí el botón ocupa el ancho completo solo.
   Uso:
     <FichaProductoAcciones nombre="Vestido Aurora" imagen="/img/aurora.jpg"
       colores={[...]} />
   ============================================================ */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SelectorColor, Boton } from '../ui';
import ModalSolicitudAtelier from './ModalSolicitudAtelier';
import styles from './FichaProductoAcciones.module.css';

function FichaProductoAcciones({ nombre, imagen, colores = [] }) {
  const t = useTranslations('producto');
  const [color, setColor] = useState(colores[0]?.nombre ?? null);
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className={styles.acciones}>
      {colores.length > 0 && (
        <SelectorColor colores={colores} seleccionado={color} onSelect={setColor} />
      )}

      <div className={styles.bloqueAnadir}>
        <Boton variante="solido" tamano="full" onClick={() => setModalAbierto(true)}>
          {t('contactar')}
        </Boton>
      </div>

      <ModalSolicitudAtelier
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        imagen={imagen}
        producto={nombre}
        color={color}
        colorHex={colores.find((candidato) => candidato.nombre === color)?.hex}
      />
    </div>
  );
}

export default FichaProductoAcciones;
