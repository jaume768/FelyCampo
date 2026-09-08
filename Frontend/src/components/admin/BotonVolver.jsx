'use client';

/* ============================================================
   BOTÓN VOLVER — Fely Campo (admin)
   Enlace de "volver" con borde (mismo look que Boton variante
   contorno, pero como <Link> — Boton no soporta href fuera de la
   variante "texto"). Se usa en toda página que cuelga de un listado
   (detalle de pedido, editar producto/reseña/blog...), siempre con un
   destino explícito — no router.back(), para que funcione igual si se
   entra por URL directa.
   Uso: <BotonVolver href="/admin/pedidos" />
   ============================================================ */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './BotonVolver.module.css';

function BotonVolver({ href, children = 'Volver' }) {
  return (
    <Link href={href} className={styles.boton}>
      <ArrowLeft size={14} aria-hidden="true" />
      {children}
    </Link>
  );
}

export default BotonVolver;
