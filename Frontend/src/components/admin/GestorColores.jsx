'use client';

/* ============================================================
   COLORES — Fely Campo (admin)
   Biblioteca de colores reutilizable desde el formulario de producto
   (picker en vez de escribir hex/nombre a mano cada vez). Antes vivía
   como una pestaña dentro de GestorMateriales.jsx (Colores/Telas/
   Colecciones en una sola página) — se separó en su propia página
   colgada del sidebar porque mezclar los tres conceptos ahí resultaba
   confuso. "Colecciones" no se migró: la temporada de un producto ya
   se gestiona directamente desde su propio formulario (sección
   "Colección" de FormularioProducto.jsx).

   Mismo lenguaje visual que la sección "Colores" de
   FormularioProducto.jsx/FormularioLook.jsx (rejilla de chips + fila de
   alta con swatch/HEX/nombre) en vez de la lista de filas de antes —
   así un admin que ya conoce ese picker reconoce esta página al
   instante. Aquí los chips no son toggle (no hay nada que "seleccionar"
   en una biblioteca), llevan una X propia para borrar en su lugar.
   ============================================================ */

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PageHeader, useToast } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { coloresMock, familiasColorMock } from '@/components/admin/mockData';
import styles from './GestorColores.module.css';

function GestorColores() {
  const { mostrarToast } = useToast();
  const [colores, setColores] = useState(coloresMock);

  const [nombreColorNuevoEs, setNombreColorNuevoEs] = useState('');
  const [nombreColorNuevoEn, setNombreColorNuevoEn] = useState('');
  // El nuevo color siempre encaja en una familia ya existente (Neutros,
  // Rojos y vinos...) — mismo criterio que FormularioProducto.jsx: el
  // desplegable no ofrece "crear familia".
  const [familiaColorNueva, setFamiliaColorNueva] = useState(familiasColorMock[0]?.id || '');
  const [hexColorNuevo, setHexColorNuevo] = useState('#000000');
  // Familia actualmente desplegada bajo la rejilla de "padres" (null =
  // ninguna) — mismo criterio que FormularioProducto.jsx/FormularioLook.jsx.
  const [familiaColorActiva, setFamiliaColorActiva] = useState(null);
  // El input HEX es texto libre mientras se escribe ("#6E263" a mitad de
  // teclear no es un hex válido todavía) — el swatch nativo <input
  // type="color"> exige siempre un #rrggbb completo, así que recibe esta
  // versión saneada en vez de hexColorNuevo tal cual. Mismo criterio que
  // FormularioProducto.jsx/FormularioLook.jsx.
  const hexColorValido = /^#[0-9a-fA-F]{6}$/.test(hexColorNuevo) ? hexColorNuevo : '#000000';

  // Agrupa colores bajo su familia, en el orden de familiasColorMock —
  // mismo criterio que gruposColores en FormularioProducto.jsx. `muestras`
  // se resuelve siempre contra coloresMock (fijo), no `colores` (con lo
  // añadido en la sesión), para que el par de cuadraditos del grupo no
  // cambie.
  const gruposColores = useMemo(() => (
    familiasColorMock
      .map((f) => ({
        ...f,
        muestras: f.muestras.map((id) => coloresMock.find((c) => c.id === id)?.hex).filter(Boolean),
        colores: colores.filter((c) => c.familia === f.id),
      }))
      .filter((f) => f.colores.length > 0)
  ), [colores]);

  function anadirColor() {
    if (!nombreColorNuevoEs.trim() || !nombreColorNuevoEn.trim() || !familiaColorNueva) return;
    setColores((actual) => [...actual, {
      id: `col${Date.now()}`,
      familia: familiaColorNueva,
      nombre: { es: nombreColorNuevoEs.trim(), en: nombreColorNuevoEn.trim() },
      hex: hexColorValido,
    }]);
    setFamiliaColorActiva(familiaColorNueva);
    setNombreColorNuevoEs('');
    setNombreColorNuevoEn('');
    setHexColorNuevo('#000000');
    mostrarToast('Color añadido (demo)');
  }

  function quitarColor(id) {
    setColores((actual) => actual.filter((c) => c.id !== id));
  }

  return (
    <div>
      <PageHeader titulo="Colores" subtitulo="Colores reutilizables al crear o editar un producto" />

      <div className={styles.familiasGrid}>
        {gruposColores.map((grupo) => {
          const activa = familiaColorActiva === grupo.id;
          return (
            <button
              key={grupo.id}
              type="button"
              className={`${styles.familiaChip} ${activa ? styles.familiaChipActiva : ''}`}
              onClick={() => setFamiliaColorActiva(activa ? null : grupo.id)}
            >
              <span className={styles.familiaMuestras}>
                {grupo.muestras.map((hex) => (
                  <span key={hex} className={styles.familiaMuestra} style={{ background: hex }} />
                ))}
              </span>
              {grupo.etiqueta}
              <span className={styles.familiaBadge}>{grupo.colores.length}</span>
            </button>
          );
        })}
      </div>

      {familiaColorActiva && (
        <div className={styles.coloresGrid}>
          {gruposColores.find((g) => g.id === familiaColorActiva)?.colores.map((color) => (
            <div key={color.id} className={styles.colorChip}>
              <span className={styles.colorPunto} style={{ background: color.hex }} />
              <span className={styles.colorChipTexto}>
                <span className={styles.colorNombre}>{color.nombre.es}</span>
                <span className={styles.colorTraduccion}>{color.nombre.en}</span>
              </span>
              <button type="button" className={styles.chipQuitar} aria-label={`Quitar ${color.nombre.es}`} onClick={() => quitarColor(color.id)}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.anadirFila}>
        <label className={styles.campoColor}>
          <span className={styles.etiquetaCampo}>Selector</span>
          <input type="color" value={hexColorValido} onChange={(e) => setHexColorNuevo(e.target.value)} className={styles.inputColor} aria-label="Elegir color" />
        </label>
        {/* HEX como campo editable junto al swatch — el swatch da el atajo
            visual rápido, el texto permite pegar/escribir un código exacto;
            ambos sincronizados con el mismo estado. */}
        <Input etiqueta="HEX" valor={hexColorNuevo} onChange={(e) => setHexColorNuevo(e.target.value)} placeholder="#6E2635" />
        <Input etiqueta="Nombre (ES)" valor={nombreColorNuevoEs} onChange={(e) => setNombreColorNuevoEs(e.target.value)} placeholder="Burdeos" />
        <Input etiqueta="Name (EN)" valor={nombreColorNuevoEn} onChange={(e) => setNombreColorNuevoEn(e.target.value)} placeholder="Bordeaux" />
        <label>
          <span className={styles.etiquetaCampo}>Grupo</span>
          <select className={styles.selectInput} value={familiaColorNueva} onChange={(e) => setFamiliaColorNueva(e.target.value)}>
            {familiasColorMock.map((f) => (
              <option key={f.id} value={f.id}>{f.etiqueta}</option>
            ))}
          </select>
        </label>
        <Boton
          variante="contorno"
          tamano="s"
          onClick={anadirColor}
          desactivado={!nombreColorNuevoEs.trim() || !nombreColorNuevoEn.trim()}
        >
          <Plus size={14} />
          Añadir color
        </Boton>
      </div>
    </div>
  );
}

export default GestorColores;
