// NavbarPanelLateralCards.jsx

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { MediaLink } from '../../ui';
import styles from './NavbarPanelLateralContent.module.css';

/**
 * Los MediaLink del submenú de escritorio — se pasan como "debajo" a
 * PanelLateral (ver Navbar.jsx), fuera de .contenido, así ocupan el
 * ancho completo del panel en vez del hueco recortado por su padding
 * lateral. Dos por defecto; "cardsUnico" en SUBMENU_STRUCTURE (Tienda,
 * Visítanos) deja solo uno, que ocupa todo el ancho (mismo .card
 * flex:1 de MediaLink, sin necesitar CSS aparte). Mismo criterio que
 * NavbarPanelLateralContent: sabe de locales, traducciones y la forma
 * de SUBMENU_STRUCTURE.
 */
function NavbarPanelLateralCards({ submenuKey, submenu }) {
  const t = useTranslations('nav');
  const locale = useLocale();

  const withLocale = (href) => (href === '/' ? `/${locale}` : `/${locale}${href}`);
  const cardItems = submenu.items.slice(0, submenu.cardsUnico ? 1 : 2);

  return (
    <div className={styles.submenuCards}>
      {cardItems.map((item) => (
        <MediaLink
          key={item.key}
          href={withLocale(item.href)}
          image={submenu.image}
          label={t(`submenus.${submenuKey}.${item.labelKey || item.key}`)}
          variante={submenu.cardsUnico ? 'ancho' : undefined}
        />
      ))}
    </div>
  );
}

export default NavbarPanelLateralCards;
