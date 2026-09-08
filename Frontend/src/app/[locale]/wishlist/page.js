'use client';

/* ============================================================
   WISHLIST (/wishlist) — Fely Campo
   Misma referencia que /carrito (vacío con icono + texto + CTA si no
   hay nada; si no, una cuadrícula de tarjetas) pero de una sola
   columna, sin el "resumen" de pedido al lado — una wishlist no tiene
   nada que calcular (ni subtotal ni envío). TarjetaWishlist (a
   diferencia de TarjetaCarrito) no enseña ni selector de talla ni de
   cantidad, ni tiene CTA "Añadir a la cesta" — solo la foto, el nombre/
   precio y "Quitar" (ver TarjetaWishlist.jsx).
   Cabecera: mismo CabeceraSeccion "enCuadricula"+alinear="start" que
   usa CuadriculaProductos en modo "grid" (Tienda/Atelier) — aquí sin
   "before"/children (ni botón de filtros ni toggle de densidad, no
   aplican a una wishlist).

   PLACEHOLDER a propósito, mismo criterio que ResenasClientes.jsx/
   GaleriaVosotras.jsx: BotonGuardar (el icono de guardar en
   TarjetaProducto y compañía) todavía no está conectado a ningún
   estado global — a diferencia del carrito (CarritoContext +
   localStorage) no hay de dónde leer una wishlist real todavía, así
   que esta página arranca con un puñado fijo de productosEjemplo.js.
   "Quitar" sí funciona de verdad (quita la tarjeta de la lista), pero
   solo en memoria de esta página — recargar la trae de vuelta, no hay
   persistencia real hasta que exista ese contexto.
   ============================================================ */

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { Boton, CabeceraSeccion } from '@/components/ui';
import { TarjetaWishlist } from '@/components/ecommerce';
import { productosEjemplo } from '@/components/layout/productosEjemplo';
import styles from './page.module.css';

// PLACEHOLDER — ver comentario de arriba: un puñado fijo de ejemplo,
// no una wishlist real todavía.
const WISHLIST_EJEMPLO = productosEjemplo.slice(0, 6);

export default function Pagina() {
  const t = useTranslations('wishlist');
  const locale = useLocale();
  const [items, setItems] = useState(WISHLIST_EJEMPLO);

  const quitar = (nombre) => setItems((actuales) => actuales.filter((item) => item.nombre !== nombre));

  return (
    <section className="seccion contenedor wishlist">
      {items.length === 0 ? (
        <div className={styles.vacio}>
          <Heart className={styles.vacioIcono} strokeWidth={1} />
          <p className={styles.vacioTexto}>{t('vacio')}</p>
          <Boton variante="solido" tamano="m" href={`/${locale}/tienda`}>{t('explorarTienda')}</Boton>
        </div>
      ) : (
        <>
          <CabeceraSeccion titleKey="wishlist.titulo" descriptionKey="wishlist.descripcion" enCuadricula alinear="start" />
          <div className={styles.cuadricula}>
            {items.map((producto) => (
              <TarjetaWishlist
                key={producto.nombre}
                imagen={producto.imagen}
                nombre={producto.nombre}
                precio={producto.precio}
                colores={producto.colores}
                onQuitar={() => quitar(producto.nombre)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
