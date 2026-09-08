// GaleriaProducto.jsx

'use client';

/* ============================================================
   GALERÍA DE PRODUCTO — Fely Campo
   Banda horizontal de scroll totalmente libre y fluido (arrastre
   táctil/trackpad, o la rueda del ratón — vertical se traduce a
   horizontal en .pista) + flechas para avanzar exactamente una imagen.
   Sin scroll-snap: la parada fija en cada imagen la dan solo las
   flechas (ver desplazar()), el scroll manual no fuerza ninguna parada
   a media imagen. Clicar una imagen abre GaleriaProductoLightbox
   a pantalla completa, en la misma posición.
   nombre/precio/colores/tallas solo se usan en el lightbox, para el
   panel de compra rápida sobre la imagen. "esAtelier" (Atelier Novias/
   Fiesta, ver FichaProductoAtelier.jsx): ese panel cambia a "Contacta
   con nosotros" en vez de "Añadir a la cesta" (sin precio ni talla,
   ver GaleriaProductoLightbox.jsx) — ahí no se pasa "precio"/"tallas",
   solo "nombre"/"colores".
   Uso:
     <GaleriaProducto imagenes={['/a.jpg', '/b.jpg']} alt="Vestido Aurora"
        nombre="Vestido Aurora" precio="890 €"
        colores={[{ hex: '#EED3E8', nombre: 'Rosa suave' }]} tallas={[38, 40, 42]} />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GaleriaProductoLightbox from './GaleriaProductoLightbox';
import styles from './GaleriaProducto.module.css';

function GaleriaProducto({ imagenes = [], alt, nombre, precio, colores = [], tallas = [], esAtelier = false }) {
  const t = useTranslations('producto');
  const galeriaRef = useRef(null);
  const pistaRef = useRef(null);
  const objetivoScrollRef = useRef(0);
  const animandoRef = useRef(false);
  const [puedeAnterior, setPuedeAnterior] = useState(false);
  const [puedeSiguiente, setPuedeSiguiente] = useState(imagenes.length > 1);
  const [lightboxAbierta, setLightboxAbierta] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(0);

  const actualizarFlechas = () => {
    const nodo = pistaRef.current;
    if (!nodo) return;
    setPuedeAnterior(nodo.scrollLeft > 8);
    setPuedeSiguiente(nodo.scrollLeft < nodo.scrollWidth - nodo.clientWidth - 8);
  };

  useEffect(() => {
    actualizarFlechas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagenes.length]);

  // La pista no usa scroll-snap (el scroll manual — rueda o arrastre —
  // debe quedar totalmente libre y fluido, sin que el navegador fuerce
  // paradas). Las flechas son las únicas que dan una parada fija: como
  // .imagenBoton mide fit-content (ver GaleriaProducto.module.css), cada
  // botón tiene un ancho distinto según el aspect-ratio de su foto, así
  // que se salta directo al offsetLeft real del botón siguiente/anterior.
  const desplazar = (direccion) => {
    const nodo = pistaRef.current;
    if (!nodo) return;
    const botones = Array.from(nodo.children);
    const actual = nodo.scrollLeft;
    const objetivo = direccion > 0
      ? botones.find((boton) => boton.offsetLeft > actual + 8)
      : [...botones].reverse().find((boton) => boton.offsetLeft < actual - 8);
    if (!objetivo) return;
    // El objetivo de la animación de rueda (ver el useEffect de abajo) se
    // sincroniza aquí también — si no, tras usar una flecha, el próximo
    // giro de rueda partiría del último objetivo de rueda (desactualizado)
    // en vez de la posición real, y pegaría un salto hacia atrás.
    objetivoScrollRef.current = objetivo.offsetLeft;
    nodo.scrollTo({ left: objetivo.offsetLeft, behavior: 'smooth' });
  };

  // La rueda del ratón suele traer solo movimiento vertical (deltaY) —
  // se traduce a scroll horizontal para poder hojear la galería sin
  // depender de un trackpad. Si el gesto ya viene horizontal (deltaX,
  // trackpad/touchpad), se deja pasar tal cual. Se engancha en .galeria
  // (no solo en .pista) para que también funcione al pasar la rueda
  // sobre las flechas, que son hermanas de .pista y no reciben su
  // burbujeo de evento.
  // Va como listener nativo con passive:false: React registra los onWheel
  // de JSX como pasivos, así que evento.preventDefault() no hace nada ahí
  // y la página sigue haciendo scroll vertical de fondo.
  //
  // Un ratón físico manda pocos "notches" grandes y espaciados (a
  // diferencia de un trackpad, que manda muchos deltas pequeños y
  // seguidos) — sumar cada notch directo a scrollLeft es un salto
  // instantáneo sin transición, y encadenados se ven como paradas
  // secas, no como un scroll fluido. Aquí cada notch solo mueve un
  // "objetivo", y un bucle por requestAnimationFrame va acercando el
  // scrollLeft real a ese objetivo con un lerp — así la pista frena en
  // vez de saltar, y varios notches seguidos se funden en un único
  // movimiento continuo.
  useEffect(() => {
    const nodo = galeriaRef.current;
    if (!nodo) return undefined;

    const animar = () => {
      const pista = pistaRef.current;
      if (!pista) {
        animandoRef.current = false;
        return;
      }
      const actual = pista.scrollLeft;
      const diferencia = objetivoScrollRef.current - actual;
      if (Math.abs(diferencia) < 0.5) {
        pista.scrollLeft = objetivoScrollRef.current;
        animandoRef.current = false;
        return;
      }
      pista.scrollLeft = actual + diferencia * 0.2;
      requestAnimationFrame(animar);
    };

    const alRueda = (evento) => {
      if (Math.abs(evento.deltaY) <= Math.abs(evento.deltaX)) return;
      const pista = pistaRef.current;
      if (!pista) return;
      evento.preventDefault();
      // Si no hay una animación en marcha, el objetivo parte de la
      // posición real actual (no del último objetivo, que puede estar
      // desactualizado si el usuario arrastró la pista a mano mientras
      // tanto sin pasar por aquí).
      if (!animandoRef.current) objetivoScrollRef.current = pista.scrollLeft;
      const maximo = pista.scrollWidth - pista.clientWidth;
      objetivoScrollRef.current = Math.min(maximo, Math.max(0, objetivoScrollRef.current + evento.deltaY));
      if (!animandoRef.current) {
        animandoRef.current = true;
        requestAnimationFrame(animar);
      }
    };
    nodo.addEventListener('wheel', alRueda, { passive: false });
    return () => nodo.removeEventListener('wheel', alRueda);
  }, []);

  const abrirLightbox = (indice) => {
    setIndiceActivo(indice);
    setLightboxAbierta(true);
  };

  if (imagenes.length === 0) return null;

  return (
    <div className={styles.galeria} ref={galeriaRef}>
      <div ref={pistaRef} className={styles.pista} onScroll={actualizarFlechas}>
        {imagenes.map((src, indice) => (
          <button
            key={src}
            type="button"
            className={styles.imagenBoton}
            onClick={() => abrirLightbox(indice)}
          >
            <img src={src} alt={alt} className={styles.imagen} />
          </button>
        ))}
      </div>

      {imagenes.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.flecha} ${styles.flechaIzquierda}`}
            onClick={() => desplazar(-1)}
            disabled={!puedeAnterior}
            aria-label={t('galeriaAnterior')}
          >
            <ChevronLeft size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
          <button
            type="button"
            className={`${styles.flecha} ${styles.flechaDerecha}`}
            onClick={() => desplazar(1)}
            disabled={!puedeSiguiente}
            aria-label={t('galeriaSiguiente')}
          >
            <ChevronRight size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        </>
      )}

      <GaleriaProductoLightbox
        imagenes={imagenes}
        alt={alt}
        abierta={lightboxAbierta}
        indiceActivo={indiceActivo}
        onCambiarIndice={setIndiceActivo}
        onCerrar={() => setLightboxAbierta(false)}
        nombre={nombre}
        precio={precio}
        colores={colores}
        tallas={tallas}
        esAtelier={esAtelier}
      />
    </div>
  );
}

export default GaleriaProducto;
