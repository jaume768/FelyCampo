'use client';

/* ============================================================
   TABS FILTRO — Fely Campo (admin)
   Fila de pestañas subrayadas para filtrar la tabla que va justo
   debajo (mismo patrón visual que ya usaba /admin/categorias para
   Prêt-à-porter/Atelier/Archivo). Genérico: recibe las opciones y el
   valor activo, no sabe nada del dato que está filtrando.
   `clase` por opción es opcional: da a la pestaña el mismo fondo/color
   de texto que su badge de estado (p.ej. EstadoPublicacionBadge) en
   vez del subrayado plano — así la pestaña ya comunica el color antes
   de tocarla. Sin `clase`, la pestaña se ve como antes (ej. "Todos").
   Uso:
     <TabsFiltro
       opciones={[{ valor: 'Todos', etiqueta: 'Todos' }, { valor: 'x', etiqueta: 'X', clase: 'publicado' }]}
       valor={filtro}
       onChange={setFiltro}
     />
   ============================================================ */

import styles from './TabsFiltro.module.css';

function TabsFiltro({ opciones, valor, onChange }) {
  return (
    <div className={styles.tabs} role="tablist">
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          role="tab"
          aria-selected={valor === opcion.valor}
          className={`${styles.tab} ${opcion.clase ? styles[opcion.clase] : ''} ${valor === opcion.valor ? styles.activo : ''}`}
          onClick={() => onChange(opcion.valor)}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}

export default TabsFiltro;
