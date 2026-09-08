'use client';

/* ============================================================
   GRID CONSULTAS DE PRECIO — Fely Campo (admin)
   Vista alternativa a TablaAdmin para /admin/consultas-precio: rejilla
   de 4 columnas (12 tarjetas/página, mismo Paginacion que GridPedidos)
   para hojear consultas de un vistazo. A diferencia de GridPedidos,
   cada consulta tiene un único producto de interés — no hace falta
   slide, una imagen fija basta.
   `esUrgente`/`etiquetaRecibida` los resuelve la página (misma lógica
   que ya usa para resaltarFila/columna "Recibida" en TablaAdmin) — así
   la regla de "4+ días sin contactar" vive en un solo sitio.
   Uso:
     <GridConsultasPrecio
       filas={consultas}
       hrefFila={(c) => `/admin/consultas-precio/${c.id}`}
       esUrgente={esUrgente}
       etiquetaRecibida={(c) => etiquetaDias(calcularDias(c.fecha))}
       porPagina={12}
     />
   ============================================================ */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EstadoContactoBadge from './EstadoContactoBadge';
import OrigenProductoBadge from './OrigenProductoBadge';
import Paginacion from './Paginacion';
import { productosMock, coloresMock } from './mockData';
import styles from './GridConsultasPrecio.module.css';

function imagenProducto(nombre) {
  return productosMock.find((p) => p.nombre === nombre)?.imagen || '';
}

function colorHex(nombre) {
  return coloresMock.find((c) => c.nombre.es === nombre)?.hex || '';
}

function Tarjeta({
  consulta, href, urgente, etiquetaRecibida,
}) {
  const imagen = imagenProducto(consulta.producto);

  return (
    <Link href={href} className={styles.tarjeta}>
      <div className={styles.imagenWrap}>
        {imagen ? <img src={imagen} alt="" className={styles.imagen} /> : <div className={styles.imagenVacia} />}
        <span className={styles.origenEsquina}><OrigenProductoBadge producto={consulta.producto} /></span>
        <span className={styles.estadoEsquina}><EstadoContactoBadge estado={consulta.estado} /></span>
      </div>
      <div className={styles.info}>
        <p className={styles.nombreCliente}>{consulta.nombre}</p>
        <p className={styles.producto}>{consulta.producto}</p>
        {consulta.color && (
          <div className={styles.colorFila}>
            {colorHex(consulta.color) && <span className={styles.colorPunto} style={{ background: colorHex(consulta.color) }} aria-hidden="true" />}
            <span>{consulta.color}</span>
          </div>
        )}
        <span className={urgente ? styles.recibidaUrgente : styles.recibida}>{etiquetaRecibida}</span>
      </div>
    </Link>
  );
}

function GridConsultasPrecio({
  filas, hrefFila, esUrgente, etiquetaRecibida, porPagina = 12, vacio = 'No hay elementos que mostrar.',
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
        {filasPagina.map((consulta) => (
          <Tarjeta
            key={consulta.id}
            consulta={consulta}
            href={hrefFila?.(consulta)}
            urgente={esUrgente(consulta)}
            etiquetaRecibida={etiquetaRecibida(consulta)}
          />
        ))}
      </div>
      <Paginacion pagina={pagina} porPagina={porPagina} total={filas.length} onCambiar={setPagina} />
    </div>
  );
}

export default GridConsultasPrecio;
