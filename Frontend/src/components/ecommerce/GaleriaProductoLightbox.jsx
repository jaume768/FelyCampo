// GaleriaProductoLightbox.jsx

'use client';

/* ============================================================
   LIGHTBOX DE GALERÍA DE PRODUCTO — Fely Campo
   Pantalla completa (fade suave al abrir/cerrar) con las imágenes de
   GaleriaProducto más grandes: misma banda con scroll horizontal +
   scroll-snap, más una franja de miniaturas a la izquierda, centrada
   verticalmente, para saltar entre ellas. Mantiene el logo en el mismo
   sitio que el Navbar real (mismo alto de fila, 76px, mismo logo/tamaño)
   pero sin el resto del header — es su propia cabecera mínima, no el
   Navbar de verdad (viven
   en sitios distintos del árbol, sin forma de ocultar uno desde el
   otro sin acoplarlos).
   Sin precio en ningún caso (a petición explícita — ver
   FichaProductoAcciones.jsx): ni Prêt-à-porter ni Atelier enseñan ya
   precio de catálogo, así que este panel nunca lo pinta.
   "esAtelier" (Atelier Novias/Fiesta, ver FichaProductoAtelier.jsx):
   el CTA "Contacta con nosotros" abre ModalSolicitudAtelier (pide
   talla dentro del propio modal, mismo flujo que InfoAtelier.jsx, sin
   compartir estado con esa instancia). Ninguno de los dos casos
   muestra ya BotonGuardar (wishlist). Sin "esAtelier" (Prêt-à-porter, único otro caso): el
   mismo CTA abre también ModalSolicitudAtelier (antes
   ModalContactoProducto; mismos datos en todas las fichas, a petición).
   Portal a document.body (igual que Modal.jsx, mismo motivo): vive
   dentro de GaleriaProducto, que cuelga de .debajoNavbar en
   tienda/[producto]/page.js y FichaProductoAtelier.jsx
   (position:relative + z-index:1, para que la página quede por debajo
   del Navbar transparent+fixed) — sin portal, ese ancestro crea su
   propio contexto de apilamiento y atrapa dentro el z-index:100 de
   .lightbox, que entonces nunca podría ganarle a los z-index:50 del
   Navbar por mucho que se suba ese número.
   Uso:
     <GaleriaProductoLightbox
       imagenes={['/a.jpg', '/b.jpg']} alt="Vestido Aurora"
       abierta={abierta} indiceActivo={indice}
       onCambiarIndice={setIndice} onCerrar={() => setAbierta(false)}
     />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { SelectorColor, Boton } from '../ui';
import ModalSolicitudAtelier from './ModalSolicitudAtelier';
import styles from './GaleriaProductoLightbox.module.css';
import { atributosImagen } from '@/lib/imagenes';

function GaleriaProductoLightbox({
  imagenes = [],
  alt,
  abierta,
  indiceActivo,
  onCambiarIndice,
  onCerrar,
  nombre,
  colores = [],
  tallas = [],
  esAtelier = false,
}) {
  const t = useTranslations('producto');
  const locale = useLocale();
  const pistaRef = useRef(null);
  const cerrarRef = useRef(null);
  const [color, setColor] = useState(colores[0]?.nombre ?? null);
  const [avisoColor, setAvisoColor] = useState(false);
  const [modalAtelierAbierto, setModalAtelierAbierto] = useState(false);
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false);
  // Portal a document.body (ver comentario de arriba) — solo existe en
  // cliente, así que se espera a montar antes de renderizarlo (mismo
  // patrón que Modal.jsx).
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Cada apertura empieza de cero — sin esto, reabrir el lightbox en
  // otro producto heredaría el aviso de color de la vez anterior.
  useEffect(() => {
    if (!abierta) return;
    setAvisoColor(false);
  }, [abierta]);

  const alClicContactar = () => {
    if (esAtelier) {
      // Mismo criterio que InfoAtelier.alContactar: sin color elegido,
      // "Contacta con nosotros" no abre el modal, solo avisa.
      if (colores.length > 0 && !color) {
        setAvisoColor(true);
        return;
      }
      setModalAtelierAbierto(true);
      return;
    }
    setModalContactoAbierto(true);
  };

  // Al abrir: foco en el botón cerrar, sin scroll de la página detrás.
  // Escape cierra — igual que atraparFoco de PanelLateral, pero
  // repetido aquí porque esto no es un drawer (PanelLateral desliza
  // desde un borde, esto ocupa toda la pantalla y tiene su propia
  // franja de miniaturas).
  useEffect(() => {
    if (!abierta) return undefined;
    const enfocadoAntes = document.activeElement;
    cerrarRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alTeclado = (evento) => {
      if (evento.key === 'Escape') onCerrar?.();
    };
    document.addEventListener('keydown', alTeclado);

    return () => {
      document.removeEventListener('keydown', alTeclado);
      document.body.style.overflow = overflowPrevio;
      enfocadoAntes?.focus?.();
    };
  }, [abierta, onCerrar]);

  // Al abrir, salta de golpe (sin "smooth") a la imagen que se clicó
  // en la galería — el barrido solo se ve al navegar ya dentro.
  // .item ocupa el 100% de .pista (ver GaleriaProductoLightbox.module.css),
  // así que ese es el ancho real de un "paso" entre imágenes.
  useEffect(() => {
    if (!abierta) return;
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indiceActivo * nodo.clientWidth, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta]);

  const irAIndice = (indice) => {
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indice * nodo.clientWidth, behavior: 'smooth' });
    onCambiarIndice(indice);
  };

  // Arrastrar/hacer scroll directamente sobre la pista (no solo clicar
  // una miniatura) también actualiza cuál está activa.
  const alScroll = () => {
    const nodo = pistaRef.current;
    if (!nodo || nodo.clientWidth === 0) return;
    const indice = Math.round(nodo.scrollLeft / nodo.clientWidth);
    if (indice !== indiceActivo) onCambiarIndice(indice);
  };

  // Cualquier gesto de rueda/trackpad pasa a la imagen siguiente/anterior
  // de golpe (como clicar una miniatura), sin importar si el eje que
  // reporta el navegador es vertical (rueda de ratón normal) u horizontal
  // (trackpad, shift+rueda) — el signo del eje dominante decide la
  // dirección. Cooldown de 500ms: un solo gesto de trackpad dispara
  // muchos eventos "wheel" seguidos: sin él, un swipe saltaría varias
  // imágenes de golpe en vez de una.
  const ruedaEnCooldownRef = useRef(false);

  const alRueda = (evento) => {
    evento.preventDefault();
    if (ruedaEnCooldownRef.current) return;

    const delta = Math.abs(evento.deltaX) > Math.abs(evento.deltaY) ? evento.deltaX : evento.deltaY;
    if (Math.abs(delta) < 10) return;

    const siguiente = indiceActivo + (delta > 0 ? 1 : -1);
    if (siguiente < 0 || siguiente >= imagenes.length) return;

    ruedaEnCooldownRef.current = true;
    irAIndice(siguiente);
    setTimeout(() => { ruedaEnCooldownRef.current = false; }, 500);
  };

  if (imagenes.length === 0 || !montado) return null;

  const tabIndexInteractivo = abierta ? 0 : -1;

  return createPortal(
    <div className={`${styles.lightbox} ${abierta ? styles.abierta : ''}`} aria-hidden={!abierta}>
      <div className={styles.cabecera}>
        <a href={`/${locale}`} className={styles.logoLink} tabIndex={tabIndexInteractivo}>
          <img src="/img/logo/fely-campo-logo.webp" alt="Fely Campo" className={styles.logo} />
        </a>
        <button
          ref={cerrarRef}
          type="button"
          className={styles.cerrar}
          onClick={onCerrar}
          aria-label={t('galeriaCerrar')}
          tabIndex={tabIndexInteractivo}
        >
          <X size={40} strokeWidth={1} strokeLinecap="square" strokeLinejoin="miter" />
        </button>
      </div>

      <div ref={pistaRef} className={styles.pista} onScroll={alScroll} onWheel={alRueda}>
        {imagenes.map((src) => (
          <div key={src} className={styles.item}>
            <img {...atributosImagen(src, { sizes: '(max-width: 768px) 100vw, 50vw' })} alt={alt} className={styles.imagen} />
          </div>
        ))}
      </div>

      {imagenes.length > 1 && (
        <div className={styles.miniaturas}>
          {imagenes.map((src, indice) => (
            <button
              key={src}
              type="button"
              className={`${styles.miniatura} ${indice === indiceActivo ? styles.miniaturaActiva : ''}`}
              onClick={() => irAIndice(indice)}
              aria-label={String(indice + 1)}
              aria-current={indice === indiceActivo}
              tabIndex={tabIndexInteractivo}
            >
              <img {...atributosImagen(src, { sizes: '96px' })} alt="" className={styles.miniaturaImagen} />
            </button>
          ))}
        </div>
      )}

      {nombre && (
        <div className={styles.panelInfo}>
          <div className={styles.panelCabecera}>
            <p className={styles.panelNombre}>{nombre}</p>
          </div>

          {colores.length > 0 && (
            <SelectorColor
              colores={colores}
              seleccionado={color}
              onSelect={(valor) => { setColor(valor); setAvisoColor(false); }}
              tabIndex={tabIndexInteractivo}
            />
          )}
          {esAtelier && avisoColor && <p className={styles.avisoColor}>{t('avisoColor')}</p>}

          <Boton
            variante="solido"
            tamano="full"
            onClick={alClicContactar}
            tabIndex={tabIndexInteractivo}
          >
            {t('contactar')}
          </Boton>
        </div>
      )}

      {esAtelier ? (
        <ModalSolicitudAtelier
          abierto={modalAtelierAbierto}
          onCerrar={() => setModalAtelierAbierto(false)}
          imagen={imagenes[0]}
          producto={nombre}
          color={color}
          colorHex={colores.find((candidato) => candidato.nombre === color)?.hex}
          tallas={tallas}
        />
      ) : (
        <ModalSolicitudAtelier
          abierto={modalContactoAbierto}
          onCerrar={() => setModalContactoAbierto(false)}
          imagen={imagenes[0]}
          producto={nombre}
          color={color}
          colorHex={colores.find((candidato) => candidato.nombre === color)?.hex}
        />
      )}
    </div>,
    document.body,
  );
}

export default GaleriaProductoLightbox;
