// Navbar.jsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './Navbar.module.css';
import { PanelLateral } from '../../ui';
import CarritoPanel from '../../ecommerce/CarritoPanel';
import MiCuentaModal from '../../ecommerce/MiCuentaModal';
import { useCarrito } from '@/context/CarritoContext';
import { useMiCuenta } from '@/context/MiCuentaContext';
import NavbarPanelLateralContent from './NavbarPanelLateralContent';
import NavbarPanelLateralCards from './NavbarPanelLateralCards';
import { obtenerPiezasComunes } from '@/lib/piezasComunes';
import { atributosImagen } from '@/lib/imagenes';
import { derivado } from '@/lib/contenido';

// Las fotos del menú salen de lib/piezasComunes.js (editables en el admin:
// «Menú, Pedir cita y newsletter»). "portada" es la de cards[0], la que se
// ve al abrir el desplegable.
// Se leen al renderizar (no al importar): el contenido llega de la base de
// datos después (src/lib/contenido.js). submenus() se recalcula solo si
// cambia el documento.

// Enlaces con submenú — coinciden con las categorías reales del
// sitemap. El resto son enlaces simples, sin panel (ver "pedirCita" en
// NAV_ITEMS, sin "submenu"). Los labels viven en messages/{locale}.json
// bajo el namespace "nav" — aquí solo se guarda la estructura (hrefs,
// claves de traducción, imagen).
// "items" alimenta la lista de texto (NavbarPanelLateralContent) tal
// cual, en su propio orden. "cards" es independiente
// (NavbarPanelLateralCards): cada una con su propia imagen, elegida a
// mano para que combine con lo que enlaza (misma foto que usa esa
// página como hero/categoría). Hoy solo se pinta la PRIMERA, cuadrada y
// sin texto encima — la segunda se queda en los datos por si se
// recupera la fila de dos. "cardsVariante" ya no se usa.
//
// Reorganización (encargo): antes "Atelier" llevaba Novias/Fiesta/
// Vosotras y "Visítanos" las 3 sedes + puntos de venta + pedir cita;
// ahora "Atelier" son las sedes físicas (Salamanca/Madrid/Oviedo/
// Vosotras), "Colecciones" agrupa todo lo que se compra (Fiesta/
// Novias/Prêt-à-porter sin categorías propias/Runway), "Sobre Fely"
// se queda con Historia/Podcast (antes "Blog")/Talleres, "Puntos de
// Venta" separa tiendas propias de externas, y "Pedir cita" pasa a
// ser un enlace de primer nivel sin desplegable (ver NAV_ITEMS).
const submenus = derivado('piezas-comunes', ({ menu: FOTOS_MENU }) => ({
  atelier: {
    items: [
      { key: 'salamanca', href: '/atelier-fiesta/salamanca', image: FOTOS_MENU.atelier.salamanca },
      { key: 'madrid', href: '/atelier-fiesta/madrid', image: FOTOS_MENU.atelier.madrid, imagePosition: 'center top' },
      { key: 'oviedo', href: '/atelier-fiesta/oviedo', image: FOTOS_MENU.atelier.oviedo },
      // "separador": "Vosotras" no es una sede — un hueco de una fila
      // por encima (ver NavbarPanelLateralContent.jsx) la separa
      // visualmente de las 3 ciudades de arriba.
      { key: 'vosotras', href: '/atelier/vosotras', separador: true, image: FOTOS_MENU.atelier.vosotras },
    ],
    cardsVariante: 'horizontal',
    cards: [
      // Antes "Atelier Salamanca" (misma foto/href que el item de la
      // lista) — foto general del atelier (felycampo-atelier-madrid.webp,
      // cambiada a petición; antes ContacPage-Hero-FelyCampo.jpg) y
      // "Nuestro Atelier" en vez del nombre de una ciudad, para que la
      // tarjeta hable del atelier en general, no de Salamanca.
      { key: 'salamanca', labelKey: 'nuestroAtelier', href: '/atelier-fiesta/salamanca', image: FOTOS_MENU.atelier.portada },
      { key: 'vosotras', href: '/atelier/vosotras', image: FOTOS_MENU.atelier.vosotras },
    ],
  },
  colecciones: {
    // "pretaporter" enlaza a la tienda entera, sin desplegar sus
    // categorías (tops/faldas/pantalones...) como antes — esas
    // siguen existiendo como páginas propias, solo no se listan aquí.
    items: [
      { key: 'fiesta', href: '/atelier/fiesta', image: FOTOS_MENU.colecciones.fiesta },
      { key: 'novias', href: '/atelier/novias', image: FOTOS_MENU.colecciones.novias },
      { key: 'pretaporter', href: '/pret-a-porter', image: FOTOS_MENU.colecciones.pretaporter },
      { key: 'runway', href: '/colecciones-fely-campo', image: FOTOS_MENU.colecciones.runway },
    ],
    cardsVariante: 'horizontal',
    cards: [
      { key: 'novias', href: '/atelier/novias', image: FOTOS_MENU.colecciones.portada },
      { key: 'fiesta', href: '/atelier/fiesta', image: FOTOS_MENU.colecciones.fiesta },
    ],
  },
  elMundoDeFely: {
    // "podcast" enlaza a /blog (antes /podcast — ver comentario de
    // cabecera en podcast/page.js para el porqué del cambio de URL).
    items: [
      { key: 'historia', href: '/sobre-fely', image: FOTOS_MENU.elMundoDeFely.historia },
      { key: 'podcast', href: '/blog', image: FOTOS_MENU.elMundoDeFely.podcast },
      { key: 'talleres', href: '/talleres-fely-campo', image: FOTOS_MENU.elMundoDeFely.talleres },
    ],
    cardsVariante: 'horizontal',
    cards: [
      { key: 'podcast', href: '/blog', image: FOTOS_MENU.elMundoDeFely.portada },
      { key: 'talleres', href: '/talleres-fely-campo', image: FOTOS_MENU.elMundoDeFely.talleres },
    ],
  },
  puntosDeVenta: {
    items: [
      { key: 'propios', href: '/visita-fely-campo', image: FOTOS_MENU.puntosDeVenta.propios },
      { key: 'externos', href: '/puntos-de-venta-fely-campo', image: FOTOS_MENU.puntosDeVenta.externos },
    ],
    cardsVariante: 'horizontal',
    cards: [
      { key: 'propios', href: '/visita-fely-campo', image: FOTOS_MENU.puntosDeVenta.portada },
      { key: 'externos', href: '/puntos-de-venta-fely-campo', image: FOTOS_MENU.puntosDeVenta.externos },
    ],
  },
}));

