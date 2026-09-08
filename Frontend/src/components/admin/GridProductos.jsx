'use client';

/* ============================================================
   GRID PRODUCTOS — Fely Campo (admin)
   Vista alternativa a TablaAdmin para el listado plano de Producto
   (/admin/productos, /admin/productos/pret-a-porter,
   /admin/productos/atelier — con o sin ?categoria=) — mismo patrón de
   rejilla paginada que GridPedidos/GridConsultasPrecio (4 columnas,
   12 tarjetas/página, Paginacion compartida).
   A diferencia de esas dos, no navega a una ficha: clicar una tarjeta
   abre el mismo modal de edición que clicar una fila de TablaAdmin
   (onClickFila) — el flujo de edición no cambia, solo cómo se hojea
   el listado. Por eso la tarjeta NO es un único <button>: el look
   vinculado (ver FormularioProducto.jsx "Vincular a Runway / Novia /
   Fiesta") necesita su propia miniatura clicable que navegue a la
   colección, y un <button> no puede anidarse dentro de otro sin romper
   la hidratación y el propio click (mismo bug ya corregido en
   ListaProductos.jsx `LookTarjeta`/.lookVinculadosGrid) — así que
   ".tarjeta" es un <div>, ".tarjetaBoton" es el único botón grande
   (imagen+info, dispara onClick), y la miniatura del look vinculado
   vive fuera de él, superpuesta por posición absoluta.
   Uso:
     <GridProductos filas={filtrados} onClickFila={abrirEdicion} porPagina={12} />
   ============================================================ */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EstadoPublicacionBadge from './EstadoPublicacionBadge';
import Paginacion from './Paginacion';
import { Boton } from '../ui';
import { rutaTipoProducto } from './mockData';
import styles from './GridProductos.module.css';

function Tarjeta({ producto, onClick, onDuplicar }) {
  const router = useRouter();
  const lookVinculado = producto.lookVinculado;

  function irALook() {
    router.push(`${rutaTipoProducto(lookVinculado.tipo)}?categoria=${lookVinculado.categoriaId}`);
  }

  return (
    <div className={styles.tarjeta}>
      <button type="button" className={styles.tarjetaBoton} onClick={onClick}>
        <div className={styles.imagenWrap}>
          {producto.imagen ? (
            <img src={producto.imagen} alt="" className={styles.imagen} />
          ) : <div className={styles.imagenVacia} />}
          <span className={styles.estadoEsquina}><EstadoPublicacionBadge estado={producto.estado} /></span>
        </div>
        <div className={styles.info}>
          <p className={styles.nombre}>{producto.nombre}</p>
          <p className={styles.sku}>{producto.sku || '—'}</p>
          <p className={styles.precio}>{producto.precio || '—'}</p>
        </div>
      </button>

      {/* Fuera de .tarjetaBoton por el mismo motivo que .lookVinculadoTile
          (no se puede anidar un <button> dentro de otro) — crea una
          variante de color de este mismo producto, ver
          FormularioProducto.jsx `productoBase`/ListaProductos.jsx
          `duplicar`. */}
      <div className={styles.tarjetaAcciones}>
        <Boton variante="contorno" tamano="s" onClick={() => onDuplicar(producto)}>
          Duplicar
        </Boton>
      </div>

      {lookVinculado && (
        <div className={styles.imagenOverlay}>
          <button
            type="button"
            className={styles.lookVinculadoTile}
            onClick={irALook}
            aria-label={`Ver look vinculado: ${lookVinculado.lookNombre} — ${lookVinculado.categoriaNombre}`}
          >
            {lookVinculado.imagen ? (
              <img src={lookVinculado.imagen} alt="" className={styles.lookVinculadoImagen} />
            ) : <span className={styles.lookVinculadoImagen} />}
          </button>
        </div>
      )}
    </div>
  );
}

function GridProductos({
  filas, onClickFila, onDuplicar, porPagina = 12, vacio = 'No hay productos que mostrar.',
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
        {filasPagina.map((producto) => (
          <Tarjeta key={producto.id} producto={producto} onClick={() => onClickFila(producto)} onDuplicar={onDuplicar} />
        ))}
      </div>
      <Paginacion pagina={pagina} porPagina={porPagina} total={filas.length} onCambiar={setPagina} />
    </div>
  );
}

export default GridProductos;
