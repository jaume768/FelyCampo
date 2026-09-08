/* ============================================================
   FOOTER — Fely Campo
   ============================================================ */

'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Boton from '@/components/ui/Boton';
import styles from './Footer.module.css';

// Simulación — sustituir por la llamada real al endpoint de newsletter
// cuando exista backend. Deja el try/catch de handleSubmitNewsletter
// listo para propagar un error real.
const suscribirNewsletter = (correo) => new Promise((resolve) => setTimeout(resolve, 500));

/**
 * Pie de página de toda la web pública. 4 columnas + newsletter.
 */
function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState(null); // null | 'cargando' | 'exito' | 'error'

  const enviarNewsletter = async () => {
    setEstado('cargando');
    try {
      await suscribirNewsletter(email);
      setEstado('exito');
      setEmail('');
    } catch {
      setEstado('error');
    }
  };

  const handleSubmitNewsletter = (e) => {
    e.preventDefault();
    enviarNewsletter();
  };

  // Mismo mecanismo que tenía el Navbar: reemplaza el segmento de locale
  // en la ruta actual, conservando la página en la que estabas.
  const otherLocale = locale === 'es' ? 'en' : 'es';

  // Mismo helper que usa el Navbar para anteponer el locale a las rutas
  // internas (ej. el enlace a la política de privacidad).
  const withLocale = (href) => `/${locale}${href}`;

  const switchLocale = () => {
    const segments = pathname.split('/');
    segments[1] = otherLocale;
    router.replace(segments.join('/'));
  };

  const columnas = [
    { titulo: 'Atención cliente', enlaces: ['Envíos', 'Devoluciones', 'Guía de cuidados', 'Contacto', 'FAQ'] },
    { titulo: 'Fely Campo', enlaces: ['Sobre Nosotros', 'Responsabilidad', 'Puntos de venta', 'Trabaja con nosotras'] },
    { titulo: 'Síguenos', enlaces: ['Instagram', 'YouTube', 'TikTok'] },
  ];

  return (
    <footer className={styles.footer}>
      {/* Logo a la mitad de escala que antes (era 100% del ancho del
          footer) — firma de marca discreta, primero en el footer en
          vez de la pieza a pantalla completa que era. */}
      <img src="/img/logo/logo-felycampo.png" alt="Fely Campo" className={styles.footerLogo} />

      <div className={styles.contenido}>
        <div className={styles.grid}>
          <div className={styles.columnas}>
            {columnas.map((col) => (
              <div key={col.titulo}>
                <h3 className={styles.titulo}>{col.titulo}</h3>
                <ul className={styles.lista}>
                  {col.enlaces.map((e) => (
                    <li key={e}><a href="#" className={styles.enlace}>{e}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Segundo bloque de la fila (35%) — en mobile sube por delante
              de las columnas (order:-1), es lo que más importa aquí. */}
          <div className={styles.newsletter}>
            <p className={styles.titulo}>Newsletter</p>
            <p className={styles.parrafo}>{t('newsletter.texto')}</p>
            <div className={styles.filaNewsletter}>
              <form className={styles.formNewsletter} onSubmit={handleSubmitNewsletter}>
                <input
                  type="email"
                  placeholder="nombre@email.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </form>
              <Boton
                variante="solido"
                tamano="s"
                type="button"
                onClick={enviarNewsletter}
                desactivado={estado === 'cargando' || email.trim().length === 0}
                className={styles.botonEnviar}
              >
                {t('newsletter.enviar')}
              </Boton>
            </div>
            {estado === 'exito' && (
              <p className={`${styles.estado} ${styles.estadoExito}`} role="status">
                {t('newsletter.exito')}
              </p>
            )}
            {estado === 'error' && (
              <p className={`${styles.estado} ${styles.estadoError}`} role="alert">
                {t('newsletter.error')}
              </p>
            )}
            <p className={styles.consentimiento}>
              {t.rich('newsletter.consentimiento', {
                privacidad: (chunks) => (
                  <a href={withLocale('/legal/privacidad')} className={styles.consentimientoEnlace}>
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
        </div>

        <div className={styles.legal}>
          <span className={styles.copy}>Fely Campo © {new Date().getFullYear()}</span>
          <div className={styles.legalLista}>
            <a href="#" className={styles.legalEnlace}>Términos y condiciones</a>
            <a href="#" className={styles.legalEnlace}>Política de cookies</a>
            <a href="#" className={styles.legalEnlace}>Política de privacidad</a>
          </div>
          <div className={styles.languageSelector}>
            <button
              className={`${styles.languageOption} ${locale === 'es' ? styles.languageOptionActivo : ''}`}
              onClick={locale === 'es' ? undefined : switchLocale}
              disabled={locale === 'es'}
            >
              ES
            </button>
            <span className={styles.languageDivider}>|</span>
            <button
              className={`${styles.languageOption} ${locale === 'en' ? styles.languageOptionActivo : ''}`}
              onClick={locale === 'en' ? undefined : switchLocale}
              disabled={locale === 'en'}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
