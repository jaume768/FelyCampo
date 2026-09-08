'use client';

/* ============================================================
   TARJETA DE PRODUCTO — Fely Campo (e-commerce)
   Referente: styleguide.html #producto (.sg-prod).
   Uso:
     <TarjetaProducto imagen="/img/aurora.jpg" imagenHover="/img/aurora-2.jpg"
        nombre="Vestido Aurora" precio="890 €" badge="Novia"
        colores={[{ hex: '#EED3E8', nombre: 'Rosa suave' }]} />
     <TarjetaProducto nombre="Vestido Nube" precio="690 €" agotado />
     <TarjetaProducto imagen="/img/aurora.mp4" tipo="video"
        imagenHover="/img/aurora-2.mp4" tipoHover="video"
        nombre="Vestido Aurora" precio="890 €" />
     <TarjetaProducto nombre="Vestido Aurora" precio="890 €" colores={[
        { hex: '#EED3E8', nombre: 'Rosa suave', imagen: '/img/aurora-rosa.jpg' },
        { hex: '#23324A', nombre: 'Azul marino', imagen: '/img/aurora-azul.jpg' },
     ]} />
   ============================================================ */

import { useState } from 'react';
import { useLocale } from 'next-intl';
import styles from './TarjetaProducto.module.css';
import { Etiqueta, BotonGuardar, Boton } from '../ui';
import { slugify } from '@/lib/slugify';

/**
 * Tarjeta de producto de e-commerce. Sin badge = producto
 * normal. Con 'precioRebajado' = muestra precio tachado + nuevo precio en rosa.
 * "imagen"/"imagenHover" admiten vídeo — tipo/tipoHover ('imagen' por
 * defecto | 'video') deciden si cada una se renderiza como <img> o
 * como <video autoPlay muted loop playsInline>, independientemente
 * una de la otra (ej. imagen base + vídeo en hover).
 *
 * "variante='carrusel'" (opcional): usada por CuadriculaProductos en
 * su modo de banda con scroll horizontal — imagen más esbelta (2/3 en
 * vez de 3/4) y nombre/precio en mayúsculas. No toca el resto de
 * listados que usan esta tarjeta con su forma base.
 *
 * "colores": cada punto es un botón — clicarlo marca ese color como
 * activo (subrayado, igual patrón que .tab/.activa de CollectionTitle)
 * y, si el color trae su propia "imagen"/"imagenHover", sustituye la
 * foto de la tarjeta por esa. El primer color empieza activo. Por
 * defecto solo se revela en hover (o :focus-within) debajo de la
 * tarjeta; con "coloresSiempreVisibles" (usado por las páginas de
 * categoría, no por la home) se pinta dentro de .encabezado, junto a
 * nombre/precio, siempre visible y navegable — sin depender del hover.
 *
 * "ocultarPrecio" (opcional): no pinta el precio en absoluto — usado
 * por Atelier (Novias/Fiesta, precio bajo cita/presupuesto, no de
 * catálogo), no por Tienda.
 * "hrefBase" ('tienda' por defecto): primer segmento de la ficha a la
 * que enlaza la tarjeta (`/${locale}/${hrefBase}/${slug}`) — Atelier
 * (Novias/Fiesta) pasa 'atelier/novias'/'atelier/fiesta' en vez de
 * 'tienda': esas piezas no se compran online (sin precio de catálogo,
 * sin carrito) así que necesitan su propia ficha, no la de Tienda (ver
 * FichaProductoAtelier.jsx).
 *
 * Imagen + nombre/precio enlazan a la ficha de producto
 * (/tienda/[producto]). Con datos reales llega "slug" desde la API y
 * es el que manda; sin él (datos de ejemplo) se deriva del nombre con
 * src/lib/slugify.js;
 * ".enlace" usa display:contents para no romper el layout en flex/
 * grid de quien la use. El botón de wishlist y los puntos de color
 * (dentro de ese enlace cuando "coloresSiempreVisibles") paran la
 * propagación del clic para no disparar también la navegación.
 */
