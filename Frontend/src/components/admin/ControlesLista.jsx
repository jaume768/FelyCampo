'use client';

/* ============================================================
   CONTROLES DE UN ELEMENTO DE LISTA — Fely Campo (admin)
   Los botones bajo cada capítulo, taller, sección o bloque de una página
   que se puede alargar: Subir, Bajar, «Añadir … debajo» y «Quitar …»
   (con confirmación). Todo se hace en el borrador del editor
   (EditorPagina.jsx): nada sale en la web hasta «Guardar y publicar», y
   «Descartar» lo deshace. En la web, los elementos se colocan solos
   (alternan de lado por su posición).
   Uso, dentro de un bloque del editor:
     <ControlesLista h={h} ruta={['capitulos']} indice={2}
       crear={nuevoCapitulo} elemento={{ uno: 'un capítulo', este: 'este capítulo' }}
       nombre="El comienzo" minimo={1} />
   ============================================================ */

import { useState } from 'react';
import {
  ArrowDown, ArrowUp, Plus, Trash2,
} from 'lucide-react';
import { Boton } from '@/components/ui';
import ConfirmarBorrado from './ConfirmarBorrado';
import styles from './ControlesLista.module.css';

// Añade un elemento nuevo en "posicion" y lleva la vista hasta él.
export function anadirElemento(h, ruta, crear, posicion) {
  const nuevo = crear();
  h.cambiar(ruta, (lista) => [...lista.slice(0, posicion), nuevo, ...lista.slice(posicion)]);
  setTimeout(() => document.getElementById(`bloque-${nuevo.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
}

export function BotonAnadir({
  h, ruta, crear, posicion, children,
}) {
  return (
    <Boton variante="contorno" type="button" onClick={() => anadirElemento(h, ruta, crear, posicion)}>
      <Plus size={14} aria-hidden="true" /> {children}
    </Boton>
  );
}

// "elemento": cómo se nombra: { uno: 'una sección', este: 'esta sección' }.
// "nombre": el de este elemento en concreto (su título), para confirmar.
// "minimo": cuántos tienen que quedar como poco (sin quitar el último).
function ControlesLista({
  h, ruta, indice, crear, elemento, nombre, minimo = 0,
}) {
  const [porQuitar, setPorQuitar] = useState(false);
  const total = h.leer(ruta).length;
  const puedeQuitar = total > minimo;

  function mover(paso) {
    h.cambiar(ruta, (lista) => {
      const copia = [...lista];
      const [movido] = copia.splice(indice, 1);
      copia.splice(indice + paso, 0, movido);
      return copia;
    });
  }

  return (
    <div className={styles.controles}>
      <Boton variante="contorno" type="button" desactivado={indice === 0} onClick={() => mover(-1)}>
        <ArrowUp size={14} aria-hidden="true" /> Subir
      </Boton>
      <Boton variante="contorno" type="button" desactivado={indice === total - 1} onClick={() => mover(1)}>
        <ArrowDown size={14} aria-hidden="true" /> Bajar
      </Boton>
      <BotonAnadir h={h} ruta={ruta} crear={crear} posicion={indice + 1}>
        {`Añadir ${elemento.uno} debajo`}
      </BotonAnadir>
      {puedeQuitar ? (
        <button type="button" className={styles.quitar} onClick={() => setPorQuitar(true)}>
          <Trash2 size={14} aria-hidden="true" /> {`Quitar ${elemento.este}`}
        </button>
      ) : (
        <p className={styles.nota}>{`Tiene que quedar al menos ${elemento.uno}.`}</p>
      )}
      <ConfirmarBorrado
        abierto={porQuitar}
        titulo={`¿Quitar «${nombre}»?`}
        mensaje="Deja de salir en la página cuando publiques. Hasta entonces, «Descartar» lo recupera."
        textoConfirmar="Quitar"
        onConfirmar={() => {
          setPorQuitar(false);
          h.cambiar(ruta, (lista) => lista.filter((_, posicion) => posicion !== indice));
        }}
        onCancelar={() => setPorQuitar(false)}
      />
    </div>
  );
}

export default ControlesLista;
