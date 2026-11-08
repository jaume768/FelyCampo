'use client';

/* ============================================================
   SELECTOR DE COLORES — Fely Campo (admin)
   Elegir los colores de un producto pulsando su muestra, agrupados por
   familias (Neutros, Marrones, Rojos…), de la biblioteca de colores del
   admin (lib/paletaColores.js, la misma de E-commerce › Materiales ›
   Colores). Arriba, los elegidos, en orden, con una «×» para quitarlos.
   Valor: [{ hex, nombre }] (nombre en español, como lo enseña la web).
   ============================================================ */

import { Check, X } from 'lucide-react';
import { coloresMock, familiasColorMock } from '@/lib/paletaColores';
import styles from './SelectorColores.module.css';

const mismoColor = (a, b) => a.hex.toLowerCase() === b.hex.toLowerCase() || a.nombre === b.nombre;

function SelectorColores({ valor = [], onChange }) {
  const alternar = (color) => {
    const elegido = { hex: color.hex, nombre: color.nombre.es };
    onChange(valor.some((c) => mismoColor(c, elegido))
      ? valor.filter((c) => !mismoColor(c, elegido))
      : [...valor, elegido]);
  };

  return (
    <div className={styles.selector}>
      <div className={styles.elegidos}>
        <span className={styles.etiqueta}>Colores del producto</span>
        {valor.length === 0 && <span className={styles.falta}>Elige al menos uno</span>}
        <div className={styles.lista}>
          {valor.map((color) => (
            <span key={`${color.hex}-${color.nombre}`} className={styles.elegido}>
              <span className={styles.punto} style={{ background: color.hex }} aria-hidden="true" />
              {color.nombre}
              <button type="button" className={styles.quitar} onClick={() => onChange(valor.filter((c) => c !== color))} aria-label={`Quitar ${color.nombre}`}>
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {familiasColorMock.map((familia) => {
        const colores = coloresMock.filter((c) => c.familia === familia.id);
        if (colores.length === 0) return null;
        return (
          <div key={familia.id} className={styles.familia}>
            <p className={styles.familiaNombre}>{familia.etiqueta}</p>
            <div className={styles.muestras}>
              {colores.map((color) => {
                const activo = valor.some((c) => mismoColor(c, { hex: color.hex, nombre: color.nombre.es }));
                return (
                  <button
                    key={color.id}
                    type="button"
                    className={`${styles.muestra} ${activo ? styles.muestraActiva : ''}`}
                    onClick={() => alternar(color)}
                    aria-pressed={activo}
                    title={color.nombre.es}
                  >
                    <span className={styles.circulo} style={{ background: color.hex }}>
                      {activo && <Check size={14} className={styles.check} aria-hidden="true" />}
                    </span>
                    <span className={styles.nombre}>{color.nombre.es}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SelectorColores;
