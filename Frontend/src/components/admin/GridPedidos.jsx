'use client';

/* ============================================================
   GRID PEDIDOS — Fely Campo (admin)
   Vista alternativa a TablaAdmin para /admin/pedidos: en vez de filas,
   una rejilla de 4 columnas (12 tarjetas por página, mismo mecanismo
   de Paginacion que TablaAdmin) pensada para hojear pedidos de un
   vistazo — imagen(es) del pedido en lugar de datos tabulares.
   A diferencia de TablaAdmin (genérica, cualquier `columnas`), esta
   tarjeta conoce la forma de un pedido (`items: [{producto,talla,color}]`)
   porque no tiene sentido generalizarla para un solo uso.
   El slide es por ITEM, no por imagen suelta: cada punto/flecha avanza
   un `item` del pedido, y la info de debajo (producto, talla, color con
   su muestra de color) cambia junto con la imagen — así ambas cosas
   quedan siempre sincronizadas, incluso si algún item no resuelve
   imagen (se ve el hueco vacío pero el punto/flecha lo cuenta igual).
   Resuelve imagen/color contra productosMock/coloresMock aquí mismo
   (no vía prop) precisamente para no perder esa correspondencia 1:1.
   Uso:
     <GridPedidos filas={pedidos} hrefFila={(p) => `/admin/pedidos/${p.id}`} porPagina={12} />
   ============================================================ */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EstadoPedidoBadge from './EstadoPedidoBadge';
import Paginacion from './Paginacion';
import { productosMock, coloresMock } from './mockData';
import styles from './GridPedidos.module.css';

function imagenProducto(nombre) {
  return productosMock.find((p) => p.nombre === nombre)?.imagen || '';
}

function colorHex(nombre) {
  return coloresMock.find((c) => c.nombre.es === nombre)?.hex || '';
}

function Tarjeta({ pedido, href }) {
  const [indice, setIndice] = useState(0);
  const items = pedido.items || [];
  const item = items[indice];

  function irAnterior(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndice((i) => (i === 0 ? items.length - 1 : i - 1));
  }

  function irSiguiente(e) {
    e.preventDefault();
    e.stopPropagation();
    setIndice((i) => (i === items.length - 1 ? 0 : i + 1));
  }

  const imagen = item && imagenProducto(item.producto);

  return (
    <Link href={href} className={styles.tarjeta}>
      <div className={styles.imagenWrap}>
        {imagen ? (
          <img src={imagen} alt="" className={styles.imagen} />
        ) : (
          <div className={styles.imagenVacia} />
        )}
        {items.length > 1 && (
          <>
            <button type="button" className={`${styles.flecha} ${styles.flechaIzq}`} onClick={irAnterior} aria-label="Artículo anterior">
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button type="button" className={`${styles.flecha} ${styles.flechaDer}`} onClick={irSiguiente} aria-label="Artículo siguiente">
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <div className={styles.puntos}>
              {items.map((it, i) => (
                <span key={`${it.producto}-${it.talla}-${it.color}`} className={`${styles.punto} ${i === indice ? styles.puntoActivo : ''}`} />
              ))}
            </div>
          </>
        )}
        <span className={styles.estadoEsquina}><EstadoPedidoBadge estado={pedido.estadoEnvio} /></span>
        {items.length > 1 && <span className={styles.contadorEsquina}>{`+${items.length - 1}`}</span>}
      </div>
      <div className={styles.info}>
        <p className={styles.idCliente}>{pedido.id} · {pedido.cliente}</p>
        {item && (
          <>
            <p className={styles.producto}>{item.producto}</p>
            <p className={styles.talla}>Talla {item.talla}</p>
            <div className={styles.colorFila}>
              {colorHex(item.color) && <span className={styles.colorPunto} style={{ background: colorHex(item.color) }} aria-hidden="true" />}
              <span>{item.color}</span>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

function GridPedidos({
  filas, hrefFila, porPagina = 12, vacio = 'No hay elementos que mostrar.',
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
        {filasPagina.map((pedido) => (
          <Tarjeta key={pedido.id} pedido={pedido} href={hrefFila?.(pedido)} />
        ))}
      </div>
      <Paginacion pagina={pagina} porPagina={porPagina} total={filas.length} onCambiar={setPagina} />
    </div>
  );
}

export default GridPedidos;
