'use client';

/* ============================================================
   FORMULARIO DE COLECCIÓN — Fely Campo (admin)
   Alta rápida de una colección dentro de un archivo (Runway/Novia/
   Fiesta, ver ListaProductos.jsx) — a diferencia de FormularioProducto,
   solo pide portada, nombre y número de looks (+ temporada, ver abajo).
   Vive en un ModalOverlay, igual que el alta de producto. Reutiliza
   comprimirImagen() de FormularioProducto.jsx en vez de duplicar la
   lógica de compresión — mismo criterio (canvas, máx. 2000px, JPEG 0.82).

   `pedirTemporada`: solo Runway usa `temporada` (badge/filtro AW/SS, ver
   ListaProductos.jsx) — Novia/Fiesta no siguen ese patrón de nombre
   limpio "Estación Año", así que ahí no se pide. Estación + año se piden
   por separado (más fácil de rellenar que escribir el string a mano) y
   se combinan al guardar en el mismo formato que ya usan las 9
   colecciones existentes: AW → "Otoño-Invierno AA/AA+1", SS →
   "Primavera-Verano AA".
   ============================================================ */

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { PageHeader, FormSeccion } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { comprimirImagen } from './FormularioProducto';
import styles from './FormularioColeccion.module.css';

// Inverso de la construcción de `temporada` en guardar() — para precargar
// Estación/Año al editar una colección existente. "Año" es siempre el año
// que enseña el badge (codigoTemporada() en mockData.js usa el último año
// del rango en AW) — por eso aquí se coge valorAnio.split('/')[1], no [0]:
// si "Año" cogiera el primero, escribir 28 generaría "28/29" y el badge
// mostraría AW29 en vez de AW28, un año más de lo escrito.
function parsearTemporada(temporada) {
  if (!temporada) return { estacion: '', anio: '' };
  const [etiquetaEstacion, valorAnio] = temporada.split(' ');
  return {
    estacion: etiquetaEstacion === 'Otoño-Invierno' ? 'AW' : 'SS',
    anio: valorAnio.includes('/') ? valorAnio.split('/')[1] : valorAnio,
  };
}

function FormularioColeccion({
  onGuardado, pedirTemporada = false, categoriaExistente, onBorrar,
}) {
  const [nombre, setNombre] = useState(categoriaExistente?.nombre || '');
  const [numeroLooks, setNumeroLooks] = useState(categoriaExistente?.numeroLooks || '');
  const [imagen, setImagen] = useState(categoriaExistente?.imagen || '');
  const [subiendo, setSubiendo] = useState(false);
  const temporadaInicial = parsearTemporada(categoriaExistente?.temporada);
  const [estacion, setEstacion] = useState(temporadaInicial.estacion);
  const [anio, setAnio] = useState(temporadaInicial.anio);
  const inputArchivoRef = useRef(null);

  async function subirPortada(archivo) {
    if (!archivo) return;
    setSubiendo(true);
    let blobFinal;
    try {
      blobFinal = await comprimirImagen(archivo);
    } catch {
      blobFinal = archivo;
    }
    setImagen(URL.createObjectURL(blobFinal));
    setSubiendo(false);
  }

  const faltaTemporada = pedirTemporada && (!estacion || !anio);

  function guardar() {
    if (!nombre.trim() || faltaTemporada) return;
    // "Año" es el año que va a mostrar el badge (codigoTemporada() usa el
    // último del rango en AW) — así que en AW el año escrito va DESPUÉS de
    // la barra, no antes: escribir 28 construye "27/28", no "28/29".
    const anioCorto = String(anio).padStart(2, '0');
    const temporada = pedirTemporada
      ? (estacion === 'AW'
        ? `Otoño-Invierno ${String(Number(anioCorto) - 1).padStart(2, '0')}/${anioCorto}`
        : `Primavera-Verano ${anioCorto}`)
      : undefined;
    onGuardado({
      nombre: nombre.trim(),
      imagen: imagen || undefined,
      numeroLooks: numeroLooks ? Number(numeroLooks) : undefined,
      temporada,
    });
  }

  return (
    <div>
      <PageHeader
        titulo={categoriaExistente ? 'Editar colección' : 'Nueva colección'}
        subtitulo="Portada, nombre y número de looks"
      />

      <FormSeccion numero={1} titulo="Portada" descripcion="Foto de portada de la colección.">
        <div className={styles.seccionAncha}>
          {imagen ? (
            <button type="button" className={styles.portada} onClick={() => inputArchivoRef.current?.click()}>
              <img src={imagen} alt="" className={styles.portadaImagen} />
            </button>
          ) : (
            <button type="button" className={styles.subirVacio} onClick={() => inputArchivoRef.current?.click()}>
              <Upload size={22} strokeWidth={1} aria-hidden="true" />
              <span>{subiendo ? 'Optimizando…' : 'Añadir portada'}</span>
            </button>
          )}
          <input
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            className={styles.inputArchivo}
            onChange={(e) => {
              subirPortada(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      </FormSeccion>

      <FormSeccion numero={2} titulo="Datos" descripcion="Nombre, número de looks y, en Runway, temporada.">
        <Input
          etiqueta="Nombre de la colección"
          valor={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Magnolia "
        />
        <Input
          etiqueta="Número de looks"
          tipo="number"
          valor={numeroLooks}
          onChange={(e) => setNumeroLooks(e.target.value)}
          placeholder="12"
        />

        {pedirTemporada && (
          <>
            <div>
              <span className={styles.etiqueta}>Temporada</span>
              <div className={styles.temporadaSelector}>
                {[
                  { valor: 'AW', etiqueta: 'Autumn Winter', clase: styles.temporadaBotonAw },
                  { valor: 'SS', etiqueta: 'Spring Summer', clase: styles.temporadaBotonSs },
                ].map(({ valor, etiqueta, clase }) => (
                  <button
                    key={valor}
                    type="button"
                    className={`${styles.temporadaBoton} ${clase} ${estacion === valor ? styles.temporadaBotonActivo : ''}`}
                    aria-pressed={estacion === valor}
                    onClick={() => setEstacion(valor)}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>
            </div>
            <Input
              etiqueta="Año"
              tipo="number"
              valor={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="28"
            />
          </>
        )}
      </FormSeccion>

      <div className={styles.acciones}>
        {categoriaExistente && onBorrar && (
          <Boton variante="contorno-rosa" onClick={onBorrar}>Borrar colección</Boton>
        )}
        <Boton onClick={guardar} desactivado={!nombre.trim() || faltaTemporada}>
          {categoriaExistente ? 'Guardar cambios' : 'Crear colección'}
        </Boton>
      </div>
    </div>
  );
}

export default FormularioColeccion;
