'use client';

/* ============================================================
   GALERÍA DE RUNWAY — Fely Campo
   Cuadrícula de looks de una colección (ver /archivo/runway/[coleccion]/
   page.js) + lightbox a pantalla completa al clicar uno — mismo
   mecanismo que GaleriaProductoLightbox.jsx (banda con scroll-snap +
   franja de miniaturas a la izquierda para saltar entre looks sin
   cerrar), pero en vez de un panel de compra de UN producto, enseña el
   número de look activo ("Look X"), su descripción editorial (opcional
   — "descripcion" en colecciones.js, si el look la tiene) y, debajo,
   los productos vinculados a ese look (0, 1 o varios — ver "productos"
   en colecciones.js), cada uno enlazando a su propia ficha. El panel se
   pinta siempre (a diferencia de los productos, que son opcionales).
   Uso:
     <RunwayGaleria looks={coleccion.looks} alt={coleccion.nombre} />
   ============================================================ */

import { useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X, Plus } from 'lucide-react';
import { slugify } from '@/lib/slugify';
import styles from './RunwayGaleria.module.css';

function RunwayGaleria({ looks = [], alt }) {
  const t = useTranslations('producto');
  const locale = useLocale();
  const pistaRef = useRef(null);
  const cerrarRef = useRef(null);
  const ruedaEnCooldownRef = useRef(false);
  const panelInfoRef = useRef(null);
  const panelInfoInteriorRef = useRef(null);

  const [abierta, setAbierta] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(0);
  // Solo tiene efecto en mobile (ver media query en RunwayGaleria.module.css)
  // — en escritorio el panel se pinta siempre entero y .panelToggle está
  // oculto. Colapsado por defecto en cada look nuevo, igual que "talla" se
  // resetea en GaleriaProductoLightbox.
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const detalleId = useId();

  const abrir = (indice) => {
    setIndiceActivo(indice);
    setAbierta(true);
  };
  const cerrar = () => setAbierta(false);

  // Foco en cerrar + sin scroll de la página de fondo mientras está
  // abierta — mismo criterio que GaleriaProductoLightbox/PanelLateral.
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

  // Al abrir, salta de golpe (sin "smooth") al look que se clicó en la
  // cuadrícula — el barrido solo se ve al navegar ya dentro.
  useEffect(() => {
    if (!abierta) return;
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indiceActivo * nodo.clientWidth, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta]);

  // Cada look nuevo empieza colapsado en mobile.
  useEffect(() => {
    setDetalleAbierto(false);
  }, [indiceActivo]);

  // .panelInfo crece/encoge según tenga o no descripción/productos (no
  // todos los looks traen los dos) — .panelInfoInterior nunca se toca
  // (mide su alto natural, sin restricciones), y ese alto se aplica al
  // propio .panelInfo con una transición (ver RunwayGaleria.module.css:
  // "height" + "overflow:hidden" ahí). Como .panelInfo es
  // position:absolute con "bottom" fijo, el propio CSS ya hace crecer
  // el panel hacia arriba desde su borde inferior — el ResizeObserver
  // solo evita que el cambio de alto sea un salto instantáneo al
  // cambiar de look (o al plegar/desplegar el detalle en mobile).
  useEffect(() => {
    const panel = panelInfoRef.current;
    const interior = panelInfoInteriorRef.current;
    if (!panel || !interior) return undefined;

    const aplicarAltura = () => {
      panel.style.height = `${interior.offsetHeight}px`;
    };

    aplicarAltura();
    const observer = new ResizeObserver(aplicarAltura);
    observer.observe(interior);
    return () => observer.disconnect();
  }, []);

  const irAIndice = (indice) => {
    const nodo = pistaRef.current;
    if (!nodo) return;
    nodo.scrollTo({ left: indice * nodo.clientWidth, behavior: 'smooth' });
    setIndiceActivo(indice);
  };

  const alScroll = () => {
    const nodo = pistaRef.current;
    if (!nodo || nodo.clientWidth === 0) return;
    const indice = Math.round(nodo.scrollLeft / nodo.clientWidth);
    if (indice !== indiceActivo) setIndiceActivo(indice);
  };

  const alRueda = (evento) => {
    evento.preventDefault();
    if (ruedaEnCooldownRef.current) return;

    const delta = Math.abs(evento.deltaX) > Math.abs(evento.deltaY) ? evento.deltaX : evento.deltaY;
    if (Math.abs(delta) < 10) return;

    const siguiente = indiceActivo + (delta > 0 ? 1 : -1);
    if (siguiente < 0 || siguiente >= looks.length) return;

    ruedaEnCooldownRef.current = true;
    irAIndice(siguiente);
    setTimeout(() => { ruedaEnCooldownRef.current = false; }, 500);
  };

  if (looks.length === 0) return null;

  const tabIndexInteractivo = abierta ? 0 : -1;
  const lookActivo = looks[indiceActivo];
  const productosDelLook = lookActivo?.productos || [];

  return (
    <>
      <div className={styles.grid}>
        {looks.map((look, indice) => (
          <button key={look.imagen} type="button" className={styles.item} onClick={() => abrir(indice)}>
            <img src={look.imagen} alt="" className={styles.itemImagen} />
          </button>
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
            aria-label={t('galeriaCerrar')}
            tabIndex={tabIndexInteractivo}
          >
            <X size={40} strokeWidth={1} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        </div>

        <div ref={pistaRef} className={styles.pista} onScroll={alScroll} onWheel={alRueda}>
          {looks.map((look) => (
            <div key={look.imagen} className={styles.pistaItem}>
              <img src={look.imagen} alt={alt} className={styles.pistaImagen} />
            </div>
          ))}
        </div>

        {looks.length > 1 && (
          <div className={styles.miniaturas}>
            {looks.map((look, indice) => (
              <button
                key={look.imagen}
                type="button"
                className={`${styles.miniatura} ${indice === indiceActivo ? styles.miniaturaActiva : ''}`}
                onClick={() => irAIndice(indice)}
                aria-label={String(indice + 1)}
                aria-current={indice === indiceActivo}
                tabIndex={tabIndexInteractivo}
              >
                <img src={look.imagen} alt="" className={styles.miniaturaImagen} />
              </button>
            ))}
          </div>
        )}

        <div className={styles.panelInfo} ref={panelInfoRef}>
          <div className={styles.panelInfoInterior} ref={panelInfoInteriorRef}>
            <div className={styles.panelCabecera}>
              <p className={styles.panelTitulo}>{t('lookNumero', { numero: indiceActivo + 1 })}</p>
              <button
                type="button"
                className={`${styles.panelToggle} ${detalleAbierto ? styles.panelToggleAbierto : ''}`}
                onClick={() => setDetalleAbierto((valor) => !valor)}
                aria-expanded={detalleAbierto}
                aria-controls={detalleId}
                aria-label={t('lookVerDetalle')}
                tabIndex={tabIndexInteractivo}
              >
                <Plus size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" />
              </button>
            </div>

            <div
              id={detalleId}
              className={`${styles.panelDetalle} ${detalleAbierto ? styles.panelDetalleAbierto : ''}`}
            >
              <div className={styles.panelDetalleInner}>
                <div className={styles.panelDetalleContenido}>
                  {lookActivo?.descripcion && <p className={styles.panelDescripcion}>{lookActivo.descripcion}</p>}

                  {productosDelLook.length > 0 && (
                    <div className={styles.panelProductosBloque}>
                      <p className={styles.panelProductosTitulo}>{t('consigueElLook')}</p>
                      <div className={`${styles.panelProductos} ${productosDelLook.length >= 3 ? styles.panelProductosScroll : ''}`}>
                        {productosDelLook.map((producto) => (
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
                                aria-label={t('anadirCesta')}
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
          </div>
        </div>
      </div>
    </>
  );
}

export default RunwayGaleria;
