/* ============================================================
   LAYOUT RAÍZ — envuelve todas las páginas.
   Aquí van el favicon y las fuentes — el equivalente en Next.js
   a los <link> del <head> de styleguide.html (que los necesita
   aparte, por ser un HTML independiente sin build).
   ============================================================ */

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '@/styles/global.css';
import { Navbar, Footer, NewsletterModalGlobal } from '@/components/layout';
import { CarritoProvider } from '@/context/CarritoContext';
import { MiCuentaProvider } from '@/context/MiCuentaContext';
import { locales } from '@/i18n';

// Páginas con su propio ProductHero (ver
// src/components/layout/ProductHero.jsx) — nacen con el Navbar
// transparente igual que home, pero con el logo a tamaño normal (ver
// "crecerLogo" más abajo). No se importa desde Navbar.jsx: es un
// Client Component, y solo sus componentes (no valores sueltos)
// cruzan de forma fiable la frontera a un Server Component como este
// layout — mantener en sync con SUBMENU_STRUCTURE.tienda.items de
// Navbar.jsx si cambian las categorías de Tienda.
const RUTAS_CON_PRODUCT_HERO = [
  '/tienda',
  '/tienda/tops-y-camisetas',
  '/tienda/chaquetas-y-abrigos',
  '/tienda/faldas',
  '/tienda/vestidos',
  '/tienda/zapatos',
  '/tienda/accesorios',
  '/atelier/novias',
  '/atelier/fiesta',
  '/visita-fely-campo',
];

export const metadata = {
  title: 'Fely Campo · Moda de fiesta y novia',
  description: 'Firma de moda femenina fundada en Salamanca en 1997. Colecciones de fiesta y novia, prêt-à-porter y costura a medida.',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23E92174'/%3E%3C/svg%3E",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  // Home transparente (con el logo creciendo), páginas de listado de
  // producto (Tienda + categorías, Atelier/novias y /fiesta) también
  // transparentes pero con el logo a tamaño normal — llevan su propio
  // ProductHero debajo (ver layout.js más abajo/Navbar.jsx) — el
  // resto de páginas con el Navbar blanco de siempre. El pathname no
  // llega como prop al layout compartido — lo inyecta middleware.js
  // vía header (x-pathname) para no tener que renderizar <Navbar />
  // a mano en cada una de las páginas.
  const pathname = (await headers()).get('x-pathname') ?? '';
  const rutaSinLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';
  const isHome = rutaSinLocale === '/';
  const tieneProductHero = RUTAS_CON_PRODUCT_HERO.includes(rutaSinLocale);
  // Ficha de colección de Runway (/archivo/runway/[coleccion], ruta
  // dinámica — no puede vivir en RUTAS_CON_PRODUCT_HERO, que solo hace
  // match exacto): mismo Navbar transparente que Tienda/Atelier, con su
  // propio hero marcado data-navbar-hero (ver [coleccion]/page.js).
  const esFichaRunway = rutaSinLocale.startsWith('/archivo/runway/');
  // Igual que "esFichaRunway": páginas de categoría de Atelier
  // (/atelier/{novias,fiesta}/categoria/[categoria], ruta dinámica —
  // ver ese page.js) llevan el mismo ProductHero que ../page.js, así
  // que necesitan el mismo Navbar transparente.
  const esCategoriaAtelier = /^\/atelier\/(novias|fiesta)\/categoria\//.test(rutaSinLocale);

  return (
    <html lang={locale}>
      {/* La fuente Inter se carga vía @import en global.css (mismo criterio
          que styleguide.html) — si más adelante se prefiere optimizarla con
          next/font/google, este es el sitio donde se sustituiría. */}
      <body>
        <NextIntlClientProvider messages={messages}>
          <CarritoProvider>
            <MiCuentaProvider>
              <Navbar transparent={isHome || tieneProductHero || esFichaRunway || esCategoriaAtelier} crecerLogo={isHome} />
              <main>{children}</main>
              <Footer />
              {isHome && <NewsletterModalGlobal />}
            </MiCuentaProvider>
          </CarritoProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
