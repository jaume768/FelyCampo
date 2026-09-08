'use client';

/* ============================================================
   PRODUCTOS RECOMENDADOS — Fely Campo
   Hasta 10 productos — SOLO para la ficha de producto
   (tienda/[producto]/page.js), debajo de LookPasarela. No se usa en
   ningún otro sitio (Tienda/Atelier/home siguen con CuadriculaProductos
   tal cual estaban).

   Carrusel de scroll horizontal libre solo por debajo de 768px (misma
   conversión de rueda vertical -> scroll horizontal que GaleriaProducto,
   para poder hojearla también con un ratón normal, no solo con
   trackpad/touch) — de tablet para arriba pasa a ser una fila estática
   sin scroll, con un número fijo de tarjetas según el ancho (3 en
   tablet, 4 en escritorio; el resto se ocultan, ver
   ProductosRecomendados.module.css). Sin título de sección.
   Uso:
     <ProductosRecomendados productos={relacionados} />

   "hrefBase"/"ocultarPrecio" (opcionales, se le pasan tal cual a
   TarjetaProducto): usados por FichaProductoAtelier.jsx (Novias/
   Fiesta) para enlazar a su propia ficha en vez de a /tienda y no
   enseñar precio — mismo criterio que en CuadriculaProductos.jsx.
   ============================================================ */

import { useEffect, useRef } from 'react';
import TarjetaProducto from '../ecommerce/TarjetaProducto';
import styles from './ProductosRecomendados.module.css';

function ProductosRecomendados({ productos = [], hrefBase, ocultarPrecio = false }) {
  const contenedorRef = useRef(null);
  const pistaRef = useRef(null);
  const objetivoScrollRef = useRef(0);
  const animandoRef = useRef(false);

  // Mismo patrón que GaleriaProducto.jsx: listener nativo con
  // passive:false (React registra onWheel como pasivo, así que
  // preventDefault no serviría de nada ahí) + un objetivo animado por
  // requestAnimationFrame en vez de sumar el delta directo — así
  // varios "notches" de rueda seguidos se funden en un scroll
  // continuo, en vez de dar saltos secos.
  useEffect(() => {
    const nodo = contenedorRef.current;
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
      // Sin nada que desplazar (versión estática de tablet/escritorio,
      // ver ProductosRecomendados.module.css) no se llama a
      // preventDefault — si no, cualquier scroll vertical de página con
      // el ratón encima de esta sección se quedaría bloqueado sin mover
      // nada (el carrusel no tiene overflow, pero el listener seguiría
      // "comiéndose" el evento).
      const maximo = pista.scrollWidth - pista.clientWidth;
      if (maximo <= 0) return;
      evento.preventDefault();
      if (!animandoRef.current) objetivoScrollRef.current = pista.scrollLeft;
      objetivoScrollRef.current = Math.min(maximo, Math.max(0, objetivoScrollRef.current + evento.deltaY));
      if (!animandoRef.current) {
        animandoRef.current = true;
        requestAnimationFrame(animar);
      }
    };

    nodo.addEventListener('wheel', alRueda, { passive: false });
    return () => nodo.removeEventListener('wheel', alRueda);
  }, []);

  const productosVisibles = productos.slice(0, 10);
  if (productosVisibles.length === 0) return null;

  return (
    <section className={styles.seccion}>
      <div ref={contenedorRef} className={styles.contenedor}>
        <div ref={pistaRef} className={styles.pista}>
          {productosVisibles.map((producto) => (
            <div key={producto.nombre} className={styles.item}>
              <TarjetaProducto {...producto} variante="carrusel" hrefBase={hrefBase} ocultarPrecio={ocultarPrecio} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductosRecomendados;
