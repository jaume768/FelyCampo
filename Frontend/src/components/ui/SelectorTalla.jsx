'use client';

/* ============================================================
   SELECTOR DE TALLA — Fely Campo
   Escala de tallas de Fely Campo: 36 a 64 (ya no XS/S/M/L/XL), ver
   TALLAS_DISPONIBLES en guiaTallasData.js — "tallas" llega ya resuelto
   desde quien lo use (catálogo de ejemplo, panel admin...), este
   componente no conoce el rango completo, solo pinta lo que le pasan.
   Con más tallas que las que caben en una fila (habitual con las 15
   del rango completo) solo se enseña la primera fila + un chip "+"
   al final para desplegar el resto (ver "colapsarEnUnaFila" abajo) —
   así el selector no arranca ya "infinito" antes de que el cliente
   toque nada.
   Uso:
     const [talla, setTalla] = useState(null);
     <SelectorTalla tallas={[36,38,40,42,44]} agotadas={[44]}
                     seleccionada={talla} onSelect={setTalla} />
   ============================================================ */

import { useLayoutEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './SelectorTalla.module.css';

/**
 * Selector de talla de producto. Las tallas en el array
 * 'agotadas' se muestran tachadas y deshabilitadas.
 * "colapsarEnUnaFila" (true por defecto): con más tallas de las que
 * caben en el ancho disponible, solo enseña la primera fila (la última
 * de sus tallas se sustituye por un chip "+" que despliega el resto).
 * Se mide el layout real (useLayoutEffect + ResizeObserver), no un
 * número fijo de tallas: así funciona igual sea cual sea el ancho del
 * contenedor (ficha de producto, modal de Atelier, lightbox...).
 */
function SelectorTalla({ tallas = [], agotadas = [], seleccionada, onSelect, tabIndex, colapsarEnUnaFila = true }) {
  const listaRef = useRef(null);
  const [expandido, setExpandido] = useState(false);
  const [cantidadPrimeraFila, setCantidadPrimeraFila] = useState(tallas.length);

  // Cuántas tallas caben en la primera fila: se mide sobre los botones
  // ya pintados (todos, sin colapsar) comparando su offsetTop contra el
  // del primero — los que comparten fila siguen igual, los que ya han
  // saltado de línea quedan fuera de la cuenta. Recalcula si cambia el
  // ancho disponible (ResizeObserver) o la propia lista de tallas.
  useLayoutEffect(() => {
    if (!colapsarEnUnaFila) return undefined;
    const nodo = listaRef.current;
    if (!nodo) return undefined;

    const medir = () => {
      const botones = Array.from(nodo.querySelectorAll(`[data-talla-medible]`));
      if (botones.length === 0) return;
      // Ya colapsado, algunos botones llegan con "hidden" puesto por el
      // render anterior — para medir el ancho real hace falta destaparlos
      // un instante (si no, su offsetTop sería 0 y falsearía la cuenta).
      // Todo en el mismo tick sin ceder el hilo (sin await/setState de por
      // medio), así el navegador no llega a pintar el estado intermedio.
      const ocultosPrevios = botones.map((boton) => boton.hidden);
      botones.forEach((boton) => { boton.hidden = false; });
      const primeraFilaTop = botones[0].offsetTop;
      const enPrimeraFila = botones.filter((boton) => boton.offsetTop === primeraFilaTop).length;
      botones.forEach((boton, indice) => { boton.hidden = ocultosPrevios[indice]; });
      setCantidadPrimeraFila(enPrimeraFila);
    };

    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(nodo);
    return () => observer.disconnect();
  }, [colapsarEnUnaFila, tallas]);

  const colapsable = colapsarEnUnaFila && !expandido && cantidadPrimeraFila < tallas.length;
  // Un hueco menos para el chip "+", que ocupa el mismo tamaño que una
  // talla — si N tallas ya cabían en la fila, N-1 + el chip "+" siguen
  // cabiendo igual (mismo ancho total).
  const tallasVisibles = colapsable ? tallas.slice(0, Math.max(cantidadPrimeraFila - 1, 1)) : tallas;

  return (
    <div className={styles.lista} ref={listaRef}>
      {tallas.map((t) => {
        const agotada = agotadas.includes(t);
        const activa = seleccionada === t;
        const clase = [
          styles.talla,
          agotada && styles.agotada,
          activa && !agotada && styles.activa,
        ].filter(Boolean).join(' ');
        const oculto = colapsable && !tallasVisibles.includes(t);

        return (
          <button
            key={t}
            type="button"
            data-talla-medible=""
            disabled={agotada}
            onClick={() => onSelect(t)}
            className={clase}
            tabIndex={tabIndex}
            hidden={oculto}
          >
            {t}
          </button>
        );
      })}

      {colapsable && (
        <button
          type="button"
          className={styles.talla}
          onClick={() => setExpandido(true)}
          aria-label="Ver más tallas"
          tabIndex={tabIndex}
        >
          <Plus size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default SelectorTalla;
