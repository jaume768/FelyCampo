'use client';

/* ============================================================
   PICKER DRAWER — Fely Campo (admin)
   Selector de "algo ya existente en el sistema" (imagen ya subida,
   producto ya publicado, reseña ya creada) — nunca una subida a
   ciegas. Es la pieza central de la sección Diseño: se abre como
   panel lateral (reutiliza PanelLateral), enseña una cuadrícula de
   opciones ya seleccionables y confirma con un botón.
   No sabe seleccionar por sí solo — es controlado: recibe
   "seleccionados" y avisa con onToggle, el padre decide la lógica
   exacta (single-select reemplaza, multi-select con tope, etc.).
   Uso:
     <PickerDrawer
       abierto={abierto} onCerrar={cerrar} titulo="Elegir productos"
       items={productosMock} claveItem={(p) => p.id}
       seleccionados={seleccionados} onToggle={toggle}
       max={4}
       renderItem={(p) => <img src={p.imagen} alt={p.nombre} />}
       onConfirmar={aplicarSeleccion}
     />
   ============================================================ */

import { X, Check } from 'lucide-react';
import { PanelLateral, Boton } from '../ui';
import styles from './PickerDrawer.module.css';

function PickerDrawer({
  abierto,
  onCerrar,
  titulo,
  items,
  claveItem = (item) => item.id,
  seleccionados = [],
  onToggle,
  max,
  renderItem,
  onConfirmar,
  columnas = 2,
}) {
  return (
    <PanelLateral abierto={abierto} onCerrar={onCerrar}>
      <div className={styles.cabecera}>
        <p className={styles.titulo}>{titulo}</p>
        <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar selector">
          <X />
        </button>
      </div>

      <p className={styles.contador}>
        {seleccionados.length} seleccionada{seleccionados.length === 1 ? '' : 's'}
        {max ? ` de ${max} máx.` : ''}
      </p>

      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
        {items.map((item) => {
          const clave = claveItem(item);
          const marcado = seleccionados.includes(clave);
          const bloqueado = !marcado && max && seleccionados.length >= max;

          return (
            <button
              key={clave}
              type="button"
              disabled={bloqueado}
              className={`${styles.tarjeta} ${marcado ? styles.seleccionada : ''}`}
              onClick={() => onToggle(clave)}
            >
              {marcado && (
                <span className={styles.marca}>
                  <Check size={14} />
                </span>
              )}
              {renderItem(item, marcado)}
            </button>
          );
        })}
      </div>

      <div className={styles.pie}>
        <Boton
          variante="solido"
          tamano="full"
          onClick={() => {
            onConfirmar?.();
            onCerrar();
          }}
        >
          Confirmar selección
        </Boton>
      </div>
    </PanelLateral>
  );
}

export default PickerDrawer;
