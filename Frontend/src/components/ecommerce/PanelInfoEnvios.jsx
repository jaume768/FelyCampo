'use client';

/* ============================================================
   PANEL "ENVÍOS Y DEVOLUCIONES" — Fely Campo
   Se abre desde el botón .infoEnvio del resumen de /carrito — mismo
   PanelLateral desde la derecha que GuiaTallas/CarritoPanel. Contenido
   pendiente de confirmar con el equipo (de ahí "REVISAR" en el
   título) — precios y plazos son un primer borrador.
   ============================================================ */

import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { PanelLateral } from '../ui';
import styles from './PanelInfoEnvios.module.css';

function PanelInfoEnvios({ abierto, onCerrar }) {
  const t = useTranslations('infoEnvios');
  const locale = useLocale();

  const metodosEnvio = [
    { nombre: t('metodoDomicilio'), plazo: t('plazoDomicilio') },
    { nombre: t('metodoTienda'), plazo: t('plazoTienda') },
    { nombre: t('metodoPuntoRecogida'), plazo: t('plazoPuntoRecogida') },
  ];

  const metodosDevolucion = [
    t('metodoEnTienda'),
    t('metodoEnPuntoEntrega'),
    t('metodoRecogidaDomicilio'),
  ];

  return (
    <PanelLateral abierto={abierto} onCerrar={onCerrar} lado="derecha" atraparFoco>
      <div className={styles.cabecera}>
        <h2 className={styles.titulo}>{t('titulo')} REVISAR</h2>
        <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label={t('cerrar')}>
          <X size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
        </button>
      </div>

      <div className={styles.seccion}>
        <h3 className={styles.subtitulo}>{t('enviosTitulo')}</h3>
        {metodosEnvio.map((metodo) => (
          <div key={metodo.nombre} className={styles.filaMetodo}>
            <div>
              <p className={styles.metodoNombre}>{metodo.nombre}</p>
              <p className={styles.metodoPlazo}>{metodo.plazo}</p>
            </div>
            <span className={styles.metodoPrecio}>{t('gratis')}</span>
          </div>
        ))}
      </div>

      <div className={styles.seccion}>
        <h3 className={styles.subtitulo}>{t('devolucionesTitulo')}</h3>
        <p className={styles.intro}>{t('devolucionesIntro')}</p>

        {metodosDevolucion.map((nombre) => (
          <div key={nombre} className={styles.filaMetodo}>
            <p className={styles.metodoNombre}>{nombre}</p>
            <span className={styles.metodoPrecio}>{t('gratis')}</span>
          </div>
        ))}

        <p className={styles.notaFinal}>
          {t.rich('notaFinal', {
            ayuda: (chunks) => (
              <a href={`/${locale}/ayuda/atencion-cliente`} className="enlace-texto">{chunks}</a>
            ),
          })}
        </p>
      </div>
    </PanelLateral>
  );
}

export default PanelInfoEnvios;
