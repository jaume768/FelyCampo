'use client';

/* ============================================================
   CARGAR MÁS — Fely Campo (paginación por carga progresiva)
   Texto de estado + barra de progreso + botón de carga, para
   listados de producto (PLP). Gestiona internamente cuántos
   productos se muestran; el padre solo declara el total y,
   si necesita reaccionar (ej. pedir más datos), recibe
   onCargarMas con el nuevo número mostrado.
   Uso:
     <CargarMas total={95} inicial={20} lote={20} />
     <CargarMas total={95} lote={20} onCargarMas={(n) => ...} />
   ============================================================ */

import { useState } from 'react';
import Boton from '../ui/Boton';
import styles from './CargarMas.module.css';

function CargarMas({ total, inicial = 20, lote = 20, onCargarMas }) {
  const [mostrados, setMostrados] = useState(Math.min(inicial, total));

  const quedanProductos = mostrados < total;
  const progreso = total > 0 ? (mostrados / total) * 100 : 100;

  function cargarMas() {
    const siguiente = Math.min(mostrados + lote, total);
    setMostrados(siguiente);
    onCargarMas?.(siguiente);
  }

  return (
    <div className={styles.contenedor}>
      <p className={styles.estado}>
        Mostrando {mostrados} de {total} productos
      </p>

      <div className={styles.pista}>
        <div className={styles.relleno} style={{ width: `${progreso}%` }} />
      </div>

      {quedanProductos && (
        <Boton variante="solido" tamano="full" onClick={cargarMas}>
          Cargar más
        </Boton>
      )}
    </div>
  );
}

export default CargarMas;
