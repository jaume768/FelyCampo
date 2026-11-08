/* Ruta comodín: cualquier URL con idioma que no coincida con ninguna
   página (/es/esto-no-existe, /es/atelier/novias/xyz...). Ninguna URL
   se queda en 404 (a petición): 301 al nivel de arriba
   (/es/atelier/novias/xyz → /es/atelier/novias). Si ese tampoco
   existe vuelve a caer aquí y sube otro nivel, hasta la home del
   idioma. Las páginas quitadas a propósito tienen su destino exacto
   en RUTAS_ELIMINADAS (src/proxy.js). */

import { permanentRedirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { cargarContenido } from '@/lib/contenidoServidor';

export default async function Resto({ params }) {
  const { locale, resto } = await params;
  setRequestLocale(locale);
  await cargarContenido();
  const padre = resto.length > 1 ? `/${locale}/${resto.slice(0, -1).join('/')}` : `/${locale}`;
  permanentRedirect(padre);
}
