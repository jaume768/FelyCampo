'use client';

/* ============================================================
   CAMPO MEDIO — Fely Campo (admin)
   Una sola foto o un solo vídeo, con su vista previa en la proporción
   en que sale en la web. Se cambia con "Reemplazar" o arrastrando el
   archivo encima (el marco se resalta). Las fotos se comprimen en el
   navegador (comprimirImagen); los vídeos se usan tal cual. Igual que el
   resto del admin hasta que haya almacén de archivos, se guardan como
   URL temporal (blob): ver docs/ADMIN.md.
   Uso:
     <CampoMedio etiqueta="Escritorio" detalle="16:9" tipo="imagen"
       proporcion="16 / 9" valor={src} onChange={setSrc} opcional />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Link2, Video } from 'lucide-react';
import { comprimirImagen } from './FormularioProducto';
import styles from './CampoMedio.module.css';

const MB = 1024 * 1024;

// Límites por defecto de un vídeo (ver LIMITES_VIDEO en lib/landing.js):
// por encima de "maximo" MB no se acepta; por encima de "aviso", se
// recomienda comprimirlo.
const LIMITE_VIDEO = {
  aviso: 10, maximo: 15, anchoMaximo: 1920, duracionAviso: 30,
};

function nombreArchivo(src) {
  if (!src) return '';
  return decodeURIComponent(src.split('/').pop());
}

const formatoPeso = (bytes) => `${(bytes / MB).toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB`;
const formatoDuracion = (segundos) => `${Math.floor(segundos / 60)}:${String(Math.round(segundos % 60)).padStart(2, '0')}`;

// Avisos de un vídeo según su peso, duración, tamaño y orientación.
function avisosVideo(info, limite, orientacion) {
  const avisos = [];
  if (info.peso && info.peso > limite.aviso * MB) {
    avisos.push(`Pesa ${formatoPeso(info.peso)}: tardará en cargar. Mejor por debajo de ${limite.aviso} MB (comprímelo con HandBrake o similar).`);
  }
  if (info.duracion && info.duracion > limite.duracionAviso) {
    avisos.push(`Dura ${formatoDuracion(info.duracion)}: la portada se queda en el vídeo hasta que termina. Mejor ${limite.duracionAviso} segundos o menos.`);
  }
  if (info.ancho && limite.anchoMaximo && Math.max(info.ancho, info.alto) > limite.anchoMaximo * (orientacion === 'vertical' ? 16 / 9 : 1) + 1) {
    avisos.push(`Mide ${info.ancho}×${info.alto} px, más de lo que se ve en pantalla: pesa más de lo necesario.`);
  }
  if (info.ancho && orientacion === 'horizontal' && info.alto > info.ancho) avisos.push('Es vertical: este es el vídeo de ordenador, debería ser horizontal.');
  if (info.ancho && orientacion === 'vertical' && info.ancho > info.alto) avisos.push('Es horizontal: este es el vídeo de móvil, debería ser vertical.');
  return avisos;
}

function CampoMedio({
  etiqueta, detalle, tipo = 'imagen', proporcion = '3 / 4', valor, onChange, opcional = false, vacio,
  limite = LIMITE_VIDEO, orientacion, heredado,
}) {
  const input = useRef(null);
  const videoRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [encima, setEncima] = useState(false);
  const [error, setError] = useState('');
  // Peso, duración y tamaño del vídeo que se ve ahora (src = a cuál
  // corresponden, para no mezclar los de un vídeo con los de otro).
  const [info, setInfo] = useState({});
  const datos = info.src === valor ? info : {};
  const anadirInfo = (src, nuevos) => setInfo((actual) => (actual.src === src ? { ...actual, ...nuevos } : { src, ...nuevos }));
  const esVideo = tipo === 'video';
  const esNuevo = valor?.startsWith('blob:');
  // Versión de móvil sin archivo propio: se enseña la de ordenador (la que
  // se verá de verdad, recortada al centro) marcada como "la misma".
  const usaHeredado = !valor && Boolean(heredado?.src);
  const nombre = esVideo ? 'vídeo' : 'foto';
  // Concordancia: «el vídeo» / «la foto».
  const g = esVideo ? { el: 'el', mismo: 'Mismo', uno: 'uno distinto' } : { el: 'la', mismo: 'Misma', uno: 'una distinta' };
  const limiteVideo = { ...LIMITE_VIDEO, ...limite };

  // Peso del vídeo ya publicado (los nuevos lo traen del archivo).
  useEffect(() => {
    if (!esVideo || !valor || valor.startsWith('blob:')) return undefined;
    let vigente = true;
    fetch(valor, { method: 'HEAD' })
      .then((respuesta) => Number(respuesta.headers.get('content-length')) || 0)
      .then((peso) => { if (vigente && peso) anadirInfo(valor, { peso }); })
      .catch(() => {});
    return () => { vigente = false; };
  }, [esVideo, valor]);

  function leerMetadatos(video) {
    const { duration, videoWidth, videoHeight } = video;
    anadirInfo(valor, { duracion: duration, ancho: videoWidth, alto: videoHeight });
  }

  // Si el vídeo ya tenía sus datos al montar (p. ej. desde la caché, antes
  // de que React escuchara onLoadedMetadata), se leen aquí.
  useEffect(() => {
    if (videoRef.current?.readyState >= 1) leerMetadatos(videoRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  async function elegir(archivos) {
    const archivo = [...(archivos || [])][0];
    if (!archivo) return;
    setError('');
    if (!archivo.type.startsWith(esVideo ? 'video/' : 'image/')) {
      setError(esVideo ? 'Elige un vídeo (MP4 o WebM).' : 'Elige una foto (JPG, PNG o WebP).');
      return;
    }
    if (esVideo && archivo.size > limiteVideo.maximo * MB) {
      setError(`No se puede subir: pesa ${formatoPeso(archivo.size)} y el máximo es ${limiteVideo.maximo} MB. Comprímelo antes (por ejemplo con HandBrake, a 1080p) y vuelve a intentarlo.`);
      if (input.current) input.current.value = '';
      return;
    }
    setSubiendo(true);
    try {
      if (esVideo) {
        const src = URL.createObjectURL(archivo);
        anadirInfo(src, { peso: archivo.size });
        onChange(src);
      } else {
        onChange(URL.createObjectURL(await comprimirImagen(archivo)));
      }
    } catch {
      setError('No se ha podido leer el archivo. Prueba con otro.');
    }
    setSubiendo(false);
    if (input.current) input.current.value = '';
  }

  const Icono = esVideo ? Video : ImagePlus;

  return (
    <div className={styles.campo}>
      <div className={styles.cabecera}>
        <span className={styles.etiqueta}>{etiqueta}</span>
        <span className={styles.detalle}>{opcional ? `Opcional${detalle ? ` · ${detalle}` : ''}` : detalle}</span>
      </div>

      <button
        type="button"
        className={`${styles.marco} ${valor || usaHeredado ? '' : styles.vacio} ${encima ? styles.encima : ''}`}
        style={{ aspectRatio: proporcion }}
        onClick={() => input.current?.click()}
        onDragEnter={(evento) => { evento.preventDefault(); setEncima(true); }}
        onDragOver={(evento) => evento.preventDefault()}
        onDragLeave={() => setEncima(false)}
        onDrop={(evento) => { evento.preventDefault(); setEncima(false); elegir(evento.dataTransfer.files); }}
        disabled={subiendo}
        aria-label={usaHeredado ? `Subir ${g.uno} para ${etiqueta.toLowerCase()}` : `${valor ? 'Reemplazar' : 'Subir'} ${nombre}: ${etiqueta}`}
      >
        {valor && (esVideo
          ? (
            <video
              key={valor}
              src={valor}
              className={styles.medio}
              autoPlay
              muted
              loop
              playsInline
              ref={videoRef}
              onLoadedMetadata={(evento) => leerMetadatos(evento.currentTarget)}
            />
          )
          : <img src={valor} alt="" className={styles.medio} draggable={false} />)}
        {usaHeredado && (esVideo
          ? <video key={heredado.src} src={heredado.src} className={styles.medio} autoPlay muted loop playsInline />
          : <img src={heredado.src} alt="" className={styles.medio} draggable={false} />)}
        {usaHeredado && !encima && !subiendo && (
          <span className={styles.heredado}>
            <Link2 size={12} aria-hidden="true" />
            {`${g.mismo} ${nombre} que en ${heredado.de}`}
          </span>
        )}
        {((!valor && !usaHeredado) || encima || subiendo) && (
          <span className={styles.capa}>
            <Icono size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>{subiendo ? 'Subiendo…' : encima ? 'Suelta para reemplazar' : (vacio || `Subir ${nombre}`)}</span>
          </span>
        )}
      </button>

      <div className={styles.pie}>
        <span className={styles.archivo} title={esNuevo ? '' : valor}>
          {esNuevo && <span className={styles.nuevo}>Nuevo</span>}
          {valor ? (esNuevo ? 'Sin publicar' : nombreArchivo(valor)) : usaHeredado ? 'Recortado al centro' : 'Sin archivo'}
        </span>
        <span className={styles.acciones}>
          <button type="button" className={styles.accion} onClick={() => input.current?.click()} disabled={subiendo}>
            {valor ? 'Reemplazar' : usaHeredado ? `Subir ${g.uno}` : 'Subir'}
          </button>
          {opcional && valor && (
            <button type="button" className={`${styles.accion} ${styles.quitar}`} onClick={() => onChange('')}>
              {heredado ? `Usar ${g.el} de ${heredado.de}` : 'Quitar'}
            </button>
          )}
        </span>
      </div>

      {esVideo && valor && (datos.peso || datos.duracion) && (
        <p className={styles.info}>
          {[
            datos.peso && formatoPeso(datos.peso),
            datos.duracion && formatoDuracion(datos.duracion),
            datos.ancho && `${datos.ancho}×${datos.alto} px`,
          ].filter(Boolean).join(' · ')}
          <span className={styles.infoLimite}>{` · máx. ${limiteVideo.maximo} MB`}</span>
        </p>
      )}
      {esVideo && valor && avisosVideo(datos, limiteVideo, orientacion).map((aviso) => (
        <p key={aviso} className={styles.aviso}>{aviso}</p>
      ))}
      {error && <p className={styles.error} role="alert">{error}</p>}

      <input
        ref={input}
        type="file"
        accept={esVideo ? 'video/mp4,video/webm' : 'image/*'}
        hidden
        onChange={(evento) => elegir(evento.target.files)}
      />
    </div>
  );
}

export default CampoMedio;
