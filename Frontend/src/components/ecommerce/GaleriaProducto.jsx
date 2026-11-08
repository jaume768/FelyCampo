// GaleriaProducto.jsx

'use client';

/* ============================================================
   GALERÍA DE PRODUCTO — Fely Campo
   Escritorio: columna vertical de fotos a pantalla completa con su
   propio scroll (ver .pista en GaleriaProducto.module.css) — con el
   ratón encima, la rueda va pasando las fotos y la página no se mueve
   hasta llegar a la última (encadenamiento de scroll nativo del
   navegador, sin JS). Mobile: banda horizontal (arrastre táctil) +
   flechas para avanzar exactamente una imagen.
   Sin scroll-snap: la parada fija en cada imagen la dan solo las
   flechas (ver desplazar()), el scroll manual no fuerza ninguna parada
   a media imagen. Clicar una imagen abre GaleriaProductoLightbox
   a pantalla completa, en la misma posición.
   nombre/colores/tallas solo se usan en el lightbox, para el panel de
   contacto rápido sobre la imagen. "esAtelier" (Atelier Novias/Fiesta,
   ver FichaProductoAtelier.jsx): ese panel abre ModalSolicitudAtelier
   (con talla); Prêt-à-porter usa el mismo modal, ver
   GaleriaProductoLightbox.jsx. Sin precio (a petición explícita, ni
   aquí ni en Prêt-à-porter — ver FichaProductoAcciones.jsx): ningún
   producto del sitio se enseña ya con precio de catálogo.
   Uso:
     <GaleriaProducto imagenes={['/a.jpg', '/b.jpg']} alt="Vestido Aurora"
        nombre="Vestido Aurora"
        colores={[{ hex: '#EED3E8', nombre: 'Rosa suave' }]} />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GaleriaProductoLightbox from './GaleriaProductoLightbox';
import styles from './GaleriaProducto.module.css';
import { atributosImagen } from '@/lib/imagenes';

function GaleriaProducto({ imagenes = [], alt, nombre, colores = [], tallas = [], esAtelier = false }) {
  const t = useTranslations('producto');
  const pistaRef = useRef(null);
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
    nodo.scrollTo({ left: objetivo.offsetLeft, behavior: 'smooth' });
  };

  const abrirLightbox = (indice) => {
    setIndiceActivo(indice);
    setLightboxAbierta(true);
  };

  if (imagenes.length === 0) return null;

  return (
    // data-navbar-hero: hace de Hero de la página de producto (Tienda/
    // Atelier, ver layout.js "esFichaProducto") — mismo mecanismo que
    // ProductHero.jsx en las páginas de listado, Navbar.jsx vigila este
    // nodo para saber cuándo volverse sólido.
    <div className={styles.galeria} data-navbar-hero>
      <div
        ref={pistaRef}
        className={`${styles.pista} ${imagenes.length === 1 ? styles.pistaUnica : ''}`}
        onScroll={actualizarFlechas}
      >
        {imagenes.map((src, indice) => (
          <button
            key={src}
            type="button"
            className={styles.imagenBoton}
            onClick={() => abrirLightbox(indice)}
          >
            <img {...atributosImagen(src, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt={alt} className={styles.imagen} />
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
        colores={colores}
        tallas={tallas}
        esAtelier={esAtelier}
      />
    </div>
  );
}

export default GaleriaProducto;
