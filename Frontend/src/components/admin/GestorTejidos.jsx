'use client';

/* ============================================================
   TEJIDOS Y COMPOSICIÓN — Fely Campo (admin)
   Biblioteca de telas reutilizable desde el formulario de producto.
   Antes vivía como pestaña "Telas" dentro de GestorMateriales.jsx —
   ver GestorColores.jsx para el resto del porqué de la separación.

   Mismo lenguaje visual que la sección "Tejidos y Composición" de
   FormularioProducto.jsx/FormularioLook.jsx (rejilla de chips con foto +
   fila de alta con imagen/nombre/composición), foto de tela incluida —
   antes esta página no dejaba subir una, así que dos telas sin nombre
   memorable eran indistinguibles a simple vista.
   ============================================================ */

import { useRef, useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { PageHeader, useToast } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { telasMock } from '@/components/admin/mockData';
import styles from './GestorTejidos.module.css';

// Miniatura de tela: recorte cuadrado centrado a 150×150 — mismo criterio
// que FormularioProducto.jsx/FormularioLook.jsx (duplicado a mano, no se
// puede importar una función de otro componente 'use client' sin
// exportarla a propósito).
const TELA_IMAGEN_LADO = 150;

function comprimirImagenTela(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const offsetX = (img.width - lado) / 2;
        const offsetY = (img.height - lado) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = TELA_IMAGEN_LADO;
        canvas.height = TELA_IMAGEN_LADO;
        canvas.getContext('2d').drawImage(img, offsetX, offsetY, lado, lado, 0, 0, TELA_IMAGEN_LADO, TELA_IMAGEN_LADO);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen de la tela'))),
          'image/jpeg',
          0.85
        );
      };
      img.onerror = reject;
      img.src = lector.result;
    };
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

function GestorTejidos() {
  const { mostrarToast } = useToast();
  const [telas, setTelas] = useState(telasMock);

  const [nombreTelaNueva, setNombreTelaNueva] = useState('');
  const [composicionTelaNueva, setComposicionTelaNueva] = useState('');
  const [imagenTelaNueva, setImagenTelaNueva] = useState('');
  const [subiendoImagenTela, setSubiendoImagenTela] = useState(false);
  const inputImagenTelaRef = useRef(null);

  async function agregarImagenTela(archivo) {
    if (!archivo) return;
    setSubiendoImagenTela(true);
    let blobFinal;
    try {
      blobFinal = await comprimirImagenTela(archivo);
    } catch {
      blobFinal = archivo;
    }
    setImagenTelaNueva(URL.createObjectURL(blobFinal));
    setSubiendoImagenTela(false);
  }

  function anadirTela() {
    if (!nombreTelaNueva.trim()) return;
    setTelas((actual) => [...actual, {
      id: `tel${Date.now()}`,
      nombre: nombreTelaNueva.trim(),
      composicion: composicionTelaNueva.trim(),
      imagen: imagenTelaNueva || undefined,
    }]);
    setNombreTelaNueva('');
    setComposicionTelaNueva('');
    setImagenTelaNueva('');
    mostrarToast('Tela añadida (demo)');
  }

  function quitarTela(id) {
    setTelas((actual) => actual.filter((t) => t.id !== id));
  }

  return (
    <div>
      <PageHeader titulo="Tejidos y Composición" subtitulo="Telas reutilizables al crear o editar un producto" />

      <div className={styles.telasGrid}>
        {telas.map((tela) => (
          <div key={tela.id} className={styles.telaChip}>
            {tela.imagen && <img src={tela.imagen} alt="" className={styles.telaChipImagen} />}
            <span className={styles.telaChipTexto}>
              <span className={styles.telaChipNombre}>{tela.nombre}</span>
              <span className={styles.telaChipComposicion}>{tela.composicion || '—'}</span>
            </span>
            <button type="button" className={styles.chipQuitar} aria-label={`Quitar ${tela.nombre}`} onClick={() => quitarTela(tela.id)}>
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
            onClick={() => inputImagenTelaRef.current?.click()}
            aria-label="Subir foto de la tela"
          >
            {imagenTelaNueva ? (
              <img src={imagenTelaNueva} alt="" className={styles.inputImagenTelaPreview} />
            ) : (
              <Upload size={16} strokeWidth={1} aria-hidden="true" />
            )}
          </button>
          <input
            ref={inputImagenTelaRef}
            type="file"
            accept="image/*"
            className={styles.inputArchivo}
            onChange={(e) => {
              agregarImagenTela(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        <Input etiqueta="Nombre" valor={nombreTelaNueva} onChange={(e) => setNombreTelaNueva(e.target.value)} placeholder="Tafetán" />
        <Input etiqueta="Composición" valor={composicionTelaNueva} onChange={(e) => setComposicionTelaNueva(e.target.value)} placeholder="70% algodón, 30% poliéster" />
        <Boton variante="contorno" tamano="s" onClick={anadirTela} desactivado={subiendoImagenTela}>
          <Plus size={14} />
          {subiendoImagenTela ? 'Optimizando…' : 'Añadir tela'}
        </Boton>
      </div>
    </div>
  );
}

export default GestorTejidos;
