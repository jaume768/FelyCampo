'use client';

/* ============================================================
   TEJIDOS Y COMPOSICIÓN — Fely Campo (admin)
   Biblioteca de telas reutilizable desde el formulario de producto.

   DATOS REALES: /api/v1/admin/fabrics/.

   La foto va en DOS pasos, no uno: `Fabric.image` es una FK a
   `MediaAsset`, así que primero se sube el archivo a la biblioteca de
   medios (POST /admin/media/, multipart) y luego se crea la tela
   referenciando el id devuelto.

   Ya NO se comprime en el navegador: el servidor normaliza al recibir
   (2560px máx., WebP, miniatura y EXIF limpio — apps/media/processing).
   El canvas del navegador reescalaba, pero no limpiaba metadatos ni
   garantizaba un peso razonable.

   Borrar una tela en uso lo impide el backend: se enseña su motivo.
   ============================================================ */

import { useCallback, useRef, useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';

import { PageHeader, useToast } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { tejidos as apiTejidos } from '@/lib/api/adminCatalog';
import { subirMedia, motivoDeRechazo } from '@/lib/api/adminMedia';
import { ApiError } from '@/lib/api/errors';
import { useRecursoAdmin } from './useRecursoAdmin';
import styles from './GestorTejidos.module.css';

function adaptarTejido(t) {
  return {
    id: t.id,
    nombre: t.name,
    nombreEn: t.name_en || '',
    composicion: t.composition || '',
    // `image_detail` cuando el serializer lo anida; si no, solo el id.
    imagen: t.image_detail?.thumbnail || t.image_detail?.file || null,
    imagenId: t.image || null,
  };
}

function GestorTejidos() {
  const { mostrarToast } = useToast();
  const adaptar = useCallback(adaptarTejido, []);
  const { filas: telas, cargando, error, guardando, crear, borrar } = useRecursoAdmin(apiTejidos, adaptar);

  const [nombre, setNombre] = useState('');
  const [composicion, setComposicion] = useState('');
  // Archivo elegido + su vista previa local. No se sube hasta guardar la tela: subir
  // primero dejaría archivos huérfanos en la biblioteca si el alta se cancela.
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef(null);

  function elegirArchivo(nuevo) {
    if (!nuevo) return;
    // Se comprueba ANTES de subir para no gastar una subida en algo que el backend va a
    // rechazar igual.
    const motivo = motivoDeRechazo(nuevo);
    if (motivo) {
      mostrarToast(motivo);
      return;
    }
    setArchivo(nuevo);
    setVistaPrevia(URL.createObjectURL(nuevo));
  }

  async function anadirTela() {
    if (!nombre.trim() || subiendo || guardando) return;
    setSubiendo(true);

    try {
      let imagenId = null;
      if (archivo) {
        // Paso 1: subir a la biblioteca de medios.
        const asset = await subirMedia(archivo, nombre.trim());
        imagenId = asset.id;
      }

      // Paso 2: crear la tela referenciando el asset.
      const resultado = await crear({
        name: nombre.trim(),
        composition: composicion.trim(),
        ...(imagenId && { image: imagenId }),
      });

      if (!resultado.ok) {
        mostrarToast(`No se ha creado: ${resultado.mensaje}`);
        return;
      }

      setNombre('');
      setComposicion('');
      setArchivo(null);
      setVistaPrevia('');
      mostrarToast('Tela añadida');
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      // La subida es lo que puede fallar aparte (peso, formato, red).
      mostrarToast(`No se ha podido subir la foto: ${fallo.firstDetail ?? fallo.message}`);
    } finally {
      setSubiendo(false);
    }
  }

  async function quitarTela(tela) {
    const resultado = await borrar(tela.id);
    mostrarToast(resultado.ok ? 'Tela eliminada' : `No se puede borrar: ${resultado.mensaje}`);
  }

  const ocupado = subiendo || guardando;

  return (
    <div>
      <PageHeader
        titulo="Tejidos y Composición"
        subtitulo={cargando ? 'Cargando…' : `${telas.length} tela${telas.length === 1 ? '' : 's'} reutilizables al crear o editar un producto`}
      />

      {error && (
        <p className={styles.aviso} role="alert">
          {error.isNetworkError ? 'No hemos podido conectar con el servidor.' : error.message}
        </p>
      )}

      {!error && !cargando && telas.length === 0 && (
        <p className={styles.aviso}>Todavía no hay telas. Añade la primera abajo.</p>
      )}

      <div className={styles.telasGrid}>
        {telas.map((tela) => (
          <div key={tela.id} className={styles.telaChip}>
            {tela.imagen && <img src={tela.imagen} alt="" className={styles.telaChipImagen} />}
            <span className={styles.telaChipTexto}>
              <span className={styles.telaChipNombre}>{tela.nombre}</span>
              <span className={styles.telaChipComposicion}>{tela.composicion || '—'}</span>
            </span>
            <button
              type="button"
              className={styles.chipQuitar}
              aria-label={`Quitar ${tela.nombre}`}
              onClick={() => quitarTela(tela)}
              disabled={ocupado}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.anadirFila}>
        <div className={styles.campoColor}>
          <span className={styles.etiquetaCampo}>Imagen</span>
          <button
            type="button"
            className={`${styles.inputColor} ${styles.inputImagenTela}`}
            onClick={() => inputRef.current?.click()}
            aria-label="Subir foto de la tela"
          >
            {vistaPrevia ? (
              <img src={vistaPrevia} alt="" className={styles.inputImagenTelaPreview} />
            ) : (
              <Upload size={16} strokeWidth={1} aria-hidden="true" />
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className={styles.inputArchivo}
            onChange={(e) => {
              elegirArchivo(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        <Input etiqueta="Nombre *" valor={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tafetán" />
        <Input etiqueta="Composición" valor={composicion} onChange={(e) => setComposicion(e.target.value)} placeholder="70% algodón, 30% poliéster" />
        <Boton variante="contorno" tamano="s" onClick={anadirTela} desactivado={ocupado || !nombre.trim()}>
          <Plus size={14} />
          {subiendo ? 'Subiendo…' : 'Añadir tela'}
        </Boton>
      </div>
    </div>
  );
}

export default GestorTejidos;
