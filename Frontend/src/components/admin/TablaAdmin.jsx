'use client';

/* ============================================================
   TABLA ADMIN — Fely Campo
   Tabla genérica de listado: columnas configurables + checkbox de
   selección opcional (para acciones en bloque) + columna de acciones
   al final vía renderAcciones. No sabe nada de filtros/búsqueda —
   eso vive en cada página, esto solo pinta filas.
   `hrefFila` es opcional: si se pasa, toda la fila navega a ese destino
   al hacer click (no solo el botón de renderAcciones) — el checkbox y
   las acciones paran la propagación para no disparar la navegación.
   `onClickFila` es la alternativa cuando el click de fila no navega sino
   que dispara una acción (p.ej. abrir un ModalOverlay de edición) — mismo
   criterio de propagación. Si se pasan ambos, gana `hrefFila`.
   `resaltarFila` es opcional: si devuelve true para una fila, se le aplica
   fondo rosa-velo a toda la fila (p.ej. consultas sin responder hace 4+ días).
   `resaltarFilaVerde` es el mismo mecanismo pero en fondo verde-light (p.ej.
   consultas ya contactadas). Si una fila cumple ambos, gana `resaltarFila`.
   `filaNueva` es opcional: si devuelve true, pinta un punto rosa junto a la
   fila (mismo color que AdminSidebar .contador). Es SOLO diseño — de dónde
   sale "nuevo" (fecha de creación, comparación con última visita, etc.) y
   cuándo deja de estarlo (sessionStorage, marcar como visto...) es lógica
   que falta por implementar; aquí solo se pinta lo que la fila diga.
   `porPagina` es opcional: sin él, se pinta el array `filas` completo (así
   se comportaba siempre esta tabla — ver docs/adminpanel.md, "no pagina").
   Con un número, corta `filas` en páginas de ese tamaño y añade el pie con
   Anterior/Siguiente. La página vuelve a 1 cuando cambia `filas` (nuevo
   filtro/búsqueda desde la página que la usa).
   Uso:
     <TablaAdmin
       columnas={[{ clave: 'nombre', etiqueta: 'Nombre' }]}
       filas={productos}
       claveFila={(fila) => fila.id}
       hrefFila={(fila) => `/admin/productos/${fila.id}`}
       renderAcciones={(fila) => <Boton variante="texto">Editar</Boton>}
     />
   ============================================================ */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Paginacion from './Paginacion';
import styles from './TablaAdmin.module.css';

function TablaAdmin({
  columnas,
  filas,
  claveFila = (fila) => fila.id,
  seleccionables = false,
  seleccionadas = [],
  onToggleSeleccion,
  onToggleTodas,
  renderAcciones,
  hrefFila,
  onClickFila,
  resaltarFila,
  resaltarFilaVerde,
  filaNueva,
  porPagina,
  vacio = 'No hay elementos que mostrar.',
}) {
  const router = useRouter();
  const [pagina, setPagina] = useState(1);

  useEffect(() => { setPagina(1); }, [filas]);

  const filasPagina = porPagina ? filas.slice((pagina - 1) * porPagina, pagina * porPagina) : filas;
  const todasSeleccionadas = seleccionables && filas.length > 0 && seleccionadas.length === filas.length;

  return (
    <div>
      <div className={styles.contenedor}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              {seleccionables && (
                <th className={styles.thCheckbox}>
                  <input
                    type="checkbox"
                    checked={todasSeleccionadas}
                    onChange={() => onToggleTodas?.(!todasSeleccionadas)}
                    aria-label="Seleccionar todas las filas"
                  />
                </th>
              )}
              {filaNueva && <th className={styles.thNueva} />}
              {columnas.map((columna) => (
                <th key={columna.clave} className={styles.th}>{columna.etiqueta}</th>
              ))}
              {renderAcciones && <th className={styles.th}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 && (
              <tr>
                <td className={styles.vacio} colSpan={columnas.length + (seleccionables ? 1 : 0) + (filaNueva ? 1 : 0) + (renderAcciones ? 1 : 0)}>
                  {vacio}
                </td>
              </tr>
            )}
            {filasPagina.map((fila) => {
              const clave = claveFila(fila);
              const marcada = seleccionadas.includes(clave);
              const destino = hrefFila?.(fila);
              const clicable = !!destino || !!onClickFila;
              const accionFila = destino ? () => router.push(destino) : () => onClickFila(fila);
              return (
                <tr
                  key={clave}
                  className={`${styles.tr} ${marcada ? styles.seleccionada : ''} ${clicable ? styles.filaClicable : ''} ${resaltarFila?.(fila) ? styles.destacada : (resaltarFilaVerde?.(fila) ? styles.destacadaVerde : '')}`}
                  onClick={clicable ? accionFila : undefined}
                  onKeyDown={clicable ? (e) => { if (e.key === 'Enter') accionFila(); } : undefined}
                  tabIndex={clicable ? 0 : undefined}
                >
                  {seleccionables && (
                    <td className={styles.tdCheckbox} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={marcada}
                        onChange={() => onToggleSeleccion?.(clave)}
                        aria-label={`Seleccionar fila ${clave}`}
                      />
                    </td>
                  )}
                  {filaNueva && (
                    <td className={styles.tdNueva}>
                      {filaNueva(fila) && <span className={styles.puntoNuevo} title="Nuevo" aria-label="Nuevo" />}
                    </td>
                  )}
                  {columnas.map((columna) => (
                    <td key={columna.clave} className={styles.td}>
                      {columna.render ? columna.render(fila) : fila[columna.clave]}
                    </td>
                  ))}
                  {renderAcciones && <td className={styles.td} onClick={(e) => e.stopPropagation()}>{renderAcciones(fila)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {porPagina && filas.length > 0 && (
        <Paginacion pagina={pagina} porPagina={porPagina} total={filas.length} onCambiar={setPagina} />
      )}
    </div>
  );
}

export default TablaAdmin;
