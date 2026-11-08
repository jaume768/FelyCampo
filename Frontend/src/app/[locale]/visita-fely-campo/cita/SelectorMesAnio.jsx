'use client';

/* ============================================================
   SELECTOR DE MES/AÑO — formulario de cita (/visita-fely-campo/cita)
   Un único campo para la "Fecha del evento" (antes dos <select>, mes y
   año — unificados a petición): parece un select más del formulario y,
   al pulsarlo, abre un panel con el año arriba (flechas ‹ › para
   cambiarlo) y los 12 meses debajo. Elegir un mes cierra el panel.

   Los años se calculan con la fecha de hoy (año actual + 3), así que la
   lista se actualiza sola cada año. Los meses ya pasados del año actual
   salen desactivados (la API los rechaza igual, ver api/cita/route.js).
   Se cierra con Escape o pulsando fuera.

   valor: "AAAA-MM" o '' · onChange(valor) · meses: 12 nombres ·
   textos: { placeholder, anioAnterior, anioSiguiente }.
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const ANIOS_VISTA = 4; // año actual + 3

export default function SelectorMesAnio({ valor, onChange, meses, textos }) {
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth() + 1;
  const anioMaximo = anioActual + ANIOS_VISTA - 1;

  const [anioElegido, mesElegido] = valor ? valor.split('-').map(Number) : [null, null];
  const [abierto, setAbierto] = useState(false);
  const [anioVista, setAnioVista] = useState(anioElegido || anioActual);
  const contenedor = useRef(null);
  const disparador = useRef(null);

  // Al abrir, el panel enseña el año ya elegido (o el actual).
  const alternar = () => {
    if (!abierto) setAnioVista(anioElegido || anioActual);
    setAbierto(!abierto);
  };

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (evento) => {
      if (contenedor.current && !contenedor.current.contains(evento.target)) setAbierto(false);
    };
    const tecla = (evento) => {
      if (evento.key === 'Escape') {
        setAbierto(false);
        disparador.current?.focus();
      }
    };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [abierto]);

  const elegir = (mes) => {
    onChange(`${anioVista}-${String(mes).padStart(2, '0')}`);
    setAbierto(false);
    disparador.current?.focus();
  };

  const texto = valor ? `${meses[mesElegido - 1]} ${anioElegido}` : textos.placeholder;

  return (
    <div className={styles.mesAnio} ref={contenedor}>
      <button
        type="button"
        ref={disparador}
        className={`${styles.select} ${styles.mesAnioDisparador} ${valor ? '' : styles.mesAnioVacio}`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={alternar}
      >
        {texto}
      </button>

      {abierto && (
        <div className={styles.mesAnioPanel} role="dialog" aria-label={textos.placeholder.replace(/^\*/, '')}>
          <div className={styles.mesAnioCabecera}>
            <button
              type="button"
              className={styles.mesAnioFlecha}
              aria-label={textos.anioAnterior}
              disabled={anioVista <= anioActual}
              onClick={() => setAnioVista(anioVista - 1)}
            >
              ‹
            </button>
            <span className={styles.mesAnioAnio} aria-live="polite">{anioVista}</span>
            <button
              type="button"
              className={styles.mesAnioFlecha}
              aria-label={textos.anioSiguiente}
              disabled={anioVista >= anioMaximo}
              onClick={() => setAnioVista(anioVista + 1)}
            >
              ›
            </button>
          </div>

          <div className={styles.mesAnioMeses}>
            {meses.map((nombreMes, indice) => {
              const mes = indice + 1;
              const pasado = anioVista === anioActual && mes < mesActual;
              const elegido = anioVista === anioElegido && mes === mesElegido;
              return (
                <button
                  key={nombreMes}
                  type="button"
                  className={`${styles.mesAnioMes} ${elegido ? styles.mesAnioMesElegido : ''}`}
                  disabled={pasado}
                  aria-pressed={elegido}
                  onClick={() => elegir(mes)}
                >
                  {nombreMes}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
