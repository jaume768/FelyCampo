'use client';

/* ============================================================
   VER PRODUCTO — Fely Campo (admin)
   Ficha de solo lectura de un producto — a diferencia de
   /admin/productos/[id]/editar (FormularioProducto), esta página no
   edita nada, solo muestra. Es el destino de "ver producto" desde
   fuera del listado (p.ej. la fila de "Producto de interés" en
   /admin/consultas-precio/[id] y /admin/consultas/[id], o un artículo
   de /admin/pedidos/[id]) — sitios donde antes no había a dónde ir, o
   se enlazaba directo a Editar sin querer.
   ============================================================ */

import { use } from 'react';
import { notFound } from 'next/navigation';
import {
  PageHeader, BotonVolver, EstadoPublicacionBadge, useCategorias,
} from '@/components/admin';
import { Boton } from '@/components/ui';
import {
  productosMock, coloresMock, telasMock, tiposProducto, coleccionesMock, rutaTipoProducto,
} from '@/components/admin/mockData';
import styles from './page.module.css';

function etiquetaTipo(tipo) {
  return tiposProducto.find((t) => t.valor === tipo)?.etiqueta || tipo;
}

function etiquetaColeccion(coleccion) {
  return coleccionesMock.find((c) => c.valor === coleccion)?.etiqueta || '—';
}

export default function VerProductoPage({ params }) {
  const { id } = use(params);
  const producto = productosMock.find((p) => p.id === id);
  const { categorias } = useCategorias();

  if (!producto) notFound();

  const categoria = categorias[producto.tipo]?.find((c) => c.id === producto.categoriaId);
  const colores = (producto.colorIds || []).map((cid) => coloresMock.find((c) => c.id === cid)).filter(Boolean);
  const telas = (producto.telaIds || []).map((tid) => telasMock.find((t) => t.id === tid)).filter(Boolean);
  const imagenes = producto.imagenes?.length ? producto.imagenes : [producto.imagen].filter(Boolean);

  return (
    <div>
      <BotonVolver href={rutaTipoProducto(producto.tipo)} />
      <PageHeader titulo={producto.nombre} subtitulo={producto.sku}>
        <Boton variante="texto" href={`/admin/productos/${producto.id}/editar`}>Editar</Boton>
      </PageHeader>

      <div className={styles.contenido}>
        <div className={styles.galeria}>
          {imagenes.length > 0 ? imagenes.map((img) => (
            <img key={img} src={img} alt="" className={styles.imagen} />
          )) : <div className={styles.imagenVacia} />}
        </div>

        <div className={styles.detalle}>
          <div className={styles.resumen}>
            <div>
              <p className={styles.resumenLabel}>Estado</p>
              <EstadoPublicacionBadge estado={producto.estado} />
            </div>
            <div>
              <p className={styles.resumenLabel}>Precio</p>
              <p className={styles.resumenValor}>{producto.precio || '—'}</p>
            </div>
            <div>
              <p className={styles.resumenLabel}>Tipo</p>
              <p className={styles.resumenValor}>{etiquetaTipo(producto.tipo)}</p>
            </div>
            <div>
              <p className={styles.resumenLabel}>Categoría</p>
              <p className={styles.resumenValor}>{categoria?.nombre || '—'}</p>
            </div>
            <div>
              <p className={styles.resumenLabel}>Colección</p>
              <p className={styles.resumenValor}>{etiquetaColeccion(producto.coleccion)}</p>
            </div>
          </div>

          {producto.descripcionCorta && (
            <div className={styles.bloque}>
              <p className={styles.bloqueTitulo}>Descripción</p>
              <p className={styles.descripcion}>{producto.descripcionCorta}</p>
            </div>
          )}

          {producto.tallas?.length > 0 && (
            <div className={styles.bloque}>
              <p className={styles.bloqueTitulo}>Tallas y stock</p>
              <div className={styles.tallasFila}>
                {producto.tallas.map((t) => (
                  <span key={t.talla} className={styles.tallaChip}>{`${t.talla} · ${t.stock}`}</span>
                ))}
              </div>
            </div>
          )}

          {colores.length > 0 && (
            <div className={styles.bloque}>
              <p className={styles.bloqueTitulo}>Colores</p>
              <div className={styles.coloresFila}>
                {colores.map((c) => (
                  <span key={c.id} className={styles.colorFila}>
                    <span className={styles.colorPunto} style={{ background: c.hex }} aria-hidden="true" />
                    {c.nombre.es}
                  </span>
                ))}
              </div>
            </div>
          )}

          {telas.length > 0 && (
            <div className={styles.bloque}>
              <p className={styles.bloqueTitulo}>Telas</p>
              {telas.map((t) => (
                <p key={t.id} className={styles.resumenValor}>{`${t.nombre} — ${t.composicion}`}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
