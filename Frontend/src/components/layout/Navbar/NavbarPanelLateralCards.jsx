// NavbarPanelLateralCards.jsx

'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import styles from './NavbarPanelLateralContent.module.css';
import { atributosImagen } from '@/lib/imagenes';

/**
 * La imagen del submenú de escritorio — se pasa como "debajo" a
 * PanelLateral (ver Navbar.jsx), a la derecha de la lista de enlaces.
 * Una sola imagen cuadrada, sin texto encima: la primera de
 * "submenu.cards" (ver SUBMENU_STRUCTURE en Navbar.jsx; el resto de
 * cards se quedan en los datos por si se recupera la fila de dos). Se
 * dimensiona por ALTO (100% del panel), así que crece en proporción con
 * él — ver .submenuCards/.submenuImagen en
 * NavbarPanelLateralContent.module.css. El label ya no se pinta, pero
 * se mantiene como aria-label del enlace para lectores de pantalla.
 * "itemHover": el enlace de la lista con el ratón encima (ver Navbar.jsx)
 * — si trae "image", la imagen (y su enlace) pasan a ser los suyos; si
 * no, la de la primera card. key={src} en la <img> la remonta en cada
 * cambio para que entre con un fundido (.submenuImagen img).
 */
function NavbarPanelLateralCards({ submenuKey, submenu, itemHover }) {
  const t = useTranslations('nav');
  const locale = useLocale();

  const withLocale = (href) => (href === '/' ? `/${locale}` : `/${locale}${href}`);
  // Precarga las imágenes de todos los enlaces del submenú al abrirlo,
  // para que el cambio al pasar el ratón sea inmediato.
  useEffect(() => {
    submenu.items.forEach((item) => {
      if (item.image) new window.Image().src = item.image;
    });
  }, [submenu]);

  const card = submenu.cards[0];
  if (!card) return null;

  // includes(): ignora un itemHover que aún sea del submenú anterior
  // (el reset en Navbar.jsx llega un render después).
  const activo = itemHover?.image && submenu.items.includes(itemHover) ? itemHover : card;

  return (
    <div className={styles.submenuCards}>
      <a
        href={withLocale(activo.href)}
        className={styles.submenuImagen}
        aria-label={t(`submenus.${submenuKey}.${activo.labelKey || activo.key}`)}
      >
        {/* imagePosition (opcional, por item): encuadre del recorte —
            p.ej. Madrid enseña la parte de arriba de la foto. */}
        <img
          key={activo.image}
          {...atributosImagen(activo.image, { sizes: '(max-width: 768px) 100vw, 33vw' })}
          alt=""
          style={activo.imagePosition ? { objectPosition: activo.imagePosition } : undefined}
        />
      </a>
    </div>
  );
}

export default NavbarPanelLateralCards;
