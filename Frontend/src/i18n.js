import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['es', 'en'];
export const defaultLocale = 'es';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested) ? requested : undefined;

  if (!locale) notFound();

  return {
    locale,
    // Sin zona horaria, next-intl avisa en cada render del servidor
    // (ENVIRONMENT_FALLBACK, salía en el build) y las fechas podrían
    // formatearse distinto en el servidor y en el navegador.
    timeZone: 'Europe/Madrid',
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
