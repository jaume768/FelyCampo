'use client';

/* ============================================================
   ADMIN · CABECERA Y TEXTOS DE UNA PÁGINA — Fely Campo
   La pestaña «Página de la web (fotos y textos)» de Blog & Podcast,
   Vosotras, Runway y Puntos de venta, y la página «Visítanos»: la foto de
   cabecera y los textos de entrada, con el editor común (EditorPagina.jsx:
   vista previa en vivo, Español | English y «Guardar y publicar»).
   Qué bloques y campos tiene cada una: PAGINAS_CABECERA en
   lib/cabeceras.js. Ver docs/ADMIN.md.
   ============================================================ */

import { PAGINAS_CABECERA, camposCabecera, idPaginaCabecera } from '@/lib/cabeceras';
import EditorPagina from './EditorPagina';
import editorStyles from './EditorPagina.module.css';

const ruta = (campo) => campo.ruta.split('.');
const leer = (datos, campo) => ruta(campo).reduce((nodo, clave) => nodo?.[clave], datos);

// "id": la página (blog, vosotras…); "pestanas": las de la sección, arriba.
function AdminCabecera({ id, pestanas, migas }) {
  const pagina = PAGINAS_CABECERA[id];
  const bloques = pagina.bloques.map((bloque) => ({
    ...bloque,
    datos: (d) => bloque.campos.map((campo) => leer(d, campo)),
  }));

  return (
    <EditorPagina
      id={idPaginaCabecera(id)}
      titulo={pagina.titulo}
      rutaWeb={pagina.rutaWeb}
      bloques={bloques}
      campos={camposCabecera(id)}
      migas={migas}
      encabezado={pestanas}
    >
      {(bloque, h) => {
        const medios = bloque.campos.filter((campo) => campo.tipo === 'medio');
        const textos = bloque.campos.filter((campo) => campo.tipo === 'texto');
        const campoTexto = (campo) => (
          <div key={campo.ruta}>
            {h.texto(ruta(campo), {
              etiqueta: campo.etiqueta, largoRecomendado: campo.largo, multilinea: campo.multilinea, filas: campo.filas,
            })}
          </div>
        );
        if (medios.length === 0) {
          return (
            <div className={editorStyles.columnaTexto}>
              <div className={editorStyles.fichaCampos}>{textos.map(campoTexto)}</div>
            </div>
          );
        }
        return (
          <div className={editorStyles.medioYCampos}>
            <div className={editorStyles.fichaCampos}>
              {medios.map((campo) => (
                <div key={campo.ruta}>
                  {h.medio(ruta(campo), { etiqueta: campo.etiqueta, detalle: campo.detalle, proporcion: campo.proporcion })}
                </div>
              ))}
            </div>
            <div className={editorStyles.fichaCampos}>{textos.map(campoTexto)}</div>
          </div>
        );
      }}
    </EditorPagina>
  );
}

export default AdminCabecera;
