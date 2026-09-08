'use client';

/* ============================================================
   BOTÓN — Fely Campo
   Estilos en Boton.module.css (cascada real sobre los tokens
   de global.css). El componente solo decide QUÉ clases aplicar.
   Uso:
     <Boton>Comprar</Boton>
     <Boton variante="contorno">Ver colección</Boton>
     <Boton variante="contorno-rosa">Limpiar filtros</Boton>
     <Boton variante="rosa" tamano="full">Añadir a la cesta</Boton>
     <Boton variante="texto">Descubre más</Boton>
     <Boton variante="texto-crema">Descubre más</Boton>
     <Boton variante="flecha" href="/coleccion">Comprar ahora</Boton>
   ============================================================ */

import styles from './Boton.module.css';

/**
 * Botón principal del sistema. 'solido' = acción principal (una
 * por pantalla). 'rosa' se reserva para CTAs de compra — no repetir más de
 * una vez por vista, pierde fuerza. 'contorno' = acción secundaria. 'contorno-rosa'
 * = mismo contorno pero en rosa-oscuro, para acciones secundarias "de limpiar/
 * descartar" (ej. Limpiar filtros); mismo patrón de hover que 'contorno' (invierte
 * a relleno sólido, texto/icono en --color-fondo). 'texto' = enlaces.
 * 'texto-crema' = mismo enlace, en --color-crema (fondos oscuros/imágenes,
 * ej. HeroCarousel).
 * 'flecha' = nuevo diseño de CTA en mayúsculas, subrayado
 * (ej. cabecera de CuadriculaProductos) — candidato a sustituir a
 * solido/contorno/rosa en el resto del sistema, todavía sin extender.
 * Esquinas siempre rectas (radio 0).
 */
function Boton({
  children,
  variante = 'solido',
  tamano = 'm',
  href,
  onClick,
  type = 'button',
  desactivado = false,
  mayusculas = false,
  tabIndex,
  className,
}) {
  if (variante === 'texto' || variante === 'texto-crema' || variante === 'flecha') {
    const clases = [
      variante === 'flecha' ? styles.flecha : styles.texto,
      variante === 'texto-crema' && styles.textoCrema,
      mayusculas && styles.textoMayusculas,
      className,
    ].filter(Boolean).join(' ');

    // Con href, es un enlace real; sin él, un <span> que solo dispara onClick.
    if (href && !desactivado) {
      return (
        <a href={href} onClick={onClick} className={clases} tabIndex={tabIndex}>
          {children}
        </a>
      );
    }

    return (
      <span
        onClick={desactivado ? undefined : onClick}
        className={clases}
      >
        {children}
      </span>
    );
  }

  // La variante "avisa" tiene un tamaño fijo — no se combina con .s/.m/.l/.full
  const clase = [
    styles.boton,
    variante === 'avisa' ? styles.avisa : `${styles[variante]} ${styles[tamano]}`,
    className,
  ].filter(Boolean).join(' ');

  // Con href, es un enlace real (mismo criterio que la variante "texto" de
  // arriba) — antes se ignoraba por completo y el botón no navegaba a
  // ningún sitio pese a tener href.
  if (href && !desactivado) {
    return (
      <a href={href} onClick={onClick} className={clase} tabIndex={tabIndex}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={desactivado} className={clase} tabIndex={tabIndex}>
      {children}
    </button>
  );
}

export default Boton;
