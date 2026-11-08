'use client';

/* ============================================================
   GALERÍA EDITABLE — Fely Campo (admin)
   Lista de fotos (y vídeos, si se permite) de una página: se añaden
   varias a la vez (clic o arrastrando), se reordenan arrastrando o con
   las flechas, se quitan, y cada una puede llevar su pie de foto en el
   idioma que se edita.
   Valor:
     conPie   → [{ src, pie: { es, en } }]   (fotos de Sobre Fely)
     sin pie  → ['ruta', 'ruta', …]          (carrusel de un taller)
   "textoPie": cómo se llama el pie («Pie de foto», «Texto del look»…).
   "columnas": en rejilla de N columnas en vez de una fila que se desplaza.
   "maximo": cuántas caben como mucho (opcional). Al llegar, la caja de
   "Añadir" desaparece y, si se sueltan más de las que caben, se añaden
   las primeras y se avisa de las que se quedan fuera.
   "papeles": lo que hace cada foto en la web según su posición
   (función (indice, total) → texto), p. ej. "Junto al texto".
   Las fotos se comprimen en el navegador (comprimirImagen) y, como en el
   resto del admin hasta que haya almacén de archivos, se guardan como
   URL temporal (blob). Los vídeos recién subidos llevan "#video" al final
   para reconocerlos (ver esVideoTaller en lib/talleres.js).
   ============================================================ */

import { useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, ImagePlus, Plus, X,
} from 'lucide-react';
import { faltaTexto } from '@/lib/previa';
import DragList from './DragList';
import { comprimirImagen } from './FormularioProducto';
import styles from './GaleriaEditable.module.css';

const MB = 1024 * 1024;
const MAXIMO_VIDEO_MB = 15;
const OTRO = { es: 'en', en: 'es' };

