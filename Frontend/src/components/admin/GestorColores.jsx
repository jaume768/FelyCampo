'use client';

/* ============================================================
   COLORES — Fely Campo (admin)
   Biblioteca de colores reutilizable desde el formulario de producto.

   DATOS REALES: /api/v1/admin/colors/.

   Dos diferencias con la versión de datos de ejemplo, ninguna cosmética:

   1. `code` (tercer segmento del SKU: VE-120-**AZU**) es OBLIGATORIO y
      ÚNICO en el modelo, y aquí no se pedía. Sin él, el alta da 400.
   2. Las FAMILIAS de color (Neutros, Rojos y vinos…) NO EXISTEN en el
      backend: `Color` solo tiene code/name/name_en/hex_value. Eran una
      agrupación decorativa del mock, así que la rejilla es plana. Ver
      docs/CONTRATO.md (C-11) — si se quieren de verdad, hace falta un
      modelo nuevo.

   Borrar un color en uso lo impide el backend (`on_delete=PROTECT` desde
   `Colorway`): se enseña el motivo que devuelve, no se finge que ha ido bien.
   ============================================================ */

import { useCallback, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { PageHeader, useToast } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { colores as apiColores } from '@/lib/api/adminCatalog';
import { useRecursoAdmin } from './useRecursoAdmin';
import styles from './GestorColores.module.css';

const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;

function adaptarColor(c) {
  return {
    id: c.id,
    code: c.code,
    nombre: { es: c.name, en: c.name_en || '' },
    hex: c.hex_value || '#000000',
  };
}

function GestorColores() {
  const { mostrarToast } = useToast();
  const adaptar = useCallback(adaptarColor, []);
  const { filas: colores, cargando, error, guardando, crear, borrar } = useRecursoAdmin(apiColores, adaptar);

  const [code, setCode] = useState('');
  const [nombreEs, setNombreEs] = useState('');
  const [nombreEn, setNombreEn] = useState('');
  const [hex, setHex] = useState('#000000');

  // El input HEX es texto libre mientras se escribe ("#6E263" a mitad de teclear no es
  // válido todavía); el swatch nativo exige siempre un #rrggbb completo.
  const hexValido = HEX_VALIDO.test(hex) ? hex : '#000000';
  const puedeAnadir = Boolean(code.trim() && nombreEs.trim()) && !guardando;

  async function anadirColor() {
    if (!puedeAnadir) return;
    const resultado = await crear({
      code: code.trim().toUpperCase(),
      name: nombreEs.trim(),
      name_en: nombreEn.trim(),
      hex_value: hexValido,
    });

    if (!resultado.ok) {
      mostrarToast(`No se ha creado: ${resultado.mensaje}`);
      return;
    }
    setCode('');
    setNombreEs('');
    setNombreEn('');
    setHex('#000000');
    mostrarToast('Color añadido');
  }

  async function quitarColor(color) {
    const resultado = await borrar(color.id);
    // El backend protege los que están en uso: su mensaje es el útil.
    mostrarToast(resultado.ok ? 'Color eliminado' : `No se puede borrar: ${resultado.mensaje}`);
  }

  return (
    <div>
      <PageHeader
        titulo="Colores"
        subtitulo={cargando ? 'Cargando…' : `${colores.length} color${colores.length === 1 ? '' : 'es'} reutilizables al crear o editar un producto`}
      />

      {error && (
        <p className={styles.aviso} role="alert">
          {error.isNetworkError ? 'No hemos podido conectar con el servidor.' : error.message}
        </p>
      )}

      {!error && !cargando && colores.length === 0 && (
        <p className={styles.aviso}>Todavía no hay colores. Añade el primero abajo.</p>
      )}

      <div className={styles.coloresGrid}>
        {colores.map((color) => (
          <div key={color.id} className={styles.colorChip}>
            <span className={styles.colorPunto} style={{ background: color.hex }} />
            <span className={styles.colorChipTexto}>
              <span className={styles.colorNombre}>{color.code} · {color.nombre.es}</span>
              <span className={styles.colorTraduccion}>{color.nombre.en || '—'}</span>
            </span>
            <button
              type="button"
              className={styles.chipQuitar}
              aria-label={`Quitar ${color.nombre.es}`}
              onClick={() => quitarColor(color)}
              disabled={guardando}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.anadirFila}>
        <label className={styles.campoColor}>
          <span className={styles.etiquetaCampo}>Selector</span>
          <input type="color" value={hexValido} onChange={(e) => setHex(e.target.value)} className={styles.inputColor} aria-label="Elegir color" />
        </label>
        <Input etiqueta="HEX" valor={hex} onChange={(e) => setHex(e.target.value)} placeholder="#6E2635" />
        {/* Código: tercer segmento del SKU (VE-120-AZU). Obligatorio y único. */}
        <Input etiqueta="Código *" valor={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BUR" />
        <Input etiqueta="Nombre (ES) *" valor={nombreEs} onChange={(e) => setNombreEs(e.target.value)} placeholder="Burdeos" />
        <Input etiqueta="Name (EN)" valor={nombreEn} onChange={(e) => setNombreEn(e.target.value)} placeholder="Bordeaux" />
        <Boton variante="contorno" tamano="s" onClick={anadirColor} desactivado={!puedeAnadir}>
          <Plus size={14} />
          {guardando ? 'Guardando…' : 'Añadir color'}
        </Boton>
      </div>
    </div>
  );
}

export default GestorColores;
