/* Ruta: /ayuda/atencion-cliente
   Destino del enlace "Más información en Atención al cliente" del
   acordeón "Envíos y devoluciones" de la ficha de producto (ver
   tienda/[producto]/page.js) — mismos datos de contacto que ahí,
   namespace compartido "atencionCliente" en messages/{locale}.json. */

import { getTranslations } from 'next-intl/server';
import styles from './page.module.css';

export default async function Pagina() {
  const t = await getTranslations('atencionCliente');

  return (
    <section className="seccion contenedor">
      <h1 className={styles.titulo}>{t('titulo')}</h1>

      <div className={styles.lista}>
        <div className={styles.fila}>
          <span className={styles.etiqueta}>{t('emailLabel')}</span>
          <a href="mailto:info@felycampo.com" className="enlace-texto">info@felycampo.com</a>
        </div>

        <div className={styles.fila}>
          <span className={styles.etiqueta}>{t('telefonoLabel')}</span>
          <a href="tel:+34683703644" className="enlace-texto">+34 683 703 644</a>
        </div>

        <div className={styles.fila}>
          <span className={styles.etiqueta}>{t('horarioLabel')}</span>
          <span>{t('horario')}</span>
        </div>

        <div className={styles.fila}>
          <span className={styles.etiqueta}>{t('clickCollectLabel')}</span>
          <span>{t('clickCollect')}</span>
        </div>

        <div className={styles.fila}>
          <span className={styles.etiqueta}>{t('direccionLabel')}</span>
          <a
            href="https://maps.app.goo.gl/rXUHfS5SdrVNNFJq7"
            target="_blank"
            rel="noopener noreferrer"
            className="enlace-texto"
          >
            C/ Laguna Negra 17-19, Salamanca
          </a>
        </div>
      </div>
    </section>
  );
}
