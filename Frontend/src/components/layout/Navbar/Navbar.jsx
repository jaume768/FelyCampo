// Navbar.jsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import styles from './Navbar.module.css';
import { PanelLateral } from '../../ui';
import CarritoPanel from '../../ecommerce/CarritoPanel';
import MiCuentaModal from '../../ecommerce/MiCuentaModal';
import { useCarrito } from '@/context/CarritoContext';
import { useMiCuenta } from '@/context/MiCuentaContext';
import NavbarPanelLateralContent from './NavbarPanelLateralContent';
import NavbarPanelLateralCards from './NavbarPanelLateralCards';

// Enlaces con submenú (Tienda, Atelier — coinciden con las categorías
// reales del sitemap). El resto son enlaces simples, sin panel.
// Los labels viven en messages/{locale}.json bajo el namespace "nav" —
// aquí solo se guarda la estructura (hrefs, claves de traducción, imagen).
const SUBMENU_STRUCTURE = {
  tienda: {
    // "verTodos" va primero a propósito: alimenta tanto la lista de
    // texto (arriba del todo) como la única MediaLink de este submenú
    // (cardsUnico, toma items[0] — ver NavbarPanelLateralCards.jsx), así
    // la imagen enlaza y rotula "Ver todos" en vez de una categoría.
    items: [
      { key: 'verTodos', href: '/tienda' },
      { key: 'tops', href: '/tienda/tops-y-camisetas' },
      { key: 'coats', href: '/tienda/chaquetas-y-abrigos' },
      { key: 'faldas', href: '/tienda/faldas' },
      { key: 'vestidos', href: '/tienda/vestidos' },
      { key: 'zapatos', href: '/tienda/zapatos' },
      { key: 'accesorios', href: '/tienda/accesorios' },
    ],
    image: '/img/styleguide/prod-tarjeta.webp',
    // Una sola imagen a todo el ancho en vez de las dos MediaLink
    // habituales (ver NavbarPanelLateralCards.jsx).
    cardsUnico: true,
  },
  atelier: {
    items: [
      // "labelKey": el submenú enseña "Colección Novias"/"Colección
      // Fiesta" (nav.submenus.atelier.noviasSubmenu/fiestaSubmenu),
      // distinto del "Novias"/"Fiesta" que usan la miga de pan y el
      // título de CabeceraSeccion en esas mismas páginas
      // (nav.submenus.atelier.novias/fiesta, ver
      // CuadriculaProductos.jsx) — mismo "key"/href para todo lo
      // demás (routing, "key" de React), ver NavbarPanelLateralContent.jsx.
      { key: 'novias', href: '/atelier/novias', labelKey: 'noviasSubmenu' },
      { key: 'fiesta', href: '/atelier/fiesta', labelKey: 'fiestaSubmenu' },
      { key: 'vosotras', href: '/atelier/vosotras' },
    ],
    image: '/img/styleguide/punto-venta.webp',
  },
  elMundoDeFely: {
    items: [
      { key: 'blog', href: '/blog' },
      { key: 'historia', href: '/sobre-fely' },
      { key: 'runway', href: '/archivo/runway' },
      { key: 'talleres', href: '/sobre-fely/talleres' },
    ],
    image: '/img/styleguide/prod-tarjeta-relacionado.webp',
  },
  visitanos: {
    items: [
      { key: 'salamanca', href: '/visita-fely-campo/salamanca' },
      { key: 'madrid', href: '/visita-fely-campo/madrid' },
      { key: 'oviedo', href: '/visita-fely-campo/oviedo' },
      { key: 'puntosDeVenta', href: '/visita-fely-campo' },
      { key: 'reservarCita', href: '/visita-fely-campo/cita' },
    ],
    image: '/img/styleguide/prod-tarjeta-hover.webp',
    // Una sola imagen a todo el ancho en vez de las dos MediaLink
    // habituales (ver NavbarPanelLateralCards.jsx).
    cardsUnico: true,
  },
};

const NAV_ITEMS = [
  { key: 'atelier', href: '/atelier', submenu: 'atelier' },
  { key: 'tienda', href: '/tienda', submenu: 'tienda' },
  { key: 'elMundoDeFely', href: '/sobre-fely', submenu: 'elMundoDeFely' },
  { key: 'visitanos', href: '/visita-fely-campo', submenu: 'visitanos' },
];

const CLOSE_DELAY_MS = 200;
const SCROLL_THRESHOLD_PX = 50;

