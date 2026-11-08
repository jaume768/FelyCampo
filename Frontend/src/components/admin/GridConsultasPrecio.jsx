'use client';

/* ============================================================
   GRID CONSULTAS DE VESTIDOS — Fely Campo (admin)
   Vista alternativa a TablaAdmin para /admin/consultas-precio: rejilla
   de 4 columnas (12 tarjetas/página, mismo Paginacion que GridPedidos)
   para hojear consultas de un vistazo. A diferencia de GridPedidos,
   cada consulta tiene un único producto de interés — no hace falta
   slide, una imagen fija basta: la foto del vestido que manda el modal
   ("imagen"), su color ("colorHex") y Novias/Fiesta ("tipo").
   `esUrgente`/`etiquetaRecibida` los resuelve la página (misma lógica
   que ya usa para resaltarFila/columna "Recibida" en TablaAdmin) — así
   la regla de "4+ días sin contactar" vive en un solo sitio.
   Uso:
     <GridConsultasPrecio
       filas={consultas}
       hrefFila={(c) => `/admin/consultas-precio/${c.id}`}
       esUrgente={esUrgente}
       etiquetaRecibida={(c) => etiquetaDias(calcularDias(c.recibida))}
       porPagina={12}
     />
   ============================================================ */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EstadoBadge from './EstadoBadge';
import OrigenProductoBadge from './OrigenProductoBadge';
import Paginacion from './Paginacion';
import styles from './GridConsultasPrecio.module.css';

function Tarjeta({
  consulta, href, urgente, etiquetaRecibida,
}) {
  const { imagen } = consulta;

  return (
    <Link href={href} className={styles.tarjeta}>
      <div className={styles.imagenWrap}>
        {imagen ? <img src={imagen} alt="" className={styles.imagen} /> : <div className={styles.imagenVacia} />}
        <span className={styles.origenEsquina}><OrigenProductoBadge tipo={consulta.tipo} /></span>
        <span className={styles.estadoEsquina}><EstadoBadge estado={consulta.estado} /></span>
      </div>
      <div className={styles.info}>
        <p className={styles.nombreCliente}>{consulta.nombre}</p>
        <p className={styles.producto}>{consulta.producto}</p>
        {consulta.color && (
          <div className={styles.colorFila}>
            {consulta.colorHex && <span className={styles.colorPunto} style={{ background: consulta.colorHex }} aria-hidden="true" />}
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