// Orden fijo por encargo: Sobre Fely, Atelier, Colecciones, Dónde
// encontrar Fely Campo (clave "puntosDeVenta", solo cambió el label) y
// Pedir cita — "pedirCita" sin "submenu": enlace directo (un
// formulario, /visita-fely-campo/cita), no despliega panel.
const NAV_ITEMS = [
  { key: 'elMundoDeFely', href: '/sobre-fely', submenu: 'elMundoDeFely' },
  { key: 'atelier', href: '/atelier', submenu: 'atelier' },
  { key: 'colecciones', href: '/colecciones-fely-campo', submenu: 'colecciones' },
  { key: 'puntosDeVenta', href: '/puntos-de-venta-fely-campo', submenu: 'puntosDeVenta' },
  { key: 'pedirCita', href: '/visita-fely-campo/cita' },
];

// En escritorio, NAV_ITEMS se reparte en dos grupos (ver .navLinks/
// .navActions más abajo) — el propio menú móvil sigue usando NAV_ITEMS
// entero (ver "debajo" del <header>), esto solo afecta al layout de
// escritorio. Solo "Pedir cita" vive en el lateral derecho (donde antes
// iban Wishlist/Mi cuenta/Carrito, comentados a petición, ver más
// abajo) — el resto, "Puntos de Venta" incluido, a la izquierda.
// Todos los destinos de los submenús (lista + tarjetas), sin repetir
// href — para el <nav hidden> rastreable del header (auditoría SEO M1).
const enlacesSubmenus = () => Object.entries(submenus())
  .flatMap(([submenu, { items = [], cards = [] }]) => [...items, ...cards]
    .map((enlace) => ({ submenu, key: enlace.labelKey || enlace.key, href: enlace.href })))
  .filter((enlace, indice, todos) => todos.findIndex((otro) => otro.href === enlace.href) === indice);

const NAV_ITEMS_IZQUIERDA = NAV_ITEMS.filter(({ key }) => key !== 'pedirCita');
const NAV_ITEMS_DERECHA = NAV_ITEMS.filter(({ key }) => key === 'pedirCita');