function TarjetaProducto({
  imagen,
  imagenHover,
  tipo = 'imagen',
  tipoHover = 'imagen',
  nombre,
  precio,
  precioRebajado,
  badge,
  badgeVariante = 'tinta',
  colores = [],
  agotado = false,
  alt,
  variante,
  coloresSiempreVisibles = false,
  ocultarPrecio = false,
  hrefBase = 'tienda',
  slug,
}) {
  const locale = useLocale();
  // "slug": el que da la API, que NO es slugify(nombre) — lleva familia y código de
  // diseño detrás (`vestido-aria-ve-770`). Sin él el enlace apunta a una ficha que no
  // existe. Se cae a slugify(nombre) para los datos de ejemplo, que no tienen slug.
  const hrefProducto = `/${locale}/${hrefBase}/${slug || slugify(nombre)}`;

  const coloresVisibles = colores.slice(0, 3);
  const coloresRestantes = colores.length - coloresVisibles.length;
  const esCarrusel = variante === 'carrusel';

  const [colorActivo, setColorActivo] = useState(0);
  const colorSeleccionado = coloresVisibles[colorActivo];

  // Solo se sustituye la imagen si el color activo trae la suya —
  // colores puramente decorativos (sin "imagen") no tocan la foto.
  const imagenActual = colorSeleccionado?.imagen || imagen;
  const imagenHoverActual = colorSeleccionado?.imagenHover || imagenHover;
  const tipoActual = colorSeleccionado?.imagen ? colorSeleccionado.tipo || 'imagen' : tipo;
  const tipoHoverActual = colorSeleccionado?.imagenHover ? colorSeleccionado.tipoHover || 'imagen' : tipoHover;

  const preciosBloque = !ocultarPrecio && (
    <div className={`${styles.precios} ${esCarrusel ? styles.preciosCarrusel : ''}`}>
      {precioRebajado ? (
        <>
          <span className={styles.antes}>{precio}</span>
          <span className={styles.ahora}>{precioRebajado}</span>
        </>
      ) : (
        <span className={styles.precio}>{precio}</span>
      )}
    </div>
  );

  const coloresBotones = coloresVisibles.length > 0 && (
    <>
      {coloresVisibles.map(({ hex, nombre: nombreColor }, index) => (
        <button
          key={nombreColor}
          type="button"
          className={`${styles.colorBoton} ${index === colorActivo ? styles.colorActivo : ''}`}
          onClick={() => setColorActivo(index)}
          aria-pressed={index === colorActivo}
          aria-label={nombreColor}
          title={nombreColor}
        >
          <span className={styles.punto} style={{ background: hex }} />
        </button>
      ))}
      {coloresRestantes > 0 && (
        <span className={styles.mas}>+{coloresRestantes}</span>
      )}
    </>
  );

  return (
    <article className={styles.tarjeta}>
      <a href={hrefProducto} className={styles.enlace}>
        <div className={`${styles.marco} ${esCarrusel ? styles.marcoCarrusel : ''}`}>
          {badge && (
            <span className={styles.badge}>
              <Etiqueta variante={badgeVariante}>{badge}</Etiqueta>
            </span>
          )}

          <span className={styles.wishlist} onClick={(evento) => evento.stopPropagation()}>
            <BotonGuardar />
          </span>

          <div className={styles.recorte}>
            {imagenActual && (
              tipoActual === 'video' ? (
                <video
                  src={imagenActual}
                  className={`${styles.imagen} ${styles.imagenBase}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={imagenActual}
                  alt={alt || nombre}
                  className={`${styles.imagen} ${styles.imagenBase}`}
                />
              )
            )}
            {imagenHoverActual && (
              tipoHoverActual === 'video' ? (
                <video
                  src={imagenHoverActual}
                  className={`${styles.imagen} ${styles.imagenHover}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={imagenHoverActual}
                  alt=""
                  className={`${styles.imagen} ${styles.imagenHover}`}
                />
              )
            )}
          </div>
        </div>

        <div className={styles.encabezado}>
          <p className={`${styles.nombre} ${esCarrusel ? styles.nombreCarrusel : ''}`}>{nombre}</p>

          {preciosBloque}

          {coloresSiempreVisibles && !agotado && coloresBotones && (
            <div className={styles.coloresEncabezado} onClick={(evento) => evento.stopPropagation()}>
              {coloresBotones}
            </div>
          )}
        </div>
      </a>

      {agotado ? (
        <div className={styles.accion}>
          <Boton variante="avisa">Avísame cuando esté disponible</Boton>
        </div>
      ) : (
        !coloresSiempreVisibles && coloresBotones && (
          <div className={styles.colores}>{coloresBotones}</div>
        )
      )}
    </article>
  );
}

export default TarjetaProducto;
