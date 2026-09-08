'use client';

/* ============================================================
   PAGINACIÓN — Fely Campo (admin)
   Pie de Anterior/Página X de Y/Siguiente, compartido por TablaAdmin
   y GridPedidos (y cualquier otro listado paginado). No lleva estado
   propio ni sabe cortar el array — solo pinta según `pagina`/`total`
   y avisa al padre con `onCambiar(nuevaPagina)`.
   Uso:
     <Paginacion pagina={pagina} porPagina={12} total={filas.length} onCambiar={setPagina} />
   ============================================================ */

import styles from './Paginacion.module.css';

function Paginacion({ pagina, porPagina, total, onCambiar }) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  return (
    <div className={styles.paginacion}>
      <span>{`${(pagina - 1) * porPagina + 1}–${Math.min(pagina * porPagina, total)} de ${total}`}</span>
      <div className={styles.botones}>
        <button
          type="button"
          className={styles.boton}
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina <= 1}
        >
          Anterior
        </button>
        <span>{`Página ${pagina} de ${totalPaginas}`}</span>
        <button
          type="button"
          className={styles.boton}
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina >= totalPaginas}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Paginacion;
