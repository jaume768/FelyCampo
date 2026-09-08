// GuiaTallas.jsx

'use client';

/* ============================================================
   GUÍA DE TALLAS ("Medidas") — Fely Campo
   Panel lateral desde la derecha (PanelLateral, lado="derecha",
   atraparFoco) con la tabla de medidas del cuerpo — referencia visual:
   el modal de guía de tallas de Mango, pero sin sus tabs "Artículo"/
   "Cuerpo" (aquí solo hay medidas de cuerpo).
   Uso:
     const [abierta, setAbierta] = useState(false);
     <button onClick={() => setAbierta(true)}>Guía de tallas</button>
     <GuiaTallas abierto={abierta} onCerrar={() => setAbierta(false)} />
   ============================================================ */

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { PanelLateral } from '../ui';
import { CLAVES_MEDIDAS, TALLAS_MEDIDAS, formatearMedida } from './guiaTallasData';
import styles from './GuiaTallas.module.css';

function GuiaTallas({ abierto, onCerrar }) {
  const t = useTranslations('guiaTallas');
  const [tallaSeleccionada, setTallaSeleccionada] = useState(TALLAS_MEDIDAS[0].talla);
  const columnasRef = useRef(new Map());

  // Al elegir una talla en los chips, la tabla se desplaza (si hiciera
  // falta) para dejar su columna a la vista — .tablaScroll sigue
  // permitiendo scroll-x pero sin barra visible (ver
  // GuiaTallas.module.css), así que sin esto una columna fuera del
  // viewport quedaría seleccionada pero invisible.
  const seleccionarTalla = (talla) => {
    setTallaSeleccionada(talla);
    columnasRef.current.get(talla)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <PanelLateral abierto={abierto} onCerrar={onCerrar} lado="derecha" atraparFoco>
      <div className={styles.cabecera}>
        <h2 className={styles.titulo}>{t('titulo')}</h2>
        <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label={t('cerrar')}>
          <X size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
        </button>
      </div>

      <section className={styles.seccionTabla}>
        <div className={styles.grupoTallas}>
          <span className={styles.etiquetaSeccion}>{t('seleccionaTallaje')}</span>

          <div className={styles.chips} role="radiogroup" aria-label={t('talla')}>
            {TALLAS_MEDIDAS.map(({ talla }) => (
              <button
                key={talla}
                type="button"
                role="radio"
                aria-checked={tallaSeleccionada === talla}
                className={`${styles.chip} ${tallaSeleccionada === talla ? styles.chipActivo : ''}`}
                onClick={() => seleccionarTalla(talla)}
              >
                {talla}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grupoTabla}>
          <div className={styles.filaControles}>
            <span className={styles.etiquetaSeccion}>{t('vistaPatron')}</span>
            <span className={styles.unidad}>{t('unidadCm')}</span>
          </div>

          <div className={styles.tablaScroll}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col" className={styles.thMedida} />
                  {TALLAS_MEDIDAS.map(({ talla }) => (
                    <th
                      key={talla}
                      ref={(nodo) => {
                        if (nodo) columnasRef.current.set(talla, nodo);
                        else columnasRef.current.delete(talla);
                      }}
                      scope="col"
                      className={`${styles.th} ${talla === tallaSeleccionada ? styles.columnaActiva : ''}`}
                    >
                      {talla}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLAVES_MEDIDAS.map((clave) => (
                  <tr key={clave}>
                    <th scope="row" className={styles.thMedida}>{t(`medidas.${clave}.etiqueta`)}</th>
                    {TALLAS_MEDIDAS.map((fila) => (
                      <td
                        key={fila.talla}
                        className={`${styles.td} ${fila.talla === tallaSeleccionada ? styles.columnaActiva : ''}`}
                      >
                        {formatearMedida(fila[clave])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.disclaimer}>{t('disclaimer')}</p>
        </div>
      </section>

      <section className={styles.seccionMedir}>
        <h3 className={styles.subtitulo}>{t('comoMedir')}</h3>
        {/* Placeholder — a sustituir por la ilustración real del cuerpo
            con cada medida señalada. */}
        <img src="/img/guia-tallas/como-medir.svg" alt="" className={styles.ilustracion} />
        <ol className={styles.listaMedir}>
          {CLAVES_MEDIDAS.map((clave, indice) => (
            <li key={clave} className={styles.itemMedir}>
              <div className={styles.filaNumero}>
                <span className={styles.numeroMedir}>{indice + 1}</span>
                <strong className={styles.etiquetaMedir}>{t(`medidas.${clave}.etiqueta`)}</strong>
              </div>
              <p className={styles.textoMedir}>{t(`medidas.${clave}.texto`)}</p>
            </li>
          ))}
        </ol>
      </section>
    </PanelLateral>
  );
}

export default GuiaTallas;
