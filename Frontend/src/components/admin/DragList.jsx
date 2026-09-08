'use client';

/* ============================================================
   DRAG LIST — Fely Campo (admin)
   Lista reordenable por arrastre nativo (HTML5 draggable), sin
   librerías externas. Genérica: recibe los "items" y un render por
   item; al soltar, reordena el array y llama a onReorder con la
   copia nueva — no muta el array recibido.
   Uso:
     <DragList
       items={slides}
       claveItem={(s) => s.id}
       onReorder={setSlides}
       renderItem={(slide) => <SlideCard slide={slide} />}
     />
   ============================================================ */

import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import styles from './DragList.module.css';

function DragList({ items, claveItem = (item) => item.id, onReorder, renderItem, orientacion = 'vertical' }) {
  const [indiceArrastrado, setIndiceArrastrado] = useState(null);
  const [indiceSobre, setIndiceSobre] = useState(null);

  function soltarSobre(indiceDestino) {
    setIndiceSobre(null);
    if (indiceArrastrado === null || indiceArrastrado === indiceDestino) return;
    const copia = [...items];
    const [movido] = copia.splice(indiceArrastrado, 1);
    copia.splice(indiceDestino, 0, movido);
    onReorder(copia);
    setIndiceArrastrado(null);
  }

  return (
    <div className={`${styles.lista} ${orientacion === 'horizontal' ? styles.horizontal : ''}`}>
      {items.map((item, indice) => (
        <div
          key={claveItem(item)}
          draggable
          onDragStart={() => setIndiceArrastrado(indice)}
          onDragEnter={() => setIndiceSobre(indice)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => soltarSobre(indice)}
          onDragEnd={() => { setIndiceArrastrado(null); setIndiceSobre(null); }}
          className={`${styles.item} ${indiceArrastrado === indice ? styles.arrastrando : ''} ${indiceSobre === indice && indiceSobre !== indiceArrastrado ? styles.sobre : ''}`}
        >
          <GripVertical className={styles.asa} aria-hidden="true" />
          <div className={styles.contenidoItem}>{renderItem(item, indice)}</div>
        </div>
      ))}
    </div>
  );
}

export default DragList;
