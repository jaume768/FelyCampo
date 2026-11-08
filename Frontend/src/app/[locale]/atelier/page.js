/* ============================================================
   ATELIER (índice: Novias + Fiesta) — Fely Campo. Ruta: /atelier
   Server Component: solo el SplitMedia variante="landing" — el mismo
   bloque Atelier (Novias | Fiesta) que la página de inicio, con los
   mismos datos: se edita una sola vez en el admin, «Página de inicio ›
   Atelier» (src/datos/landing.js, "atelier"), y vale para las dos
   páginas. data-navbar-hero en el envoltorio para que Navbar sepa cuándo
   volverse sólido (ver RUTAS_CON_PRODUCT_HERO en ../layout.js).
   (El antiguo atelierIndex.js, con frases y tarjetas que ya no salían
   en la web, se quitó: ver el historial de git.)
   ============================================================ */

import { SplitMedia } from '@/components/layout';
import { enlaceEn, obtenerLanding, textoEn } from '@/lib/landing';
import { metadataPagina, textosSeo } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';
import { cargarContenido } from '@/lib/contenidoServidor';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  return metadataPagina({ locale, ruta: '/atelier' });
}

export default async function Pagina({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const { atelier } = obtenerLanding();
  const pieza = (bloque) => ({
    src: bloque.imagen,
    tipo: 'imagen',
    titulo: textoEn(bloque.titulo, locale),
    cta: textoEn(bloque.boton, locale),
    href: enlaceEn(bloque.enlace, locale),
  });

  return (
    <section>
      <h1 className="sr-only">{textosSeo('/atelier', locale).h1}</h1>
      <div data-navbar-hero>
        <SplitMedia variante="landing" items={[pieza(atelier.novias), pieza(atelier.fiesta)]} />
      </div>
    </section>
  );
}