const esVideoPorDefecto = (src) => /\.(mp4|webm|mov)(\?|#|$)/i.test(src) || /#video$/.test(src);

function GaleriaEditable({
  valor = [], onChange, idioma = 'es', conPie = false, permitirVideo = false, papeles, esVideo = esVideoPorDefecto,
  textoAnadir, maximo, textoPie = 'Pie de foto',
  // "columnas": rejilla de N columnas (todas las fotos a la vista, sin
  // desplazarse en horizontal), p. ej. los looks de una colección de Runway.
  columnas,
}) {
  const input = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [encima, setEncima] = useState(false);
  const [error, setError] = useState('');

  // Todo se trabaja como { src, pie } y se devuelve en el formato de entrada.
  const items = valor.map((item) => (typeof item === 'string' ? { src: item, pie: null } : item));
  // Cualquier cambio de la lista deja viejo el aviso anterior.
  const devolver = (lista) => {
    setError('');
    onChange(conPie ? lista : lista.map((item) => item.src));
  };

  async function anadir(archivos) {
    const lista = [...(archivos || [])].filter((archivo) => archivo.type.startsWith('image/') || (permitirVideo && archivo.type.startsWith('video/')));
    const hueco = maximo === undefined ? Infinity : Math.max(0, maximo - items.length);
    const sobran = Math.max(0, lista.length - hueco);
    if (sobran) lista.splice(hueco);
    if (lista.length === 0 && sobran) {
      setError(`Caben ${maximo} como máximo. Quita alguna para añadir otra.`);
      if (input.current) input.current.value = '';
      return;
    }
    if (lista.length === 0) {
      setError(permitirVideo ? 'Elige fotos (JPG, PNG o WebP) o vídeos (MP4).' : 'Elige fotos (JPG, PNG o WebP).');
      return;
    }
    setSubiendo(true);
    setError('');
    const nuevas = [];
    const rechazados = [];
    for (const archivo of lista) {
      try {
        if (archivo.type.startsWith('video/')) {
          if (archivo.size > MAXIMO_VIDEO_MB * MB) {
            rechazados.push(`${archivo.name} (${Math.round(archivo.size / MB)} MB)`);
          } else {
            nuevas.push({ src: `${URL.createObjectURL(archivo)}#video`, pie: conPie ? { es: '', en: '' } : null });
          }
        } else {
          // eslint-disable-next-line no-await-in-loop
          const blob = await comprimirImagen(archivo);
          nuevas.push({ src: URL.createObjectURL(blob), pie: conPie ? { es: '', en: '' } : null });
        }
      } catch {
        rechazados.push(archivo.name);
      }
    }
    if (nuevas.length) devolver([...items, ...nuevas]);
    if (rechazados.length) {
      setError(`No se han podido subir: ${rechazados.join(', ')}. Los vídeos, como máximo ${MAXIMO_VIDEO_MB} MB.`);
    } else if (sobran) {
      setError(`Caben ${maximo} como máximo: no se ${sobran === 1 ? 'ha añadido 1' : `han añadido ${sobran}`}.`);
    }
    setSubiendo(false);
    if (input.current) input.current.value = '';
  }

  function mover(indice, desplazamiento) {
    const destino = indice + desplazamiento;
    if (destino < 0 || destino >= items.length) return;
    const copia = [...items];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    devolver(copia);
  }

  function cambiarPie(indice, texto) {
    devolver(items.map((item, posicion) => (posicion === indice ? { ...item, pie: { ...item.pie, [idioma]: texto } } : item)));
  }

  const hayVideos = items.some((item) => esVideo(item.src));
  // Con máximo, las fotos son pocas: van en varias filas y la caja de
  // «Añadir» siempre se ve, así que no hace falta repetirla arriba. Sin
  // máximo (carruseles largos), la fila se desplaza y «Añadir» va también
  // en la cabecera para que siempre esté a mano.
  const conLimite = maximo !== undefined;
  const lleno = conLimite && items.length >= maximo;
  const deMas = conLimite ? items.length - maximo : 0;
  const recuento = `${items.length}${conLimite ? ` de ${maximo}` : ''} ${hayVideos || permitirVideo ? ((conLimite ? maximo : items.length) === 1 ? 'elemento' : 'elementos') : ((conLimite ? maximo : items.length) === 1 ? 'foto' : 'fotos')}`;

  return (
    <div className={styles.galeria}>
      <div className={styles.cabecera}>
        <span className={`${styles.recuento} ${deMas > 0 ? styles.recuentoDeMas : ''}`}>
          {items.length ? recuento : (conLimite ? `Sin fotos · máximo ${maximo}` : 'Sin fotos')}
        </span>
        {!conLimite && (
          <button type="button" className={styles.anadirTexto} onClick={() => input.current?.click()} disabled={subiendo}>
            <Plus size={14} aria-hidden="true" />
            {textoAnadir || (permitirVideo ? 'Añadir fotos o vídeos' : 'Añadir fotos')}
          </button>
        )}
      </div>

      <div
        className={`${styles.fila} ${conLimite ? styles.filaEnVarias : ''} ${columnas ? styles.filaRejilla : ''}`}
        style={columnas ? { '--columnas': columnas } : undefined}
      >
        {items.length > 0 && (
          <DragList
            items={items}
            claveItem={(item) => item.src}
            onReorder={devolver}
            orientacion="horizontal"
            renderItem={(item, indice) => {
              const video = esVideo(item.src);
              const pieFalta = conPie && faltaTexto(item.pie, idioma, false);
              return (
                <figure className={styles.foto}>
                  <div className={styles.marco}>
                    {video
                      ? <video src={item.src} className={styles.medio} muted loop playsInline autoPlay />
                      : <img src={item.src} alt="" className={styles.medio} draggable={false} />}
                    <span className={styles.numero}>{indice + 1}</span>
                    {video && <span className={styles.etiquetaVideo}>Vídeo</span>}
                    <div className={styles.acciones}>
                      <button type="button" className={styles.accion} onClick={() => mover(indice, -1)} disabled={indice === 0} aria-label="Mover a la izquierda">
                        <ChevronLeft size={14} aria-hidden="true" />
                      </button>
                      <button type="button" className={styles.accion} onClick={() => mover(indice, 1)} disabled={indice === items.length - 1} aria-label="Mover a la derecha">
                        <ChevronRight size={14} aria-hidden="true" />
                      </button>
                      <button type="button" className={styles.accion} onClick={() => devolver(items.filter((_, posicion) => posicion !== indice))} aria-label="Quitar">
                        <X size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {papeles && <figcaption className={styles.papel}>{papeles(indice, items.length)}</figcaption>}
                  {conPie && (
                    <input
                      className={`${styles.pie} ${pieFalta ? styles.pieFalta : ''}`}
                      value={item.pie?.[idioma] || ''}
                      placeholder={item.pie?.[OTRO[idioma]] ? `${idioma === 'en' ? 'ES' : 'EN'}: ${item.pie[OTRO[idioma]]}` : `${textoPie} (opcional)`}
                      aria-label={`${textoPie} ${indice + 1}`}
                      title={pieFalta ? 'Falta la traducción de este pie' : undefined}
                      onChange={(evento) => cambiarPie(indice, evento.target.value)}
                    />
                  )}
                </figure>
              );
            }}
          />
        )}

        {!lleno && (
          <button
            type="button"
            className={`${styles.anadir} ${encima ? styles.encima : ''}`}
            onClick={() => input.current?.click()}
            onDragEnter={(evento) => { evento.preventDefault(); setEncima(true); }}
            onDragOver={(evento) => evento.preventDefault()}
            onDragLeave={() => setEncima(false)}
            onDrop={(evento) => { evento.preventDefault(); setEncima(false); anadir(evento.dataTransfer.files); }}
            disabled={subiendo}
          >
            <ImagePlus size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>{subiendo ? 'Subiendo…' : (textoAnadir || (permitirVideo ? 'Añadir fotos o vídeos' : 'Añadir fotos'))}</span>
            <span className={styles.anadirAyuda}>
              {maximo !== undefined ? `Clic o arrastra aquí · caben ${maximo - items.length} más` : 'Clic o arrastra aquí · varias a la vez'}
            </span>
          </button>
        )}
      </div>

      {deMas > 0 && (
        <p className={styles.error} role="alert">
          {`Caben ${maximo} como máximo: quita ${deMas === 1 ? 'una' : deMas} para poder publicar.`}
        </p>
      )}
      {lleno && deMas === 0 && <p className={styles.nota}>{`Ya hay ${maximo}, el máximo. Para añadir otra, quita alguna.`}</p>}

      {items.length > 1 && <p className={styles.nota}>Arrastra para cambiar el orden.</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}

      <input
        ref={input}
        type="file"
        accept={permitirVideo ? 'image/*,video/mp4,video/webm' : 'image/*'}
        multiple
        hidden
        onChange={(evento) => anadir(evento.target.files)}
      />
    </div>
  );
}

export default GaleriaEditable;
