'use client';

/* ============================================================
   PANEL DE CARRITO — Fely Campo
   Se abre automáticamente al añadir un producto (ver agregar() en
   CarritoContext) — mismo PanelLateral que el submenú del Navbar/
   GuiaTallas, desde la derecha. A diferencia de GuiaTallas (montado
   por cada ficha de producto), este vive montado una sola vez en
   Navbar: el carrito es global, no de una página.
   ============================================================ */

import { X, ShoppingBag } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { PanelLateral, Boton } from '../ui';
import { useCarrito } from '@/context/CarritoContext';
import LineaCarrito from './LineaCarrito';
import styles from './CarritoPanel.module.css';

function CarritoPanel() {
  const t = useTranslations('carrito');
  const locale = useLocale();
  const { lineas, panelAbierto, cerrarPanel, quitar, actualizarCantidad } = useCarrito();

  return (
    <PanelLateral abierto={panelAbierto} onCerrar={cerrarPanel} lado="derecha" atraparFoco claseContenido={styles.contenido} ancho="380px">
      <div className={styles.cabecera}>
        <h2 className={styles.titulo}>{t('titulo')}</h2>
        <button type="button" className={styles.cerrar} onClick={cerrarPanel} aria-label={t('cerrar')}>
          <X size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
        </button>
      </div>

      {lineas.length === 0 ? (
        <p className={styles.vacio}>{t('vacio')}</p>
      ) : (
        <>
          {/* Lista con su propio scroll (flex:1 + overflow-y:auto sobre
              un .contenido de alto 100%, ver claseContenido en
              PanelLateral.jsx) — cabecera y botones de abajo quedan
              siempre en el mismo sitio, nunca se mueven ni al llegar
              al final del scroll. */}
          <div className={styles.lista}>
            {lineas.map((linea) => (
              <LineaCarrito
                key={linea.id}
                imagen={linea.imagen}
                nombre={linea.nombre}
                talla={linea.talla}
                color={linea.color}
                colorHex={linea.colorHex}
                precio={linea.precio}
                cantidad={linea.cantidad}
                onCantidad={(cantidad) => actualizarCantidad(linea.id, cantidad)}
                onQuitar={() => quitar(linea.id)}
              />
            ))}
          </div>

          <div className={styles.acciones}>
            <Boton variante="contorno" tamano="full" href={`/${locale}/carrito`} onClick={cerrarPanel}>
              <ShoppingBag size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" />
              {t('verCarrito')}
            </Boton>
            <Boton variante="solido" tamano="full">{t('pagar')}</Boton>
          </div>
        </>
      )}
    </PanelLateral>
  );
}

export default CarritoPanel;