// Selector de idioma del lateral derecho — cada idioma en su propia
// lengua, por eso no pasa por messages/{locale}.json.
const IDIOMAS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

const CLOSE_DELAY_MS = 200;
const SCROLL_THRESHOLD_PX = 50;
// Corte del Navbar móvil — debe coincidir con la media query del menú
// móvil en Navbar.module.css.
const MEDIA_NAV_MOBILE = '(max-width: 964px), (max-width: 1024px) and (orientation: portrait)';

// Remate del menú móvil (ver "debajo" en el <PanelLateral> de más abajo):
// misma foto que el ProductHero de /pret-a-porter (horizontal de verdad,
// no recortada a la fuerza — ver hero-pages-pretaporter-cover.jpg),
// pegada al fondo del panel entero, a todo su ancho. Aparte de
// NavbarPanelLateralCards (esa es la fila de dos MediaLink del submenú
// de escritorio, con hover — esto es una sola imagen fija, pensada
// para dedo, sin esa lógica).
// "submenuKey" (paso 2 del menú móvil): la foto pasa a ser la misma
// portada que usa el submenú de escritorio para esa sección — la de
// "cards[0]" (ver NavbarPanelLateralCards), una sola fija, sin el
// cambio por hover de escritorio. Paso 1 (sin submenú): la portada de
// Prêt-à-porter de siempre.
function MobileMenuBanner({ locale, submenuKey, onNavegar }) {
  const t = useTranslations('nav');
  const card = submenuKey && submenus()[submenuKey].cards[0];
  const portada = card
    ? { href: card.href, image: card.image, imagePosition: card.imagePosition, label: t(`submenus.${submenuKey}.${card.labelKey || card.key}`) }
    : { href: '/pret-a-porter', image: obtenerPiezasComunes().menu.movil, label: t('links.tienda') };

  return (
    <a
      href={`/${locale}${portada.href}`}
      className={styles.mobileMenuBanner}
      onClick={onNavegar}
    >
      {/* Sin texto encima a petición — el nombre queda solo como
          alt de la imagen (el enlace sigue necesitando un nombre
          accesible). key={image}: remonta la imagen (y su estado de
          carga) en cada cambio de portada. */}
      <ImagenBanner key={portada.image} src={portada.image} alt={portada.label} posicion={portada.imagePosition} />
    </a>
  );
}

// Foto de MobileMenuBanner: invisible hasta que termina de cargar y
// entonces entra con fundido + leve zoom de salida (ver
// .mobileMenuBannerImagenCargada), en vez de un fundido que arranca al
// montar y, si la foto aún no ha llegado, la deja aparecer de golpe.
// img.complete cubre la que ya estaba en caché (onLoad puede no llegar a
// dispararse si cargó antes de hidratar).
function ImagenBanner({ src, alt, posicion }) {
  const [cargada, setCargada] = useState(false);
  const imgRef = useRef(null);
  useEffect(() => {
    if (imgRef.current?.complete) setCargada(true);
  }, []);

  return (
    <img
      ref={imgRef}
      {...atributosImagen(src, { sizes: '100vw' })}
      alt={alt}
      onLoad={() => setCargada(true)}
      className={`${styles.mobileMenuBannerImagen} ${cargada ? styles.mobileMenuBannerImagenCargada : ''}`}
      style={posicion ? { objectPosition: posicion } : undefined}
    />
  );
}

