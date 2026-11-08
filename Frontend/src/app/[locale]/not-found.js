/* ============================================================
   PÁGINA 404 — Fely Campo. Se renderiza dentro del layout de [locale]
   (Navbar/Footer normales, ver ../layout.js) para cualquier ruta que
   no coincida con ninguna página — el middleware (../../proxy.js,
   localePrefix:"always") ya garantiza que la URL trae un locale
   válido antes de llegar aquí, así que no hace falta leer el pathname
   a mano: getLocale()/getTranslations() resuelven el idioma de la
   petición como en cualquier otra página de este segmento.

   not-found.js no recibe "params" (a diferencia de page.js/layout.js)
   — de ahí getLocale() en vez de desestructurar params.locale.

   Diseño editorial minimalista: "404" grande en --font-editorial
   itálica (mismo tratamiento que .cita en BlogArticulo.module.css,
   la única nota "de autor" de la página) a tamaño --text-h1, eyebrow
   pequeño encima, un párrafo corto y un único CTA sólido de vuelta al
   inicio — sin ProductHero, imagen ni nada más: cuanto menos, mejor
   para una página de error. */

import { getLocale, getTranslations } from 'next-intl/server';
import { Boton } from '@/components/ui';
import styles from './not-found.module.css';

export default async function NoEncontrado() {
  const locale = await getLocale();
  const t = await getTranslations('notFound');

  return (
    <section className={styles.pagina}>
      <p className={styles.eyebrow}>{t('eyebrow')}</p>
      <h1 className={styles.numero}>404</h1>
      <p className={styles.texto}>{t('texto')}</p>
      <Boton variante="solido" href={`/${locale}`}>{t('boton')}</Boton>
    </section>
  );
}