function Navbar({ transparent = false, crecerLogo = false }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  // `cargando`: el carrito viene del servidor, así que el contador no es instantáneo en
  // el primer render. Se oculta mientras carga en vez de parpadear un 0 falso.
  const { cantidadTotal, cargando: carritoCargando } = useCarrito();
  // Con sesión iniciada, "Mi cuenta" deja de abrir el modal y lleva al panel: abrir un
  // formulario de login a quien ya ha entrado no tiene sentido.
  const { abrir: abrirMiCuenta, haySesion, usuario } = useMiCuenta();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [lastSubmenu, setLastSubmenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  // ¿La página que se está viendo AHORA tiene hero? Arranca con lo que dijo el servidor
  // (correcto en la primera carga y sin JS) y se corrige en cada navegación.
  const [hayHero, setHayHero] = useState(transparent);
  const closeTimeout = useRef(null);
  const headerLeaveTimeout = useRef(null);

  useEffect(() => () => {
    clearTimeout(closeTimeout.current);
    clearTimeout(headerLeaveTimeout.current);
  }, []);

  // Solo importa combinado con la prop "transparent" (ver Navbar.module.css):
  // decide si el fondo pasa de transparente a blanco al hacer scroll.
  // Si la página trae un Hero marcado con data-navbar-hero (home,
  // ProductHero en Tienda/Atelier), se usa un IntersectionObserver
  // sobre ese bloque en vez del umbral fijo: "scrolled" pasa a true
  // al 80% de scroll del Hero (threshold 0.2 — cuando solo queda un
  // 20% de su alto por asomar, sea cual sea ese alto: 105dvh en home,
  // 50vh en ProductHero), no cuando ya ha desaparecido del todo — así
  // el fondo blanco no llega "tarde" justo antes de que el Hero se
  // acabe. Mismo criterio de observer que ya usa el Footer más abajo.
  // Sin Hero en la página (o sin soporte de IntersectionObserver), cae
  // al umbral fijo de siempre. Depende de "pathname": el layout no
  // desmonta Navbar al navegar entre rutas, así que hay que re-buscar
  // el Hero de la página nueva.
  useEffect(() => {
    const heroMarcador = document.querySelector('[data-navbar-hero]');

    // La transparencia solo es válida si esta página TIENE hero: el header en modo
    // transparente pinta el texto y el logo en blanco, así que sobre una página de fondo
    // claro y sin hero desaparece por completo. Es lo que pasaba en el carrito y en el
    // checkout al llegar navegando desde la tienda: `transparent` lo decide el layout en
    // SERVIDOR a partir de `x-pathname`, y Next NO vuelve a renderizar un layout
    // compartido al navegar por cliente — el Navbar se quedaba con el valor de la página
    // anterior. Se corrige aquí, que es el único sitio que sabe lo que hay de verdad en
    // la página actual.
    setHayHero(Boolean(heroMarcador));

    if (heroMarcador && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entrada]) => setScrolled(entrada.intersectionRatio <= 0.2),
        { threshold: 0.2 },
      );
      observer.observe(heroMarcador);
      return () => observer.disconnect();
    }

    const handleScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // El Footer tiene su propio logo (ver Footer.jsx) — cuando entra en
  // el viewport, el header se desliza hacia arriba y desaparece para
  // que los dos no compitan a la vez. Footer y Navbar son hermanos en
  // layout.js, sin ref compartida, así que se busca por la etiqueta
  // semántica (una sola por página) en vez de pasar una prop/contexto
  // solo para esto.
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entrada]) => setFooterVisible(entrada.isIntersecting),
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const openSubmenu = (key) => {
    clearTimeout(closeTimeout.current);
    setActiveSubmenu(key);
    setLastSubmenu(key);
  };

  const scheduleSubmenuClose = () => {
    clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => setActiveSubmenu(null), CLOSE_DELAY_MS);
  };

  const cancelSubmenuClose = () => clearTimeout(closeTimeout.current);

  // Cierre inmediato (sin el retardo anti-parpadeo de scheduleSubmenuClose):
  // es un clic explícito del usuario sobre el overlay, no un hover-out.
  const closeSubmenu = () => {
    clearTimeout(closeTimeout.current);
    setActiveSubmenu(null);
  };

  // El logo cambia de tamaño con el hover (isLight/solido más abajo), y
  // eso mueve el propio elemento que se está hovereando: al encoger, el
  // cursor puede quedar fuera de él, lo que dispara un mouseleave, que
  // lo vuelve a agrandar, que lo vuelve a poner bajo el cursor... Con
  // retardo antes de confirmar la salida (igual que scheduleSubmenuClose)
  // se corta ese bucle.
  const handleHeaderMouseEnter = () => {
    clearTimeout(headerLeaveTimeout.current);
    setHeaderHovered(true);
  };

  const handleHeaderMouseLeave = () => {
    headerLeaveTimeout.current = setTimeout(() => setHeaderHovered(false), CLOSE_DELAY_MS);
  };

  const displayedSubmenu = lastSubmenu && SUBMENU_STRUCTURE[lastSubmenu];

  // Todos los enlaces internos del Navbar llevan el locale activo por
  // delante (/es/atelier, /en/atelier...) para que navegar por el sitio
  // no resetee el idioma elegido — el middleware, si no, redirigiría
  // cualquier ruta sin prefijo al locale por defecto (es).
  const withLocale = (href) => (href === '/' ? `/${locale}` : `/${locale}${href}`);

  // Activo = la ruta actual es ese enlace o vive debajo de él (ej.
  // /tienda/chaquetas-y-abrigos marca activo "Tienda", cuyo href es
  // /tienda) — así funciona para toda la sección, no solo su
  // portada exacta.
  const esRutaActiva = (href) => {
    const destino = withLocale(href);
    return pathname === destino || pathname?.startsWith(`${destino}/`);
  };

  // Para enlaces con submenú, "activo" también cuenta si la ruta actual
  // es la de cualquiera de sus items — en Atelier/Tienda esto ya salía
  // gratis porque sus hrefs de submenú viven bajo el propio href del
  // enlace (/atelier/novias bajo /atelier), pero en Sobre Fely no: sus
  // items (/blog, /archivo/runway...) no cuelgan de /sobre-fely, así que
  // sin este chequeo extra el enlace no se subrayaba en esas páginas.
  const esActivo = (item) => {
    if (typeof item === 'string') return esRutaActiva(item);
    const hrefs = item.submenu
      ? [item.href, ...SUBMENU_STRUCTURE[item.submenu].items.map((sub) => sub.href)]
      : [item.href];
    return hrefs.some(esRutaActiva);
  };

  // El fondo se vuelve sólido por scroll, por hover, O por tener un
  // submenú abierto (antes esto último era un :hover puro en CSS).
  // Ahora lo llevamos a JS porque el logo (un <img src>, no se puede
  // tintar con CSS) tiene que cambiar de imagen exactamente a la vez
  // que el fondo y el texto.
  // El PanelLateral del submenú vive fuera de <header> a propósito (ver
  // más abajo) — al mover el ratón del header hacia el panel, el
  // mouseleave del header dispara igual, y sin "activeSubmenu" aquí el
  // fondo se volvía transparente con el panel (blanco) todavía abierto.
  const solido = scrolled || headerHovered || !!activeSubmenu;
  // `transparent` es la INTENCIÓN del layout; `esTransparente` es lo que de verdad se
  // puede aplicar en esta página. Sin hero detrás, el header va sólido siempre.
  const esTransparente = transparent && hayHero;
  const isLight = esTransparente && !solido;

  const headerClass = [
    styles.header,
    esTransparente && styles.transparent,
    esTransparente && solido && styles.opaco,
    isLight && styles.light,
    footerVisible && styles.ocultoPorFooter,
  ].filter(Boolean).join(' ');

  // El logo solo crece en home (crecerLogo) — en las páginas con
  // ProductHero (Tienda/Atelier) se queda en blanco pero a tamaño
  // normal, ver isLight más arriba para el color/imagen del logo.
  const navLogoClassName = (isLight && crecerLogo) ? `${styles.navLogo} ${styles.navLogoGrande}` : styles.navLogo;

  return (
    <>
    <header
      className={headerClass}
      onMouseEnter={handleHeaderMouseEnter}
      onMouseLeave={handleHeaderMouseLeave}
    >
      <div className={styles.navRow}>

        {/* Botón hamburguesa — solo visible en móvil. Es el mismo botón que
            cierra el menú: las dos barras rotan hasta formar una X. Sigue
            siendo clicable con el menú abierto porque el panel móvil
            arranca debajo de .navRow, no lo tapa (ver .sobreNavbar en
            PanelLateral.module.css). */}
        <button
          type="button"
          className={styles.navToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t('aria.cerrarMenu') : t('aria.abrirMenu')}
          aria-expanded={mobileMenuOpen}
        >
          <span className={`${styles.navToggleBar} ${mobileMenuOpen ? styles.navToggleBarTopOpen : styles.navToggleBarTop}`} />
          <span className={`${styles.navToggleBar} ${mobileMenuOpen ? styles.navToggleBarBottomOpen : styles.navToggleBarBottom}`} />
        </button>

        {/* Enlaces — solo visibles en escritorio. Los que tienen submenú lo
            abren al hacer hover. El cierre vive en el mouseleave de todo
            el <nav>, no en cada <a>: así el hueco entre enlaces no cierra
            el submenú de camino al siguiente, solo lo hace salir de toda
            la fila (o entrar en un enlace sin submenú, que lo cierra a
            propósito — "siguiente navegación" sin desplegable). */}
        <nav className={styles.navLinks} onMouseLeave={scheduleSubmenuClose}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={withLocale(item.href)}
              className={`${styles.navLink} ${esActivo(item) ? styles.navLinkActivo : ''}`}
              onMouseEnter={() => (item.submenu ? openSubmenu(item.submenu) : scheduleSubmenuClose())}
            >
              {t(`links.${item.key}`)}
            </a>
          ))}
        </nav>

        {/* Logo, siempre visible, centrado */}
        <a href={withLocale('/')} className={styles.navLogoLink}>
          <img
            src={isLight ? '/img/logo/logo-white-felycampo.png' : '/img/logo/logo-felycampo.png'}
            alt="Fely Campo"
            className={navLogoClassName}
          />
        </a>

        {/* Utilidades — escritorio: texto completo */}
        <div className={styles.navActions}>
          <a href={withLocale('/wishlist')} className={`${styles.navLink} ${esActivo('/wishlist') ? styles.navLinkActivo : ''}`}>{t('actions.wishlist')}</a>
          {/* Botón, no enlace: abre MiCuentaModal (ver useMiCuenta más
              arriba) en vez de navegar a una página — por eso no lleva
              "esActivo" tampoco, ya no hay una ruta /mi-cuenta que
              pueda ser la actual. */}
          {haySesion ? (
            <a
              href={withLocale('/mi-cuenta/panel')}
              className={`${styles.navLink} ${esActivo('/mi-cuenta/panel') ? styles.navLinkActivo : ''}`}
            >
              {usuario.nombre || t('actions.miCuenta')}
            </a>
          ) : (
            <button type="button" className={styles.navLink} onClick={abrirMiCuenta}>{t('actions.miCuenta')}</button>
          )}
          <a href={withLocale('/carrito')} className={`${styles.navLink} ${esActivo('/carrito') ? styles.navLinkActivo : ''}`}>{t('actions.carrito')}{carritoCargando ? '' : ` (${cantidadTotal})`}</a>
        </div>

        {/* Utilidades — móvil: solo el icono del carrito, el resto vive en el menú hamburguesa */}
        <a href={withLocale('/carrito')} className={styles.navActionsMobile} aria-label={t('aria.carrito')}>
          <ShoppingBag className={styles.cartIcon} strokeWidth={1.5} />
        </a>
      </div>
    </header>

      {/* Submenú de escritorio: mismo panel lateral que el menú móvil,
          por debajo del navbar (z-index menor que el header). Fuera del
          <header> a propósito: si estuviera dentro, el z-index del header
          no serviría de nada — solo importa frente a elementos hermanos. */}
      <PanelLateral
        abierto={!!activeSubmenu}
        debajoHeader
        onMouseEnter={cancelSubmenuClose}
        onMouseLeave={scheduleSubmenuClose}
        onCerrar={closeSubmenu}
        debajo={displayedSubmenu && (
          <NavbarPanelLateralCards submenuKey={lastSubmenu} submenu={displayedSubmenu} />
        )}
      >
        {displayedSubmenu && (
          <NavbarPanelLateralContent submenuKey={lastSubmenu} submenu={displayedSubmenu} />
        )}
      </PanelLateral>

      {/* Menú móvil: mismo panel lateral, pero a pantalla completa por
          debajo del navRow y solo con la lista de enlaces. Se cierra con
          el propio botón hamburguesa/X del header, no tiene botón de
          cerrar propio. */}
      <PanelLateral abierto={mobileMenuOpen} sobreNavbar onCerrar={() => setMobileMenuOpen(false)}>
        <nav className={styles.mobileMenu}>
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={withLocale(item.href)} className={styles.mobileMenuLink}>
              {t(`links.${item.key}`)}
            </a>
          ))}
          <div className={styles.mobileMenuDivider} />
          <a href={withLocale('/wishlist')} className={styles.mobileMenuLink}>{t('actions.wishlist')}</a>
          {/* Mismo criterio que en .navActions de escritorio: botón que
              abre MiCuentaModal, no un enlace — cierra antes el propio
              menú móvil, si no quedarían los dos superpuestos. */}
          {haySesion ? (
            <a href={withLocale('/mi-cuenta/panel')} className={styles.mobileMenuLink}>
              {usuario.nombre || t('actions.miCuenta')}
            </a>
          ) : (
            <button
              type="button"
              className={styles.mobileMenuLink}
              onClick={() => { setMobileMenuOpen(false); abrirMiCuenta(); }}
            >
              {t('actions.miCuenta')}
            </button>
          )}
        </nav>
      </PanelLateral>

      {/* Global, no por página (a diferencia de GuiaTallas): se abre
          sola al añadir un producto desde cualquier ficha, ver
          CarritoContext. */}
      <CarritoPanel />

      {/* Global también — "Mi cuenta" (arriba y en el menú móvil) y el
          aviso de /carrito la abren vía useMiCuenta(), ver
          MiCuentaContext.jsx. */}
      <MiCuentaModal />
    </>
  );
}

export default Navbar;
