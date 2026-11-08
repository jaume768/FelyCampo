// fuentes.js — Inter y Source Serif 4 con next/font (parte de Next, no es
// una dependencia aparte).
//
// Antes: @import de Google Fonts al principio de global.css. Bloqueaba el
// renderizado de TODAS las páginas (CSS → CSS de Google → fuente, ~450 ms
// en Lighthouse) y llevaba a un dominio de terceros en cada visita.
//
// Ahora los archivos se descargan en el build y se sirven desde el propio
// dominio. preload: false a propósito: --font-base empieza por Helvetica y
// --font-editorial por Charter (global.css), así que en Mac e iOS estas
// fuentes ni se usan; con preload, todo el mundo las descargaría igual.
// Sin preload, el navegador solo las pide si de verdad las necesita
// (Android, Linux…), con display: swap.
//
// Las dos son fuentes variables: un solo archivo por fuente para todos los
// pesos (Inter 300-800; Source Serif 4 con su eje óptico, opsz).

import { Inter, Source_Serif_4 } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-inter',
});

export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  preload: false,
  variable: '--font-source-serif',
});

export const clasesFuentes = `${inter.variable} ${sourceSerif.variable}`;
