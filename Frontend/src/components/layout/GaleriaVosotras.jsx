// GaleriaVosotras.jsx

'use client';

/* ============================================================
   GALERÍA DE VOSOTRAS — Fely Campo
   Cuadrícula de looks de clientas para /atelier/vosotras — a
   diferencia de Novias/Fiesta (CuadriculaProductos: catálogo de
   producto con precio/talla/color), esta sección es la comunidad:
   fotos que las clientas comparten llevando piezas de Fely Campo, no
   productos en venta. Por eso no lleva PanelFiltros (sin talla/color/
   precio que filtrar) ni CuadriculaProductos.

   Cada tile de la cuadrícula es un "look" (PLACEHOLDER, ver
   LOOKS_EJEMPLO más abajo — sin backend real que permita a las
   clientas subir sus propias fotos/reseña todavía): su propia mini-
   galería de fotos (CarruselFotos.jsx, ui/ — cross-fade + barra de
   progreso al hover, mismo componente que ResenasClientes.jsx) más un
   botón "+" (40px, esquina inferior derecha, ver .abrirBtn) que —
   igual que clicar la propia foto — abre un lightbox a pantalla
   completa con esa mini-galería.

   El lightbox reutiliza el mecanismo de RunwayGaleria.jsx (mismo
   .lightbox/.abierta, cabecera con logo + cerrar, pista con scroll-
   snap + rueda con cooldown, franja de miniaturas a la izquierda para
   saltar entre fotos sin cerrar, y el propio bloque "Consigue el look"
   — .panelProductosBloque, productos reales de productosEjemplo.js
   enlazando a su ficha de Tienda, mismo criterio que "productos" en
   colecciones.js) pero con contenido propio: las miniaturas son las
   fotos DE ESE MISMO look (no otros looks de la cuadrícula — no hay
   forma de saltar de un look a otro sin cerrar, a diferencia de
   RunwayGaleria con sus looks de colección), y encima de "Consigue el
   look" el panel muestra el nombre de la clienta + su comentario, no
   "Look X" — mismo tratamiento tipográfico que .pie de
   ResenasClientes.module.css (cita + nombre).
   Uso:
     <GaleriaVosotras />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
import { CarruselFotos } from '../ui';
import { RESENAS_EJEMPLO } from './resenasEjemplo';
import { productosEjemplo } from './productosEjemplo';
import { slugify } from '@/lib/slugify';
import styles from './GaleriaVosotras.module.css';

// Mismas 3 fotos que FOTOS_CARRUSEL_EJEMPLO en ResenasClientes.jsx —
// sin backend real que permita a las clientas subir sus propias fotos
// todavía, se turnan aquí para simular la mini-galería de cada look.
const FOTOS_EJEMPLO = [
  '/img/Clientes/ClientReview- (1).jpg',
  '/img/Clientes/ClientReview- (2).jpg',
  '/img/Clientes/vestido-2clienta.JPG',
];

const CANTIDAD_EJEMPLO = 12;

// Cada look: su propia mini-galería (la foto de portada siempre
// primera, mismo criterio que TarjetaResena en ResenasClientes.jsx) +
// nombre/comentario (reutiliza RESENAS_EJEMPLO, resenasEjemplo.js, en
// vez de inventar textos nuevos) + un producto "vinculado" ("Consigue
// el look") — sin backend real que cruce clienta-look con un producto
// de verdad, se turna aquí uno de productosEjemplo.js por índice.
const LOOKS_EJEMPLO = Array.from({ length: CANTIDAD_EJEMPLO }, (_, indice) => {
  const portada = FOTOS_EJEMPLO[indice % FOTOS_EJEMPLO.length];
  const resena = RESENAS_EJEMPLO[indice % RESENAS_EJEMPLO.length];
  return {
    fotos: [portada, ...FOTOS_EJEMPLO.filter((foto) => foto !== portada)],
    nombre: resena.nombre,
    comentario: resena.texto,
    productos: [productosEjemplo[indice % productosEjemplo.length]],
  };
});

function GaleriaVosotras() {
  const t = useTranslations();
  const locale = useLocale();
  const pistaRef = useRef(null);
  const cerrarRef = useRef(null);
  const ruedaEnCooldownRef = useRef(false);

  const [abierta, setAbierta] = useState(false);
  const [indiceLook, setIndiceLook] = useState(0);
  const [indiceFoto, setIndiceFoto] = useState(0);

  const lookActivo = LOOKS_EJEMPLO[indiceLook];

  const abrir = (indice) => {
    setIndiceLook(indice);
    setIndiceFoto(0);
    setAbierta(true);
  };
  const cerrar = () => setAbierta(false);

  // Foco en cerrar + sin scroll de la página detrás mientras está
  // abierto — mismo criterio que RunwayGaleria/GaleriaProductoLightbox.
  useEffect(() => {
    if (!abierta) return undefined;
    const enfocadoAntes = document.activeElement;
    cerrarRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alTeclado = (evento) => {
      if (evento.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alTeclado);

    return () => {
      document.removeEventListener('keydown', alTeclado);
      document.body.style.overflow = overflowPrevio;
      enfocadoAntes?.focus?.();
    };
  }, [abierta]);

  // Al abrir (o cambiar de look), salta de golpe a la primera foto —
  // el barrido solo se ve al navegar ya dentro.
  useEffect(() => {
    if (!abierta) return;
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indiceFoto * nodo.clientWidth, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta, indiceLook]);

  const irAIndice = (indice) => {
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indice * nodo.clientWidth, behavior: 'smooth' });
    setIndiceFoto(indice);
  };

  const alScroll = () => {
    const nodo = pistaRef.current;
    if (!nodo || nodo.clientWidth === 0) return;
    const indice = Math.round(nodo.scrollLeft / nodo.clientWidth);
    if (indice !== indiceFoto) setIndiceFoto(indice);
  };

  const alRueda = (evento) => {
    evento.preventDefault();
    if (ruedaEnCooldownRef.current) return;

    const delta = Math.abs(evento.deltaX) > Math.abs(evento.deltaY) ? evento.deltaX : evento.deltaY;
    if (Math.abs(delta) < 10) return;

    const siguiente = indiceFoto + (delta > 0 ? 1 : -1);
    if (siguiente < 0 || siguiente >= lookActivo.fotos.length) return;

    ruedaEnCooldownRef.current = true;
    irAIndice(siguiente);
    setTimeout(() => { ruedaEnCooldownRef.current = false; }, 500);
  };

  const tabIndexInteractivo = abierta ? 0 : -1;

  return (
    <>
      <div className={styles.grid}>
        {LOOKS_EJEMPLO.map((look, indice) => (
          <div key={indice} className={styles.item} onClick={() => abrir(indice)}>
            <CarruselFotos fotos={look.fotos} />
            <button
              type="button"
              className={styles.abrirBtn}
              onClick={(evento) => { evento.stopPropagation(); abrir(indice); }}
              aria-label={t('vosotras.verGaleria')}
            >
              <Plus size={20} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className={`${styles.lightbox} ${abierta ? styles.abierta : ''}`} aria-hidden={!abierta}>
        <div className={styles.cabecera}>
          <a href={`/${locale}`} className={styles.logoLink} tabIndex={tabIndexInteractivo}>
            <img src="/img/logo/logo-felycampo.png" alt="Fely Campo" className={styles.logo} />
          </a>
          <button
            ref={cerrarRef}
            type="button"
            className={styles.cerrar}
            onClick={cerrar}
            aria-label={t('producto.galeriaCerrar')}
            tabIndex={tabIndexInteractivo}
          >
            <X size={40} strokeWidth={1} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        </div>

        <div ref={pistaRef} className={styles.pista} onScroll={alScroll} onWheel={alRueda}>
          {lookActivo.fotos.map((foto) => (
            <div key={foto} className={styles.pistaItem}>
              <img src={foto} alt="" className={styles.pistaImagen} />
            </div>
          ))}
        </div>

        {lookActivo.fotos.length > 1 && (
          <div className={styles.miniaturas}>
            {lookActivo.fotos.map((foto, indice) => (
              <button
                key={foto}
                type="button"
                className={`${styles.miniatura} ${indice === indiceFoto ? styles.miniaturaActiva : ''}`}
                onClick={() => irAIndice(indice)}
                aria-label={String(indice + 1)}
                aria-current={indice === indiceFoto}
                tabIndex={tabIndexInteractivo}
              >
                <img src={foto} alt="" className={styles.miniaturaImagen} />
              </button>
            ))}
          </div>
        )}

        <div className={styles.panelInfo}>
          <div className={styles.panelInfoInterior}>
            <div className={styles.panelResena}>
              <p className={styles.panelTexto}>&ldquo;{lookActivo.comentario}&rdquo;</p>
              <p className={styles.panelNombre}>{lookActivo.nombre}</p>
            </div>

            {lookActivo.productos.length > 0 && (
              <div className={styles.panelProductosBloque}>
                <p className={styles.panelProductosTitulo}>{t('producto.consigueElLook')}</p>
                <div className={styles.panelProductos}>
                  {lookActivo.productos.map((producto) => (
                    <a
                      key={producto.nombre}
                      href={`/${locale}/tienda/${slugify(producto.nombre)}`}
                      className={styles.panelProducto}
                      tabIndex={tabIndexInteractivo}
                    >
                      <span className={styles.panelProductoImagenWrap}>
                        <img src={producto.imagen} alt="" className={styles.panelProductoImagen} />
                        <button
                          type="button"
                          className={styles.panelProductoAnadir}
                          onClick={(evento) => evento.preventDefault()}
                          aria-label={t('producto.anadirCesta')}
                          tabIndex={tabIndexInteractivo}
                        >
                          <Plus size={12} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" />
                        </button>
                      </span>
                      <span className={styles.panelProductoNombre}>{producto.nombre}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default GaleriaVosotras;
