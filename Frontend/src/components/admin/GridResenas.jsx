'use client';

/* ============================================================
   GRID RESEÑAS — Fely Campo (admin)
   Vista alternativa a TablaAdmin para /admin/resenas: rejilla de 4
   columnas (12 tarjetas/página, mismo Paginacion que GridPedidos/
   GridConsultasPrecio). La imagen de la tarjeta es la del PRODUCTO
   reseñado (no la foto que sube la clienta, ver FormularioResena.jsx
   "Fotos de clientas" — esa es secundaria, aquí prima reconocer de un
   vistazo qué producto es).
   Clicar una tarjeta abre el mismo ModalOverlay de edición que clicar
   una fila de TablaAdmin (onClickFila) — /admin/resenas/nueva y
   /admin/resenas/[id]/editar ya no son páginas propias, ver
   FormularioResena.jsx.
   Uso:
     <GridResenas filas={resenas} onClickFila={(r) => setResenaEnEdicion(r)} porPagina={12} />
   ============================================================ */

import { useEffect, useState } from 'react';
import EstadoBadge from './EstadoBadge';
import Paginacion from './Paginacion';
import { productosMock } from './mockData';
import styles from './GridResenas.module.css';

function productoDe(productoId) {
  return productosMock.find((p) => p.id === productoId);
}

function Tarjeta({ resena, onClick }) {
  const producto = productoDe(resena.productoId);
  // `texto` es string en reseñas antiguas del mock y {es, en} en las
  // creadas/editadas desde FormularioResena.jsx.
  const texto = typeof resena.texto === 'string' ? resena.texto : resena.texto.es;

  return (
    <button type="button" onClick={onClick} className={styles.tarjeta}>
      <div className={styles.imagenWrap}>
        {producto?.imagen ? <img src={producto.imagen} alt="" className={styles.imagen} /> : <div className={styles.imagenVacia} />}
        {resena.nuevo && <span className={styles.puntoNuevo} title="Nuevo" aria-label="Nuevo" />}
        <span className={styles.estadoEsquina}><EstadoBadge estado={resena.estado} /></span>
      </div>
      <div className={styles.info}>
        <p className={styles.nombreCliente}>{resena.nombreCliente}</p>
        <p className={styles.texto}>{texto}</p>
        {producto && (
          <p className={styles.producto}>
            {producto.nombre}
            {' · '}
            {producto.sku}
          </p>
        )}
      </div>
    </button>
  );
}

function GridResenas({
  filas, onClickFila, porPagina = 12, vacio = 'No hay reseñas que mostrar.',
}) {
  const [pagina, setPagina] = useState(1);

  useEffect(() => { setPagina(1); }, [filas]);

  const filasPagina = filas.slice((pagina - 1) * porPagina, pagina * porPagina);

  if (filas.length === 0) {
    return <p className={styles.vacio}>{vacio}</p>;
  }

  return (
    <div>
      <div className={styles.grid}>
        {filasPagina.map((resena) => (
          <Tarjeta key={resena.id} resena={resena} onClick={() => onClickFila(resena)} />
        ))}
      </div>
      <Paginacion pagina={pagina} porPagina={porPagina} total={filas.length} onCambiar={setPagina} />
    </div>
  );
}

export default GridResenas;
