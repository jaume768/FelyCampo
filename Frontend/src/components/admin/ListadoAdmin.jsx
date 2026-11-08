'use client';

/* ============================================================
   LISTADO DEL ADMIN — piezas comunes — Fely Campo
   Para que todos los listados del panel se vean y se usen igual
   (Blog & Podcast, Vosotras…):
     · <PestanasListado>  pestañas con su número, subrayada la activa.
     · <FilaListado>      una fila: miniatura, título (enlace a su ficha),
                          detalle gris, estado «Publicado / Oculto» y, a
                          la derecha, siempre los mismos botones y en el
                          mismo orden: ver en la web, ocultar/mostrar,
                          editar y borrar.
   Uso:
     <PestanasListado pestanas={[{ href, nombre, cuenta, activa }]} />
     <FilaListado imagen titulo detalle publicado editar verEnWeb
       onAlternar onBorrar vertical numero etiqueta />
   ============================================================ */

import Link from 'next/link';
import {
  ExternalLink, Eye, EyeOff, Pencil, Trash2,
} from 'lucide-react';
import styles from './ListadoAdmin.module.css';

// Las dos pestañas de una sección con página propia: primero «Página de la
// web (fotos y textos)», que es la que se abre al entrar ("pagina": su
// dirección), y después el listado ("listado": { href, nombre, cuenta }).
// "activa": 'pagina' | 'listado'. Igual que Colección Fiesta / Prêt-à-porter.
export function PestanasPagina({
  etiqueta, pagina, listado, activa,
}) {
  return (
    <PestanasListado
      etiqueta={etiqueta}
      pestanas={[
        { href: pagina, nombre: 'Página de la web (fotos y textos)', activa: activa === 'pagina' },
        { ...listado, activa: activa === 'listado' },
      ]}
    />
  );
}

export function PestanasListado({ pestanas, etiqueta = 'Secciones' }) {
  return (
    <nav className={styles.pestanas} aria-label={etiqueta}>
      {pestanas.map(({
        href, nombre, cuenta, activa,
      }) => (
        <Link key={href} href={href} className={`${styles.pestana} ${activa ? styles.pestanaActiva : ''}`} aria-current={activa ? 'page' : undefined}>
          {nombre}
          {cuenta !== undefined && <span className={styles.cuenta}>{cuenta}</span>}
        </Link>
      ))}
    </nav>
  );
}

// Botón de texto de una fila («Ver», «Editar», «Ocultar»…), con borde:
// más fácil de ver y de pulsar que un enlace subrayado. Con "href" es un
// enlace; si no, un botón con "onClick". Lo usan también las tablas
// (TablaAdmin) de citas, consultas, pedidos, clientes y reseñas.
export function BotonFila({ href, onClick, children }) {
  if (href) return <Link href={href} className={styles.accion} onClick={(evento) => evento.stopPropagation()}>{children}</Link>;
  return (
    <button
      type="button"
      className={styles.accion}
      onClick={(evento) => { evento.stopPropagation(); onClick?.(evento); }}
    >
      {children}
    </button>
  );
}

export function EstadoPublicacion({ publicado }) {
  return (
    <span className={`${styles.estado} ${publicado ? styles.estadoSi : styles.estadoNo}`}>
      {publicado ? 'Publicado' : 'Oculto'}
    </span>
  );
}

// "abrir": a dónde lleva el título (por defecto, a editar). "accion":
// un botón de texto antes de los iconos, para lo principal de la fila
// (p. ej. { href, texto: 'Ver looks' } en una colección). "onBorrar"
// opcional: sin él, el hueco de la papelera se queda vacío.
export function FilaListado({
  imagen, titulo, detalle, etiqueta, publicado, editar, abrir, accion, verEnWeb, onAlternar, onBorrar, vertical = false, numero,
}) {
  const claseMiniatura = `${styles.miniatura} ${vertical ? styles.miniaturaVertical : ''}`;
  return (
    <div className={styles.fila}>
      {numero !== undefined && <span className={styles.numero}>{numero}</span>}
      {imagen
        ? <img src={imagen} alt="" className={claseMiniatura} draggable={false} loading="lazy" />
        : <div className={`${claseMiniatura} ${styles.miniaturaVacia}`} />}
      <div className={styles.filaTexto}>
        <Link href={abrir || editar} className={styles.filaTitulo}>{titulo || 'Sin título'}</Link>
        {detalle && <p className={styles.filaDetalle}>{detalle}</p>}
      </div>
      {etiqueta && <span className={styles.etiqueta}>{etiqueta}</span>}
      {accion && <Link href={accion.href} className={styles.accion}>{accion.texto}</Link>}
      <EstadoPublicacion publicado={publicado} />
      <div className={styles.filaAcciones}>
        {publicado && verEnWeb ? (
          <a href={verEnWeb} target="_blank" rel="noopener noreferrer" className={styles.icono} aria-label="Ver en la web" title="Ver en la web">
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        ) : <span className={styles.iconoHueco} aria-hidden="true" />}
        <button
          type="button"
          className={styles.icono}
          onClick={onAlternar}
          aria-label={publicado ? 'Ocultar en la web' : 'Mostrar en la web'}
          title={publicado ? 'Ocultar en la web' : 'Mostrar en la web'}
        >
          {publicado ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
        <Link href={editar} className={styles.icono} aria-label="Editar" title="Editar">
          <Pencil size={16} aria-hidden="true" />
        </Link>
        {onBorrar ? (
          <button type="button" className={`${styles.icono} ${styles.iconoBorrar}`} onClick={onBorrar} aria-label="Borrar" title="Borrar">
            <Trash2 size={16} aria-hidden="true" />
          </button>
        ) : <span className={styles.iconoHueco} aria-hidden="true" />}
      </div>
    </div>
  );
}
