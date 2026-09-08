// ResenasClientes.jsx

/* ============================================================
   RESEÑAS DE CLIENTES (placeholder) — Fely Campo
   Bloque de reseñas publicadas, debajo de .ficha en la ficha de
   producto — usado tanto en tienda/[producto]/page.js como en
   FichaProductoAtelier.jsx (Atelier Novias/Fiesta) — solo LECTURA,
   reseñas ya publicadas desde el admin panel (ver resenasMock en
   src/components/admin/mockData.js, campo estado: 'Publicada'). El
   formulario público "Escribe tu reseña" (EscribirResena.jsx) que
   vivía debajo en la misma página se quitó del sitio público.

   PLACEHOLDER a propósito, mismo criterio que LookPasarela.jsx: no
   está conectado de verdad al admin todavía (ni hay filtrado real por
   producto, ni por estado), así que se renderiza siempre con el mismo
   par de reseñas de ejemplo en los dos sitios (RESENAS_EJEMPLO, ver
   resenasEjemplo.js) — mismas foto/texto/nombre que r1/r2 de
   resenasMock, las únicas dos con foto real disponible en
   /public/img/Clientes. Cuando exista esa conexión real, este mismo
   componente puede recibir el resultado filtrado (estado: 'Publicada',
   productoId del producto actual) tal cual.

   Copia de diseño 1:1 de ProductosRecomendados.jsx (.pista/.item) +
   TarjetaProducto en su variante "carrusel" (ver
   ResenasClientes.module.css para el detalle propiedad por propiedad):
   mismo gap entre tarjetas, mismo aspect-ratio de imagen (2/3, la
   misma variante que usa el carrusel), mismo radio (0), y mismo
   tamaño/peso/color de texto debajo de la imagen (.texto ~ .nombre de
   TarjetaProducto, .nombre ~ .precio). Única diferencia, por el propio
   contenido: fondo de color en .marco para cuando falta la foto
   (.fotoVacia, TarjetaProducto no tiene ese caso). A diferencia de
   .item (260px fijos, carrusel de scroll por debajo de tablet), aquí
   la fila es siempre de 4 columnas fijas (25% de ancho cada tarjeta,
   tope real, no las hasta 10 de recomendados) — con menos de 4
   reseñas no se reparten el ancho sobrante entre sí, "justify-content:
   center" en .fila las centra en conjunto en su lugar. La quinta
   reseña en adelante se oculta, no se añade como columna de más.

   ".marco" al pasar el ratón: carrusel de fotos — ver CarruselFotos.jsx
   (ui/), pieza compartida con GaleriaVosotras.jsx. PLACEHOLDER a
   propósito: una reseña real solo trae una foto, "foto", no una
   galería; el modelo de datos no tiene todavía un campo para subir
   varias, así que se turnan aquí unas pocas fotos fijas del mismo
   fondo de ejemplo (ver FOTOS_CARRUSEL_EJEMPLO más abajo).
   Uso:
     <ResenasClientes resenas={[
       { nombre: 'Marta Ibáñez', texto: 'El vestido...', foto: '/img/Clientes/ClientReview- (1).jpg' },
     ]} />
   ============================================================ */

import { CarruselFotos } from '../ui';
import styles from './ResenasClientes.module.css';

// Sin backend real que permita subir varias fotos por reseña, se
// turnan aquí unas pocas fotos fijas del mismo fondo de ejemplo
// (/public/img/Clientes) para simular el carrusel — mismo criterio
// que COMBOS_ESTILO_SILUETA en FichaProductoAtelier.jsx. La propia
// "foto" de cada reseña siempre va primera (para que el hover no dé un
// salto respecto a la foto ya visible en reposo).
const FOTOS_CARRUSEL_EJEMPLO = [
  '/img/Clientes/ClientReview- (1).jpg',
  '/img/Clientes/ClientReview- (2).jpg',
  '/img/Clientes/vestido-2clienta.JPG',
];

function TarjetaResena({ resena }) {
  const fotos = resena.foto
    ? [resena.foto, ...FOTOS_CARRUSEL_EJEMPLO.filter((foto) => foto !== resena.foto)]
    : [];

  return (
    <figure className={styles.tarjeta}>
      <div className={styles.marco}>
        {fotos.length > 0 ? (
          <CarruselFotos fotos={fotos} />
        ) : (
          <div className={styles.fotoVacia} aria-hidden="true" />
        )}
      </div>
      <figcaption className={styles.pie}>
        <p className={styles.texto}>&ldquo;{resena.texto}&rdquo;</p>
        <p className={styles.nombre}>{resena.nombre}</p>
      </figcaption>
    </figure>
  );
}

function ResenasClientes({ resenas = [] }) {
  if (resenas.length === 0) return null;

  return (
    <section className={styles.seccion}>
      <div className={styles.fila}>
        {resenas.map((resena) => (
          <TarjetaResena key={resena.nombre} resena={resena} />
        ))}
      </div>
    </section>
  );
}

export default ResenasClientes;