function Navbar({ transparent = false, crecerLogo = false, textoOscuro = false }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { cantidadTotal } = useCarrito();
  const { abrir: abrirMiCuenta } = useMiCuenta();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Submenú abierto DENTRO del menú móvil (drill-down: la lista raíz
  // desliza a la izquierda y la del submenú entra desde la derecha, ver
  // .mobileMenuTrack más abajo) — independiente de "activeSubmenu"
  // (ese es el hover de escritorio). null = viendo la lista raíz.
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [lastSubmenu, setLastSubmenu] = useState(null);
  // Enlace de la lista del submenú de escritorio con el ratón encima: su
  // "image" sustituye a la imagen de la derecha (ver
  // NavbarPanelLateralCards). Se resetea al cambiar de submenú.
  const [itemHover, setItemHover] = useState(null);
  useEffect(() => setItemHover(null), [lastSubmenu]);
  const [scrolled, setScrolled] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const closeTimeout = useRef(null);
  const headerLeaveTimeout = useRef(null);

  useEffect(() => () => {
    clearTimeout(closeTimeout.current);
    clearTimeout(headerLeaveTimeout.current);
  }, []);

  // Solo importa combinado con la prop "transparent" (ver Navbar.module.css):
  // decide si el fondo pasa de transparente a blanco al hacer scroll.
  // Si la página trae un Hero marcado con data-navbar-hero (home,
  // ProductHero en Tienda/Atelier), "scrolled" pasa a true al 80% de
  // scroll del Hero (sea cual sea su alto: 105dvh en home, 50vh en
  // ProductHero), no cuando ya ha desaparecido del todo — así el fondo
  // blanco no llega "tarde" justo antes de que el Hero se acabe.
  // Se mide por scroll (scrollY frente a donde acaba ese 80%), no con
  // un IntersectionObserver sobre el Hero: en mobile varios Heros van
  // fijados (ProductHero con position:fixed, HeroPagina "fijarEnMobile"
  // con sticky) y nunca salen de la pantalla, así que un observer no
  // disparaba nunca y el Navbar se quedaba transparente/claro.
  // Sin Hero en la página, cae al umbral fijo de siempre. En mobile
  // (MEDIA_NAV_MOBILE, mismo corte que el menú móvil en
  // Navbar.module.css) se vuelve sólido en cuanto empieza el scroll,
  // haya Hero o no — a petición. Depende de "pathname": el layout no
  // desmonta Navbar al navegar entre rutas, así que hay que re-buscar
  // el Hero de la página nueva.
  useEffect(() => {
    const heroMarcador = document.querySelector('[data-navbar-hero]');
    const mobile = window.matchMedia(MEDIA_NAV_MOBILE);
    let limite = SCROLL_THRESHOLD_PX;

    const medir = () => {
      if (mobile.matches) {
        limite = 0;
        return;
      }
      if (!heroMarcador) {
        limite = SCROLL_THRESHOLD_PX;
        return;
      }
      // Inicio del Hero en el documento (0 si va fijado arriba) + 80%
      // de su alto.
      const inicio = heroMarcador.getBoundingClientRect().top + window.scrollY;
      limite = Math.max(0, inicio) + heroMarcador.offsetHeight * 0.8;
    };

    const handleScroll = () => setScrolled(window.scrollY > limite);
    const alRedimensionar = () => {
      medir();
      handleScroll();
    };

    alRedimensionar();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', alRedimensionar);
    mobile.addEventListener('change', alRedimensionar);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', alRedimensionar);
      mobile.removeEventListener('change', alRedimensionar);
    };
  }, [pathname]);

  // El Footer tiene su propio logo (ver Footer.jsx) — cuando entra en
  // el viewport, el header se desliza hacia arriba y desaparece para
  // que los dos no compitan a la vez. Footer y Navbar son hermanos en
  // layout.js, sin ref compartida, así que se busca por la etiqueta
  // semántica (una sola por página) en vez de pasar una prop/contexto
  // solo para esto. threshold 0.5 (no el 0 por defecto): recién que
  // asoma la primera línea del footer aún no hay conflicto visual con
  // el logo — se espera a que esté medio visible.
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entrada]) => setFooterVisible(entrada.isIntersecting),
      { threshold: 0.5 },
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

  const displayedSubmenu = lastSubmenu && submenus()[lastSubmenu];

  // Todos los enlaces internos del Navbar llevan el locale activo por
  // delante (/es/atelier, /en/atelier...) para que navegar por el sitio
  // no resetee el idioma elegido — el middleware, si no, redirigiría
  // cualquier ruta sin prefijo al locale por defecto (es).
  const withLocale = (href) => (href === '/' ? `/${locale}` : `/${locale}${href}`);

  // Misma página actual con otro locale (mismo mecanismo que el selector
  // del Footer: sustituye el primer segmento de la ruta).
  const conLocale = (code) => {
    const segments = pathname.split('/');
    segments[1] = code;
    return segments.join('/');
  };

  // Cierra el menú móvil entero y lo resetea a la lista raíz (nunca se
  // queda abierto "a medias" dentro de un submenú la próxima vez) — el
  // salto a la raíz ocurre a la vez que el panel entero sale deslizando
  // hacia fuera (ver .panel.sobreNavbar en PanelLateral.module.css), así
  // que no se nota. Usarla en vez de "setMobileMenuOpen(false)" a pelo
  // en cualquier sitio que cierre el menú móvil (enlaces, X, overlay).
  const cerrarMenuMobile = () => {
    setMobileMenuOpen(false);
    setMobileSubmenu(null);
  };

  // Paso 1 → paso 2 y vuelta (ver el <nav> del menú móvil). El foco
  // sigue al paso visible: al botón "← Menú" al entrar, y de vuelta a
  // la fila de la categoría al salir — después del deslizamiento
  // (CSS 0.35s), si no el navegador haría scroll al elemento a medio
  // camino.
  const volverMenuRef = useRef(null);
  const filasMenuRef = useRef({});
  const toqueMenuRef = useRef(null);

  const abrirPasoMenu = (submenu) => {
    setMobileSubmenu(submenu);
    setTimeout(() => volverMenuRef.current?.focus({ preventScroll: true }), 350);
  };

  const volverPasoMenu = () => {
    const anterior = mobileSubmenu;
    setMobileSubmenu(null);
    setTimeout(() => filasMenuRef.current[anterior]?.focus({ preventScroll: true }), 350);
  };

  // Deslizar a la derecha en el paso 2 = volver (gesto nativo de "atrás"
  // en móvil). Solo si el gesto es claramente horizontal, para no
  // confundirlo con el scroll vertical de la lista.
  const alEmpezarToqueMenu = (evento) => {
    const toque = evento.touches[0];
    toqueMenuRef.current = { x: toque.clientX, y: toque.clientY };
  };

  const alTerminarToqueMenu = (evento) => {
    const inicio = toqueMenuRef.current;
    toqueMenuRef.current = null;
    if (!inicio || !mobileSubmenu) return;
    const toque = evento.changedTouches[0];
    const dx = toque.clientX - inicio.x;
    const dy = toque.clientY - inicio.y;
    if (dx > 60 && Math.abs(dy) < dx / 2) volverPasoMenu();
  };

  // Activo = la ruta actual es ese enlace o vive debajo de él (ej.
  // /pret-a-porter/chaquetas-y-abrigos marca activo "Prêt-à-porter",
  // cuyo href es /pret-a-porter) — así funciona para toda la sección,
  // no solo su portada exacta.
  const esRutaActiva = (href) => {
    const destino = withLocale(href);
    return pathname === destino || pathname?.startsWith(`${destino}/`);
  };

  // Para enlaces con submenú, "activo" también cuenta si la ruta actual
  // es la de cualquiera de sus items — en Atelier/Tienda esto ya salía
  // gratis porque sus hrefs de submenú viven bajo el propio href del
  // enlace (/atelier/novias bajo /atelier), pero en Sobre Fely no: sus
  // items (/blog, /colecciones-fely-campo...) no cuelgan de /sobre-fely,
  // así que sin este chequeo extra el enlace no se subrayaba en esas páginas.
  // Si varios enlaces casan con la ruta, gana el href más largo (el más
  // específico): /atelier/novias casa con "Atelier" (/atelier, por
  // prefijo) y con "Colecciones" (/atelier/novias, en su submenú) — solo
  // debe subrayarse Colecciones.
  const hrefsDe = (item) => (item.submenu
    ? [item.href, ...submenus()[item.submenu].items.map((sub) => sub.href)]
    : [item.href]);
  const hrefMasEspecifico = NAV_ITEMS
    .flatMap(hrefsDe)
    .filter(esRutaActiva)
    .reduce((mejor, href) => (href.length > mejor.length ? href : mejor), '');

  const esActivo = (item) => {
    if (typeof item === 'string') return esRutaActiva(item);
    return hrefMasEspecifico !== '' && hrefsDe(item).includes(hrefMasEspecifico);
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
  // Menú móvil abierto también: el header se queda en blanco (texto y
  // logo oscuros) mientras el panel está abierto, sin hueco transparente
  // entre los dos.
  const solido = scrolled || headerHovered || !!activeSubmenu || mobileMenuOpen;
  // "textoOscuro" (ficha de producto, ver layout.js "esFichaProducto"):
  // el Hero de esta página es GaleriaProducto, con object-fit:contain
  // (no recorta la foto, ver GaleriaProducto.module.css) — normalmente
  // deja aire/fondo claro alrededor de la prenda, así que el texto/logo
  // en blanco de siempre (pensado para un Hero oscuro a sangre,
  // ProductHero/home) quedaría invisible ahí. Aquí el fondo sigue
  // siendo transparente igual (isLight solo decide el color de texto,
  // no el fondo, ver headerClass más abajo), el texto/logo se quedan en
  // --color-tinta de siempre.
  const isLight = transparent && !solido && !textoOscuro;

  const headerClass = [
    styles.header,
    transparent && styles.transparent,
    transparent && solido && styles.opaco,
    isLight && styles.light,
    // Con el menú móvil abierto el header no se esconde por el Footer —
    // si no, se iría y dejaría el panel colgando de un hueco vacío.
    footerVisible && !mobileMenuOpen && styles.ocultoPorFooter,
    mobileMenuOpen && styles.menuMovilAbierto,
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
            queda por debajo del header en z-index, no lo tapa (ver .sobreNavbar en
            PanelLateral.module.css). */}
        <button
          type="button"
          className={styles.navToggle}
          onClick={() => (mobileMenuOpen ? cerrarMenuMobile() : setMobileMenuOpen(true))}
          aria-label={mobileMenuOpen ? t('aria.cerrarMenu') : t('aria.abrirMenu')}
          aria-expanded={mobileMenuOpen}
        >
          <span className={`${styles.navToggleBar} ${mobileMenuOpen ? styles.navToggleBarTopOpen : styles.navToggleBarTop}`} />
          <span className={`${styles.navToggleBar} ${mobileMenuOpen ? styles.navToggleBarBottomOpen : styles.navToggleBarBottom}`} />
        </button>

        {/* Enlaces de TODOS los submenús, siempre en el HTML (auditoría SEO
            M1): los paneles de escritorio y móvil solo se montan al
            abrirlos, así que sin esto Google no veía desde ninguna página
            /pret-a-porter, /blog, los ateliers por ciudad, Vosotras,
            Talleres... "hidden" (display:none): no se ve ni lo lee el
            lector de pantalla (que ya tiene el menú real), pero los href
            siguen en el DOM, igual que un mega-menú desplegable. */}
        <nav hidden aria-hidden="true">
          {enlacesSubmenus().map(({ submenu, key, href }) => (
            <a key={href} href={withLocale(href)} tabIndex={-1}>
              {t(`submenus.${submenu}.${key}`)}
            </a>
          ))}
        </nav>

        {/* Enlaces — solo visibles en escritorio. Los que tienen submenú lo
            abren al hacer hover. El cierre vive en el mouseleave de todo
            el <nav>, no en cada <a>: así el hueco entre enlaces no cierra
            el submenú de camino al siguiente, solo lo hace salir de toda
            la fila (o entrar en un enlace sin submenú, que lo cierra a
            propósito — "siguiente navegación" sin desplegable). */}
        <nav className={styles.navLinks} onMouseLeave={scheduleSubmenuClose}>
          {NAV_ITEMS_IZQUIERDA.map((item) => (
            <a
              key={item.href}
              href={withLocale(item.href)}
              className={`${styles.navLink} ${esActivo(item) ? styles.navLinkActivo : ''}`}
              onMouseEnter={() => (item.submenu ? openSubmenu(item.submenu) : scheduleSubmenuClose())}
            >
              {/* "puntosDeVenta" tiene versión corta ("Dónde encontrarnos")
                  para anchos estrechos de escritorio — se alternan por CSS
                  (.textoLargo/.textoCorto, ver Navbar.module.css). */}
              {t.has(`links.${item.key}Corto`) ? (
                <>
                  <span className={styles.textoLargo}>{t(`links.${item.key}`)}</span>
                  <span className={styles.textoCorto}>{t(`links.${item.key}Corto`)}</span>
                </>
              ) : t(`links.${item.key}`)}
            </a>
          ))}
        </nav>

        {/* Logo, siempre visible, centrado */}
        <a href={withLocale('/')} className={styles.navLogoLink}>
          <img
            src={isLight ? '/img/logo/fely-campo-logo-white.webp' : '/img/logo/fely-campo-logo.webp'}
            alt="Fely Campo"
            className={navLogoClassName}
            // En las páginas con vídeo de portada (home, Fiesta) el logo es lo
            // más grande que pinta la página al cargar (LCP): prioridad alta.
            fetchPriority="high"
          />
        </a>

        {/* Utilidades — escritorio: antes Wishlist/Mi cuenta/Carrito
            (comentado a petición, ver debajo, recuperable tal cual),
            ahora solo Pedir cita — mismo comportamiento de
            hover/submenú que NAV_ITEMS_IZQUIERDA (ver "nav" de arriba),
            por eso el propio onMouseLeave se repite aquí. */}
        <div className={styles.navActions} onMouseLeave={scheduleSubmenuClose}>
          {NAV_ITEMS_DERECHA.map((item) => (
            <a
              key={item.href}
              href={withLocale(item.href)}
              className={`${styles.navLink} ${esActivo(item) ? styles.navLinkActivo : ''}`}
              onMouseEnter={() => (item.submenu ? openSubmenu(item.submenu) : scheduleSubmenuClose())}
            >
              {t(`links.${item.key}`)}
            </a>
          ))}
          {/* Selector de idioma — el activo subrayado (.navLinkActivo),
              el otro enlaza a la misma página con el locale cambiado. */}
          <div className={styles.navIdiomas} onMouseEnter={scheduleSubmenuClose}>
            {IDIOMAS.map(({ code, label }, i) => (
              <span key={code} className={styles.navIdiomasItem}>
                {i > 0 && <span className={styles.navIdiomasDivider}>|</span>}
                {code === locale ? (
                  <span className={`${styles.navLink} ${styles.navLinkActivo}`} aria-current="true">{label}</span>
                ) : (
                  <a href={conLocale(code)} className={styles.navLink} hrefLang={code} lang={code}>{label}</a>
                )}
              </span>
            ))}
          </div>
          {/*
          <a href={withLocale('/wishlist')} className={`${styles.navLink} ${esActivo('/wishlist') ? styles.navLinkActivo : ''}`}>{t('actions.wishlist')}</a>
          <button type="button" className={styles.navLink} onClick={abrirMiCuenta}>{t('actions.miCuenta')}</button>
          <a href={withLocale('/carrito')} className={`${styles.navLink} ${esActivo('/carrito') ? styles.navLinkActivo : ''}`}>{t('actions.carrito')} ({cantidadTotal})</a>
          */}
        </div>

        {/* Utilidades — móvil: solo el icono de "Pedir cita" (antes el
            del carrito, comentado a petición — para recuperarlo,
            descomentar y volver a importar ShoppingBag de lucide-react).
            El resto vive en el menú hamburguesa.
        <a href={withLocale('/carrito')} className={styles.navActionsMobile} aria-label={t('aria.carrito')}>
          <ShoppingBag className={styles.cartIcon} strokeWidth={1.5} />
        </a> */}
        <a href={withLocale('/visita-fely-campo/cita')} className={styles.navActionsMobile} aria-label={t('links.pedirCita')}>
          <CalendarDays className={styles.cartIcon} strokeWidth={1.5} />
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
          <NavbarPanelLateralCards submenuKey={lastSubmenu} submenu={displayedSubmenu} itemHover={itemHover} />
        )}
      >
        {displayedSubmenu && (
          <NavbarPanelLateralContent submenuKey={lastSubmenu} submenu={displayedSubmenu} onItemHover={setItemHover} />
        )}
      </PanelLateral>

      {/* Menú móvil: mismo panel lateral, pero a pantalla completa por
          debajo del navRow. Se cierra con el propio botón hamburguesa/X
          del header, no tiene botón de cerrar propio.
          Drill-down de dos "pantallas" (.mobileMenuTrack, ancho 200%):
          la raíz (los 4 NAV_ITEMS, cada uno con submenú de verdad) y el
          submenú activo (mobileSubmenu) — tocar una categoría desliza a
          la segunda pantalla en vez de navegar directo, igual que el
          hover de escritorio pero pensado para dedo, con su propio
          botón atrás. "debajo" (fuera de .contenido, ver
          PanelLateral.jsx) cuelga la foto editorial a todo el ancho,
          empujada al fondo del panel por el justify-content:space-between
          de .panel — el remate "visualmente fuerte" pedido, no una
          lista de texto sola. */}
      <PanelLateral
        abierto={mobileMenuOpen}
        sobreNavbar
        onCerrar={cerrarMenuMobile}
        debajo={<MobileMenuBanner locale={locale} submenuKey={mobileSubmenu} onNavegar={cerrarMenuMobile} />}
      >
        {/* Navegación por pasos: paso 1 = las categorías, paso 2 = el
            submenú de la tocada. Solo el paso 2 lleva cabecera: el botón
            "← Menú" para volver (sin indicador de paso). La pantalla que no
            se ve va "inert" (fuera del tabulador y del lector de
            pantalla), el foco salta al botón de volver al entrar y de
            vuelta a la categoría al salir, y en el paso 2 deslizar el
            dedo hacia la derecha también vuelve atrás. */}
        <nav
          className={styles.mobileMenu}
          onTouchStart={alEmpezarToqueMenu}
          onTouchEnd={alTerminarToqueMenu}
        >
          <div className={`${styles.mobileMenuTrack} ${mobileSubmenu ? styles.mobileMenuTrackSub : ''}`}>
            <div className={styles.mobileMenuScreen} inert={mobileSubmenu ? true : undefined}>
              <ul className={styles.mobileMenuList}>
                {NAV_ITEMS.map((item) => (
                  <li key={item.key}>
                    {/* "Pedir cita" (sin "submenu"): enlace directo, sin
                        drill-down ni chevron — no hay panel que abrir. */}
                    {item.submenu ? (
                      <button
                        type="button"
                        ref={(nodo) => { filasMenuRef.current[item.submenu] = nodo; }}
                        className={styles.mobileMenuRow}
                        onClick={() => abrirPasoMenu(item.submenu)}
                      >
                        <span className={styles.mobileMenuRowTexto}>{t(`links.${item.key}`)}</span>
                        <ChevronRight size={18} strokeWidth={1.25} aria-hidden="true" />
                      </button>
                    ) : (
                      <a
                        href={withLocale(item.href)}
                        className={styles.mobileMenuRow}
                        onClick={cerrarMenuMobile}
                      >
                        <span className={styles.mobileMenuRowTexto}>{t(`links.${item.key}`)}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>

              {/* Wishlist / Mi cuenta comentados a petición (mismo criterio
                  que en .navActions de escritorio). Para recuperarlos,
                  descomentar — "Mi cuenta" es un botón que abre
                  MiCuentaModal y cierra antes el menú móvil.
              <div className={styles.mobileMenuDivider} />

              <div className={styles.mobileMenuUtilities}>
                <a href={withLocale('/wishlist')} className={styles.mobileMenuLink} onClick={cerrarMenuMobile}>
                  {t('actions.wishlist')}
                </a>
                <button
                  type="button"
                  className={styles.mobileMenuLink}
                  onClick={() => { cerrarMenuMobile(); abrirMiCuenta(); }}
                >
                  {t('actions.miCuenta')}
                </button>
              </div>
              */}
            </div>

            <div className={styles.mobileMenuScreen} inert={mobileSubmenu ? undefined : true}>
              {mobileSubmenu && (
                <>
                  <div className={styles.mobileMenuCabecera}>
                    <button
                      type="button"
                      ref={volverMenuRef}
                      className={styles.mobileMenuBack}
                      onClick={volverPasoMenu}
                      aria-label={t('aria.volverMenu')}
                    >
                      {/* Solo la flecha, más grande (sin el texto "Menú"
                          a petición — el nombre accesible lo da aria-label). */}
                      <ChevronLeft size={26} strokeWidth={1.25} aria-hidden="true" />
                    </button>
                  </div>

                  {/* Título de la sección (sin "Ver todo" a petición). */}
                  <p className={styles.mobileMenuTitulo}>{t(`links.${mobileSubmenu}`)}</p>

                  {/* key={mobileSubmenu}: la lista se vuelve a montar en cada
                      submenú, así la entrada escalonada de .mobileMenuSubLink
                      (--i, ver CSS) se repite cada vez. */}
                  <ul key={mobileSubmenu} className={styles.mobileMenuList}>
                    {submenus()[mobileSubmenu].items.map((subItem, indice) => (
                      <li
                        key={subItem.href}
                        className={subItem.separador ? styles.mobileMenuSubItemSeparador : undefined}
                        style={{ '--i': indice }}
                      >
                        <a
                          href={withLocale(subItem.href)}
                          className={styles.mobileMenuSubLink}
                          onClick={cerrarMenuMobile}
                        >
                          {t(`submenus.${mobileSubmenu}.${subItem.labelKey || subItem.key}`)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
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
