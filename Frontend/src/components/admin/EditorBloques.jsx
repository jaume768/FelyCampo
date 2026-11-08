'use client';

/* ============================================================
   EDITOR DE BLOQUES — Fely Campo (admin)
   El cuerpo de un artículo del blog, al estilo del editor de bloques de
   WordPress pero sencillo: una columna de bloques en el orden de la web.
     · Texto          uno o varios párrafos. Se respetan los saltos de
                      línea y los espacios; una línea en blanco empieza
                      un párrafo nuevo.
     · Subtítulo      el título de una sección.
     · Foto           una foto con su pie (opcional) y su descripción
                      para Google (opcional).
     · Fotos en fila  de 2 a 4 fotos, una al lado de otra, con su pie.
     · Cita destacada una frase en grande (cursiva) y quién la dice.
   Cada bloque se mueve con las flechas o arrastrando su asa (⋮⋮), y se
   quita con la papelera. Entre dos bloques, «+» inserta uno nuevo ahí;
   al final, los botones añaden uno al final.
   Valor: el array "bloques" de un artículo (ver src/datos/blog.js).
   ============================================================ */

import { Fragment, useState } from 'react';
import {
  AlignLeft, ArrowDown, ArrowUp, GalleryHorizontal, GripVertical, Heading2, Image, Plus, Quote, Trash2,
} from 'lucide-react';
import { FOTOS_FILA, TIPOS_BLOQUE, nuevoBloque } from '@/lib/blog';
import { faltaTexto, textoVacio } from '@/lib/previa';
import CampoLinea from './CampoLinea';
import CampoMedio from './CampoMedio';
import CampoTexto from './CampoTexto';
import ConfirmarBorrado from './ConfirmarBorrado';
import GaleriaEditable from './GaleriaEditable';
import styles from './EditorBloques.module.css';

const ICONOS = {
  texto: AlignLeft, subtitulo: Heading2, foto: Image, fotos: GalleryHorizontal, cita: Quote,
};
const ORDEN_TIPOS = ['texto', 'subtitulo', 'foto', 'fotos', 'cita'];

// ¿Le falta algo obligatorio? (para marcar el bloque en rosa)
function incompleto(bloque) {
  if (bloque.tipo === 'foto') return !bloque.src;
  if (bloque.tipo === 'fotos') return bloque.fotos.length < FOTOS_FILA.minimo || bloque.fotos.length > FOTOS_FILA.maximo;
  return faltaTexto(bloque.texto, 'es', true) || faltaTexto(bloque.texto, 'en', true);
}

// ¿Tiene algo escrito o subido? (para pedir confirmación antes de quitarlo)
function tieneContenido(bloque) {
  if (bloque.tipo === 'foto') return Boolean(bloque.src);
  if (bloque.tipo === 'fotos') return bloque.fotos.length > 0;
  return !textoVacio(bloque.texto?.es) || !textoVacio(bloque.texto?.en);
}

// Alto del campo de texto según lo escrito, para no tener que hacer
// scroll dentro de cada bloque.
function filasPara(texto) {
  const lineas = (Array.isArray(texto) ? texto.join('\n\n') : texto || '').split('\n')
    .reduce((total, linea) => total + Math.max(1, Math.ceil(linea.length / 95)), 0);
  return Math.min(24, Math.max(4, lineas + 1));
}

function BotonesTipo({ onElegir, compacto = false }) {
  return (
    <div className={`${styles.tipos} ${compacto ? styles.tiposCompactos : ''}`}>
      {ORDEN_TIPOS.map((tipo) => {
        const Icono = ICONOS[tipo];
        return (
          <button key={tipo} type="button" className={styles.tipo} onClick={() => onElegir(tipo)}>
            <Icono size={15} strokeWidth={1.6} aria-hidden="true" />
            {TIPOS_BLOQUE[tipo]}
          </button>
        );
      })}
    </div>
  );
}

