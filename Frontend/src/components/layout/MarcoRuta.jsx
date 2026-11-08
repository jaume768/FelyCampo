'use client';

/* ============================================================
   MARCO SEGÚN LA RUTA — Fely Campo
   Lo que cambia del marco común (Navbar, bandas de cita, newsletter)
   según la página. Antes lo decidía app/[locale]/layout.js leyendo
   headers() (x-pathname, que ponía el proxy): eso obligaba a renderizar
   en el servidor TODAS las páginas en cada visita. Con usePathname la
   decisión es la misma, en el servidor (al prerenderizar cada página) y en
   el navegador, y las páginas vuelven a poder ser estáticas.

   AteliersCita y PedirCita son Server Components (next-intl/server):
   llegan ya renderizados como props y aquí solo se decide si se pintan.
   ============================================================ */

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import NewsletterModalGlobal from './NewsletterModalGlobal';

// Páginas con su propio ProductHero (ver ProductHero.jsx): nacen con el
// Navbar transparente igual que home, pero con el logo a tamaño normal.
// Mantener en sync con SUBMENU_STRUCTURE.tienda.items de Navbar.jsx si
// cambian las categorías de Prêt-à-porter.
const RUTAS_CON_PRODUCT_HERO = new Set([
  '/pret-a-porter',
  '/atelier',
  '/atelier/novias',
  '/atelier/fiesta',
  '/puntos-de-venta-fely-campo',
  '/visita-fely-campo',
  '/atelier-fiesta/salamanca',
  '/atelier-fiesta/madrid',
  '/atelier-fiesta/oviedo',
  '/sobre-fely',
  '/colecciones-fely-campo',
  '/blog',
  '/talleres-fely-campo',
  // Páginas legales: portada HeroPagina (ver legal/TextoLegal.jsx).
  '/legal/privacidad',
  '/legal/cookies',
  '/legal/aviso-legal',
  '/legal/terminos',
]);

// Columnas de ateliers (AteliersCita, encima de PedirCita) solo donde hay
// intención de visitar un atelier: home y hecho a medida (/atelier,
// /atelier/novias, /atelier/fiesta y sus fichas). Ver el comentario
// original en la historia de app/[locale]/layout.js.
function conAteliersCitaEn(ruta) {
  return (
    ruta === '/' ||
    ruta === '/atelier' ||
    ruta.startsWith('/atelier/novias') ||
    ruta.startsWith('/atelier/fiesta')
  );
}

export function ruta(pathname, locale) {
  return (pathname || '').replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';
}

export default function MarcoRuta({
  locale, children, ateliersCita, ateliersCitaSeparado, pedirCita, pedirCitaSeparado,
}) {
  const rutaSinLocale = ruta(usePathname(), locale);

  const isHome = rutaSinLocale === '/';
  const tieneProductHero = RUTAS_CON_PRODUCT_HERO.has(rutaSinLocale);
  // Ficha de colección de Runway: la URL pública es /runways-<slug> y la
  // ruta interna /runways/<slug> (rewrite de next.config.mjs). Se aceptan
  // las dos para que servidor y navegador decidan lo mismo.
  const esFichaRunway = /^\/runways[-/]/.test(rutaSinLocale);
  // Ficha de entrada de blog: foto a sangre con data-navbar-hero.
  const esHeroBlog = /^\/blog\/[^/]+$/.test(rutaSinLocale);
  // /pret-a-porter (solo la principal): hero sin velo y texto en tinta.
  const esPretAPorter = rutaSinLocale === '/pret-a-porter';

  const conAteliersCita = conAteliersCitaEn(rutaSinLocale);
  // PedirCita en todas salvo el propio formulario de cita (y sus
  // confirmaciones) y el blog (a petición, 2026-11-04).
  const conPedirCita =
    !rutaSinLocale.startsWith('/visita-fely-campo/cita') &&
    rutaSinLocale !== '/blog' &&
    !rutaSinLocale.startsWith('/blog/');

  return (
    <>
      <Navbar
        transparent={isHome || tieneProductHero || esFichaRunway || esHeroBlog}
        crecerLogo={isHome}
        textoOscuro={esPretAPorter}
      />
      <main>{children}</main>
      {/* AteliersCita encima de PedirCita: la banda de cita va siempre
          justo antes del footer. */}
      {conAteliersCita && (rutaSinLocale === '/atelier' ? ateliersCitaSeparado : ateliersCita)}
      {conPedirCita && (rutaSinLocale.startsWith('/atelier-fiesta/') ? pedirCitaSeparado : pedirCita)}
      {isHome && <NewsletterModalGlobal />}
    </>
  );
}
