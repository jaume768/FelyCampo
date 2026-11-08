/* ============================================================
   LAYOUT RAÍZ — envuelve todas las páginas.
   Aquí van el favicon y las fuentes — el equivalente en Next.js
   a los <link> del <head> de styleguide.html (que los necesita
   aparte, por ser un HTML independiente sin build).
   ============================================================ */

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import '@/styles/global.css';
import { clasesFuentes } from '@/styles/fuentes';
import { Footer, CookieConsent, BotonWhatsapp, Analitica } from '@/components/layout';
import MarcoRuta from '@/components/layout/MarcoRuta';
// Server Components (usan next-intl/server): importados directamente, no
// desde el barrel de layout, que también cargan Client Components.
import AteliersCita from '@/components/layout/AteliersCita';
import PedirCita from '@/components/layout/PedirCita';
import { SITE_URL, SITIO_INDEXABLE } from '@/lib/seo';
import { CarritoProvider } from '@/context/CarritoContext';
import { MiCuentaProvider } from '@/context/MiCuentaContext';
import { locales } from '@/i18n';
import { cargarContenido } from '@/lib/contenidoServidor';
import ContenidoCliente, { CLAVES_MARCO } from '@/components/layout/ContenidoCliente';

// Qué cambia del marco según la página (Navbar transparente, bandas de
// cita, newsletter de la home): en components/layout/MarcoRuta.jsx, con
// usePathname. NO leas headers() aquí: haría dinámicas todas las páginas.

// Valores por defecto de SEO para todo el sitio — cada página pone los
// suyos (title, description, canonical, hreflang) con metadataPagina()
// de src/lib/seo.js. Aquí solo: dominio base (para que las URLs
// relativas de Open Graph salgan absolutas), plantilla de título para
// las pocas páginas que no lo fijan, y el noindex GLOBAL mientras
// SITIO_INDEXABLE no sea "true" (entorno de pruebas) — gana a cualquier
// "index" de una página concreta porque esas nunca lo declaran en
// positivo, solo el noindex de las privadas.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fely Campo | Vestidos de novia y fiesta a medida',
    template: '%s | Fely Campo',
  },
  description: 'Firma de moda femenina nacida en Salamanca. Vestidos de novia y fiesta a medida en Salamanca, Madrid y Oviedo, y prêt-à-porter online.',
  // Indexable: max-image-preview:large (como la web anterior, auditoría
  // SEO M3) para que Google pueda usar las fotos grandes en resultados y
  // Discover. Las páginas privadas (indexar:false en metadataPagina)
  // declaran su propio "robots" y reemplazan entero este.
  robots: SITIO_INDEXABLE
    ? { index: true, follow: true, 'max-image-preview': 'large', googleBot: { index: true, follow: true, 'max-image-preview': 'large' } }
    : { index: false, follow: false },
  // Verificación del dominio en Meta Business (la misma que la web
  // anterior en WordPress): sin ella se pierde la verificación de
  // felycampo.com para el Pixel y los anuncios.
  other: {
    'facebook-domain-verification': '52ua5uh83t9xk46o8js2214qt0aczn',
  },
  // Favicon: F negra sobre blanco por defecto; en modo oscuro del
  // navegador/sistema, la versión invertida (F blanca sobre negro). PNG,
  // no WebP: Safari no admite favicons WebP.
  icons: {
    icon: [
      { url: '/img/logo/FelyCampo-logo-favicon-blanco.png', type: 'image/png', sizes: '512x512' },
      { url: '/img/logo/FelyCampo-logo-favicon.png', type: 'image/png', sizes: '512x512', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/img/logo/FelyCampo-logo-favicon-blanco.png',
  },
};

// Sin páginas generadas en el build: el contenido sale de la API, que en
// el build de Docker no está. Cada página se genera en su primera visita y
// queda en caché (estática) hasta que se publica algo desde el panel
// (revalidateTag «contenido», ver src/lib/contenidoServidor.js).
export function generateStaticParams() {
  return [];
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  // Sin esto next-intl lee el idioma de las cabeceras y la página deja de
  // poder ser estática. Va en este layout y en cada página.
  setRequestLocale(locale);
  await cargarContenido();

  const messages = await getMessages();

  return (
    <html lang={locale} className={clasesFuentes} data-scroll-behavior="smooth">
      <body>
        <Analitica />
        {/* timeZone también aquí: los componentes de cliente que formatean
            fechas avisaban de ENVIRONMENT_FALLBACK al prerenderizar. */}
        <NextIntlClientProvider messages={messages} timeZone="Europe/Madrid">
          <ContenidoCliente claves={CLAVES_MARCO}>
          <CarritoProvider>
            <MiCuentaProvider>
              <MarcoRuta
                locale={locale}
                ateliersCita={<AteliersCita />}
                ateliersCitaSeparado={<AteliersCita separado />}
                pedirCita={<PedirCita />}
                pedirCitaSeparado={<PedirCita separado />}
              >
                {children}
              </MarcoRuta>
              <Footer />
              <BotonWhatsapp />
              <CookieConsent />
            </MiCuentaProvider>
          </CarritoProvider>
          </ContenidoCliente>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