// «+» entre dos bloques: al pulsarlo, enseña los tipos para insertar ahí.
function Insertador({ abierto, onAbrir, onCerrar, onElegir }) {
  if (abierto) {
    return (
      <div className={styles.insertadorAbierto}>
        <BotonesTipo compacto onElegir={onElegir} />
        <button type="button" className={styles.cancelar} onClick={onCerrar}>Cancelar</button>
      </div>
    );
  }
  return (
    <div className={styles.insertador}>
      <button type="button" className={styles.insertar} onClick={onAbrir} aria-label="Insertar un bloque aquí" title="Insertar un bloque aquí">
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

// onChange recibe solo lo que cambia ({ texto }, { src }…), que se aplica
// sobre el bloque tal y como esté en ese momento.
function ContenidoBloque({ bloque, idioma, onChange }) {
  const cambiar = onChange;

  if (bloque.tipo === 'texto') {
    return (
      <CampoTexto
        etiqueta="Texto"
        idioma={idioma}
        valor={bloque.texto}
        parrafos
        filas={filasPara(bloque.texto[idioma])}
        onChange={(texto) => cambiar({ texto })}
      />
    );
  }

  if (bloque.tipo === 'subtitulo') {
    return (
      <CampoTexto etiqueta="Subtítulo" idioma={idioma} valor={bloque.texto} largoRecomendado={80} onChange={(texto) => cambiar({ texto })} />
    );
  }

  if (bloque.tipo === 'cita') {
    return (
      <div className={styles.campos}>
        <CampoTexto etiqueta="Frase" idioma={idioma} valor={bloque.texto} multilinea filas={3} onChange={(texto) => cambiar({ texto })} />
        <CampoTexto
          etiqueta="Quién la dice"
          idioma={idioma}
          valor={bloque.autor}
          opcional
          largoRecomendado={40}
          onChange={(autor) => cambiar({ autor })}
        />
      </div>
    );
  }

  if (bloque.tipo === 'foto') {
    return (
      <div className={styles.foto}>
        <CampoMedio etiqueta="Foto" detalle="Sale con su forma, sin recortar" proporcion="4 / 3" valor={bloque.src} onChange={(src) => cambiar({ src })} />
        <div className={styles.campos}>
          <CampoTexto etiqueta="Pie de foto" idioma={idioma} valor={bloque.pie} opcional onChange={(pie) => cambiar({ pie })} />
          <CampoLinea
            etiqueta="Descripción para Google"
            opcional
            valor={bloque.alt}
            placeholder={bloque.pie?.es || 'Qué se ve en la foto'}
            ayuda="Para buscadores y lectores de pantalla. Si se deja vacía, se usa el pie."
            onChange={(alt) => cambiar({ alt })}
          />
        </div>
      </div>
    );
  }

  // Fotos en fila
  return (
    <div className={styles.campos}>
      <p className={styles.nota}>
        {`De ${FOTOS_FILA.minimo} a ${FOTOS_FILA.maximo} fotos, una al lado de otra (en el móvil, de dos en dos o una debajo de otra). Cada una puede llevar su pie.`}
      </p>
      <GaleriaEditable idioma={idioma} conPie valor={bloque.fotos} maximo={FOTOS_FILA.maximo} onChange={(fotos) => cambiar({ fotos })} />
    </div>
  );
}

// onChange recibe siempre una función (bloquesActuales) => bloquesNuevos,
// para que una foto que termina de subirse no pise lo añadido mientras.
function EditorBloques({ bloques, onChange, idioma }) {
  const [insertarEn, setInsertarEn] = useState(null);
  const [asaPulsada, setAsaPulsada] = useState(null);
  const [arrastrado, setArrastrado] = useState(null);
  const [encima, setEncima] = useState(null);
  const [porQuitar, setPorQuitar] = useState(null);
  const [recienCreado, setRecienCreado] = useState(null);

  function insertar(posicion, tipo) {
    const bloque = nuevoBloque(tipo);
    onChange((actuales) => {
      const copia = [...actuales];
      copia.splice(posicion, 0, bloque);
      return copia;
    });
    setInsertarEn(null);
    setRecienCreado(bloque.id);
    // Lleva la vista al bloque nuevo.
    requestAnimationFrame(() => document.getElementById(`bloque-cuerpo-${bloque.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  function mover(indice, desplazamiento) {
    const destino = indice + desplazamiento;
    if (destino < 0 || destino >= bloques.length) return;
    onChange((actuales) => {
      const copia = [...actuales];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  }

  function soltarEn(destino) {
    setEncima(null);
    if (arrastrado === null || arrastrado === destino) return;
    const origen = arrastrado;
    onChange((actuales) => {
      const copia = [...actuales];
      const [movido] = copia.splice(origen, 1);
      copia.splice(destino, 0, movido);
      return copia;
    });
    setArrastrado(null);
  }

  // Por id, no por posición: sigue valiendo aunque la lista haya cambiado.
  const quitar = (id) => onChange((actuales) => actuales.filter((bloque) => bloque.id !== id));
  const cambiarBloque = (id, cambios) => onChange((actuales) => actuales.map((bloque) => (bloque.id === id ? { ...bloque, ...cambios } : bloque)));

  return (
    <div className={styles.editor}>
      {bloques.length === 0 && <p className={styles.vacio}>El artículo está vacío. Empieza añadiendo un bloque.</p>}

      {bloques.map((bloque, indice) => {
        const Icono = ICONOS[bloque.tipo];
        const falta = incompleto(bloque);
        return (
          <Fragment key={bloque.id}>
            {indice > 0 && (
              <Insertador
                abierto={insertarEn === indice}
                onAbrir={() => setInsertarEn(indice)}
                onCerrar={() => setInsertarEn(null)}
                onElegir={(tipo) => insertar(indice, tipo)}
              />
            )}
            <section
              id={`bloque-cuerpo-${bloque.id}`}
              className={[
                styles.bloque,
                falta ? styles.bloqueFalta : '',
                arrastrado === indice ? styles.arrastrando : '',
                encima === indice && arrastrado !== indice ? styles.encima : '',
                recienCreado === bloque.id ? styles.nuevo : '',
              ].join(' ')}
              // Solo se arrastra desde el asa: así se puede seleccionar
              // texto dentro de los campos sin mover el bloque.
              draggable={asaPulsada === indice}
              onDragStart={() => setArrastrado(indice)}
              onDragEnter={() => arrastrado !== null && setEncima(indice)}
              onDragOver={(evento) => arrastrado !== null && evento.preventDefault()}
              onDrop={() => soltarEn(indice)}
              onDragEnd={() => { setArrastrado(null); setEncima(null); setAsaPulsada(null); }}
              aria-label={`Bloque ${indice + 1}: ${TIPOS_BLOQUE[bloque.tipo]}`}
            >
              <header className={styles.cabecera}>
                <button
                  type="button"
                  className={styles.asa}
                  onMouseDown={() => setAsaPulsada(indice)}
                  onMouseUp={() => setAsaPulsada(null)}
                  aria-label="Arrastra para mover el bloque"
                  title="Arrastra para mover el bloque"
                >
                  <GripVertical size={15} aria-hidden="true" />
                </button>
                <span className={styles.numero}>{indice + 1}</span>
                <span className={styles.nombre}>
                  <Icono size={14} strokeWidth={1.6} aria-hidden="true" />
                  {TIPOS_BLOQUE[bloque.tipo]}
                </span>
                {falta && <span className={styles.chipFalta}>Incompleto</span>}
                <div className={styles.acciones}>
                  <button type="button" className={styles.accion} onClick={() => mover(indice, -1)} disabled={indice === 0} aria-label="Subir el bloque" title="Subir">
                    <ArrowUp size={14} aria-hidden="true" />
                  </button>
                  <button type="button" className={styles.accion} onClick={() => mover(indice, 1)} disabled={indice === bloques.length - 1} aria-label="Bajar el bloque" title="Bajar">
                    <ArrowDown size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${styles.accion} ${styles.accionQuitar}`}
                    onClick={() => (tieneContenido(bloque) ? setPorQuitar(indice) : quitar(bloque.id))}
                    aria-label="Quitar el bloque"
                    title="Quitar"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </header>
              <div className={styles.cuerpo}>
                <ContenidoBloque
                  bloque={bloque}
                  idioma={idioma}
                  onChange={(cambios) => cambiarBloque(bloque.id, cambios)}
                />
              </div>
            </section>
          </Fragment>
        );
      })}

      <div className={styles.final}>
        <p className={styles.finalTitulo}>¿Qué más añadimos?</p>
        <BotonesTipo onElegir={(tipo) => insertar(bloques.length, tipo)} />
      </div>

      <ConfirmarBorrado
        abierto={porQuitar !== null}
        titulo={porQuitar !== null ? `¿Quitar el bloque ${porQuitar + 1} (${TIPOS_BLOQUE[bloques[porQuitar]?.tipo]})?` : ''}
        mensaje="Se quita del borrador. Si te equivocas, «Descartar» deshace todos los cambios sin publicar."
        textoConfirmar="Quitar"
        onConfirmar={() => { quitar(bloques[porQuitar].id); setPorQuitar(null); }}
        onCancelar={() => setPorQuitar(null)}
      />
    </div>
  );
}

export default EditorBloques;
